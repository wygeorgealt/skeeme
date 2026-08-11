<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Note;
use App\Models\Course;
use App\Notifications\NoteUploaded;
use Livewire\WithFileUploads;
use Livewire\Attributes\Url;
use App\Traits\HasToastNotifications;

class LecturerNotes extends Component
{
    use WithFileUploads;
    use HasToastNotifications;

    public $courses = [];
    #[Url]
    public $selectedCourse = '';
    public $notes;
    public $topics = [];
    public $showUploadForm = false;
    public $uploadedFile;
    public $newNote = [
        'title' => '',
        'description' => '',
        'topic_id' => '',
    ];

    public function mount()
    {
        $this->loadCourses();
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
        $this->loadNotes();
        $this->loadTopics();
    }

    public function loadNotes()
    {
        if (!$this->selectedCourse) {
            $this->notes = null;
            return;
        }

        $this->notes = Note::where('course_id', $this->selectedCourse)
            ->with(['topic', 'course'])
            ->orderBy('uploaded_at', 'desc')
            ->get();

        // Load embedding_status from notes automatically for UI
        foreach ($this->notes as $note) {
            $note->embedding_status = $note->embedding_status ?? 'pending';
        }
    }

    public function loadTopics()
    {
        if (!$this->selectedCourse) return;

        $this->topics = DB::table('scheme_of_work')
            ->where('course_id', $this->selectedCourse)
            ->select('id', 'topic')
            ->orderBy('week_number')
            ->get();
    }

    public function uploadNote()
    {
        $this->validate([
            'uploadedFile' => 'required|file|max:16384', // 16MB max
            'newNote.title' => 'required|string|max:255',
            'newNote.description' => 'nullable|string',
        ]);

        $filePath = $this->uploadedFile->store('notes');

        $note = Note::create([
            'course_id' => $this->selectedCourse,
            'lecturer_id' => Auth::id(),
            'title' => $this->newNote['title'],
            'description' => $this->newNote['description'],
            'file_path' => $filePath,
            'topic_id' => $this->newNote['topic_id'] ?: null,
            'uploaded_at' => now(),
            'embedding_status' => 'pending', // Initialize embedding status
        ]);

        $this->uploadedFile = null;
        $this->newNote = [
            'title' => '',
            'description' => '',
            'topic_id' => '',
        ];
        $this->showUploadForm = false;

        $this->loadNotes();

        // Dispatch job for async ingestion
        if ($note) {
            \App\Jobs\IngestNoteJob::dispatch($note);
        }

        // Notify students
        $this->notifyStudents();

        $this->toastSuccess('Note uploaded successfully!', 'Success');
    }

    public function deleteNote($noteId)
    {
        $note = Note::find($noteId);

        if ($note && $note->lecturer_id === Auth::id()) {
            // Delete file from storage
            if ($note->file_path && Storage::exists($note->file_path)) {
                Storage::delete($note->file_path);
            }

            $note->delete();
            $this->loadNotes();
            $this->toastSuccess('Note deleted successfully!', 'Success');
        }
    }

    private function notifyStudents()
    {
        $course = Course::find($this->selectedCourse);
        $note = Note::where('course_id', $this->selectedCourse)
            ->where('lecturer_id', Auth::id())
            ->latest()
            ->first();

        if ($course && $note) {
            $studentIds = DB::table('enrollments')
                ->where('course_id', $this->selectedCourse)
                ->pluck('student_id');

            // Send notifications to students after response
            foreach ($studentIds as $studentId) {
                $user = \App\Models\User::find($studentId);
                if ($user) {
                    $user->notify(new NoteUploaded($note, $course));
                }
            }
        }
    }

    public function render()
    {
        return view('livewire.lecturer-notes');
    }
}
