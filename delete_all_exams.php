<?php

use App\Models\Exam;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $count = Exam::count();
    echo "Found $count exams. Deleting...\n";

    // Standard delete to trigger any model events/cascade if needed
    // However, migrations show cascade on DB level, so this is safe.
    Exam::query()->delete();

    echo "All exams have been deleted successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
