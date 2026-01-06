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
        Schema::create('toast_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('team_members')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'success', 'warning', 'error'])->default('info');
            $table->enum('recipient_type', ['all_admins', 'specific_schools', 'specific_admin'])->default('all_admins');
            $table->json('recipient_schools')->nullable();
            $table->json('recipient_users')->nullable();
            $table->integer('duration_seconds')->default(5);
            $table->boolean('is_dismissible')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('view_count')->default(0);
            $table->timestamps();
            $table->index('published_at');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toast_notifications');
    }
};
