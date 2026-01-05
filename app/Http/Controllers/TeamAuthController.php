<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\TeamMember;

class TeamAuthController extends Controller
{
    /**
     * Show the team login form
     */
    public function showLogin()
    {
        if (auth('team')->check()) {
            return redirect()->route('team.dashboard');
        }

        return view('team-auth.login');
    }

    /**
     * Handle team login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // Try to find the user with team member record
        $user = \App\Models\User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        // Check if user is a team member
        $teamMember = $user->teamMember;
        
        if (!$teamMember || !$teamMember->is_active) {
            return back()->withErrors([
                'email' => 'You do not have access to the Team Management Dashboard.',
            ])->onlyInput('email');
        }

        // Login the user
        Auth::guard('web')->login($user, $request->boolean('remember'));

        // Log the login action
        \App\Models\AdminAuditLog::log(
            $teamMember,
            'auth.login',
            'TeamMember',
            $teamMember->id
        );

        // Update last login
        $teamMember->update(['last_login_at' => now()]);

        return redirect()->route('team.dashboard')
            ->with('success', 'Welcome back, ' . $user->name . '!');
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        $teamMember = auth()->user()?->teamMember;

        if ($teamMember) {
            \App\Models\AdminAuditLog::log(
                $teamMember,
                'auth.logout',
                'TeamMember',
                $teamMember->id
            );
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('team.login')->with('success', 'You have been logged out.');
    }

    /**
     * Show forgot password form
     */
    public function showForgotPassword()
    {
        return view('team-auth.forgot-password');
    }

    /**
     * Handle forgot password request
     */
    public function sendResetLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // TODO: Send password reset email to team member
        // Password::sendResetLink($validated);

        return back()->with('status', 'If a team account exists with that email, we have sent a password reset link.');
    }

    /**
     * Show reset password form
     */
    public function showResetPassword($token)
    {
        return view('team-auth.reset-password', ['token' => $token]);
    }

    /**
     * Handle password reset
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
            'token' => 'required',
        ]);

        // TODO: Verify token and reset password
        // Password::reset($validated, function ($user, $password) {
        //     $user->password = Hash::make($password);
        //     $user->save();
        // });

        return redirect()->route('team.login')->with('success', 'Your password has been reset.');
    }
}
