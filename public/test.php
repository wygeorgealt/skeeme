<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<style>body { font-family: sans-serif; padding: 20px; line-height: 1.5; } h2 { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-top: 30px; } .success { color: green; font-weight: bold; } .failure { color: red; font-weight: bold; } pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }</style>";

echo "<h1>Render Deep Diagnostic Tool v3</h1>";

// 1. Critical File Check
echo "<h2>1. Critical File Check</h2>";
$files = [
    '../vendor/autoload.php' => 'Composer Autoloader',
    '../bootstrap/app.php' => 'Laravel Bootstrap',
    '../.env' => 'Environment File',
    '../storage/logs/laravel.log' => 'Log File'
];

foreach ($files as $path => $name) {
    if (file_exists(__DIR__ . '/' . $path)) {
        echo "$name: <span class='success'>FOUND</span><br>";
    } else {
        echo "$name: <span class='failure'>MISSING ({$path})</span><br>";
    }
}

// 2. Connectivity Variables
echo "<h2>2. Configuration Check</h2>";
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$ssl  = getenv('MYSQL_ATTR_SSL_CA');
$appKey = getenv('APP_KEY');

echo "APP_KEY: " . ($appKey ? "<span class='success'>SET (" . substr($appKey, 0, 7) . "...)</span>" : "<span class='failure'>NOT SET</span>") . "<br>";
echo "DB_HOST: " . ($host ?: 'NOT SET') . "<br>";
echo "DB_PORT: " . ($port ?: 'NOT SET (Defaulting to 3306)') . "<br>";
echo "SESSION_DRIVER: " . getenv('SESSION_DRIVER') . "<br>";
echo "CACHE_STORE: " . getenv('CACHE_STORE') . "<br>";

$targetPort = $port ?: 3306;

// 3. Database Connection Test (Detailed)
echo "<h2>3. MySQL Connection Test</h2>";
if ($host) {
    echo "<strong>Target: $host:$targetPort</strong><br>";
    try {
        $dsn = "mysql:host=$host;port=$targetPort;dbname=" . getenv('DB_DATABASE');
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ];
        
        // Use logic from config/database.php fix
        if ($ssl && file_exists($ssl)) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = $ssl;
        }
        
        // Explicitly handle the boolean false for verification if set
        if (getenv('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT') === 'false') {
             $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
             echo "<em>MYSQL_ATTR_SSL_VERIFY_SERVER_CERT set to false.</em><br>";
        }
        
        $pdo = new PDO($dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'), $options);
        echo "<span class='success'>SUCCESS! Database connection established.</span><br>";
        
        // Test query
        $stmt = $pdo->query("SELECT @@version");
        $version = $stmt->fetchColumn();
        echo "DB Version: $version<br>";
        
    } catch (Exception $e) {
        echo "<span class='failure'>Database Connection Failed: " . $e->getMessage() . "</span><br>";
    }
}

// 4. Laravel Logs
echo "<h2>4. Laravel Logs (Last 100 entries)</h2>";
$logPath = __DIR__ . '/../storage/logs/laravel.log';

if (file_exists($logPath)) {
    if (is_readable($logPath)) {
        $content = file_get_contents($logPath);
        // Clean up empty lines
        $lines = array_filter(explode("\n", $content));
        // Get last 100
        $lastLines = array_slice($lines, -100);
        
        if (count($lastLines) > 0) {
            echo "<pre>" . htmlspecialchars(implode("\n", $lastLines)) . "</pre>";
        } else {
            echo "<em>Log file exists but is empty.</em>";
        }
    } else {
        echo "<span class='failure'>Log file exists but is NOT readable. Check permissions.</span>";
    }
} else {
    echo "<span class='failure'>Log file does not exist.</span>";
}

echo "<h2>5. PHP Info</h2>";
echo "PHP Version: " . phpversion();
