<?php

namespace App\Console\Commands;

use App\Services\TranslationService;
use Illuminate\Console\Command;

class GenerateTranslations extends Command
{
    protected $signature = 'translations:generate';

    protected $description = 'Generate translation files for all supported languages using Deepseek AI';

    public function handle(): int
    {
        try {
            $this->info('🌍 Starting translation generation...');
            
            $service = new TranslationService();
            
            // Extract strings from all Blade files
            $this->info('🔍 Extracting translatable strings from Blade files...');
            $extracted = $service->extractStringsFromBladeFiles('resources/views');
            
            // Merge with core UI strings
            $baseTranslations = array_merge($this->getCoreUIStrings(), $extracted);
            
            $this->info('📝 Generating translation files for all languages...');
            $this->info('📊 Found ' . count($baseTranslations) . ' unique strings to translate');
            
            $service->createLanguageFiles($baseTranslations);
            
            $this->info('✅ Translation files generated successfully!');
            $this->info('📍 Language files created in: resources/lang/');
            $this->info('🔤 Languages: en (English), es (Spanish), fr (French), de (German), pt (Portuguese)');
            $this->info('📈 Total strings: ' . count($baseTranslations));
            
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    /**
     * Get core UI strings that should always be translated
     */
    private function getCoreUIStrings(): array
    {
        return [
            // Navigation
            'Profile' => 'Profile',
            'Password' => 'Password',
            'Two-Factor Auth' => 'Two-Factor Authentication',
            'Appearance' => 'Appearance',
            'School Configuration' => 'School Configuration',
            'Subscription & Billing' => 'Subscription & Billing',
            'Dashboard' => 'Dashboard',
            'Settings' => 'Settings',
            'Logout' => 'Logout',
            
            // Forms
            'Save' => 'Save',
            'Save Configuration' => 'Save Configuration',
            'Cancel' => 'Cancel',
            'Delete' => 'Delete',
            'Edit' => 'Edit',
            'Add' => 'Add',
            'Update' => 'Update',
            'Remove' => 'Remove',
            'Remove Logo' => 'Remove Logo',
            
            // School Configuration
            'School Name' => 'School Name',
            'Contact Email' => 'Contact Email',
            'Phone Number' => 'Phone Number',
            'Location / Address' => 'Location / Address',
            'Website' => 'Website',
            'School Logo' => 'School Logo',
            'Upload Logo' => 'Upload Logo',
            'Timezone' => 'Timezone',
            'Default Language' => 'Default Language',
            'Academic Year' => 'Academic Year',
            'Grading Scale' => 'Grading Scale',
            'Manage your school settings and basic information' => 'Manage your school settings and basic information',
            
            // Subscription
            'Plan Status' => 'Plan Status',
            'Current Plan' => 'Current Plan',
            'License Information' => 'License Information',
            'Active Licenses' => 'Active Licenses',
            'Invoice History' => 'Invoice History',
            'Auto-Renewal' => 'Auto-Renewal',
            'Enable Auto-Renewal' => 'Enable Auto-Renewal',
            'Manage your subscription and billing' => 'Manage your subscription and billing',
            
            // Messages
            'Saved.' => 'Saved.',
            'Changes saved successfully.' => 'Changes saved successfully.',
            'Error saving changes.' => 'Error saving changes.',
            'The selected timezone is invalid.' => 'The selected timezone is invalid.',
            'PNG, JPG, GIF up to 5MB' => 'PNG, JPG, GIF up to 5MB',
            'Format: YYYY/YYYY (e.g., 2024/2025)' => 'Format: YYYY/YYYY (e.g., 2024/2025)',
            
            // Common
            'Yes' => 'Yes',
            'No' => 'No',
            'Required' => 'Required',
            'Optional' => 'Optional',
            'Loading...' => 'Loading...',
            'Saving...' => 'Saving...',
            'Processing...' => 'Processing...',
            'Success' => 'Success',
            'Error' => 'Error',
            'Warning' => 'Warning',
            'Info' => 'Info',
        ];
    }
}
