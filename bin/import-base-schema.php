<?php

echo "🏗️ Starting full database reconstruction...\n";

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

    // 1. Wipe the current database
    echo "🧼 Wiping all existing tables, procedures, and functions...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    
    // Drop all tables
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $pdo->exec("DROP TABLE IF EXISTS `{$row[0]}`");
    }
    
    // Drop all procedures
    $stmt = $pdo->query("SHOW PROCEDURE STATUS WHERE Db = '$db'");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $pdo->exec("DROP PROCEDURE IF EXISTS `{$row['Name']}`");
    }
    
    // Drop all functions
    $stmt = $pdo->query("SHOW FUNCTION STATUS WHERE Db = '$db'");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $pdo->exec("DROP FUNCTION IF EXISTS `{$row['Name']}`");
    }

    // 2. Prep the SQL Foundation
    echo "📝 Preparing foundation from database/skeeme.sql...\n";
    $sqlFile = __DIR__ . '/../database/skeeme.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found at: $sqlFile");
    }

    $sql = file_get_contents($sqlFile);
    
    // CLEANING: Remove DEFINER statements which cause permission errors in cloud DBs
    $sql = preg_replace('/DEFINER\s*=\s*`[^`]+`@`[^`]+`/', '', $sql);
    
    // CLEANING: Remove parent_tokens table and inserts if present (deprecated)
    // First, find the table creation and remove it
    $sql = preg_replace('/CREATE TABLE IF NOT EXISTS `parent_tokens`[^;]+;/is', '-- Removed parent_tokens', $sql);
    $sql = preg_replace('/INSERT INTO `parent_tokens`[^;]+;/is', '-- Removed parent_tokens data', $sql);
    $sql = preg_replace('/DROP TABLE IF EXISTS `parent_tokens`;/i', '-- Removed parent_tokens drop', $sql);

    // 3. Import the SQL Foundation
    echo "🐘 Importing base schema commands...\n";
    
    $commands = [];
    $currentCommand = '';
    $delimiter = ';';
    
    $lines = explode("\n", $sql);
    foreach ($lines as $line) {
        $trimmedLine = trim($line);
        if (empty($trimmedLine) || str_starts_with($trimmedLine, '--') || str_starts_with($trimmedLine, '/*')) {
            continue;
        }
        
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

    echo "Found " . count($commands) . " foundation commands.\n";
    foreach ($commands as $index => $command) {
        $cmd = trim($command);
        if (empty($cmd)) continue;
        try {
            $pdo->exec($cmd);
        } catch (Exception $e) {
            echo "⚠️ Command " . ($index + 1) . " Warning: " . $e->getMessage() . "\n";
            // We continue here because some warnings are expected (like "Table already exists" if our wipe somehow missed something)
        }
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "✅ Database foundation reconstructed successfully!\n";

} catch (Exception $e) {
    echo "❌ FATAL ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
