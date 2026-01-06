<?php

echo "🐘 Importing base schema from database/skeeme.sql...\n";

try {
    $host = getenv('DB_HOST');
    $port = getenv('DB_PORT');
    $db   = getenv('DB_DATABASE');
    $user = getenv('DB_USERNAME');
    $pass = getenv('DB_PASSWORD');
    $ca   = getenv('MYSQL_ATTR_SSL_CA');
    $verify = getenv('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT');
    $verifyBool = filter_var($verify, FILTER_VALIDATE_BOOLEAN);

    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
    if ($ca) {
        $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = $verifyBool;
    }

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Read the SQL file
    $sqlFile = __DIR__ . '/../database/skeeme.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found at: $sqlFile");
    }

    $sql = file_get_contents($sqlFile);
    
    // Split by semicolon, but handle procedures/functions delimited by $$
    // This is a simple parser, but should work for this specific file structure
    
    // First, handle the DELIMITER blocks
    $commands = [];
    $currentCommand = '';
    $delimiter = ';';
    
    $lines = explode("\n", $sql);
    foreach ($lines as $line) {
        $trimmedLine = trim($line);
        if (str_starts_with($trimmedLine, 'DELIMITER $$')) {
            $delimiter = '$$';
            continue;
        }
        if (str_starts_with($trimmedLine, 'DELIMITER ;')) {
            $delimiter = ';';
            continue;
        }
        
        $currentCommand .= $line . "\n";
        
        if (str_ends_with(rtrim($trimmedLine), $delimiter)) {
            $commands[] = rtrim(rtrim($currentCommand), $delimiter);
            $currentCommand = '';
        }
    }

    echo "Found " . count($commands) . " commands to execute.\n";

    foreach ($commands as $index => $command) {
        if (empty(trim($command))) continue;
        try {
            $pdo->exec($command);
        } catch (Exception $e) {
            // Ignore "Table already exists" or "Procedure already exists" if it happens, 
            // but log other errors. Actually, migrate:fresh drops tables, so these should be clean.
            echo "Error in command " . ($index + 1) . ": " . $e->getMessage() . "\n";
            // We don't exit here to try following commands unless they are critical
        }
    }

    echo "✅ Base schema import complete!\n";

} catch (Exception $e) {
    echo "❌ FATAL ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
