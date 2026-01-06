<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Render Diagnostic Tool</h1>";

// 1. Basic PHP Info
echo "<h2>1. PHP Version</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Current User: " . get_current_user() . "<br>";

// 2. Storage Permissions
echo "<h2>2. Storage Permissions</h2>";
$storagePath = __DIR__ . '/../storage/logs';
if (is_dir($storagePath)) {
    echo "Storage logs directory exists.<br>";
    if (is_writable($storagePath)) {
        echo "<strong style='color:green;'>Storage logs directory is writable.</strong><br>";
        
        // Try creating a test file
        $testFile = $storagePath . '/test_write.txt';
        if (file_put_contents($testFile, 'test')) {
            echo "<strong style='color:green;'>Successfully wrote to storage/logs/test_write.txt</strong><br>";
            unlink($testFile);
        } else {
            echo "<strong style='color:red;'>FAILED to write to storage/logs/test_write.txt</strong><br>";
        }
    } else {
        echo "<strong style='color:red;'>Storage logs directory is NOT writable.</strong><br>";
    }
} else {
    echo "<strong style='color:red;'>Storage logs directory does not exist at: $storagePath</strong><br>";
}

// 3. Environment Variables
echo "<h2>3. Environment Variables Check</h2>";
$varsToCheck = ['APP_DEBUG', 'LOG_CHANNEL', 'DB_HOST', 'DB_CONNECTION', 'SESSION_DRIVER'];
foreach ($varsToCheck as $var) {
    $val = getenv($var) !== false ? getenv($var) : 'NOT SET';
    // Obfuscate potential secrets if added
    echo "$var: " . htmlspecialchars($val) . "<br>";
}

// 4. Database Connection Test
echo "<h2>4. Database Connection Test</h2>";
try {
    $host = getenv('DB_HOST');
    $port = getenv('DB_PORT') ?: 3306;
    $db   = getenv('DB_DATABASE');
    $user = getenv('DB_USERNAME');
    $pass = getenv('DB_PASSWORD');
    $ssl  = getenv('MYSQL_ATTR_SSL_CA');

    if ($host) {
        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ];

        if ($ssl && file_exists($ssl)) {
             $options[PDO::MYSQL_ATTR_SSL_CA] = $ssl;
             echo "SSL CA found at $ssl<br>";
        } elseif ($ssl) {
             echo "<strong style='color:red;'>SSL CA path defined but file not found at: $ssl</strong><br>";
        }

        $pdo = new PDO($dsn, $user, $pass, $options);
        echo "<strong style='color:green;'>Database connection successful!</strong><br>";
    } else {
        echo "Skipping DB test (DB_HOST not set).<br>";
    }
} catch (Exception $e) {
    echo "<strong style='color:red;'>Database Connection Failed: " . $e->getMessage() . "</strong><br>";
}

echo "<h2>5. PHP Info</h2>";
phpinfo();
