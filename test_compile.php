<?php

require 'vendor/autoload.php';

use Illuminate\View\Compilers\BladeCompiler;

$compiler = new BladeCompiler(
    'storage/framework/views',
    'storage/cache'
);

$template = file_get_contents('resources/views/livewire/settings/admin-subscription-billing.blade.php');

try {
    $compiled = $compiler->compileString($template);
    echo "Compilation successful!\n";
    
    // Write the compiled output to see what it looks like
    file_put_contents('storage/debug_compiled.php', $compiled);
    echo "Compiled output saved to storage/debug_compiled.php\n";
    
    // Check for syntax errors in the compiled output
    $result = exec('php -l storage/debug_compiled.php 2>&1');
    echo "PHP Lint: " . $result . "\n";
} catch (\Exception $e) {
    echo "Compilation failed: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
