<?php

namespace App\Livewire;

use App\Models\SchoolClass;
use Livewire\Component;
use Livewire\WithPagination;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ClassesManagement extends Component
{
    use WithPagination;

    public $search = '';
    public $sortBy = 'name';
    public $sortDirection = 'asc';

    public $showAddModal = false;
    public $showEditModal = false;
    public $showDeleteModal = false;
    public $showClassDetailsModal = false;
    public $confirmingAction = null;

    public $selectedClass = null;
    public $classDetails = null;

    // Add Class Form
    public $className = '';
    public $classDescription = '';

    // Edit Class Form
    public $editClassName = '';
    public $editClassDescription = '';

    protected $queryString = [
        'search' => ['except' => ''],
        'sortBy' => ['except' => 'name'],
        'sortDirection' => ['except' => 'asc'],
    ];

    public function mount()
    {
        $this->authorizeClassesManagement();
    }

    protected function authorizeClassesManagement()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to classes management.');
        }
    }

    public function updatedSearch()
    {
        $this->resetPage();
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
    }

    public function getClasses()
    {
        $query = SchoolClass::where('school_id', auth()->user()->school_id)
            ->withCount('students')
            ->when($this->search, function ($query) {
                $query->where(function ($q) {
                    $q->where('name', 'like', '%' . $this->search . '%')
                      ->orWhere('description', 'like', '%' . $this->search . '%');
                });
            });

        // Apply sorting
        switch ($this->sortBy) {
            case 'name':
                $query->orderBy('name', $this->sortDirection);
                break;
            case 'students_count':
                $query->orderBy('students_count', $this->sortDirection);
                break;
            case 'created_at':
                $query->orderBy('created_at', $this->sortDirection);
                break;
        }

        return $query->paginate(10);
    }

    public function openAddModal()
    {
        $this->resetAddForm();
        $this->showAddModal = true;
    }

    public function confirmAdd()
    {
        $this->validate([
            'className' => 'required|string|max:255|unique:classes,name,NULL,id,school_id,' . auth()->user()->school_id,
            'classDescription' => 'nullable|string|max:1000',
        ]);

        SchoolClass::create([
            'name' => $this->className,
            'description' => $this->classDescription,
            'school_id' => auth()->user()->school_id,
        ]);

        session()->flash('message', 'Class added successfully.');
        $this->dispatch('class-added');
        $this->closeModals();
    }

    public function openEditModal($classId)
    {
        $this->selectedClass = SchoolClass::where('id', $classId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedClass) {
            $this->editClassName = $this->selectedClass->name;
            $this->editClassDescription = $this->selectedClass->description ?? '';
            $this->showEditModal = true;
        }
    }

    public function confirmEdit()
    {
        $this->validate([
            'editClassName' => 'required|string|max:255|unique:classes,name,' . $this->selectedClass->id . ',id,school_id,' . auth()->user()->school_id,
            'editClassDescription' => 'nullable|string|max:1000',
        ]);

        if (!$this->selectedClass) {
            session()->flash('error', 'Class not found.');
            return;
        }

        $this->selectedClass->update([
            'name' => $this->editClassName,
            'description' => $this->editClassDescription,
        ]);

        session()->flash('message', 'Class updated successfully.');
        $this->dispatch('class-updated');
        $this->closeModals();
    }

    public function openDeleteModal($classId)
    {
        $this->selectedClass = SchoolClass::where('id', $classId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedClass) {
            $this->confirmingAction = 'delete';
            $this->showDeleteModal = true;
        }
    }

    public function confirmDelete()
    {
        if (!$this->selectedClass) {
            session()->flash('error', 'Class not found.');
            return;
        }

        // Check if class has students
        if ($this->selectedClass->students()->count() > 0) {
            session()->flash('error', 'Cannot delete class with enrolled students. Please remove all students first.');
            return;
        }

        // Remove all course associations
        DB::table('class_courses')->where('class_id', $this->selectedClass->id)->delete();

        $this->selectedClass->delete();

        session()->flash('message', 'Class deleted successfully.');
        $this->dispatch('class-deleted');
        $this->closeModals();
    }

    public function viewClassDetails($classId)
    {
        $this->selectedClass = SchoolClass::with(['students', 'courses'])
            ->where('id', $classId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedClass) {
            $this->classDetails = [
                'name' => $this->selectedClass->name,
                'description' => $this->selectedClass->description ?? 'No description',
                'students_count' => $this->selectedClass->students()->count(),
                'courses_count' => $this->selectedClass->courses()->count(),
                'created_at' => $this->selectedClass->created_at->format('M d, Y'),
                'students' => $this->selectedClass->students()->select('id', 'first_name', 'last_name', 'email')->get(),
                'courses' => $this->selectedClass->courses()->select('courses.id', 'courses.name', 'courses.code', 'courses.description')->get(),
            ];
            $this->showClassDetailsModal = true;
        }
    }

    protected function resetAddForm()
    {
        $this->className = '';
        $this->classDescription = '';
    }

    public function closeModals()
    {
        $this->showAddModal = false;
        $this->showEditModal = false;
        $this->showDeleteModal = false;
        $this->showClassDetailsModal = false;
        $this->selectedClass = null;
        $this->confirmingAction = null;
        $this->resetAddForm();
    }

    public function render()
    {
        return view('livewire.classes-management', [
            'classes' => $this->getClasses(),
        ]);
    }
}
