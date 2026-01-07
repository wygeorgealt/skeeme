<?php

namespace App\Http\Controllers;

use App\Models\SocialAccount;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class IntegrationController extends Controller
{
    /**
     * Redirect the user to the provider's authentication page.
     */
    public function redirect(string $provider)
    {
        $scopes = $this->getScopesForProvider($provider);
        $driver = $provider;
        
        return Socialite::driver($driver)
            ->scopes($scopes)
            ->redirect();
    }

    /**
     * Obtain the user information from the provider.
     */
    public function callback(string $provider)
    {
        try {
            $driver = $provider;
            
            $socialUser = Socialite::driver($driver)->user();
            $user = Auth::user();

            if ($user) {
                // User is already logged in, just link the account
                $this->linkSocialAccount($user, $socialUser, $provider);
                return redirect()->route('settings.integrations')
                    ->with('success', "Successfully connected to " . ucfirst($provider));
            }

            // User is not logged in, try to find them by social account or email
            $socialAccount = SocialAccount::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->first();

            if ($socialAccount) {
                $user = $socialAccount->user;
            } else {
                // Try to find user by email
                $user = \App\Models\User::where('email', $socialUser->getEmail())->first();

                if (!$user) {
                    // Create a new user
                    $name = $socialUser->getName() ?? $socialUser->getNickname() ?? 'User';
                    $parts = explode(' ', $name, 2);
                    
                    $user = \App\Models\User::create([
                        'name' => $name,
                        'first_name' => $parts[0] ?? 'User',
                        'last_name' => $parts[1] ?? '',
                        'email' => $socialUser->getEmail(),
                        'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(24)),
                        'status' => 'active',
                        'email_verified_at' => now(), // Auto-verify social users
                    ]);
                }
            }

            // Link/Update the social account
            $this->linkSocialAccount($user, $socialUser, $provider);

            Auth::login($user);
            
            \Illuminate\Support\Facades\Log::info('Social Login Success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'has_role' => !empty($user->role)
            ]);

            // If user has no role, redirect to role selection
            if (!$user->role) {
                return redirect()->route('role-selection');
            }

            return redirect()->intended(route('dashboard'));

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Social Login Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $route = Auth::check() ? 'settings.integrations' : 'login';
            return redirect()->route($route)
                ->with('status', "Authentication failed: " . $e->getMessage());
        }
    }

    /**
     * Link or update a social account for a user.
     */
    protected function linkSocialAccount($user, $socialUser, $provider)
    {
        SocialAccount::updateOrCreate(
            [
                'user_id' => $user->id,
                'provider' => $provider,
            ],
            [
                'provider_id' => $socialUser->getId(),
                'access_token' => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken,
                'expires_at' => property_exists($socialUser, 'expiresIn') 
                    ? Carbon::now()->addSeconds($socialUser->expiresIn) 
                    : null,
                'scopes' => $this->getScopesForProvider($provider),
            ]
        );
    }

    /**
     * Get the necessary scopes for each provider.
     */
    protected function getScopesForProvider(string $provider): array
    {
        return match ($provider) {
            'google' => [
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/drive.file',
                'openid',
                'profile',
                'email'
            ],
            'zoom' => [
                'meeting:write',
                'meeting:read'
            ],
            'slack' => [
                'incoming-webhook',
                'commands',
                'bot'
            ],
            default => [],
        };
    }
}
