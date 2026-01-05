<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeamMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder creates team members with the provided credentials.
     * Use: php artisan db:seed --class=TeamMemberSeeder
     */
    public function run(): void
    {
        $teamMembers = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@skeeme.dev',
                'password' => 'EDucation',
                'role' => 'super-admin',
            ],
            [
                'name' => 'George Future',
                'email' => 'george@skeeme.dev',
                'password' => 'GEORGE.future',
                'role' => 'admin',
            ],
            [
                'name' => 'Support Team',
                'email' => 'support@skeeme.dev',
                'password' => 'wwewwr123',
                'role' => 'support',
            ],
            [
                'name' => 'Finance Manager',
                'email' => 'finance@skeeme.dev',
                'password' => 'WWEwwr_123',
                'role' => 'finance',
            ],
        ];

        foreach ($teamMembers as $memberData) {
            // Check if user already exists
            $user = User::where('email', $memberData['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $memberData['name'],
                    'email' => $memberData['email'],
                    'password' => Hash::make($memberData['password']),
                    'role' => 'team',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);
            }

            // Create or update team member record
            TeamMember::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'role' => $memberData['role'],
                    'is_active' => true,
                    'activated_at' => now(),
                ]
            );

            $this->command->info("Team member created/updated: {$memberData['email']} ({$memberData['role']})");
        }
    }
}
