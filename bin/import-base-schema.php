<?php

echo "🏗️ Starting SQUASHED database reconstruction...\n";

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

    // 1. Wipe everything
    echo "🧼 Wiping database foundation (ignoring foreign keys)...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    
    // Drop all tables
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $pdo->exec("DROP TABLE IF EXISTS `{$row[0]}`");
    }
    
    // 2. Prep the SQUASHED Foundation
    // We search for the file in a few possible names
    $sqlFiles = [
        __DIR__ . '/../skeeme structure.sql',
        __DIR__ . '/../database/skeeme.sql'
    ];
    
    $foundationFile = null;
    foreach ($sqlFiles as $file) {
        if (file_exists($file)) {
            $foundationFile = $file;
            break;
        }
    }

    if (!$foundationFile) {
        throw new Exception("Foundation SQL file not found (checked skeeme structure.sql and database/skeeme.sql)");
    }

    echo "📝 Loading foundation from: " . basename($foundationFile) . "\n";
    $sql = file_get_contents($foundationFile);
    
    // CLEANING: Strip DEFINERs
    $sql = preg_replace('/DEFINER\s*=\s*`[^`]+`@`[^`]+`/', '', $sql);
    
    // CLEANING: Convert MyISAM to InnoDB (for foreign keys)
    $sql = str_ireplace('ENGINE=MyISAM', 'ENGINE=InnoDB', $sql);
    
    // CLEANING: Handle common collation issues (0900_ai_ci vs unicode_ci)
    $sql = str_ireplace('utf8mb4_0900_ai_ci', 'utf8mb4_unicode_ci', $sql);

    // 3. Import
    echo "🐘 Importing foundation commands...\n";
    
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
            // Log but continue
            echo "⚠️ Cmd " . ($index + 1) . " Warning: " . substr($e->getMessage(), 0, 100) . "...\n";
        }
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "✅ Foundation reconstructed! Moving to incremental migrations...\n";

} catch (Exception $e) {
    echo "❌ FATAL ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
