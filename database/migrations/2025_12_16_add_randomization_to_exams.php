<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            // Add randomization settings to metadata if not exists
            // This migration is informational - the settings are stored in metadata JSON
            
            // Add a column for tracking randomization configuration
            if (!Schema::hasColumn('exams', 'randomize_questions')) {
                $table->boolean('randomize_questions')->default(true)
                    ->comment('Whether to randomize question order per student');
            }
            
            if (!Schema::hasColumn('exams', 'randomize_options')) {
                $table->boolean('randomize_options')->default(true)
                    ->comment('Whether to randomize answer options per student');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['randomize_questions', 'randomize_options']);
        });
    }
};
