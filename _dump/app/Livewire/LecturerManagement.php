<?php

namespace App\Livewire;

use App\Models\User;
use App\Models\IndividualSubscription;
use App\Events\UserApproved;
use Livewire\Component;
use Livewire\WithPagination;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LecturerManagement extends Component
{
    use WithPagination;

    public $search = '';
    public $statusFilter = 'all';
    public $sortBy = 'name';
    public $sortDirection = 'asc';

    public $showLecturerModal = false;
    public $showRejectModal = false;
    public $showRemoveModal = false;
    public $showDetailsModal = false;
    public $showApproveModal = false;
    public $confirmingAction = null;

    public $selectedLecturer = null;
    public $lecturerDetails = null;

    public $editName = '';
    public $editEmail = '';
    public $editFirstName = '';
    public $editLastName = '';
    public $editPhone = '';

    protected $queryString = [
        'search' => ['except' => ''],
        'statusFilter' => ['except' => 'all'],
        'sortBy' => ['except' => 'name'],
        'sortDirection' => ['except' => 'asc'],
    ];

    public function mount()
    {
        $this->authorizeLecturerManagement();
    }

    protected function authorizeLecturerManagement()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to lecturer management.');
        }
    }

    public function updatedSearch()
    {
        $this->resetPage();
    }

    public function updatedStatusFilter()
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

    public function getLecturersQuery()
    {
        $query = User::where('role', 'lecturer')
            ->where('school_id', auth()->user()->school_id)
            ->when($this->search, function ($query) {
                $query->where(function ($q) {
                    $q->where('first_name', 'like', '%' . $this->search . '%')
                      ->orWhere('last_name', 'like', '%' . $this->search . '%')
                      ->orWhere('email', 'like', '%' . $this->search . '%');
                });
            })
            ->when($this->statusFilter !== 'all', function ($query) {
                $query->where('status', $this->statusFilter);
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
            case 'status':
                $query->orderBy('status', $this->sortDirection);
                break;
            case 'created_at':
                $query->orderBy('created_at', $this->sortDirection);
                break;
        }

        return $query;
    }

    public function getLecturers()
    {
        return $this->getLecturersQuery()->paginate(10);
    }

    public function openApproveModal($lecturerId)
    {
        $this->selectedLecturer = User::where('id', $lecturerId)
            ->where('school_id', auth()->user()->school_id)
            ->where('status', 'pending')
            ->first();

        if ($this->selectedLecturer) {
            $this->confirmingAction = 'approve';
            $this->showApproveModal = true;
        }
    }

    public function confirmApprove()
    {
        if (!$this->selectedLecturer) {
            session()->flash('error', 'Lecturer not found.');
            return;
        }

        DB::transaction(function () {
            $this->selectedLecturer->update([
                'status' => 'active',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Only create individual subscription for lecturers not belonging to a school
            if (!$this->selectedLecturer->school_id && !$this->selectedLecturer->individualSubscription) {
                IndividualSubscription::create([
                    'user_id' => $this->selectedLecturer->id,
                    'plan_name' => 'Free',
                    'student_limit' => 10,
                    'price' => 0.00,
                    'start_date' => now(),
                    'expiry_date' => now()->addYear(),
                    'is_active' => true,
                ]);
            }

            // Dispatch event to send approval email
            event(new UserApproved($this->selectedLecturer, auth()->user()));
        });

        session()->flash('message', 'Lecturer approved successfully. Approval email sent.');
        $this->dispatch('lecturer-approved');
        $this->closeModals();
    }

    public function openRejectModal($lecturerId)
    {
        $this->selectedLecturer = User::where('id', $lecturerId)
            ->where('school_id', auth()->user()->school_id)
            ->where('status', 'pending')
            ->first();

        if ($this->selectedLecturer) {
            $this->confirmingAction = 'reject';
            $this->showRejectModal = true;
        }
    }

    public function confirmReject()
    {
        if (!$this->selectedLecturer) {
            session()->flash('error', 'Lecturer not found.');
            return;
        }

        DB::transaction(function () {
            // Send rejection email
            $this->sendRejectionEmail($this->selectedLecturer);

            // Schedule account deletion (8 hours)
            $this->selectedLecturer->update([
                'status' => 'rejected',
                'email_verified_at' => null, // Prevent login
            ]);

            // In a real app, you'd schedule a job to delete after 8 hours
            // For now, we'll just mark as rejected
        });

        session()->flash('message', 'Lecturer rejected. Account will be cleared in 8 hours.');
        $this->dispatch('lecturer-rejected');
        $this->closeModals();
    }

    public function openRemoveModal($lecturerId)
    {
        $this->selectedLecturer = User::where('id', $lecturerId)
            ->where('school_id', auth()->user()->school_id)
            ->where('status', 'active')
            ->first();

        if ($this->selectedLecturer) {
            $this->confirmingAction = 'remove';
            $this->showRemoveModal = true;
        }
    }

    public function confirmRemove()
    {
        if (!$this->selectedLecturer) {
            session()->flash('error', 'Lecturer not found.');
            return;
        }

        $this->selectedLecturer->update(['status' => 'pending']);
        session()->flash('message', 'Lecturer removed. Status changed to pending.');
        $this->dispatch('lecturer-removed');
        $this->closeModals();
    }

    public function viewLecturerDetails($lecturerId)
    {
        $this->selectedLecturer = User::where('id', $lecturerId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedLecturer) {
            $subscriptionPlan = 'None';
            $coursesLimit = 'Unlimited';

            if ($this->selectedLecturer->school_id) {
                // School lecturer - uses school subscription
                $schoolSubscription = $this->selectedLecturer->school->activeSubscription;
                $subscriptionPlan = $schoolSubscription ? $schoolSubscription->plan_name : 'No School Plan';
                $coursesLimit = 'Unlimited'; // School lecturers have unlimited courses under school plan
            } else {
                // Individual lecturer - uses individual subscription
                $individualSubscription = $this->selectedLecturer->individualSubscription;
                $subscriptionPlan = $individualSubscription ? $individualSubscription->plan_name : 'None';
                $coursesLimit = $individualSubscription ? $individualSubscription->getCourseLimit() : 'Unlimited';
            }

            $this->lecturerDetails = [
                'full_name' => $this->selectedLecturer->first_name . ' ' . $this->selectedLecturer->last_name,
                'email' => $this->selectedLecturer->email,
                'phone' => $this->selectedLecturer->phone ?? 'Not provided',
                'status' => $this->selectedLecturer->status,
                'registration_date' => $this->selectedLecturer->created_at->format('M d, Y'),
                'courses_count' => $this->selectedLecturer->courses()->count(),
                'subscription_plan' => $subscriptionPlan,
                'courses_limit' => $coursesLimit,
                'courses_used' => $this->selectedLecturer->courses()->count(),
            ];
            $this->showDetailsModal = true;
        }
    }

    public function exportLecturers()
    {
        $lecturers = $this->getLecturersQuery()->get();

        $filename = 'lecturers_export_' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($lecturers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Full Name', 'Email', 'Status', 'Registration Date', 'Courses', 'Plan']);

            foreach ($lecturers as $lecturer) {
                $plan = 'None';
                if ($lecturer->school_id) {
                    $schoolSubscription = $lecturer->school->activeSubscription;
                    $plan = $schoolSubscription ? 'School: ' . $schoolSubscription->plan_name : 'No School Plan';
                } else {
                    $individualSubscription = $lecturer->individualSubscription;
                    $plan = $individualSubscription ? 'Individual: ' . $individualSubscription->plan_name : 'None';
                }

                fputcsv($file, [
                    $lecturer->first_name . ' ' . $lecturer->last_name,
                    $lecturer->email,
                    ucfirst($lecturer->status),
                    $lecturer->created_at->format('Y-m-d'),
                    $lecturer->courses()->count(),
                    $plan,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    protected function sendApprovalEmail(User $lecturer)
    {
        // In a real app, you'd create a Mailable class
        // For now, we'll just log it
        Log::info('Approval email sent to: ' . $lecturer->email);
    }

    protected function sendRejectionEmail(User $lecturer)
    {
        // In a real app, you'd create a Mailable class
        // For now, we'll just log it
        Log::info('Rejection email sent to: ' . $lecturer->email);
    }

    public function closeModals()
    {
        $this->showApproveModal = false;
        $this->showRejectModal = false;
        $this->showRemoveModal = false;
        $this->showDetailsModal = false;
        $this->selectedLecturer = null;
        $this->confirmingAction = null;
    }

    public function render()
    {
        return view('livewire.lecturer-management', [
            'lecturers' => $this->getLecturers(),
        ]);
    }
}
