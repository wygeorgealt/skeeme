<?php

namespace App\Livewire;

use App\Models\User;
use App\Models\School;
use Livewire\Component;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class LecturerOnboarding extends Component
{
    public $step = 1;
    public $firstName = '';
    public $lastName = '';
    public $phoneNumber = '';
    public $schoolSearch = '';
    public $selectedSchoolId = null;
    public $schools = [];
    public $filteredSchools = [];

    protected $rules = [
        'firstName' => ['required', 'string', 'max:100'],
        'lastName' => ['required', 'string', 'max:100'],
        'phoneNumber' => ['nullable', 'string', 'max:20'],
        'selectedSchoolId' => ['required', 'exists:schools,id'],
    ];

    public function mount()
    {
        // Redirect if not authenticated
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // Check if user selected lecturer role
        $role = Session::get('registration_role');
        if ($role !== 'lecturer') {
            return redirect()->route('role-selection');
        }

        $this->schools = School::select('id', 'name')->get()->toArray();
    }

    public function updatedSchoolSearch($value)
    {
        if (strlen($value) >= 2) {
            $this->filteredSchools = School::where('name', 'like', '%' . $value . '%')
                ->select('id', 'name')
                ->limit(10)
                ->get()
                ->toArray();
        } else {
            $this->filteredSchools = [];
        }
    }

    public function selectSchool($schoolId)
    {
        $school = School::find($schoolId);
        if ($school) {
            $this->selectedSchoolId = $schoolId;
            $this->schoolSearch = $school->name;
            $this->filteredSchools = [];
        }
    }

    public function nextStep()
    {
        if ($this->step === 1) {
            $this->validate([
                'firstName' => $this->rules['firstName'],
                'lastName' => $this->rules['lastName'],
                'phoneNumber' => $this->rules['phoneNumber'],
            ]);
        }

        $this->step++;
    }

    public function previousStep()
    {
        if ($this->step > 1) {
            $this->step--;
        }
    }

    public function complete()
    {
        $this->validate([
            'selectedSchoolId' => $this->rules['selectedSchoolId'],
        ]);

        $user = Auth::user();

        // Update user with onboarding info
        $user->update([
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'phone_number' => $this->phoneNumber,
            'school_id' => $this->selectedSchoolId,
            'role' => 'lecturer',
            'status' => 'pending',
        ]);

        Session::forget('registration_role');

        return redirect()->route('lecturer.pending-approval');
    }

    public function render()
    {
        return view('livewire.lecturer-onboarding');
    }
}
