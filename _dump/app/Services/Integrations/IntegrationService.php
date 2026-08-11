<?php

namespace App\Services\Integrations;

use App\Models\User;
use App\Models\SocialAccount;
use Exception;

class IntegrationService
{
    /**
     * Resolve the provider instance for a user.
     */
    public function forUser(User $user, string $providerName): AbstractIntegrationProvider
    {
        $account = $user->socialAccounts()->where('provider', $providerName)->first();

        if (!$account) {
            throw new Exception("Provider {$providerName} not connected for user.");
        }

        return match ($providerName) {
            'google' => new GoogleProvider($account),
            'microsoft' => new MicrosoftProvider($account),
            'zoom' => new ZoomProvider($account),
            default => throw new Exception("Unsupported provider: {$providerName}"),
        };
    }

    /**
     * Get all connected providers for a user.
     */
    public function getConnectedProviders(User $user): array
    {
        return $user->socialAccounts()->pluck('provider')->toArray();
    }
}
