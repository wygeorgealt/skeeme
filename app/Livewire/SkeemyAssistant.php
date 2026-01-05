<?php

namespace App\Livewire;

use Livewire\Component;
use App\Services\DeepseekAIService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SkeemyAssistant extends Component
{
    public $isOpen = false;
    public $currentPage = '';
    public $conversation = [];
    public $userMessage = '';
    public $isProcessing = false;
    public $quickActions = [];

    protected $aiService;

    public function boot(DeepseekAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function mount()
    {
        $this->detectCurrentPage();
        $this->loadQuickActions();
    }

    public function togglePanel()
    {
        $this->isOpen = !$this->isOpen;
        
        if ($this->isOpen && empty($this->conversation)) {
            $this->addSystemMessage("Hi! I'm Skeemy, your AI assistant. How can I help you today?");
        }
    }

    public function detectCurrentPage()
    {
        $route = request()->route()->getName();
        
        $pageMap = [
            'classes-management' => 'classes',
            'students-management' => 'students',
            'lecturer-management' => 'lecturers',
            'lecturer.courses' => 'courses',
            'lecturer.exams' => 'exams',
            'announcements' => 'announcements',
            'academic-calendar' => 'calendar',
            'manage-class' => 'manage-class',
        ];

        $this->currentPage = $pageMap[$route] ?? 'general';
    }

    public function loadQuickActions()
    {
        // All quick actions removed as per user request
        $this->quickActions = [];
    }

    public function sendMessage()
    {
        if (empty(trim($this->userMessage))) {
            return;
        }

        $this->addUserMessage($this->userMessage);
        $this->isProcessing = true;

        try {
            $response = $this->processWithAI($this->userMessage);
            $this->addAssistantMessage($response);

            // If action was successful, reload the page to show changes
            if (Str::contains($response, '✅')) {
                return $this->redirect(request()->header('Referer'), navigate: true);
            }
        } catch (\Exception $e) {
            $this->addAssistantMessage("Sorry, I cant do that");
            \Log::error('Skeemy Error: ' . $e->getMessage());
        }

        $this->userMessage = '';
        $this->isProcessing = false;
    }

    protected function processWithAI($message)
    {
        $context = $this->getPageContext();
        $school = Auth::user()->school;
        
        // 1. Build Contextual Data (Retrieval) - Give AI "eyes" on the data
        $pageData = $this->getDataForContext($context, $message);

        // 2. Build Capability Map - Tell AI what it CAN and CANNOT do
        $capabilities = $this->getCapabilitiesForContext($context);

        // 3. Build Prompt
        $systemPrompt = $this->buildSmartSystemPrompt($context, $capabilities, $pageData);
        
        // 4. Check for Direct Pattern Match first (Fast Path)
        $directAction = $this->parseDirectRequest($message, $context);
        if ($directAction['has_action']) {
            $executor = app(\App\Services\SkeemyActionExecutor::class);
            $result = $executor->execute($directAction['action'], $directAction['data'], $context);
             if ($result['success']) {
                return $result['message'] . "\n\n✅ Action completed.";
            } else {
                // If it's the middle name prompt, return it directly for a more natural feel
                if (Str::contains($result['message'], 'provide a middle name')) {
                    return $result['message'];
                }
                return "❌ Error: " . $result['message'];
            }
        }

        // 5. Ask AI
        $executor = app(\App\Services\SkeemyActionExecutor::class); // Ready for AI use
        
        try {
            // We expect JSON if it wants to do an action, or plain text if it's answering a question
            $response = $this->aiService->generateText($message, $systemPrompt);

            // Try to parse as JSON being embedded in text or pure JSON
            $jsonPattern = '/\{[\s\S]*\}/';
            if (preg_match($jsonPattern, $response, $matches)) {
                $jsonData = json_decode($matches[0], true);
                if ($jsonData && isset($jsonData['action'])) {
                    // It wants to perform an action
                    $result = $executor->execute($jsonData['action'], $jsonData['data'] ?? [], $context);
                     if ($result['success']) {
                        return $result['message'] . "\n\n✅ Done!";
                    } else {
                        // If it's the middle name prompt, return it directly for a more natural feel
                        if (Str::contains($result['message'], 'provide a middle name')) {
                            return $result['message'];
                        }
                        return "❌ I tried to do that, but: " . $result['message'];
                    }
                }
            }

            return $response; // Just chat/answer
        } catch (\Exception $e) {
            return "Sorry, I cant do that";
        }
    }

    protected function getCapabilitiesForContext($context)
    {
        // Define what buttons/actions exist on each page
        $caps = [
            'classes' => [
                'CAN: Create multiple classes (e.g. "Create Grade 1 to 6")',
                'CAN: Assign courses to classes (e.g. "Add Physics to Grade 1")',
                'CAN: Read/List courses offered by a class',
                'CANNOT: Create exams, Edit Student details directly here',
                'BUTTONS_AVAILABLE: "Add Class", "Edit", "Delete", "Assign Course"'
            ],
            'students' => [
                'CAN: Create students from a provided list of names (e.g. "Add students: John, Jane")',
                'CAN: Move students between classes',
                'CANNOT: Generate fake/dummy students, Create courses',
                'BUTTONS_AVAILABLE: "Add Student", "Edit", "Delete"'
            ],
            'lecturers' => [
                 'CAN: Assign lecturers to specific class courses (e.g. "Assign Physics in Grade 10 to Mr. Smith")',
                 'CANNOT: Create fake/dummy lecturers',
                 'BUTTONS_AVAILABLE: "Add Lecturer"'
            ],
            'courses' => [
                'CAN: Assign courses to classes and lecturers',
                'CANNOT: Create fake/dummy courses',
                'BUTTONS_AVAILABLE: "Add Course"'
            ],
            'announcements' => [
                'CAN: Create/Post announcements to Students, Lecturers, or All (e.g. "Post announcement \'Title\'")',
                'BUTTONS_AVAILABLE: "Create Announcement"'
            ],
            'calendar' => [
                'CAN: Add events/holidays (e.g. "Add event \'Exam\' on Oct 15")',
                'BUTTONS_AVAILABLE: "Add Event"'
            ]
        ];
        
        return $caps[$context] ?? ['CAN: Answer general questions', 'CANNOT: Modify data', 'REFUSAL_MESSAGE: "Sorry, I cant do that"'];
    }

    protected function getDataForContext($context, $message)
    {
        // Simple RAG (Retrieval Augmented Generation) to answer "What courses..."
        $schoolId = Auth::user()->school_id;
        $data = "No specific data loaded.";

        if ($context === 'classes') {
            // Be efficient: Only query if message looks like a query
            if (Str::contains(strtolower($message), ['what', 'show', 'list', 'who', 'courses', 'classes'])) {
                // Fetch summary of classes
                 $classes = \App\Models\SchoolClass::where('school_id', $schoolId)
                    ->with('courses:id,name') // Optimize
                    ->limit(20) // Safety limit
                    ->get()
                    ->map(function($c) {
                        return "Class: {$c->name} (Courses: " . $c->courses->pluck('name')->implode(', ') . ")";
                    })->implode("\n");
                 $data = "Current Classes and their Courses:\n" . $classes;
            }
        }

        return $data;
    }

    protected function buildSmartSystemPrompt($context, $capabilities, $pageData)
    {
        $capsList = implode("\n- ", $capabilities);
        
        return <<<PROMPT
You are Skeemy, the School Admin AI. 
You are currently on the "{$context}" page.

YOUR CAPABILITIES HERE:
- {$capsList}

CURRENT DATA VISIBLE:
{$pageData}

INSTRUCTIONS:
1. If the user asks for actions you CAN do, output a JSON object: {"action": "action_name", "data": {...}}.
   - 'create_classes': { "classes": [{"name": "...", "description": "..."}] }
   - 'assign_course_bulk': { "course_name": "...", "target_classes": ["...", "..."] }
   - 'create_students': { "students": [{"first_name": "...", "last_name": "...", "email": "...", "password": "...", "class_name": "..."}] }
   - 'promote_students': { "from_class": "...", "to_class": "..." }
   - 'assign_lecturer_to_course': { "course_name": "...", "class_name": "...", "lecturer_name": "..." }
   - 'create_announcement': { "title": "...", "content": "...", "target": "all/students/lecturers" }
   - 'create_calendar_event': { "title": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "type": "event/holiday/milestone", "description": "..." }

2. If the user asks a question about the data (e.g. "What courses are in Grade 6?"), use the CURRENT DATA VISIBLE to answer.
3. If you cannot do something or if the question is out of scope, ALWAYS respond with ONLY the exact phrase: "Sorry, I cant do that"

EXAMPLE JSON for "Assign Physics to Grade 1 and 2":
{ "action": "assign_course_bulk", "data": { "course_name": "Physics", "target_classes": ["Grade 1", "Grade 2"] } }
PROMPT;
    }

    protected function formatTutorial($tutorial)
    {
        $response = "### " . $tutorial['title'] . "\n\n";
        foreach ($tutorial['steps'] as $index => $step) {
            $response .= ($index + 1) . ". " . $step . "\n";
        }
        
        if (isset($tutorial['tip'])) {
            $response .= "\n💡 **Tip**: " . $tutorial['tip'];
        }
        
        if (isset($tutorial['link'])) {
            $response .= "\n\n[{$tutorial['link_text']}]({$tutorial['link']})";
        }
        
        return $response;
    }

    // Deprecated: Execution methods removed/merged into Tutor logic
    public function useQuickAction($prompt)
    {
        $this->userMessage = $prompt;
        $this->sendMessage();
    }


    protected function buildUserPrompt($message, $context)
    {
        return "User request: {$message}\n\nContext: Currently on the {$context} management page.";
    }

    protected function parseAIResponse($response, $context)
    {
        // Try to parse JSON response
        $decoded = json_decode($response, true);
        
        if ($decoded && isset($decoded['action']) && isset($decoded['data'])) {
            return [
                'has_action' => true,
                'action' => $decoded['action'],
                'data' => $decoded['data']
            ];
        }
        
        return ['has_action' => false];
    }

    protected function parseDirectRequest($message, $context)
    {
        // Direct pattern matching for common requests (fallback if AI doesn't return JSON)
        
        // CLASSES PATTERNS
        if ($context === 'classes' || $context === 'manage-class') {
            // Pattern: "Create X classes from Grade Y to Grade Z"
            if (preg_match('/create\s+(\d+)\s+classes?\s+from\s+grade\s+(\d+)\s+to\s+grade\s+(\d+)/i', $message, $matches)) {
                $count = (int)$matches[1];
                $start = (int)$matches[2];
                $end = (int)$matches[3];
                
                $classes = [];
                for ($i = $start; $i <= $end; $i++) {
                    $classes[] = [
                        'name' => "Grade {$i}",
                        'description' => "Grade {$i} class for students"
                    ];
                }
                
                return [
                    'has_action' => true,
                    'action' => 'create_classes',
                    'data' => ['classes' => $classes]
                ];
            }

            // Pattern: "Promote students from Class A to Class B"
            if (preg_match('/(?:promote|move)\s+(?:all\s+)?students\s+from\s+(.+)\s+to\s+(.+)/i', $message, $matches)) {
                return [
                    'has_action' => true,
                    'action' => 'promote_students',
                    'data' => [
                        'from_class' => trim($matches[1]),
                        'to_class' => trim($matches[2])
                    ]
                ];
            }

            // Pattern: "Assign [Subject] to [Class Pattern]" (e.g., "Assign Math to Grade 7")
            if (preg_match('/(?:assign|add)\s+(?:course\s+)?(.+)\s+to\s+(.+)/i', $message, $matches)) {
                $courseName = trim($matches[1]);
                $target = trim($matches[2]);
                
                // If target contains "classes" or "all", clean it
                $target = str_ireplace(['classes', 'all '], '', $target);
                
                return [
                    'has_action' => true,
                    'action' => 'assign_course_bulk',
                    'data' => [
                        'course_name' => $courseName,
                        'target_classes' => $target
                    ]
                ];
            }
        }
        
        // STUDENTS PATTERNS
        if ($context === 'students') {
            // Pattern: "Create/Add students: Name 1, Name 2, ..."
            // We want to capture the list after the colon or keywords
            if (preg_match('/(?:create|add|import)\s+students?(?:[:\s]+)(.+)/i', $message, $matches)) {
                $rawList = $matches[1];
                
                // If it looks like just a number (e.g. "50"), IGNORE IT (User wants real names)
                if (is_numeric(trim($rawList))) {
                    return ['has_action' => false]; 
                }

                // Split by comma or newline
                $names = preg_split('/[,\n]+/', $rawList);
                $students = [];
                
                foreach ($names as $name) {
                    $name = trim($name);
                    if (empty($name)) continue;
                    
                    // Basic name splitting (Last word is surname, rest is first name)
                    $parts = explode(' ', $name);
                    if (count($parts) < 2) {
                        $fName = $name;
                        $lName = "Student"; // Fallback if single name provided
                    } else {
                        $lName = array_pop($parts);
                        $fName = implode(' ', $parts);
                    }

                    $students[] = [
                        'first_name' => $fName,
                        'last_name' => $lName,
                        'email' => strtolower($fName . '.' . $lName . rand(100, 999) . '@school.com'), // Temp email
                        'password' => 'password123'
                    ];
                }
                
                if (count($students) > 0) {
                     return [
                        'has_action' => true,
                        'action' => 'create_students',
                        'data' => ['students' => $students]
                    ];
                }
            }
        }
        
        // LECTURERS PATTERNS
        // Pattern: "Assign [Course] in [Class] to [Lecturer]"
        if (preg_match('/assign\s+(.+)\s+in\s+(.+)\s+to\s+(.+)/i', $message, $matches)) {
            // Note: This pattern might overlap with "Assign [Course] to [Class]" if user says "Assign Physics to Grade 10" (classes context)
            // But this specific one has "in ... to ..." structure
            
            return [
                'has_action' => true,
                'action' => 'assign_lecturer_to_course',
                'data' => [
                    'course_name' => trim($matches[1]),
                    'class_name' => trim($matches[2]),
                    'lecturer_name' => trim($matches[3])
                ]
            ];
        }

        if ($context === 'lecturers') {
            // No generic creation anymore
            // Maybe "Add lecturer: Name Email" in future
        }
        
        // COURSES PATTERNS
        if ($context === 'courses') {
             // No generic creation anymore
        }

        // ANNOUNCEMENTS PATTERNS
        if ($context === 'announcements') {
            // Pattern: "Post announcement 'Title' [saying 'Content'] to [Target]"
            if (preg_match('/post\s+(?:announcement\s+)?[\'"](.+?)[\'"]\s+(?:saying\s+[\'"](.+?)[\'"])?/i', $message, $matches)) {
                $title = $matches[1];
                $content = $matches[2] ?? $title; // Default content to title if not specific
                
                // Try to find target
                $target = 'all';
                if (stripos($message, 'students') !== false) $target = 'students';
                if (stripos($message, 'lecturers') !== false) $target = 'lecturers';
                
                return [
                    'has_action' => true,
                    'action' => 'create_announcement',
                    'data' => [
                        'title' => $title,
                        'content' => $content,
                        'target' => $target
                    ]
                ];
            }
        }

        // CALENDAR PATTERNS
        if ($context === 'calendar') {
            // Pattern: "Add event 'Title' on [Date]"
            if (preg_match('/add\s+(?:event|holiday)\s+[\'"](.+?)[\'"]\s+on\s+(.+)/i', $message, $matches)) {
                $title = $matches[1];
                $dateStr = $matches[2];
                $type = stripos($message, 'holiday') !== false ? 'holiday' : 'event';
                
                return [
                    'has_action' => true,
                    'action' => 'create_calendar_event',
                    'data' => [
                        'title' => $title,
                        'start_date' => $dateStr, // Executor parses this
                        'type' => $type
                    ]
                ];
            }
        }
        
        return ['has_action' => false];
    }

     protected function getPageContext()
    {
        return $this->currentPage;
    }

    protected function addUserMessage($message)
    {
        $this->conversation[] = [
            'role' => 'user',
            'content' => $message,
            'timestamp' => now(),
        ];
    }

    protected function addAssistantMessage($message)
    {
        $this->conversation[] = [
            'role' => 'assistant',
            'content' => $message,
            'timestamp' => now(),
        ];
    }

    protected function addSystemMessage($message)
    {
        $this->conversation[] = [
            'role' => 'system',
            'content' => $message,
            'timestamp' => now(),
        ];
    }

    public function render()
    {
        return view('livewire.skeemy-assistant');
    }
}
