<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExtractAndTranslateStrings extends Command
{
    protected $signature = 'translations:extract-and-update {--include-path=resources/views}';

    protected $description = 'Extract all __() strings from Blade files and auto-update them with message. prefix';

    public function handle(): int
    {
        $this->info('🔍 Scanning Blade files for translation strings...');
        
        $path = $this->option('include-path');
        $files = File::allFiles(base_path($path));
        
        $updatedCount = 0;
        $totalStrings = 0;
        $foundStrings = [];

        foreach ($files as $file) {
            if ($file->getExtension() !== 'blade' && $file->getExtension() !== 'php') {
                continue;
            }

            $content = File::get($file->getPathname());
            
            // Extract all __('...') patterns
            if (preg_match_all("/__\\('([^']+)'\\)/", $content, $matches)) {
                $strings = $matches[1];
                
                foreach ($strings as $string) {
                    // Skip if already has 'messages.' prefix
                    if (strpos($string, 'messages.') === 0) {
                        continue;
                    }
                    
                    $foundStrings[$string] = true;
                    $totalStrings++;
                    
                    // Replace without 'messages.' with 'messages.'
                    $oldPattern = "__('$string')";
                    $newPattern = "__('messages.$string')";
                    
                    if (strpos($content, $oldPattern) !== false) {
                        $newContent = str_replace($oldPattern, $newPattern, $content);
                        File::put($file->getPathname(), $newContent);
                        $updatedCount++;
                        
                        $this->line("✓ Updated: {$file->getRelativePathname()} ({$string})");
                    }
                }
            }
        }

        $this->info("\n📊 Summary:");
        $this->info("✅ Found $totalStrings translatable strings");
        $this->info("✅ Updated $updatedCount files");
        $this->info('📝 Unique strings: ' . count($foundStrings));
        
        if (count($foundStrings) > 0) {
            $this->info("\n🌍 Now running: php artisan translations:generate");
            $this->call('translations:generate');
            
            return self::SUCCESS;
        }
        
        $this->warn('No new strings found to translate');
        return self::SUCCESS;
    }
}
