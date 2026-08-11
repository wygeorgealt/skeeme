<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\StudyStreak;
use App\Models\QuizSession;
use App\Models\FlashcardSession;
use App\Models\Transaction;
use App\Mail\StudentWelcomeEmail;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use App\Support\PendingReferralCache;

class AuthController extends Controller
{
    protected $otpService;

    public function __construct(\App\Services\OtpService $otpService)
    {
        $this->otpService = $otpService;
    }
    /**
     * Handle student login and return Sanctum token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.',
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'You do not have permission to access the student portal.',
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is ' . $user->status . '. Please contact support.',
            ], 403);
        }

        $deviceName = $request->input('device_name', 'mobile_app');
        $token = $user->createToken($deviceName)->plainTextToken;

        $pricing = $this->getLocalizedPrice($request);

        return response()->json([
            'user' => $this->studentUserPayload($user),
            'token' => $token,
            'pricing' => $pricing,
        ], 200);
    }

    /**
     * Handle OAuth login from mobile app (Google, Apple, etc.)
     * Accepts an id_token from the native SDK, verifies it via Socialite,
     * and returns a Sanctum token.
     */
    public function handleOAuthLogin(Request $request, string $provider)
    {
        $request->validate([
            'token' => 'required|string',
            'device_name' => 'nullable|string',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        $allowedProviders = ['google', 'apple'];
        if (!in_array($provider, $allowedProviders)) {
            return response()->json(['message' => 'Unsupported provider.'], 422);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->userFromToken($request->token);
        } catch (\Exception $e) {
            Log::error("OAuth verification failed for {$provider}", ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Authentication failed. Invalid or expired token.'], 401);
        }

        // Find existing user by provider+id OR by email
        $user = User::where('provider', $provider)->where('provider_id', $socialUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $socialUser->getEmail())->first();
        }

        $isNewUser = false;

        if ($user) {
            if ($user->role !== 'student') {
                return response()->json([
                    'message' => 'You do not have permission to access the student portal.',
                ], 403);
            }

            if ($user->status !== 'active') {
                return response()->json([
                    'message' => 'Your account is ' . $user->status . '. Please contact support.',
                ], 403);
            }

            // Link social provider if not yet linked
            if (!$user->provider) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            }
        } else {
            // Create new student account
            $nameParts = explode(' ', $socialUser->getName() ?? 'Student');
            $user = User::create([
                'name' => $socialUser->getName() ?? 'Student',
                'first_name' => $nameParts[0] ?? '',
                'last_name' => $nameParts[1] ?? '',
                'email' => $socialUser->getEmail(),
                'password' => \Illuminate\Support\Facades\Hash::make(Str::random(32)),
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
                'approved_at' => now(),
                'credits' => 100,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'referral_code' => strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6)),
            ]);

            // Log initial credits
            $user->transactions()->create([
                'type' => 'reward',
                'amount' => 100,
                'description' => 'Welcome bonus: Free tier signup credits',
                'metadata' => json_encode(['source' => 'signup']),
            ]);

            $isNewUser = true;

            // Process Referral if provided
            if ($request->filled('referral_code')) {
                try {
                    Auth::login($user); // Temporary login to use ReferralController
                    app(\App\Http\Controllers\API\Student\ReferralController::class)->redeem($request);
                } catch (\Exception $e) {
                    Log::error("Referral redemption failed during OAuth signup", ['error' => $e->getMessage()]);
                }
            }
        }

        $deviceName = $request->input('device_name', 'mobile_app');
        $token = $user->createToken($deviceName)->plainTextToken;

        Log::info("Student OAuth login via {$provider}", ['user_id' => $user->id, 'new' => $isNewUser]);

        // Send welcome email to new OAuth users
        if ($isNewUser) {
            try {
                Mail::queue(new StudentWelcomeEmail($user));
            } catch (\Exception $e) {
                Log::error('Failed to queue welcome email for OAuth user', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            }
        }

        $pricing = $this->getLocalizedPrice($request);

        return response()->json([
            'user' => $this->studentUserPayload($user),
            'token' => $token,
            'pricing' => $pricing,
            'is_new_user' => $isNewUser,
        ], $isNewUser ? 201 : 200);
    }

