<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\User;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SkeemyActionExecutor
{
    /**
     * Execute an action based on parsed AI response
     */
    public function execute(string $action, array $data, string $context): array
    {
        try {
            return match($context) {
                'classes' => $this->executeClassesAction($action, $data),
                'students' => $this->executeStudentsAction($action, $data),
                'lecturers' => $this->executeLecturersAction($action, $data),
                'courses' => $this->executeCoursesAction($action, $data),
                'announcements' => $this->executeAnnouncementsAction($action, $data),
                'calendar' => $this->executeCalendarAction($action, $data),
                default => ['success' => false, 'message' => 'Context not supported yet']
            };
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Execute classes-related actions
     */
    protected function executeClassesAction(string $action, array $data): array
    {
        $school = Auth::user()->school;
        
        if (!$school) {
            return ['success' => false, 'message' => 'No school associated with user'];
        }

        return match($action) {
            'create_classes' => $this->createClasses($data, $school),
            'promote_students' => $this->promoteStudents($data, $school),
            'assign_course_bulk' => $this->assignCourseBulk($data, $school),
            default => ['success' => false, 'message' => 'Action not supported']
        };
    }

    /**
     * Promote/Move students from one class to another
     */
    protected function promoteStudents(array $data, $school): array
    {
        $fromClassName = $data['from_class'];
        $toClassName = $data['to_class'];

        DB::beginTransaction();
        try {
            // Find Source Class
            $fromClass = SchoolClass::where('school_id', $school->id)
                ->where('name', 'like', $fromClassName)
                ->first();

            if (!$fromClass) {
                throw new \Exception("Source class '{$fromClassName}' not found.");
            }

            // Find Target Class
            $toClass = SchoolClass::where('school_id', $school->id)
                ->where('name', 'like', $toClassName)
                ->first();

            if (!$toClass) {
                // Option to create if not exists? For now, fail.
                throw new \Exception("Target class '{$toClassName}' not found.");
            }

            // Get Students
            $students = User::where('class_id', $fromClass->id)
                ->where('role', 'student')
                ->get();

            if ($students->isEmpty()) {
                throw new \Exception("No students found in '{$fromClassName}'.");
            }

            $count = 0;
            foreach ($students as $student) {
                // Update Class ID
                $student->update(['class_id' => $toClass->id]);

                // Handle Enrollments (Unenroll from old, Enroll in new)
                // 1. Unenroll from old class courses
                $oldClassCourses = DB::table('class_courses')->where('class_id', $fromClass->id)->pluck('course_id');
                if ($oldClassCourses->isNotEmpty()) {
                    \App\Models\Enrollment::where('student_id', $student->id)
                        ->whereIn('course_id', $oldClassCourses)
                        ->delete();
                }

                // 2. Enroll in new class courses
                $newClassCourses = DB::table('class_courses')->where('class_id', $toClass->id)->pluck('course_id');
                foreach ($newClassCourses as $courseId) {
                    \App\Models\Enrollment::firstOrCreate([
                        'student_id' => $student->id,
                        'course_id' => $courseId,
                    ], [
                        'class_id' => $toClass->id,
                        'enrolled_at' => now(),
                    ]);
                }
                
                $count++;
            }

            DB::commit();

            return [
                'success' => true,
                'message' => "Successfully moved {$count} students from '{$fromClass->name}' to '{$toClass->name}'.",
                'data' => ['moved_count' => $count]
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Assign a course to multiple classes
     */
    protected function assignCourseBulk(array $data, $school): array
    {
        $courseName = $data['course_name'];
        $classPatterns = $data['target_classes']; // Array of strings like "Grade 7", "Grade 8" OR string pattern

        DB::beginTransaction();
        try {
            // Find Course
            $course = Course::where('school_id', $school->id)
                ->where('name', 'like', "%{$courseName}%")
                ->first();

            if (!$course) {
                // Try creating it?
                $course = Course::create([
                    'school_id' => $school->id,
                    'name' => ucwords($courseName),
                    'code' => $this->generateCourseCode($courseName),
                    'description' => "Course for {$courseName}",
                ]);
            }

            // Find Target Classes
            $classes = collect();
            
            if (is_array($classPatterns)) {
                foreach ($classPatterns as $pattern) {
                     $found = SchoolClass::where('school_id', $school->id)
                        ->where('name', 'like', "%{$pattern}%")
                        ->get();
                     $classes = $classes->merge($found);
                }
            } else {
                 // Assume string pattern like "Grade %"
                 $classes = SchoolClass::where('school_id', $school->id)
                    ->where('name', 'like', $classPatterns)
                    ->get();
            }
            
            $classes = $classes->unique('id');

            if ($classes->isEmpty()) {
                throw new \Exception("No classes found matching the criteria.");
            }

            $assignedCount = 0;
            foreach ($classes as $class) {
                // Check if already assigned
                $exists = DB::table('class_courses')
                    ->where('class_id', $class->id)
                    ->where('course_id', $course->id)
                    ->exists();

                if (!$exists) {
                    // Assign
                    DB::table('class_courses')->insert([
                        'class_id' => $class->id,
                        'course_id' => $course->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    // Auto-enroll students
                    $students = User::where('class_id', $class->id)->where('role', 'student')->get();
                    foreach($students as $student) {
                        \App\Models\Enrollment::firstOrCreate([
                            'student_id' => $student->id,
                            'course_id' => $course->id,
                        ], [
                            'class_id' => $class->id,
                            'enrolled_at' => now(),
                        ]);
                    }

                    $assignedCount++;
                }
            }

            DB::commit();

            return [
                'success' => true,
                'message' => "Successfully assigned '{$course->name}' to {$assignedCount} classes.",
                'data' => ['assigned_count' => $assignedCount]
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Create multiple classes
     */
    protected function createClasses(array $data, $school): array
    {
        $created = [];
        
        DB::beginTransaction();
        try {
            foreach ($data['classes'] as $classData) {
                $class = SchoolClass::create([
                    'school_id' => $school->id,
                    'name' => $classData['name'],
                    'description' => $classData['description'] ?? "Class for {$classData['name']}",
                ]);
                
                $created[] = $class->name;
            }
            
            DB::commit();
            
            return [
                'success' => true,
                'message' => 'Successfully created ' . count($created) . ' classes',
                'data' => ['created' => $created]
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate descriptions for existing classes
     */
    protected function generateClassDescriptions(array $data, $school): array
    {
        // Placeholder for future implementation
        return [
            'success' => false,
            'message' => 'This action is not yet implemented'
        ];
    }

    /**
     * Execute students-related actions
     */
    protected function executeStudentsAction(string $action, array $data): array
    {
        $school = Auth::user()->school;
        
        if (!$school) {
            return ['success' => false, 'message' => 'No school associated with user'];
        }

        return match($action) {
            'create_students' => $this->createStudents($data, $school),
            'assign_to_classes' => $this->assignStudentsToClasses($data, $school),
            default => ['success' => false, 'message' => 'Action not supported']
        };
    }

    /**
     * Create multiple students
     */
    protected function createStudents(array $data, $school): array
    {
        $created = [];
        
        DB::beginTransaction();
        try {
            foreach ($data['students'] as $studentData) {
                // Check if user with same name exists and middle name is missing
                if (empty($studentData['middle_name'])) {
                    $existingUser = User::where('first_name', $studentData['first_name'])
                        ->where('last_name', $studentData['last_name'])
                        ->with('school')
                        ->first();

                    if ($existingUser) {
                        $schoolName = $existingUser->school->name ?? 'another school';
                        throw new \Exception("name exists in \"{$schoolName}\" please provide a middle name");
                    }
                }

                // Determine class if provided as a name
                $classId = null;
                if (isset($studentData['class_name'])) {
                    $class = SchoolClass::where('school_id', $school->id)
                        ->where('name', 'like', "%{$studentData['class_name']}%")
                        ->first();
                    if ($class) {
                        $classId = $class->id;
                    }
                } elseif (isset($studentData['class_id'])) {
                    $classId = $studentData['class_id'];
                }

                // Create user account
                $user = User::create([
                    'name' => $studentData['first_name'] . ' ' . $studentData['last_name'],
                    'first_name' => $studentData['first_name'],
                    'last_name' => $studentData['last_name'],
                    'email' => $studentData['email'] ?? strtolower($studentData['first_name'] . '.' . $studentData['last_name'] . rand(10, 99) . '@skeeme.com'),
                    'password' => bcrypt($studentData['password'] ?? 'password123'),
                    'role' => 'student',
                    'status' => 'active',
                    'school_id' => $school->id,
                    'class_id' => $classId,
                    'email_verified_at' => now(),
                ]);
                
                // Auto-enroll in class courses if assigned to a class
                if ($classId) {
                    $classCourses = DB::table('class_courses')->where('class_id', $classId)->pluck('course_id');
                    foreach ($classCourses as $courseId) {
                        \App\Models\Enrollment::firstOrCreate([
                            'student_id' => $user->id,
                            'course_id' => $courseId,
                        ], [
                            'class_id' => $classId,
                            'enrolled_at' => now(),
                        ]);
                    }
                }
                
                $created[] = $user->name;
            }
            
            DB::commit();
            
            return [
                'success' => true,
                'message' => 'Successfully created ' . count($created) . ' students',
                'data' => ['created' => $created]
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create students: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Assign students to classes evenly
     */
    protected function assignStudentsToClasses(array $data, $school): array
    {
        // Placeholder for future implementation
        return [
            'success' => false,
            'message' => 'This action is not yet implemented'
        ];
    }

    /**
     * Generate unique student ID
     */
    protected function generateStudentId($school): string
    {
        $prefix = strtoupper(substr($school->name, 0, 3));
        $year = date('Y');
        $count = Student::where('school_id', $school->id)->count() + 1;
        
        return $prefix . $year . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Execute lecturers-related actions
     */
    protected function executeLecturersAction(string $action, array $data): array
    {
        $school = Auth::user()->school;
        
        return match($action) {
            'assign_lecturer_to_course' => $this->assignLecturerToClassCourse($data, $school),
            default => ['success' => false, 'message' => 'Action not supported']
        };
    }

    /**
     * Assign a lecturer to a course in a specific class
     */
    protected function assignLecturerToClassCourse(array $data, $school): array
    {
        $courseName = $data['course_name'];
        $className = $data['class_name'];
        $lecturerName = $data['lecturer_name'];

        // 1. Find the Class
        $class = \App\Models\SchoolClass::where('school_id', $school->id)
            ->where('name', 'LIKE', "%{$className}%")
            ->first();

        if (!$class) {
            return ['success' => false, 'message' => "Could not find class matching '{$className}'."];
        }

        // 2. Find the Course attached to this class (or global if needed)
        $course = $class->courses()->where('name', 'LIKE', "%{$courseName}%")->first();

        if (!$course) {
             // Fallback: Check if course exists globally and attach it
             $course = \App\Models\Course::where('school_id', $school->id)
                ->where('name', 'LIKE', "%{$courseName}%")
                ->first();
                
             if ($course) {
                 // Attach to class first
                 if (!$class->courses()->where('id', $course->id)->exists()) {
                     $class->courses()->attach($course->id);
                 }
             } else {
                 return ['success' => false, 'message' => "Could not find course '{$courseName}'."];
             }
        }

        // 3. Find Lecturer
        // Simple search logic
        $lecturer = \App\Models\User::where('school_id', $school->id)
            ->role('lecturer')
            ->where(function($q) use ($lecturerName) {
                $q->where('first_name', 'LIKE', "%{$lecturerName}%")
                  ->orWhere('last_name', 'LIKE', "%{$lecturerName}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$lecturerName}%");
            })
            ->first();

        if (!$lecturer) {
            return ['success' => false, 'message' => "Could not find lecturer matching '{$lecturerName}'."];
        }

        // 4. Assign Lecturer to Course
        if (!$course->lecturers()->where('user_id', $lecturer->id)->exists()) {
            $course->lecturers()->attach($lecturer->id);
            return [
                'success' => true, 
                'message' => "Assigned {$lecturer->first_name} {$lecturer->last_name} to teach {$course->name} in {$class->name}."
            ];
        }

        return [
            'success' => true, 
            'message' => "{$lecturer->first_name} is already assigned to {$course->name}."
        ];
    }

    /**
     * Execute courses-related actions
     */
    protected function executeCoursesAction(string $action, array $data): array
    {
        // Courses page actions are minimal now
         return ['success' => false, 'message' => 'Please use specific assignment commands.'];
    }

    /**
     * Generate course code from name
     */
    protected function generateCourseCode(string $name): string
    {
        $words = explode(' ', $name);
        $code = '';
        
        foreach (array_slice($words, 0, 3) as $word) {
            $code .= strtoupper(substr($word, 0, 3));
        }
        
        return $code . rand(100, 999);
    }

    /**
     * Execute announcements-related actions
     */
    public function executeAnnouncementsAction(string $action, array $data): array
    {
        $school = Auth::user()->school;
        
        return match($action) {
            'create_announcement' => $this->createAnnouncement($data, $school),
            default => ['success' => false, 'message' => 'Action not supported']
        };
    }

    protected function createAnnouncement(array $data, $school): array
    {
        DB::beginTransaction();
        try {
            $announcement = \App\Models\Announcement::create([
                'title' => $data['title'],
                'content' => $data['content'],
                'school_id' => $school->id,
                'target_type' => $data['target'] ?? 'all', // 'all', 'students', 'lecturers'
                'priority' => 'normal',
                'posted_by' => Auth::id(),
                'published_at' => now(),
            ]);

            DB::commit();
            return ['success' => true, 'message' => "Posted announcement: '{$announcement->title}' to {$announcement->target_type}."];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => "Failed to post: " . $e->getMessage()];
        }
    }

    /**
     * Execute calendar-related actions
     */
    public function executeCalendarAction(string $action, array $data): array
    {
        $school = Auth::user()->school;
        
        return match($action) {
            'create_calendar_event' => $this->createCalendarEvent($data, $school),
            default => ['success' => false, 'message' => 'Action not supported']
        };
    }

    protected function createCalendarEvent(array $data, $school): array
    {
        // Parse dates (AI usually sends Y-m-d H:i, or we let PHP guess)
        try {
            $start = \Carbon\Carbon::parse($data['start_date']);
            $end = isset($data['end_date']) ? \Carbon\Carbon::parse($data['end_date']) : $start->copy()->addHour();
        } catch (\Exception $e) {
            return ['success' => false, 'message' => "Invalid date format. Please use YYYY-MM-DD."];
        }

        $title = $data['title'] ?? $data['name'] ?? $data['event_name'] ?? 'Untitled Event';
        $description = $data['description'] ?? 'Event created by AI';
        $type = $data['type'] ?? $this->inferEventType($title, $description);

        DB::beginTransaction();
        try {
            $event = \App\Models\AcademicEvent::create([
                'school_id' => $school->id,
                'title' => $title,
                'description' => $description,
                'start_date' => $start,
                'end_date' => $end,
                'type' => $type, // event, holiday, milestone
            ]);

            DB::commit();
            return ['success' => true, 'message' => "Added event '{$event->title}' (" . ucfirst($type) . ") ({$start->format('M j')} - {$end->format('M j')}) to calendar."];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => "Failed to add event: " . $e->getMessage()];
        }
    }

    protected function inferEventType(string $title, string $description): string
    {
        $text = strtolower($title . ' ' . $description);
        
        $holidayKeywords = ['holiday', 'break', 'vacation', 'closure', 'christmas', 'easter', 'eid', 'independence', 'public holiday'];
        foreach ($holidayKeywords as $kw) {
            if (str_contains($text, $kw)) return 'holiday';
        }

        $milestoneKeywords = ['exam', 'test', 'quiz', 'submission', 'deadline', 'graduation', 'commencement', 'result', 'assessment'];
        foreach ($milestoneKeywords as $kw) {
            if (str_contains($text, $kw)) return 'milestone';
        }

        return 'event';
    }
}
