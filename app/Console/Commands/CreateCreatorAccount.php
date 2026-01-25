<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CreateCreatorAccount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-creator-account {email} {password?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new super-admin creator account or promote an existing one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password') ?: 'creator_pass_change_me';

        $user = \App\Models\User::where('email', $email)->first();

        if ($user) {
            $this->info("User {$email} already exists. Ensuring super-admin status...");
            $user->status = 'active';
            if ($this->argument('password')) {
                $user->password = \Illuminate\Support\Facades\Hash::make($password);
            }
            $user->save();
        } else {
            $user = \App\Models\User::create([
                'name' => 'Creator Support',
                'first_name' => 'Creator',
                'last_name' => 'Support',
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make($password),
                'role' => 'admin', // Base role for internal consistency
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $this->info("New creator account {$email} created successfully.");
        }

        // Ensure TeamMember record exists with super-admin role
        \App\Models\TeamMember::updateOrCreate(
            ['user_id' => $user->id],
            [
                'role' => 'super-admin',
                'is_active' => true,
            ]
        );

        $this->info("User {$email} is now a super-admin creator.");

        return Command::SUCCESS;
    }
}
