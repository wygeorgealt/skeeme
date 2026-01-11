<?php

namespace App\Http\Controllers\API\Team;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');

        if (!File::exists($logPath)) {
            return response()->json(['content' => 'Log file not found.'], 404);
        }

        // Get last N lines
        $lines = $request->query('lines', 100);
        $content = $this->tailCustom($logPath, $lines);

        return response()->json(['content' => $content]);
    }

    protected function tailCustom($filepath, $lines = 100)
    {
        $f = @fopen($filepath, "rb");
        if ($f === false) return false;

        $buffer = ($lines < 2 ? 64 : ($lines < 10 ? 512 : 4096));
        fseek($f, -1, SEEK_END);
        
        if (fread($f, 1) != "\n") $lines -= 1;
        
        $output = '';
        $chunk = '';

        while (ftell($f) > 0 && $lines >= 0) {
            $seek = min(ftell($f), $buffer);
            fseek($f, -$seek, SEEK_CUR);
            $chunk = fread($f, $seek);
            $output = $chunk . $output;
            fseek($f, -mb_strlen($chunk, '8bit'), SEEK_CUR);
            $lines -= substr_count($chunk, "\n");
        }

        // Retrieve the last lines
        while ($lines++ < 0) {
            $output = substr($output, strpos($output, "\n") + 1);
        }

        fclose($f);
        return $output;
    }
    
    public function errors(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');
        if (!File::exists($logPath)) {
            return response()->json([]);
        }

        $content = File::get($logPath);
        
        // Simple regex to find error blocks - this is a basic implementation
        // Matches typical Laravel error pattern: [Date] Env.ERROR: Message
        preg_match_all('/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\].*ERROR:.*/', $content, $matches);

        $errors = array_reverse(array_slice($matches[0], -50)); // Last 50 errors

        return response()->json($errors);
    }
}
