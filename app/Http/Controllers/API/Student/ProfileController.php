<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Update student personal information
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'first_name' => 'sometimes|nullable|string|max:100',
            'last_name' => 'sometimes|nullable|string|max:100',
            'phone_number' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'credits' => $user->credits,
                'is_unlimited' => $user->is_unlimited_student,
            ]
        ]);
    }

    /**
     * Update student password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Delete the student's account (Required by App Store Guideline 5.1.1(v))
     */
    public function destroyAccount(Request $request)
    {
        $user = $request->user();

        // If the user did not sign up via a social provider, verify their password
        if (!$user->provider) {
            $request->validate([
                'password' => 'required|string',
            ]);

            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Incorrect password. Account deletion cancelled.'], 403);
            }
        }

        // 1. Revoke all API tokens
        $user->tokens()->delete();

        // 2. Anonymize personal data (GDPR-friendly — account becomes unusable)
        $user->update([
            'name'          => 'Deleted User',
            'email'         => 'deleted_' . $user->id . '@removed.skeeme.com',
            'password'      => Hash::make(\Str::random(64)), // Scramble password
            'phone_number'  => null,
            'avatar_url'    => null,
            'first_name'    => null,
            'last_name'     => null,
            'credits'       => 0,
        ]);

        return response()->json(['message' => 'Your account has been permanently deleted.']);
    }
}
