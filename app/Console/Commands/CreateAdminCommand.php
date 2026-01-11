<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:make-admin {email} {password?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin user or promote an existing one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password') ?: 'password123';

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->role = 'admin';
            $user->status = 'active';
            if ($this->argument('password')) {
                $user->password = Hash::make($password);
            }
            $user->save();
            $this->info("User {$email} promoted to admin successfully.");
        } else {
            User::create([
                'name' => 'Admin User',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $this->info("New admin user {$email} created successfully with password: {$password}");
        }

        return Command::SUCCESS;
    }
}
