<?php
ob_start();
passthru('php artisan about 2>&1');
$output = ob_get_clean();
file_put_contents(__DIR__ . '/debug_output.txt', $output);
echo "Written to debug_output.txt\n";
