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
        Schema::table('users', function (Blueprint $table) {
            // Change role to allow NULL and remove the default 'student'
            $table->enum('role', ['admin', 'lecturer', 'student'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert back to default 'student'
            $table->enum('role', ['admin', 'lecturer', 'student'])->default('student')->change();
        });
    }
};
