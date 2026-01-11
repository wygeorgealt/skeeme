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
        DB::statement("ALTER TABLE exam_sessions MODIFY COLUMN status ENUM('not_started', 'in_progress', 'submitted', 'graded', 'abandoned', 'published') NOT NULL DEFAULT 'not_started'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE exam_sessions MODIFY COLUMN status ENUM('not_started', 'in_progress', 'submitted', 'graded', 'abandoned') NOT NULL DEFAULT 'not_started'");
    }
};
