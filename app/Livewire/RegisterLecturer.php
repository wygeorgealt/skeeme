<?php

namespace App\Livewire;

use App\Models\User;
use App\Models\School;
use Illuminate\Support\Facades\Mail;
use Livewire\Component;
use Livewire\Attributes\Validate;

class RegisterLecturer extends Component
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

    #[Validate('nullable|string|max:20')]
    public string $phone_number = '';

    public function register()
    {
        $this->validate();

        // Create lecturer user (pending status)
        $user = User::create([
            'name' => $this->name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'password' => $this->password,
            'phone_number' => $this->phone_number ?: null,
            'role' => 'lecturer',
            'status' => 'pending',
        ]);

        // Redirect to lecturer onboarding (school selection)
        return redirect()->route('onboarding.lecturer')->with('success', 'Registration successful. Select your school.');
    }

    public function render()
    {
        return view('livewire.register-lecturer');
    }
}
