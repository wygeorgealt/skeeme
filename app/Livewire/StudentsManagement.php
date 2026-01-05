<?php

namespace App\Livewire;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use Livewire\Component;
use Livewire\WithPagination;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Notifications\StudentEnrollment;

use App\Notifications\LecturerAlert;

class StudentsManagement extends Component
{
    use WithPagination;

    public $search = '';
    public $statusFilter = 'all';
    public $classFilter = 'all';
    public $sortBy = 'name';
    public $sortDirection = 'asc';

    public $showAddModal = false;
    public $showEditModal = false;
    public $showDeleteModal = false;
    public $showDetailsModal = false;
    public $showBulkResetModal = false;
    public $confirmingAction = null;

    public $selectedStudent = null;
    public $studentDetails = null;

    // Add Student Form
    public $firstName = '';
    public $lastName = '';
    public $middleName = '';
    public $address = '';
    public $selectedClassId = '';

    // Edit Student Form
    public $editFirstName = '';
    public $editLastName = '';
    public $editMiddleName = '';
    public $editAddress = '';
    public $editClassId = '';
    public $editStatus = 'active';

    // Bulk Operations
    public $selectedStudents = [];
    public $selectAll = false;

    protected $queryString = [
        'search' => ['except' => ''],
        'statusFilter' => ['except' => 'all'],
        'classFilter' => ['except' => 'all'],
        'sortBy' => ['except' => 'name'],
        'sortDirection' => ['except' => 'asc'],
    ];

    public function mount()
    {
        $this->authorizeStudentsManagement();
    }