    /**
     * Handle student registration and return Sanctum token
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required_without_all:first_name,last_name|string|max:255',
            'first_name' => 'required_without:name|string|max:127',
            'last_name' => 'required_without:name|string|max:127',
            'dob_month' => 'nullable|integer|between:1,12',
            'dob_year' => 'nullable|integer|min:1900',
            'age' => 'nullable|integer|min:13|max:120',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                \Illuminate\Validation\Rules\Password::min(10)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                'confirmed'
            ],
            'device_name' => 'nullable|string',
            'education_level' => 'nullable|string|in:high_school,undergraduate,masters,professional',
            'field_of_study' => 'nullable|string|max:100',
            'learning_style' => 'nullable|string|in:simple,detailed,analogies',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        // Logic to extract first/last name from fullName if not provided explicitly
        $firstName = $validated['first_name'] ?? '';
        $lastName = $validated['last_name'] ?? '';
        $fullName = $validated['name'] ?? trim($firstName . ' ' . $lastName);

        if (empty($firstName) && !empty($validated['name'])) {
            $parts = explode(' ', trim($validated['name']));
            $firstName = $parts[0] ?? '';
            $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
        }

        $dob = null;
        if (isset($validated['dob_year']) && isset($validated['dob_month'])) {
            $dob = $validated['dob_year'] . '-' . str_pad($validated['dob_month'], 2, '0', STR_PAD_LEFT) . '-01';
        }

        $user = User::create([
            'name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'dob' => $dob,
            'age' => $validated['age'] ?? null,
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'student',
            'status' => 'pending', // Verification required
            'approved_at' => null,   // Will be set on verification
            'credits' => 100, // Initial credits for Free tier
            'referral_code' => strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6)),
            'ai_preferences' => [
                'education_level' => $validated['education_level'] ?? null,
                'field_of_study' => $validated['field_of_study'] ?? null,
                'learning_style' => $validated['learning_style'] ?? null,
                'tone' => 'encouraging', // Default
                'language' => 'english', // Default
            ],
        ]);

        // Log initial credits
        $user->transactions()->create([
            'type' => 'reward',
            'amount' => 100,
            'description' => 'Welcome bonus: Free tier signup credits',
            'metadata' => json_encode(['source' => 'signup']),
        ]);

        // Defer referral until email is verified (prevents abuse on pending accounts)
        if ($request->filled('referral_code')) {
            PendingReferralCache::store($user->id, $request->referral_code);
        }

        $deviceName = $request->input('device_name', 'mobile_app');
        Log::info('New student registered (Pending Verification)', ['user_id' => $user->id, 'device' => $deviceName]);
 
        // Send OTP Verification Email
        $this->otpService->sendOtp($user->email, 'verification');
 
        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'email' => $user->email
        ], 201);
    }

    /**
     * Logout and revoke tokens
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $user->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated student details
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated. Please log in.'], 401);
        }
        // Ensure we operate on the latest DB state in case an admin modified
        // credits outside the user's session (e.g. Filament/admin UI).
        $user->refresh();
        $user->checkAndRefillCredits();
        // Re-load after any potential refill/deduction to return accurate values
        $user->refresh();

        // Ensure user has a streak record initialized
        $streak = StudyStreak::firstOrCreate(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'longest_streak' => 0]
        );

        $pricing = $this->getLocalizedPrice($request);

        // Calculate Weekly Stats
        $startOfWeek = now()->startOfWeek();
        
        $quizSessionsCount = QuizSession::where('user_id', $user->id)
            ->where('created_at', '>=', $startOfWeek)
            ->count();
            
        $flashcardSessionsCount = FlashcardSession::where('user_id', $user->id)
            ->where('created_at', '>=', $startOfWeek)
            ->count();
            
        $scanHistoryCount = \App\Models\Transaction::where('user_id', $user->id)
            ->where('type', 'usage')
            ->where('description', 'like', 'Scan & Solve%')
            ->where('created_at', '>=', $startOfWeek)
            ->count();
            
        $creditsSpent = Transaction::where('user_id', $user->id)
            ->where('type', 'usage')
            ->where('amount', '<', 0)
            ->where('created_at', '>=', $startOfWeek)
            ->sum('amount');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'credits' => $user->credits,
            'credits_spent_this_week' => abs($creditsSpent),
            'study_sessions_this_week' => $quizSessionsCount + $flashcardSessionsCount + $scanHistoryCount,
            'plan_name' => $user->getStudentPlan(),
            'role' => $user->role,
            'streak' => $streak,
            'pricing' => $pricing,
            'ai_preferences' => $user->ai_preferences,
            'nearest_exam' => $user->nearest_exam,
            'next_free_refill_at' => $user->next_free_refill_at,
        ]);
    }

    /**
     * Update the student's AI personalization preferences.
     */
    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'education_level' => 'nullable|string|in:high_school,undergraduate,masters,professional',
            'field_of_study' => 'nullable|string|max:100',
            'learning_style' => 'nullable|string|in:simple,detailed',
            'tone' => 'nullable|string|in:supportive,strict,concise,fun',
            'analogy_focus' => 'nullable|string|in:general,tech,sports,gaming,pop_culture',
            'academic_goal' => 'nullable|string|in:conceptual,exam,cheat',
            'custom_weakness' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $currentPrefs = $user->ai_preferences ?? [];
        $user->ai_preferences = array_merge($currentPrefs, array_filter($validated, fn($v) => !is_null($v)));
        $user->save();

