<?php

use App\Models\User;
use App\Jobs\NotifyFreeUserCreditRefilled;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

it('stamps cache, dispatches job and creates transaction when free user hits zero', function () {
    Bus::fake();
    Cache::flush();

    $user = User::factory()->student()->create(['credits' => 50, 'subscription_tier' => null]);

    $user->deductCredits(50, 'test', 'deduct to zero', 'req-1');

    expect(Cache::has("credits_emptied_at:{$user->id}"))->toBeTrue();
    Bus::assertDispatched(NotifyFreeUserCreditRefilled::class);

    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'type' => 'credit_refill',
        'description' => 'Free plan 14-day refill (100 credits)'
    ]);
});

it('refills credits when depletion stamp older than 14 days', function () {
    Cache::flush();

    $user = User::factory()->student()->create(['credits' => 0, 'subscription_tier' => null]);

    Cache::put("credits_emptied_at:{$user->id}", Carbon::now()->subDays(15)->toIso8601String(), Carbon::now()->addDays(30));

    $user->checkAndRefillCredits();
    $user->refresh();

    expect($user->credits)->toBe(100);
    expect(Cache::has("credits_emptied_at:{$user->id}"))->toBeFalse();
});

it('does not refill if depletion stamp less than 14 days', function () {
    Cache::flush();

    $user = User::factory()->student()->create(['credits' => 0, 'subscription_tier' => null]);

    Cache::put("credits_emptied_at:{$user->id}", Carbon::now()->subDays(5)->toIso8601String(), Carbon::now()->addDays(30));

    $user->checkAndRefillCredits();
    $user->refresh();

    expect($user->credits)->toBe(0);
});

it('next_free_refill_at reflects roughly 14 days from depletion', function () {
    Cache::flush();

    $user = User::factory()->student()->create(['credits' => 0, 'subscription_tier' => null]);
    Cache::put("credits_emptied_at:{$user->id}", Carbon::now()->toIso8601String(), Carbon::now()->addDays(30));

    $next = Carbon::parse($user->next_free_refill_at);

    expect($next->diffInDays(Carbon::now()))->toBe(14);
});
