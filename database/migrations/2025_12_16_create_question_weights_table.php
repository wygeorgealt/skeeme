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
        // Question weights for exams - allows different weight per question per exam
        Schema::create('question_weights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->decimal('weight', 5, 2)->default(1.0); // 1.0 = 1 mark, 2.5 = 2.5 marks, etc.
            $table->integer('total_marks')->default(1); // Total marks available for this question
            $table->text('marking_notes')->nullable(); // Notes for graders
            $table->boolean('is_optional')->default(false); // Optional question
            $table->timestamps();

            // Unique constraint - one weight per exam-question combo
            $table->unique(['exam_id', 'question_id']);
            
            // Indexes
            $table->index(['exam_id']);
            $table->index(['question_id']);
        });

        // Weighted exam results - stores calculated weighted scores
        Schema::create('weighted_exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->decimal('raw_marks', 8, 2)->default(0); // Actual marks earned
            $table->decimal('weight', 5, 2)->default(1.0); // Question weight
            $table->decimal('weighted_marks', 8, 2)->default(0); // raw_marks * weight
            $table->decimal('total_weighted_marks', 8, 2)->default(0); // Total marks for this question (weight * total_marks)
            $table->timestamp('calculated_at');
            $table->timestamps();

            // Indexes
            $table->unique(['exam_session_id', 'question_id']);
            $table->index(['exam_session_id']);
            $table->index(['question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weighted_exam_results');
        Schema::dropIfExists('question_weights');
    }
};
