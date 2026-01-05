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
        Schema::create('system_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('team_members')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->enum('target', ['all', 'schools', 'teachers', 'students', 'custom'])->default('all');
            $table->json('target_schools')->nullable();
            $table->enum('type', ['info', 'warning', 'success', 'critical'])->default('info');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('view_count')->default(0);
            $table->timestamps();
            $table->index('published_at');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_announcements');
    }
};
