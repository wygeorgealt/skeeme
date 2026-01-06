<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Render Deep Diagnostic Tool v2</h1>";

// 1. Connectivity Variables
echo "<h2>1. Connectivity Configuration</h2>";
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$ssl  = getenv('MYSQL_ATTR_SSL_CA');

echo "DB_HOST: " . ($host ?: 'NOT SET') . "<br>";
echo "DB_PORT: " . ($port ?: 'NOT SET (Defaulting to 3306)') . "<br>";
echo "SSL CA Path: " . ($ssl ?: 'NOT SET') . "<br>";

$targetPort = $port ?: 3306;

// 2. TCP Connectivity Test
echo "<h2>2. TCP Network Test (fsockopen)</h2>";
if ($host) {
    echo "Attempting TCP connection to $host:$targetPort...<br>";
    $fp = @fsockopen($host, $targetPort, $errno, $errstr, 5);
    if ($fp) {
        echo "<strong style='color:green;'>SUCCESS: TCP usage confirmed. Port is open and reachable.</strong><br>";
        fclose($fp);
    } else {
        echo "<strong style='color:red;'>FAILURE: Could not reach host on port $targetPort.</strong><br>";
        echo "Error: $errno - $errstr<br>";
        echo "<em>Tip: If this fails, the DB_PORT is wrong or Aiven IP access is blocked.</em><br>";
    }
} else {
    echo "Skipped (No Host).<br>";
}

// 3. Database Connection Test (Detailed)
echo "<h2>3. MySQL Connection Test</h2>";
if ($host) {
    // Attempt 1: Standard with SSL
    echo "<strong>Attempt 1: Standard Connection (PCR with SSL)</strong><br>";
    try {
        $dsn = "mysql:host=$host;port=$targetPort;dbname=" . getenv('DB_DATABASE');
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ];
        if ($ssl && file_exists($ssl)) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = $ssl;
        }
        
        $pdo = new PDO($dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'), $options);
        echo "<strong style='color:green;'>SUCCESS! Connected using standard options.</strong><br>";
    } catch (Exception $e) {
        echo "<span style='color:red;'>Failed: " . $e->getMessage() . "</span><br><br>";
        
        // Attempt 2: Disable Verify Server Cert (Common Fix for "Cannot connect using SSL")
        echo "<strong>Attempt 2: Disabling Server Certificate Verification</strong><br>";
        try {
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            $pdo = new PDO($dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'), $options);
            echo "<strong style='color:green;'>SUCCESS! Connected with verification disabled.</strong><br>";
            echo "<em>Solution: You need to add MYSQL_ATTR_SSL_VERIFY_SERVER_CERT=false to your config.</em><br>";
        } catch (Exception $e2) {
             echo "<span style='color:red;'>Failed: " . $e2->getMessage() . "</span><br><br>";
        }
    }
}

echo "<h2>4. Environment Dump (Partial)</h2>";
$vars = ['APP_ENV', 'DB_CONNECTION', 'FILESYSTEM_DISK', 'ASSET_URL'];
foreach($vars as $v) {
    echo "$v: " . getenv($v) . "<br>";
}
