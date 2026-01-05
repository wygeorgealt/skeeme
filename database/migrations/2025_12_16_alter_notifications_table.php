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
        // Check if notifications table exists with old structure
        if (Schema::hasTable('notifications')) {
            // Check if it has the old Laravel polymorphic structure
            if (Schema::hasColumn('notifications', 'notifiable_type')) {
                // Drop the old table and create the new one
                Schema::dropIfExists('notifications');
            }
        }

        // Create the new notifications table with correct structure
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('type');
                $table->string('title')->nullable();
                $table->text('message')->nullable();
                $table->json('data')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->string('related_model_type')->nullable();
                $table->unsignedBigInteger('related_model_id')->nullable();
                $table->timestamps();

                $table->index('user_id');
                $table->index('type');
                $table->index('is_read');
                $table->index(['related_model_type', 'related_model_id']);
            });
        } else {
            // If table exists with new structure, just ensure all columns exist
            Schema::table('notifications', function (Blueprint $table) {
                if (!Schema::hasColumn('notifications', 'title')) {
                    $table->string('title')->nullable()->after('type');
                }
                if (!Schema::hasColumn('notifications', 'message')) {
                    $table->text('message')->nullable()->after('title');
                }
                if (!Schema::hasColumn('notifications', 'related_model_type')) {
                    $table->string('related_model_type')->nullable()->after('data');
                }
                if (!Schema::hasColumn('notifications', 'related_model_id')) {
                    $table->unsignedBigInteger('related_model_id')->nullable()->after('related_model_type');
                }
                if (Schema::hasColumn('notifications', 'read') && !Schema::hasColumn('notifications', 'is_read')) {
                    $table->renameColumn('read', 'is_read');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
