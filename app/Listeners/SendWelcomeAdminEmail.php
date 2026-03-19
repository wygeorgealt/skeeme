<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Mail\WelcomeAdminEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeAdminEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(UserRegistered $event): void
    {
        // Only send to admin users
        if ($event->userType !== 'admin' || $event->user->role !== 'admin') {
            return;
        }

        $school = $event->user->school;

        if ($school) {
            Mail::mailer('resend')->to($event->user->email)->send(
                new WelcomeAdminEmail($event->user, $school->name)
            );
        }
    }
}
