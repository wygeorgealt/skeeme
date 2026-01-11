<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\SchemeOfWork;
use App\Models\Course;
use App\Notifications\CurriculumUpdated;
use App\Traits\HasToastNotifications;
use Livewire\Attributes\Url;

class LecturerCurriculum extends Component
{
    use HasToastNotifications;

    public $courses = [];
    #[Url]
    public $selectedCourse = '';
    public $curriculum;
    public $showAddForm = false;
    public $editingTopic = null;
    public $newTopic = [
        'week_number' => '',
        'topic' => '',
        'description' => '',
        'status' => 'pending',
    ];

    public function mount()
    {
        $this->loadCourses();
        $this->curriculum = collect();
    }

    public function loadCourses()
    {
        $user = Auth::user();

        $this->courses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function selectCourse($courseId)
    {
        $this->selectedCourse = $courseId;
        $this->loadCurriculum();
    }

    public function updatedSelectedCourse()
    {
        $this->loadCurriculum();
    }

    public function loadCurriculum()
    {
        if (!$this->selectedCourse) {
            $this->curriculum = collect();
            return;
        }

        $this->curriculum = SchemeOfWork::where('course_id', $this->selectedCourse)
            ->with('course')
            ->orderBy('week_number')
            ->get();
    }

    public function addTopic()
    {
        $this->validate([
            'newTopic.week_number' => 'required|integer|min:1',
            'newTopic.topic' => 'required|string|max:255',
            'newTopic.description' => 'nullable|string',
        ]);

        SchemeOfWork::create([
            'course_id' => $this->selectedCourse,
            'week_number' => $this->newTopic['week_number'],
            'topic' => $this->newTopic['topic'],
            'description' => $this->newTopic['description'],
            'status' => $this->newTopic['status'],
        ]);

        $this->newTopic = [
            'week_number' => '',
            'topic' => '',
            'description' => '',
            'status' => 'pending',
        ];
        $this->showAddForm = false;
        $this->loadCurriculum();

        // Show success toast
        $this->toastSuccess('Topic added successfully!', 'Curriculum Updated');

        // Notify students
        $this->notifyStudents();

        session()->flash('message', 'Topic added successfully!');
    }

    public function editTopic($topicId)
    {
        $topic = SchemeOfWork::find($topicId);
        $this->editingTopic = $topicId;
        $this->newTopic = [
            'week_number' => $topic->week_number,
            'topic' => $topic->topic,
            'description' => $topic->description,
            'status' => $topic->status,
        ];
    }

    public function updateTopic()
    {
        $this->validate([
            'newTopic.week_number' => 'required|integer|min:1',
            'newTopic.topic' => 'required|string|max:255',
            'newTopic.description' => 'nullable|string',
        ]);

        $topic = SchemeOfWork::find($this->editingTopic);
        $topic->update([
            'week_number' => $this->newTopic['week_number'],
            'topic' => $this->newTopic['topic'],
            'description' => $this->newTopic['description'],
            'status' => $this->newTopic['status'],
        ]);

        $this->editingTopic = null;
        $this->newTopic = [
            'week_number' => '',
            'topic' => '',
            'description' => '',
            'status' => 'pending',
        ];
        $this->loadCurriculum();

        // Show success toast
        $this->toastSuccess('Topic updated successfully!', 'Curriculum Updated');

        // Notify students
        $this->notifyStudents();

        session()->flash('message', 'Topic updated successfully!');
    }

    public function deleteTopic($topicId)
    {
        SchemeOfWork::find($topicId)->delete();
        $this->loadCurriculum();

        // Show success toast
        $this->toastSuccess('Topic deleted successfully!', 'Curriculum Updated');

        session()->flash('message', 'Topic deleted successfully!');
    }

    public function cancelEdit()
    {
        $this->editingTopic = null;
        $this->newTopic = [
            'week_number' => '',
            'topic' => '',
            'description' => '',
            'status' => 'pending',
        ];
    }

    private function notifyStudents()
    {
        $course = Course::find($this->selectedCourse);
        $schemeOfWork = SchemeOfWork::where('course_id', $this->selectedCourse)
            ->latest()
            ->first();

        if ($course && $schemeOfWork) {
            $studentIds = DB::table('enrollments')
                ->where('course_id', $this->selectedCourse)
                ->pluck('student_id')
                ->toArray();

            // Send notifications to students
            foreach ($studentIds as $studentId) {
                try {
                    $user = \App\Models\User::find($studentId);
                    if ($user && $schemeOfWork) {
                        $user->notify(new CurriculumUpdated($schemeOfWork, $course));
                    }
                } catch (\Exception $e) {
                    \Log::warning("Failed to notify student {$studentId} for curriculum update: " . $e->getMessage());
                }
            }

            // Send real-time toast notification to students
            $this->toastBroadcast(
                "The curriculum for '{$course->name}' has been updated. Check your curriculum page for the latest topics.",
                $studentIds,
                'info',
                'Curriculum Updated',
                8000,
                [
                    'url' => route('student.curriculum'),
                    'text' => 'View Curriculum'
                ]
            );

            // Also dispatch a custom event to StudentCurriculum components
            $this->dispatch('curriculumUpdated', [
                'course_id' => $course->id,
                'course_name' => $course->name,
                'scheme_of_work_id' => $schemeOfWork->id
            ]);
        }
    }

    public function render()
    {
        return view('livewire.lecturer-curriculum');
    }
}
