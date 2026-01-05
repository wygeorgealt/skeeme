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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('question_pool_id');
            $table->string('uuid')->unique(); // For referencing across systems
            $table->string('question_type'); // 'multiple_choice', 'essay', 'true_false', etc
            $table->longText('question_text');
            $table->json('options')->nullable(); // For MCQ: [{id, text, is_correct}, ...]
            $table->json('correct_answer')->nullable(); // For essays or complex answers
            $table->decimal('marks', 8, 2)->default(1);
            $table->enum('bloom_level', [
                'remember',      // 1
                'understand',    // 2
                'apply',         // 3
                'analyze',       // 4
                'evaluate',      // 5
                'create'         // 6
            ])->default('understand');
            $table->json('metadata')->nullable(); // Difficulty, source note, tags, AI generation params
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->integer('usage_count')->default(0); // Track how many exams use this
            $table->timestamps();
            
            $table->foreign('question_pool_id')->references('id')->on('question_pools')->onDelete('cascade');
            $table->index('question_pool_id');
            $table->index('bloom_level');
            $table->index('question_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