        // Generate AI narrative summary asynchronously / safely
        try {
            app(\App\Services\UserPersonalizationService::class)->generateAndSaveSummary($user, $user->ai_preferences);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to trigger preference summary: " . $e->getMessage());
        }

        $user->refresh();

        // Clear personalization cache
        app(\App\Services\UserPersonalizationService::class)->clearCache($user);

        return response()->json([
            'message' => 'AI preferences updated successfully.',
            'ai_preferences' => $user->ai_preferences,
        ]);
    }

    /**
     * Get default pricing info. Actual localized pricing is handled by the mobile stores (Google Play/Apple).
     */
    private function getLocalizedPrice(Request $request)
    {
        return [
            'amount' => '4.99',
            'currency' => '$',
            'period' => '/ month',
        ];
    }

    /**
     * Mark student email as verified using OTP token
     */
    public function verifyAccount(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $cachedEmail = Cache::get('otp_token_' . $request->token);

        if (!$cachedEmail || $cachedEmail !== $request->email) {
            return response()->json(['message' => 'Invalid or expired verification session.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->email_verified_at = now();
            $user->status = 'active'; // Mark as active now
            $user->approved_at = now();
            $user->save();

            $deviceName = $request->input('device_name', 'mobile_app');
            $authToken = $user->createToken($deviceName)->plainTextToken;
            $pricing = $this->getLocalizedPrice($request);

            Cache::forget('otp_token_' . $request->token);

            $this->applyPendingReferral($user);

            // Send welcome email to new student
            try {
                Mail::queue(new StudentWelcomeEmail($user));
            } catch (\Exception $e) {
                Log::error('Failed to queue welcome email', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            }

            return response()->json([
                'message' => 'Account verified successfully.',
                'user' => $this->studentUserPayload($user->fresh()),
                'token' => $authToken,
                'pricing' => $pricing,
            ]);
        }

        return response()->json(['message' => 'User not found.'], 404);
    }

    /**
     * Handle password reset securely using Token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => [
                'required',
                'string',
                \Illuminate\Validation\Rules\Password::min(10)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                'confirmed'
            ],
        ]);

        $cachedEmail = Cache::get('otp_token_' . $request->token);

        if (!$cachedEmail || $cachedEmail !== $request->email) {
            return response()->json(['message' => 'Invalid or expired reset session. Please verify your email again.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        Cache::forget('otp_token_' . $request->token); // Invalidate token immediately

        return response()->json(['message' => 'Password reset successfully.', 'success' => true]);
    }

    /**
     * Standard student user payload for auth responses (includes id for mobile clients).
     */
    private function studentUserPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'credits' => $user->credits,
            'plan_name' => $user->getStudentPlan(),
            'next_free_refill_at' => $user->next_free_refill_at,
            'ai_preferences' => $user->ai_preferences,
            'nearest_exam' => $user->nearest_exam,
        ];
    }

    /**
     * Apply a referral code stored during registration, after the account is verified.
     */
    private function applyPendingReferral(User $user): void
    {
        $code = PendingReferralCache::pull($user->id);
        if (!$code) {
            return;
        }

        try {
            Auth::setUser($user);
            $redeemRequest = Request::create(
                '/api/v1/student/referral/redeem',
                'POST',
                ['referral_code' => $code]
            );
            $redeemRequest->setUserResolver(fn () => $user);
            app(ReferralController::class)->redeem($redeemRequest);
        } catch (\Exception $e) {
            Log::error('Referral redemption failed after verification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
