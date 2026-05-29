<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Mail\AccountDeletionSurveyEmail;

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
                'plan_name' => $user->getStudentPlan(),
                'next_free_refill_at' => $user->next_free_refill_at,
            ]
        ]);
    }

    /**
     * Handle the submission of onboarding data
     */
    public function completeOnboarding(Request $request)
    {
        $validated = $request->validate([
            'education_level' => 'nullable|string|in:high_school,undergraduate,masters,professional',
            'field_of_study' => 'nullable|string|max:100',
            'dob_month' => 'nullable|integer|between:1,12',
            'dob_year' => 'nullable|integer|min:1900|max:' . now()->year,
            'age' => 'nullable|integer|min:13|max:120',
            'next_exam_date' => 'nullable|date',
            'next_exam_title' => 'nullable|string|max:100',
        ]);

        $user = $request->user();

        if (isset($validated['dob_year']) && isset($validated['dob_month'])) {
            $user->dob = $validated['dob_year'] . '-' . str_pad($validated['dob_month'], 2, '0', STR_PAD_LEFT) . '-01';
        }
        
        if (isset($validated['age'])) {
            $user->age = $validated['age'];
        }

        $aiPreferences = $user->ai_preferences ?? [];
        if (isset($validated['education_level'])) {
            $aiPreferences['education_level'] = $validated['education_level'];
        }
        if (isset($validated['field_of_study'])) {
            $aiPreferences['field_of_study'] = $validated['field_of_study'];
        }
        
        $user->ai_preferences = $aiPreferences;
        $user->save();

        if (isset($validated['next_exam_date'])) {
            $user->userExams()->create([
                'title' => $validated['next_exam_title'] ?? 'Next Exam',
                'exam_date' => $validated['next_exam_date'],
            ]);
        }

        return response()->json([
            'message' => 'Onboarding completed successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'credits' => $user->credits,
                'plan_name' => $user->getStudentPlan(),
                'next_free_refill_at' => $user->next_free_refill_at,
                'ai_preferences' => $user->ai_preferences,
                'nearest_exam' => $user->nearest_exam,
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

        // Password check has been replaced with a frontend random word confirmation challenge.

        // Capture email before anonymization (needed for sending goodbye email)
        $userEmail = $user->email;
        $userName = $user->name;

        // Make anonymization + token revocation atomic so a partial failure
        // doesn't leave the client logged out while the account remains intact.
        DB::transaction(function () use ($user) {
            // 1. Anonymize personal data (GDPR-friendly — account becomes unusable)
            $user->update([
                'name'          => 'Deleted User',
                'email'         => 'deleted_' . $user->id . '@removed.skeeme.com',
                'password'      => Hash::make(Str::random(64)), // Scramble password
                'phone_number'  => null,
                'avatar_url'    => null,
                'first_name'    => null,
                'last_name'     => null,
                'credits'       => 0,
                // Use an allowed enum value for `status` to avoid SQL truncation errors
                'status'        => 'inactive',
            ]);

            // 2. Revoke all API tokens after anonymization
            $user->tokens()->delete();
        });

        // Send goodbye email with survey link to their original email
        try {
            $tempUser = clone $user;
            $tempUser->email = $userEmail;
            $tempUser->name = $userName;
            Mail::to($userEmail)->queue(new AccountDeletionSurveyEmail($tempUser));
        } catch (\Exception $e) {
            // Silently fail — don't block account deletion
            \Illuminate\Support\Facades\Log::error('Failed to queue account deletion survey email', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json(['message' => 'Your account has been permanently deleted.']);
    }
}
