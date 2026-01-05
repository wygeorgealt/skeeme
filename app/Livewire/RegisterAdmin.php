<?php

namespace App\Livewire;

use App\Models\User;
use App\Models\School;
use App\Mail\WelcomeAdminEmail;
use App\Events\UserRegistered;
use Illuminate\Support\Facades\Mail;
use Livewire\Component;
use Livewire\Attributes\Validate;

class RegisterAdmin extends Component
{
    #[Validate('required|string|max:255')]
    public string $name = '';

    #[Validate('required|string|max:255')]
    public string $first_name = '';

    #[Validate('required|string|max:255')]
    public string $last_name = '';

    #[Validate('required|email|unique:users')]
    public string $email = '';

    #[Validate('required|string|min:8|confirmed')]
    public string $password = '';

    #[Validate('required|string')]
    public string $password_confirmation = '';

    #[Validate('required|string|max:255')]
    public string $school_name = '';

    public function register()
    {
        $this->validate();

        // Create school
        $school = School::create([
            'name' => $this->school_name,
            'status' => 'active',
        ]);

        // Create user (admin)
        $user = User::create([
            'name' => $this->name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'password' => $this->password,
            'role' => 'admin',
            'status' => 'active',
            'school_id' => $school->id,
        ]);

        // Dispatch event to trigger email listeners
        event(new UserRegistered($user, 'admin'));

        // Redirect to onboarding
        return redirect()->route('onboarding.admin')->with('success', 'Check your email to verify your account.');
    }

    public function render()
    {
        return view('livewire.register-admin');
    }
}
