<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleSelectionController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        // If user already has a role, redirect to appropriate onboarding
        if ($user->role === 'admin') {
            return redirect()->route('onboarding.admin');
        } elseif ($user->role === 'lecturer') {
            return redirect()->route('onboarding.lecturer');
        } elseif ($user->role === 'student') {
            return redirect()->route('dashboard');
        }
        
        // Show role selection form
        return view('role-selection');
    }
    
    public function selectRole(Request $request)
    {
        // Validate role input
        $validated = $request->validate([
            'role' => 'required|in:admin,lecturer',
        ]);
        
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Session expired. Please login again.');
        }
        
        try {
            // Update user role in database
            $user->update(['role' => $validated['role']]);
            
            // Refresh user in auth guard
            Auth::setUser($user->fresh());
            
            // Store role in session for onboarding component
            session(['registration_role' => $validated['role']]);
            
            // Redirect to appropriate onboarding page
            if ($validated['role'] === 'admin') {
                return redirect()->route('onboarding.admin')->with('success', 'Welcome! Let\'s set up your school.');
            } else {
                return redirect()->route('onboarding.lecturer')->with('success', 'Welcome! Let\'s get you started.');
            }
        } catch (\Exception $e) {
            Log::error('Role selection failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to set role. Please try again.');
        }
    }
}
