<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\StudyStreak;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    /**
     * Handle student login and return Sanctum token
     */
    public function login(Request $request)
    {
        // ... (existing login code)
    }

    /**
     * Handle student registration and return Sanctum token
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'device_name' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'student',
            'status' => 'active',
            'approved_at' => now(),
            'credits' => 500, // Initial credits for Free tier
        ]);

        $deviceName = $request->input('device_name', 'mobile_app');
        $token = $user->createToken($deviceName)->plainTextToken;

        Log::info('New student registered via API', ['user_id' => $user->id, 'device' => $deviceName]);

        $pricing = $this->getLocalizedPrice($request);

        return response()->json([
            'user' => [
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'credits' => $user->credits,
                'is_unlimited' => false,
                'ai_preferences' => null,
            ],
            'token' => $token,
            'pricing' => $pricing,
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

        // Ensure user has a streak record initialized
        $streak = StudyStreak::firstOrCreate(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'longest_streak' => 0]
        );

        $pricing = $this->getLocalizedPrice($request);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'credits' => $user->credits,
            'is_unlimited' => $user->is_unlimited_student,
            'role' => $user->role,
            'streak' => $streak,
            'pricing' => $pricing,
            'ai_preferences' => $user->ai_preferences,
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
}
