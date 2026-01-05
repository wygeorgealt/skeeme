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
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

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
            \SocialiteProviders\Graph\GraphExtendSocialite::class.'@handle',
        );

        Event::listen(
            \SocialiteProviders\Manager\SocialiteWasCalled::class,
            \SocialiteProviders\Zoom\ZoomExtendSocialite::class.'@handle',
        );
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
