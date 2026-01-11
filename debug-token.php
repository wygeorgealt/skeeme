<?php
// Quick debug script to check token in database
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "=== Checking Personal Access Tokens ===\n\n";

// Check if table exists
$tableExists = DB::select("SHOW TABLES LIKE 'personal_access_tokens'");
echo "Table exists: " . (count($tableExists) > 0 ? "YES" : "NO") . "\n\n";

if (count($tableExists) > 0) {
    // Get all tokens
    $tokens = DB::table('personal_access_tokens')->get();
    echo "Total tokens: " . count($tokens) . "\n\n";
    
    foreach ($tokens as $token) {
        echo "Token ID: {$token->id}\n";
        echo "Tokenable Type: {$token->tokenable_type}\n";
        echo "Tokenable ID: {$token->tokenable_id}\n";
        echo "Name: {$token->name}\n";
        echo "Token (first 10 chars): " . substr($token->token, 0, 10) . "...\n";
        echo "Created: {$token->created_at}\n";
        echo "---\n";
    }
}

echo "\n=== Checking User Model ===\n";
$user = User::where('role', 'admin')->orWhere('role', 'super-admin')->first();
if ($user) {
    echo "Found admin user: {$user->email}\n";
    echo "User class: " . get_class($user) . "\n";
    echo "Has HasApiTokens trait: " . (in_array('Laravel\Sanctum\HasApiTokens', class_uses_recursive($user)) ? "YES" : "NO") . "\n";
}
