<?php

namespace App\Listeners;

use App\Events\UserApproved;
use App\Mail\LecturerApprovalNotificationEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendLecturerApprovalEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(UserApproved $event): void
    {
        $lecturer = $event->lecturer;
        $school = $lecturer->school;

        if (!$school) {
            return;
        }

        Mail::mailer('resend')->to($lecturer->email)->send(
            new LecturerApprovalNotificationEmail(
                $lecturer,
                $school,
                $event->approvedBy->name,
                route('dashboard')
            )
        );
    }
}
