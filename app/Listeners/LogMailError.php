<?php

namespace App\Listeners;

use Illuminate\Mail\Events\MessageFailed;
use Illuminate\Support\Facades\Log;

class LogMailError
{
    /**
     * Handle mail failures only (not every send).
     */
    public function handle(MessageFailed $event): void
    {
        $mailer = config('mail.default');
        $to = $event->message->getTo();
        $subject = $event->message->getSubject();

        Log::error("Mail sending failed via '{$mailer}' mailer", [
            'to' => $to,
            'subject' => $subject,
            'exception' => $event->exception?->getMessage(),
        ]);
    }
}
