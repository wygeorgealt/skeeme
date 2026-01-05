<?php

$path = 'resources/views/livewire/settings/admin-subscription-billing.blade.php';
$content = file_get_contents($path);

echo "File size: " . strlen($content) . " bytes\n";
echo "Line count: " . count(file($path)) . " lines\n\n";

// Count opens and closes
$opens = preg_match_all('/@(if|foreach|while|forelse)\b/', $content);
$closes = preg_match_all('/@(endif|endforeach|endwhile|endforelse)\b/', $content);

echo "Opens (if/foreach/while/forelse): " . $opens . "\n";
echo "Closes (endif/endforeach/endwhile/endforelse): " . $closes . "\n\n";

if ($opens != $closes) {
    echo "ERROR: Mismatch between opens and closes!\n";
}

// Find all positions of @if and @endif
$ifPositions = [];
$endifPositions = [];

$lines = file($path);
foreach ($lines as $lineNum => $line) {
    if (preg_match('/@(if|foreach|while|forelse)\b/', $line)) {
        $ifPositions[] = $lineNum + 1;
    }
    if (preg_match('/@(endif|endforeach|endwhile|endforelse)\b/', $line)) {
        $endifPositions[] = $lineNum + 1;
    }
}

echo "Opens at lines: " . implode(', ', $ifPositions) . "\n";
echo "Closes at lines: " . implode(', ', $endifPositions) . "\n";
