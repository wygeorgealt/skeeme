<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Aiven Database Audit</h1>";

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

    echo "<p style='color:green'>Connected.</p>";

    // 1. Check all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<h3>Tables in Database:</h3><ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";

    // 2. Check migrations table content
    if (in_array('migrations', $tables)) {
        $stmt = $pdo->query("SELECT migration FROM migrations");
        $migrations = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "<h3>Migrations Recorded:</h3><ul>";
        foreach ($migrations as $m) {
            echo "<li>$m</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color:red'>'migrations' table DOES NOT EXIST.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>
