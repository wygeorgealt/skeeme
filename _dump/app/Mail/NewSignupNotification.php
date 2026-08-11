<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class NewSignupNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $method; // 'normal' or 'google'

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $method)
    {
        $this->user = $user;
        $this->method = $method;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('New User Signup')
                    ->view('emails.new_signup')
                    ->with([
                        'userName' => $this->user->name,
                        'userEmail' => $this->user->email,
                        'method' => $this->method,
                    ]);
    }
}
?>
