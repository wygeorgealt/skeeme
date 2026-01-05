<?php

$path = 'resources/views/livewire/settings/admin-subscription-billing.blade.php';
$lines = file($path);

$opens = [];
$closes = [];
$depth = 0;

foreach ($lines as $lineNum => $line) {
    $curLine = $lineNum + 1;
    
    // Count opens and closes on this line
    if (preg_match('/@(if|foreach|while|forelse|unless)\b/', $line)) {
        preg_match_all('/@(if|foreach|while|forelse|unless)\b/', $line, $m);
        foreach ($m[0] as $match) {
            $depth++;
            $opens[] = ['line' => $curLine, 'type' => $match, 'depth' => $depth];
        }
    }
    
    if (preg_match('/@(endif|endforeach|endwhile|endforelse|endunless)\b/', $line)) {
        preg_match_all('/@(endif|endforeach|endwhile|endforelse|endunless)\b/', $line, $m);
        foreach ($m[0] as $match) {
            $closes[] = ['line' => $curLine, 'type' => $match, 'depth' => $depth];
            $depth--;
        }
    }
}

echo "Opens: " . count($opens) . "\n";
echo "Closes: " . count($closes) . "\n\n";

// Print them all
echo "OPENS:\n";
foreach ($opens as $o) {
    echo str_pad($o['line'], 4) . " " . str_pad($o['type'], 15) . " depth=" . $o['depth'] . "\n";
}

echo "\nCLOSES:\n";
foreach ($closes as $c) {
    echo str_pad($c['line'], 4) . " " . str_pad($c['type'], 15) . " depth=" . $c['depth'] . "\n";
}

echo "\nFinal depth: " . $depth . "\n";
