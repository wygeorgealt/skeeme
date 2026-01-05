<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public User $lecturer,
        public User $approvedBy
    ) {
    }
}
