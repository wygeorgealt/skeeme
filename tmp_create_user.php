<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'george.finn@skeeme.test';

$user = clone User::firstOrNew(['email' => $email]);
$user = User::updateOrCreate(
    ['email' => $email],
    [
        'name' => 'George Finn',
        'first_name' => 'George',
        'last_name' => 'Finn',
        'password' => Hash::make('wwewwr123'),
        'role' => 'student',
        'status' => 'active',
        'credits' => 3000,
        'is_unlimited_student' => true,
        'email_verified_at' => now(),
    ]
);

echo "Account created successfully!\n";
echo "============================\n";
echo "Email: " . $user->email . "\n";
echo "Password: wwewwr123\n";
echo "Credits: " . $user->credits . "\n";
echo "Plan: " . $user->getStudentPlan() . "\n";
echo "============================\n";
