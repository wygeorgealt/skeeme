<?php

namespace App\Providers;

use App\Events\PaymentCompleted;
use App\Events\UserRegistered;
use App\Events\UserApproved;
use App\Listeners\SendInvoiceEmail;
use App\Listeners\SendWelcomeAdminEmail;
use App\Listeners\SendLecturerApprovalEmail;
use App\Models\Exam;
use App\Policies\ExamPolicy;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     */
    protected $policies = [
        Exam::class => ExamPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\AnthropicAIService::class, function ($app) {
            return new \App\Services\AnthropicAIService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        \Illuminate\Database\Eloquent\Model::preventLazyLoading(! app()->isProduction());

        if ($this->app->environment('production')) {
            \URL::forceScheme('https');
        }

        // Register policies
        $this->registerPolicies();

        // Register event listeners
        Event::listen(
            PaymentCompleted::class,
            SendInvoiceEmail::class,
        );

        Event::listen(
            PaymentCompleted::class,
            \App\Listeners\UpdateSubscriptionOnPayment::class,
        );

        Event::listen(
            UserRegistered::class,
            SendWelcomeAdminEmail::class,
        );

        Event::listen(
            UserApproved::class,
            SendLecturerApprovalEmail::class,
        );

        Event::listen(
            \SocialiteProviders\Manager\SocialiteWasCalled::class,
            \SocialiteProviders\Slack\SlackExtendSocialite::class.'@handle',
        );

        Event::listen(
            \SocialiteProviders\Manager\SocialiteWasCalled::class,
            \SocialiteProviders\Zoom\ZoomExtendSocialite::class.'@handle',
        );

        // Log mail errors to help debug sending issues
        Event::listen(
            \Illuminate\Mail\Events\MessageFailed::class,
            \App\Listeners\LogMailError::class,
        );

        // Authorization Gates for Creator Tools
        Gate::define('viewWebTinker', function ($user) {
            return $user->isCreator();
        });
 
        // Register Observers for AI Agents
        \App\Models\SupportTicket::observe(\App\Observers\SupportTicketObserver::class);
 
        $this->configureRateLimiting();

        // Dynamic Mail Configuration Override
        try {
            // Check request cache first, then database with short TTL to ensure fresh values when changed
            $cacheKey = 'app:mail_config';
            $mailConfig = \Illuminate\Support\Facades\Cache::remember($cacheKey, 1, function () {
                $setting = \App\Models\SystemSetting::where('key', 'mail_config')->first();
                return $setting ? $setting->value : ['active_resend_account' => 'skeeme'];
            });
            
            $activeAccount = $mailConfig['active_resend_account'] ?? 'skeeme';
            
            if (isset($mailConfig['active_resend_account']) && $mailConfig['active_resend_account'] === 'campusbites') {
                \Illuminate\Support\Facades\Config::set('mail.default', 'campusbites_resend');
                \Illuminate\Support\Facades\Config::set('mail.from.address', 'noreply@campusbites.org');
                \Illuminate\Support\Facades\Config::set('mail.from.name', 'Skeeme');
                
                // Ensure the campusbites API key is set in the transport config
                $campusKey = env('CAMPUSBITES_RESEND_API_KEY');
                if (!empty($campusKey)) {
                    // Set the API key for the Resend transport to use
                    \Illuminate\Support\Facades\Config::set('services.resend.key', $campusKey);
                } else {
                    Log::warning('campusbites_resend selected but CAMPUSBITES_RESEND_API_KEY is not set. Emails will use default RESEND_API_KEY.');
                }
            } else {
                \Illuminate\Support\Facades\Config::set('mail.default', 'resend');
                // Ensure we use the main Skeeme API key
                \Illuminate\Support\Facades\Config::set('services.resend.key', env('RESEND_API_KEY'));
            }
        } catch (\Throwable $th) {
            Log::error('Error loading mail config: ' . $th->getMessage());
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(180)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('otp', function (Request $request) {
            return Limit::perMinutes(5, 5)->by($request->ip());
        });

        RateLimiter::for('ai-generation', function (Request $request) {
            $user = $request->user();
            if (!$user) {
                return Limit::perMinute(5)->by($request->ip());
            }

            $plan = $user->getStudentPlan();
                        $limit = match ($plan) {
                'max' => 100,
                'pro' => 50,
                default => 30,
            };

            return Limit::perMinute($limit)->by($user->id);
        });
    }

    /**
     * Register the application's policies.
     */
    protected function registerPolicies()
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}