    protected function authorizeStudentsManagement()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to students management.');
        }
    }

    public function updatedSearch()
    {
        $this->resetPage();
        $this->resetSelection();
    }

    public function updatedStatusFilter()
    {
        $this->resetPage();
        $this->resetSelection();
    }

    public function updatedClassFilter()
    {
        $this->resetPage();
        $this->resetSelection();
    }

    public function updatedSelectAll($value)
    {
        if ($value) {
            $this->selectedStudents = $this->getStudents()->pluck('id')->toArray();
        } else {
            $this->selectedStudents = [];
        }
    }

    public function updatedSelectedStudents()
    {
        $totalStudents = $this->getStudents()->count();
        $this->selectAll = count($this->selectedStudents) === $totalStudents && $totalStudents > 0;
    }

    protected function resetSelection()
    {
        $this->selectedStudents = [];
        $this->selectAll = false;
    }

    public function sortBy($column)
    {
        if ($this->sortBy === $column) {
            $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortBy = $column;
            $this->sortDirection = 'asc';
        }
        $this->resetPage();
        $this->resetSelection();
    }

    public function getStudents()
    {
        $query = User::where('role', 'student')
            ->where('school_id', auth()->user()->school_id)
            ->with('schoolClass')
            ->when($this->search, function ($query) {
                $query->where(function ($q) {
                    $q->where('first_name', 'like', '%' . $this->search . '%')
                      ->orWhere('last_name', 'like', '%' . $this->search . '%')
                      ->orWhere('email', 'like', '%' . $this->search . '%');
                });
            })
            ->when($this->statusFilter !== 'all', function ($query) {
                $query->where('status', $this->statusFilter);
            })
            ->when($this->classFilter !== 'all', function ($query) {
                if ($this->classFilter === 'no_class') {
                    $query->whereNull('class_id');
                } else {
                    $query->where('class_id', $this->classFilter);
                }
            });

        // Apply sorting
        switch ($this->sortBy) {
            case 'name':
                $query->orderBy('first_name', $this->sortDirection)
                      ->orderBy('last_name', $this->sortDirection);
                break;
            case 'email':
                $query->orderBy('email', $this->sortDirection);
                break;
            case 'class':
                $query->leftJoin('classes', 'users.class_id', '=', 'classes.id')
                      ->orderBy('classes.name', $this->sortDirection)
                      ->select('users.*');
                break;
            case 'status':
                $query->orderBy('status', $this->sortDirection);
                break;
            case 'created_at':
                $query->orderBy('created_at', $this->sortDirection);
                break;
        }

        return $query->paginate(10);
    }

    public function getAvailableClasses()
    {
        return SchoolClass::where('school_id', auth()->user()->school_id)
            ->orderBy('name')
            ->get();
    }

    public function openAddModal()
    {
        $this->resetAddForm();
        $this->showAddModal = true;
    }

    public function confirmAdd()
    {
        $this->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'middleName' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'selectedClassId' => 'required|exists:classes,id,school_id,' . auth()->user()->school_id,
        ]);

        // Check for duplicate name if middle name is missing
        if (empty($this->middleName)) {
            $existingUser = User::where('first_name', $this->firstName)
                ->where('last_name', $this->lastName)
                ->with('school')
                ->first();

            if ($existingUser) {
                $schoolName = $existingUser->school->name ?? 'another school';
                $this->addError('middleName', "name exists in {$schoolName} please provide a middle name");
                return;
            }
        }

        $student = null;
        DB::transaction(function () use (&$student) {
            // Generate unique email
            $baseEmail = strtolower($this->firstName . '.' . $this->lastName . '@skeeme.com');
            $email = $this->generateUniqueEmail($baseEmail);

            $student = User::create([
                'name' => $this->firstName . ' ' . $this->lastName,
                'first_name' => $this->firstName,
                'last_name' => $this->lastName,
                'middle_name' => $this->middleName,
                'email' => $email,
                'password' => bcrypt('password123'),
                'address' => $this->address,
                'role' => 'student',
                'status' => 'active',
                'school_id' => auth()->user()->school_id,
                'class_id' => $this->selectedClassId,
                'email_verified_at' => now(),
            ]);

            // Auto-enroll in all class courses
            $this->autoEnrollStudentInClassCourses($student, $this->selectedClassId);
        });



        session()->flash('message', 'Student added successfully and enrolled in class courses.');
        $this->dispatch('student-added');
        $this->closeModals();
    }

    protected function generateUniqueEmail($baseEmail)
    {
        $email = $baseEmail;
        $counter = 1;

        while (User::where('email', $email)->exists()) {
            $nameParts = explode('@', $baseEmail);
            $email = $nameParts[0] . $counter . '@' . $nameParts[1];
            $counter++;
        }

        return $email;
    }

    protected function autoEnrollStudentInClassCourses(User $student, $classId)
    {
        $classCourses = DB::table('class_courses')->where('class_id', $classId)->pluck('course_id');

        foreach ($classCourses as $courseId) {
            Enrollment::firstOrCreate([
                'student_id' => $student->id,
                'course_id' => $courseId,
            ], [
                'class_id' => $classId,
                'enrolled_at' => now(),
            ]);
        }
    }

    public function openEditModal($studentId)
    {
        $this->selectedStudent = User::where('id', $studentId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedStudent) {
            $this->editFirstName = $this->selectedStudent->first_name;
            $this->editLastName = $this->selectedStudent->last_name;
            $this->editMiddleName = $this->selectedStudent->middle_name ?? '';
            $this->editAddress = $this->selectedStudent->address ?? '';
            $this->editClassId = $this->selectedStudent->class_id;
            $this->editStatus = $this->selectedStudent->status;
            $this->showEditModal = true;
        }
    }

    public function confirmEdit()
    {
        $this->validate([
            'editFirstName' => 'required|string|max:255',
            'editLastName' => 'required|string|max:255',
            'editMiddleName' => 'nullable|string|max:255',
            'editAddress' => 'nullable|string|max:500',
            'editClassId' => 'required|exists:classes,id,school_id,' . auth()->user()->school_id,
            'editStatus' => 'required|in:active,suspended',
        ]);

        if (!$this->selectedStudent) {
            session()->flash('error', 'Student not found.');
            return;
        }

        $oldClassId = $this->selectedStudent->class_id;

        DB::transaction(function () use ($oldClassId) {
            $this->selectedStudent->update([
                'first_name' => $this->editFirstName,
                'last_name' => $this->editLastName,
                'middle_name' => $this->editMiddleName,
                'address' => $this->editAddress,
                'class_id' => $this->editClassId,
                'status' => $this->editStatus,
            ]);

            // Handle class change enrollment logic
            if ($oldClassId != $this->editClassId) {
                $this->handleClassChangeEnrollments($this->selectedStudent, $oldClassId, $this->editClassId);
            }
        });



        session()->flash('message', 'Student updated successfully.');
        $this->dispatch('student-updated');
        $this->closeModals();
    }

    protected function handleClassChangeEnrollments(User $student, $oldClassId, $newClassId)
    {
        // Unenroll from old class courses
        if ($oldClassId) {
            $oldClassCourses = DB::table('class_courses')->where('class_id', $oldClassId)->pluck('course_id');
            Enrollment::where('student_id', $student->id)
                ->whereIn('course_id', $oldClassCourses)
                ->delete();
        }

        // Enroll in new class courses
        $this->autoEnrollStudentInClassCourses($student, $newClassId);
    }

    public function openDeleteModal($studentId)
    {
        $this->selectedStudent = User::where('id', $studentId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedStudent) {
            $this->confirmingAction = 'delete';
            $this->showDeleteModal = true;
        }
    }

    public function confirmDelete()
    {
        if (!$this->selectedStudent) {
            session()->flash('error', 'Student not found.');
            return;
        }

        $studentName = $this->selectedStudent->first_name . ' ' . $this->selectedStudent->last_name;

        // Delete enrollments first
        Enrollment::where('student_id', $this->selectedStudent->id)->delete();

        // Delete student
        $this->selectedStudent->delete();



        session()->flash('message', 'Student deleted successfully.');
        $this->dispatch('student-deleted');
        $this->closeModals();
        $this->resetSelection();
    }

    public function resetPassword($studentId)
    {
        $student = User::where('id', $studentId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($student) {
            $student->update(['password' => bcrypt('password123')]);
            session()->flash('message', 'Password reset to "password123" for ' . $student->first_name . ' ' . $student->last_name);
            $this->dispatch('password-reset');
        }
    }

    public function openBulkResetModal()
    {
        if (empty($this->selectedStudents)) {
            session()->flash('error', 'Please select students to reset passwords.');
            return;
        }
        $this->showBulkResetModal = true;
    }

    public function confirmBulkReset()
    {
        if (empty($this->selectedStudents)) {
            session()->flash('error', 'No students selected.');
            return;
        }

        User::whereIn('id', $this->selectedStudents)
            ->where('school_id', auth()->user()->school_id)
            ->update(['password' => bcrypt('password123')]);

        $count = count($this->selectedStudents);



        session()->flash('message', "Passwords reset to 'password123' for {$count} student(s).");
        $this->dispatch('bulk-password-reset');
        $this->closeModals();
        $this->resetSelection();
    }

    public function viewStudentDetails($studentId)
    {
        $this->selectedStudent = User::with('schoolClass')
            ->where('id', $studentId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedStudent) {
            $enrollmentsCount = Enrollment::where('student_id', $studentId)->count();

            $this->studentDetails = [
                'full_name' => $this->selectedStudent->first_name . ' ' . ($this->selectedStudent->middle_name ? $this->selectedStudent->middle_name . ' ' : '') . $this->selectedStudent->last_name,
                'email' => $this->selectedStudent->email,
                'address' => $this->selectedStudent->address ?? 'Not provided',
                'class' => $this->selectedStudent->schoolClass ? $this->selectedStudent->schoolClass->name : 'No class assigned',
                'status' => $this->selectedStudent->status,
                'registration_date' => $this->selectedStudent->created_at->format('M d, Y'),
                'enrollments_count' => $enrollmentsCount,
            ];
            $this->showDetailsModal = true;
        }
    }

    public function exportStudents($format = 'csv')
    {
        $students = $this->getStudents()->get();

        if ($format === 'csv') {
            $filename = 'students_export_' . now()->format('Y-m-d') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function () use ($students) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['First Name', 'Last Name', 'Email', 'Class', 'Status', 'Registration Date']);

                foreach ($students as $student) {
                    fputcsv($file, [
                        $student->first_name,
                        $student->last_name,
                        $student->email,
                        $student->schoolClass ? $student->schoolClass->name : 'No class',
                        ucfirst($student->status),
                        $student->created_at->format('Y-m-d'),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } elseif ($format === 'pdf') {
            // PDF export would require additional packages like dompdf or tcpdf
            // For now, we'll implement CSV only
            return $this->exportStudents('csv');
        }
    }

    protected function resetAddForm()
    {
        $this->firstName = '';
        $this->lastName = '';
        $this->middleName = '';
        $this->address = '';
        $this->selectedClassId = '';
    }

    public function closeModals()
    {
        $this->showAddModal = false;
        $this->showEditModal = false;
        $this->showDeleteModal = false;
        $this->showDetailsModal = false;
        $this->showBulkResetModal = false;
        $this->selectedStudent = null;
        $this->confirmingAction = null;
        $this->resetAddForm();
    }

    protected function notifyLecturersAboutStudentAddition(User $student, $classId)
    {
        // Get all lecturers teaching courses in this class
        $lecturers = DB::table('course_lecturers')
            ->join('class_courses', 'course_lecturers.course_id', '=', 'class_courses.course_id')
            ->join('users', 'course_lecturers.user_id', '=', 'users.id')
            ->where('class_courses.class_id', $classId)
            ->where('users.school_id', auth()->user()->school_id)
            ->select('users.id', 'users.first_name', 'users.last_name')
            ->distinct()
            ->get();

        $class = SchoolClass::find($classId);

        foreach ($lecturers as $lecturer) {
            $lecturerUser = User::find($lecturer->id);
            if ($lecturerUser) {
                $lecturerUser->notify(new LecturerAlert(
                    'New Student Added to Class',
                    "A new student {$student->first_name} {$student->last_name} has been added to class {$class->name}. Please ensure they are properly enrolled in your courses.",
                    route('dashboard')
                ));
            }
        }
    }

    public function render()
    {
        return view('livewire.students-management', [
            'students' => $this->getStudents(),
            'availableClasses' => $this->getAvailableClasses(),
        ]);
    }
}
