<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Livewire\WithFileUploads;
use Livewire\Attributes\Url;

class StudentNotes extends Component
{
    use WithFileUploads;

    public $notes = [];
    #[Url]
    public $selectedCourse = '';
    public $courses = [];

    public function mount()
    {
        $this->loadCourses();
        $this->loadNotes();
    }

    public function loadCourses()
    {
        $user = Auth::user();

        $this->courses = DB::table('courses')
            ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->where('enrollments.student_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function loadNotes()
    {
        $user = Auth::user();

        $query = DB::table('notes')
            ->join('courses', 'notes.course_id', '=', 'courses.id')
            ->join('enrollments', function($join) use ($user) {
                $join->on('courses.id', '=', 'enrollments.course_id')
                     ->where('enrollments.student_id', $user->id);
            })
            ->leftJoin('users as lecturers', 'notes.lecturer_id', '=', 'lecturers.id')
            ->leftJoin('scheme_of_work', 'notes.topic_id', '=', 'scheme_of_work.id')
            ->select(
                'notes.*',
                'courses.name as course_name',
                'courses.code as course_code',
                DB::raw('CONCAT(lecturers.first_name, " ", lecturers.last_name) as lecturer_name'),
                'scheme_of_work.topic as topic_name'
            )
            ->orderBy('notes.uploaded_at', 'desc');

        if ($this->selectedCourse) {
            $query->where('notes.course_id', $this->selectedCourse);
        }

        $this->notes = $query->get();
    }

    public function updatedSelectedCourse()
    {
        $this->loadNotes();
    }

    public function downloadNote($noteId)
    {
        $note = DB::table('notes')->where('id', $noteId)->first();

        if ($note && $note->file_path) {
            return response()->download(storage_path('app/public/' . $note->file_path));
        }

        $this->toastError('File not found.', 'Error');
    }

    public function render()
    {
        return view('livewire.student-notes');
    }
}
