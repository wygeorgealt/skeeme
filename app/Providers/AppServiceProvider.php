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

        // Authorization Gates for Creator Tools
        Gate::define('viewWebTinker', function ($user) {
            return $user->isCreator();
        });
 
        // Register Observers for AI Agents
        \App\Models\SupportTicket::observe(\App\Observers\SupportTicketObserver::class);
 
        $this->configureRateLimiting();
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
                'max' => 20,
                'pro' => 15,
                default => 5,
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
