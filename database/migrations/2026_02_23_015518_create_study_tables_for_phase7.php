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
        // 1. Flashcards Feature
        Schema::create('flashcard_decks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('source_type')->default('manual'); // manual, file, topic
            $table->timestamps();
        });

        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flashcard_deck_id')->constrained()->cascadeOnDelete();
            $table->text('front');
            $table->text('back');
            $table->integer('order_column')->default(0);
            $table->timestamps();
        });

        // 2. Quiz History Feature
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('topic');
            $table->string('difficulty')->default('medium');
            $table->integer('total_questions');
            $table->integer('correct_answers')->default(0);
            $table->decimal('score_percentage', 5, 2)->default(0);
            $table->integer('time_spent_seconds')->nullable(); // For study timer tracking
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->string('type'); // multiple_choice, essay
            $table->json('options')->nullable();
            $table->text('correct_answer');
            $table->text('user_answer')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->text('explanation')->nullable();
            $table->decimal('marks_awarded', 5, 2)->nullable(); // For theory questions
            $table->decimal('max_marks', 5, 2)->nullable();
            $table->text('feedback')->nullable(); // AI feedback for theory
            $table->timestamps();
        });

        // 3. Streak Tracking
        Schema::create('study_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_study_date')->nullable();
            $table->timestamps();
            
            $table->unique('user_id'); // One streak record per user
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_streaks');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quiz_sessions');
        Schema::dropIfExists('flashcards');
        Schema::dropIfExists('flashcard_decks');
    }
};
