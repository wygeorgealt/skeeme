<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\StudyStreak;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Handle student login and return Sanctum token
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'nullable|string',
        ]);

        if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            $user = Auth::user();

            // Check if user has student role
            if ($user->role !== 'student') {
                Auth::logout();
                return response()->json([
                    'message' => 'This account is not registered as a student. Please use the appropriate portal.'
                ], 403);
            }

            $deviceName = $request->input('device_name', 'mobile_app');
            $token = $user->createToken($deviceName)->plainTextToken;

            Log::info('Student logged in via API', ['user_id' => $user->id, 'device' => $deviceName]);

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'credits' => $user->credits,
                    'is_unlimited' => $user->is_unlimited_student,
                ],
                'token' => $token,
            ]);
        }

        return response()->json(['message' => 'Invalid email or password'], 401);
    }

    /**
     * Logout and revoke tokens
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated student details
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Ensure user has a streak record initialized
        $streak = StudyStreak::firstOrCreate(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'longest_streak' => 0]
        );

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'credits' => $user->credits,
            'is_unlimited' => $user->is_unlimited_student,
            'role' => $user->role,
            'streak' => $streak,
        ]);
    }
}
