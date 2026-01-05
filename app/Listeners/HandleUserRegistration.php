<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Redirect;

class HandleUserRegistration
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        // This listener is here to handle post-registration logic
        // We redirect to role-selection in the FortifyServiceProvider RegisterResponse
    }
}
