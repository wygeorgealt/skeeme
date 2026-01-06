<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Aiven Database Table Check</h1>";

try {
    $host = getenv('DB_HOST');
    $port = getenv('DB_PORT');
    $db   = getenv('DB_DATABASE');
    $user = getenv('DB_USERNAME');
    $pass = getenv('DB_PASSWORD');
    $ca   = getenv('MYSQL_ATTR_SSL_CA');
    $verify = getenv('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT');

    // Robust boolean casting for the diagnostic script too
    $verifyBool = filter_var($verify, FILTER_VALIDATE_BOOLEAN);

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ];

    if ($ca) {
        $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = $verifyBool;
    }

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, $options);

    echo "<p style='color:green'>Successfully connected to the database.</p>";

    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "<p style='color:orange'>No tables found in the database. It is empty!</p>";
    } else {
        echo "<h3>Tables Found (" . count($tables) . "):</h3><ul>";
        foreach ($tables as $table) {
            echo "<li>$table</li>";
        }
        echo "</ul>";
    }

} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>
