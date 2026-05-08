<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

// Create request with API headers
$request = Illuminate\Http\Request::create('/api/v1/student/scan/solve/stream', 'POST', ['image' => 'data:image/jpeg;base64,fakeimage']);
$request->headers->set('Accept', 'application/json');

// Authenticate user
$user = App\Models\User::first();
Auth::login($user);

// Run through full HTTP kernel to catch middleware errors
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request);

echo "Response status: " . $response->getStatusCode() . "\n";
echo "Response content: " . $response->getContent() . "\n";
