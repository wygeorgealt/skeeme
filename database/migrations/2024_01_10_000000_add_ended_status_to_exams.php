<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, we need to alter the enum column
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE exams MODIFY COLUMN status ENUM('draft', 'published', 'completed', 'ended') DEFAULT 'draft'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE exams MODIFY COLUMN status ENUM('draft', 'published', 'completed') DEFAULT 'draft'");
        }
    }
};
