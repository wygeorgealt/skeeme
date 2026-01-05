<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a sample school if none exists
        $school = School::firstOrCreate(
            ['email' => 'demo@school.com'],
            [
                'name' => 'Demo School',
                'address' => '123 Education Street',
                'phone' => '+1234567890',
                'academic_year' => '2024-2025',
            ]
        );

        // Create a free subscription for the demo school
        $subscriptionService = app(SubscriptionService::class);

        if (!$school->activeSubscription) {
            $subscriptionService->createSubscription($school, 'Free/Basic Plan', [
                'start_date' => now(),
                'duration_days' => 365, // 1 year free for demo
            ]);
        }

        // Create another school with Pro subscription
        $proSchool = School::firstOrCreate(
            ['email' => 'pro@school.com'],
            [
                'name' => 'Pro School',
                'address' => '456 Learning Avenue',
                'phone' => '+0987654321',
                'academic_year' => '2024-2025',
            ]
        );

        if (!$proSchool->activeSubscription) {
            $subscriptionService->createSubscription($proSchool, 'Pro', [
                'start_date' => now(),
                'duration_days' => 30,
            ]);
        }

        $this->command->info('Subscription plans seeded successfully!');
    }
}
