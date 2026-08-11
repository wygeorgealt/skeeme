<?php
// CLI helper to create a forensic dump and pause the app.
// Usage: php scripts/recover_db.php

if (php_sapi_name() !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

chdir(dirname(__DIR__)); // project root

function parseDotEnv(string $path): array
{
    if (!file_exists($path)) return [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $out = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (!str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v);
        $v = preg_replace('/^"(.*)"$/', '$1', $v);
        $v = preg_replace("/^'(.*)'$/", '$1', $v);
        $out[$k] = $v;
    }
    return $out;
}

$env = parseDotEnv(__DIR__ . '/../.env');

$dbConn = $env['DB_CONNECTION'] ?? getenv('DB_CONNECTION');
$dbHost = $env['DB_HOST'] ?? getenv('DB_HOST');
$dbPort = $env['DB_PORT'] ?? getenv('DB_PORT') ?? '3306';
$dbName = $env['DB_DATABASE'] ?? getenv('DB_DATABASE');
$dbUser = $env['DB_USERNAME'] ?? getenv('DB_USERNAME');
$dbPass = $env['DB_PASSWORD'] ?? getenv('DB_PASSWORD');
$appEnv = $env['APP_ENV'] ?? getenv('APP_ENV');

fwrite(STDOUT, "\n--- DB Recovery Helper ---\n");
fwrite(STDOUT, "Detected environment: APP_ENV={$appEnv}, DB_CONNECTION={$dbConn}, DB_HOST={$dbHost}:{$dbPort}\n");

if ($dbConn !== 'mysql') {
    fwrite(STDERR, "This script currently supports MySQL only (DB_CONNECTION!=mysql).\n");
    exit(2);
}

fwrite(STDOUT, "This will: put the app into maintenance mode, restart queues, and create a forensic dump of the '" . $dbName . "' database.\n");
fwrite(STDOUT, "The DB password will NOT be displayed but will be used to perform the dump.\n");

fwrite(STDOUT, "Type YES to continue: ");
$confirm = trim(fgets(STDIN));
if ($confirm !== 'YES') {
    fwrite(STDOUT, "Aborted by user.\n");
    exit(3);
}

// 1) Put app into maintenance mode
fwrite(STDOUT, "\nRunning: php artisan down\n");
passthru('php artisan down', $rc);
if ($rc !== 0) fwrite(STDOUT, "Warning: 'php artisan down' exited with code {$rc}\n");

// 2) Restart queues to stop workers
fwrite(STDOUT, "Running: php artisan queue:restart\n");
passthru('php artisan queue:restart', $rc);
if ($rc !== 0) fwrite(STDOUT, "Warning: 'php artisan queue:restart' exited with code {$rc}\n");

// 3) Prepare dump filename
$ts = date('Ymd_His');
$dumpFile = __DIR__ . "/../before_restore_dump_{$ts}.sql";

// 4) Determine method: docker or native mysqldump
fwrite(STDOUT, "\nDetecting docker availability...\n");
exec('docker --version 2>&1', $out, $dockerRc);
if ($dockerRc === 0) {
    fwrite(STDOUT, "Docker found — using dockerized mysqldump.\n");

    // Build inner mysqldump command
    $inner = sprintf('exec mysqldump -h %s -P %s -u %s %s', escapeshellarg($dbHost), escapeshellarg($dbPort), escapeshellarg($dbUser), escapeshellarg($dbName));

    // Pass password via MYSQL_PWD env var to avoid -p in args
    $cmd = sprintf('docker run --rm -e MYSQL_PWD=%s mysql:8.0 sh -c %s > %s', escapeshellarg($dbPass), escapeshellarg($inner), escapeshellarg($dumpFile));
    fwrite(STDOUT, "Running dump (this may take a while)...\n");
    passthru($cmd, $dumpRc);
} else {
    fwrite(STDOUT, "Docker not found — attempting local mysqldump.\n");
    // Try native mysqldump
    $cmd = sprintf('mysqldump -h %s -P %s -u %s -p%s %s > %s', escapeshellarg($dbHost), escapeshellarg($dbPort), escapeshellarg($dbUser), escapeshellarg($dbPass), escapeshellarg($dbName), escapeshellarg($dumpFile));
    fwrite(STDOUT, "Running dump (this may take a while)...\n");
    passthru($cmd, $dumpRc);
}

if (!isset($dumpRc) || $dumpRc !== 0) {
    fwrite(STDERR, "Dump command failed or returned non-zero exit code.\n");
    fwrite(STDERR, "You should copy the project logs and the partial dump (if any) to a safe location.\n");
    exit(4);
}

// 5) Report dump file size
if (file_exists($dumpFile)) {
    $size = filesize($dumpFile);
    fwrite(STDOUT, "\nDump saved to: {$dumpFile} (" . round($size/1024/1024, 2) . " MB)\n");
} else {
    fwrite(STDERR, "Dump file not found after dump command.\n");
    exit(5);
}

fwrite(STDOUT, "\nFOR FORENSIC SAFETY: Do NOT run any destructive restore command until you have copied '{$dumpFile}' to a safe backup location.\n");
fwrite(STDOUT, "If you want, I can now prepare restore commands to load a backup into a fresh DB instance.\n");

fwrite(STDOUT, "\nDone.\n");
exit(0);
