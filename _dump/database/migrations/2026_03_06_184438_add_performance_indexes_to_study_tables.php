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
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });

        Schema::table('flashcard_decks', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });

        Schema::table('study_streaks', function (Blueprint $table) {
            $table->index(['user_id', 'last_study_date']);
        });
        
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->index('quiz_session_id'); // Just in case foreignId didn't auto-index (varies by DB)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('study_tables', function (Blueprint $table) {
            //
        });
    }
};
