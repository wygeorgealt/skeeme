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
        // Add missing columns to notes table if they don't exist
        if (Schema::hasTable('notes')) {
            Schema::table('notes', function (Blueprint $table) {
                if (!Schema::hasColumn('notes', 'text_content')) {
                    $table->longText('text_content')->nullable()->after('file_path');
                }
                if (!Schema::hasColumn('notes', 'embedding_status')) {
                    $table->enum('embedding_status', ['pending', 'processing', 'completed', 'failed'])
                        ->default('pending')->after('text_content');
                }
                if (!Schema::hasColumn('notes', 'ingested_at')) {
                    $table->timestamp('ingested_at')->nullable()->after('embedding_status');
                }
            });
        }

        // Create vector_store_entries table if it doesn't exist
        if (!Schema::hasTable('vector_store_entries')) {
            Schema::create('vector_store_entries', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('note_id');
                $table->json('vector_data'); // Store embedding vector
                $table->json('metadata')->nullable(); // Additional metadata
                $table->timestamps();

                $table->foreign('note_id')->references('id')->on('notes')->onDelete('cascade');
                $table->unique('note_id');
                $table->index('note_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vector_store_entries');

        if (Schema::hasTable('notes')) {
            Schema::table('notes', function (Blueprint $table) {
                if (Schema::hasColumn('notes', 'text_content')) {
                    $table->dropColumn('text_content');
                }
                if (Schema::hasColumn('notes', 'embedding_status')) {
                    $table->dropColumn('embedding_status');
                }
                if (Schema::hasColumn('notes', 'ingested_at')) {
                    $table->dropColumn('ingested_at');
                }
            });
        }
    }
};
