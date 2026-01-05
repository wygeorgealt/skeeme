<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// Execute SELECT query
$session = DB::select("SELECT * FROM sessions WHERE id = ? LIMIT 1", ['MMzIrejHnkUWVtXb7vCGToUOcFzxJ2snMd5w7RWF']);

if ($session) {
    echo "Session found:\n";
    print_r($session[0]);
} else {
    echo "No session found with that ID.\n";
}

// Execute UPDATE query
$affected = DB::update("UPDATE sessions SET payload = ?, last_activity = ?, user_id = ?, ip_address = ?, user_agent = ? WHERE id = ?", [
    'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWmx3RmwwVkxNb0cxOFJ5WHV4UUtjV3FNem9ENWV2SDd5T0pIU2EyUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHA6Ly9za2VlbWUudGVzdC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',
    1763148790,
    null,
    '127.0.0.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'MMzIrejHnkUWVtXb7vCGToUOcFzxJ2snMd5w7RWF'
]);

echo "Rows affected by UPDATE: $affected\n";
