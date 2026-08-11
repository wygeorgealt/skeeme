<?php

namespace App\Services\Integrations;

use App\Models\SocialAccount;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

abstract class AbstractIntegrationProvider
{
    protected $account;

    public function __construct(SocialAccount $account)
    {
        $this->account = $account;
    }

    /**
     * Refresh the access token if expired.
     */
    protected function ensureValidToken()
    {
        if ($this->account->expires_at && $this->account->expires_at->isPast()) {
            $this->refreshToken();
        }
    }

    /**
     * Provider-specific token refresh logic.
     */
    abstract protected function refreshToken();

    /**
     * Create a virtual meeting.
     */
    abstract public function createMeeting(array $data);
}
