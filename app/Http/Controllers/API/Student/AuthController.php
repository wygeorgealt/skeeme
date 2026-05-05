<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\StudyStreak;
use App\Models\QuizSession;
use App\Models\FlashcardSession;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

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
            'user' => [
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'credits' => $user->credits,
                'is_unlimited' => (bool) $user->is_unlimited_student,
                'ai_preferences' => $user->ai_preferences,
                'nearest_exam' => $user->nearest_exam,
            ],
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
                'approved_at' => now(),
                'credits' => 100,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'referral_code' => strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8)),
            ]);

            // Log initial credits
            $user->transactions()->create([
                'type' => 'reward',
                'amount' => 100,
                'description' => 'Welcome bonus: Free tier signup credits',
                'metadata' => json_encode(['source' => 'signup']),
            ]);

            $isNewUser = true;
        }

        $deviceName = $request->input('device_name', 'mobile_app');
        $token = $user->createToken($deviceName)->plainTextToken;

        Log::info("Student OAuth login via {$provider}", ['user_id' => $user->id, 'new' => $isNewUser]);

        $pricing = $this->getLocalizedPrice($request);

        return response()->json([
            'user' => [
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'credits' => $user->credits,
                'is_unlimited' => (bool) $user->is_unlimited_student,
                'ai_preferences' => $user->ai_preferences,
                'nearest_exam' => $user->nearest_exam,
            ],
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
            'age' => 'nullable|integer|min:0',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'device_name' => 'nullable|string',
            // Onboarding AI Preferences
            'education_level' => 'nullable|string|in:high_school,undergraduate,masters,professional',
            'field_of_study' => 'nullable|string|max:100',
            'learning_style' => 'nullable|string|in:simple,detailed,analogies',
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
            'referral_code' => strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8)),
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
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated student details
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->checkAndRefillFreeCredits();

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
            'is_unlimited' => $user->is_unlimited_student,
            'plan_name' => $user->activeSubscription?->plan_name ?? 'free',
            'role' => $user->role,
            'streak' => $streak,
            'pricing' => $pricing,
            'ai_preferences' => $user->ai_preferences,
            'nearest_exam' => $user->nearest_exam,
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
            'learning_style' => 'nullable|string|in:simple,detailed,analogies',
            'tone' => 'nullable|string|in:encouraging,strict,concise',
            'language' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $user->ai_preferences = $validated;
        $user->save();

        return response()->json([
            'message' => 'AI preferences updated successfully.',
            'ai_preferences' => $user->ai_preferences,
        ]);
    }

    /**
     * Determine localized pricing based on the user's request IP/headers using live conversion.
     */
    private function getLocalizedPrice(Request $request)
    {
        $countryCode = $request->header('CF-IPCountry');
        $baseUsdPrice = 4;

        // Fallback for local development or non-Cloudflare proxies (like native Ngrok)
        if (!$countryCode) {
            $clientIp = $request->header('X-Forwarded-For', $request->ip());
            $clientIp = trim(explode(',', $clientIp)[0]); // Get the true client IP if there are multiple

            // If it's a public remote IP, look up the client's location
            if (filter_var($clientIp, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $countryCode = Cache::remember("ip_country_{$clientIp}", 60 * 60 * 24, function () use ($clientIp) {
                    try {
                        $response = Http::timeout(3)->get("http://ip-api.com/json/{$clientIp}?fields=countryCode");
                        return $response->successful() ? $response->json('countryCode') : null;
                    } catch (\Exception $e) {
                        return null;
                    }
                });
            } else {
                // If it's a local/private IP (e.g., testing on localhost or local Wi-Fi network), 
                // look up the machine's public IP location as a fallback for development.
                $countryCode = Cache::remember('dev_server_country', 60 * 60 * 24, function () {
                    try {
                        $response = Http::timeout(3)->get("http://ip-api.com/json/?fields=countryCode");
                        return $response->successful() ? $response->json('countryCode') : null;
                    } catch (\Exception $e) {
                        return null;
                    }
                });
            }
        }

        if ($countryCode === 'NG') {
            // Fetch cached rate or look it up (cache for 24 hours)
            $nairaRate = Cache::remember('usd_to_ngn_rate', 60 * 60 * 24, function () {
                try {
                    $response = Http::timeout(3)->get('https://api.exchangerate-api.com/v4/latest/USD');
                    if ($response->successful()) {
                        return $response->json('rates.NGN', 1500); // fallback to 1500 if missing
                    }
                } catch (\Exception $e) {
                    Log::error('Currency conversion API failed', ['error' => $e->getMessage()]);
                }
                return 1500; // Fallback hardcoded rate in case API goes down
            });

            // Calculate converted price and round up nicely to nearest 100
            $rawNairaPrice = $baseUsdPrice * $nairaRate;
            $prettyNairaPrice = ceil($rawNairaPrice / 100) * 100;

            return [
                'amount' => number_format($prettyNairaPrice),
                'currency' => '₦',
                'period' => '/ month',
            ];
        }

        // Default to USD
        return [
            'amount' => (string) $baseUsdPrice,
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

            return response()->json([
                'message' => 'Account verified successfully.',
                'user' => [
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'credits' => $user->credits,
                    'is_unlimited' => (bool) $user->is_unlimited_student,
                    'ai_preferences' => $user->ai_preferences,
                    'nearest_exam' => $user->nearest_exam,
                ],
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
            'password' => 'required|string|min:8|confirmed',
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
}
