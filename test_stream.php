<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/v1/student/scan/solve/stream', 'POST', ['image' => 'data:image/jpeg;base64,fakeimage']);
$user = App\Models\User::first();
$request->setUserResolver(function () use ($user) { return $user; });
$controller = app(App\Http\Controllers\API\Student\ScanController::class);
try {
    $response = $controller->streamSolve($request);
    echo "Response status: " . $response->getStatusCode() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
}
