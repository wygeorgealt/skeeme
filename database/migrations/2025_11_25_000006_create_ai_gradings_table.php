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
        Schema::create('ai_gradings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_answer_id');
            $table->unsignedBigInteger('exam_session_id');
            $table->string('grading_method'); // 'auto_mark', 'ai_essay', 'rubric'
            $table->decimal('marks_awarded', 8, 2)->default(0);
            $table->decimal('confidence_score', 5, 2); // 0-100, higher = more confident
            $table->decimal('confidence_threshold', 5, 2)->default(75); // Require review if below this
            $table->text('reasoning'); // Explanation for the grade
            $table->json('analysis_details')->nullable(); // Detailed breakdown:
            // For essays: {word_count, rubric_scores: {criterion: score}, key_concepts: [...]}
            // For MCQ: {expected: ..., provided: ..., correct: true/false}
            $table->enum('status', ['pending_review', 'approved', 'rejected', 'revised'])->default('pending_review');
            $table->unsignedBigInteger('reviewed_by')->nullable(); // Lecturer who reviewed
            $table->text('lecturer_override_reason')->nullable();
            $table->decimal('lecturer_override_marks', 8, 2)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('exam_answer_id')->references('id')->on('exam_answers')->onDelete('cascade');
            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('users')->onNullableDelete();
            
            $table->index('exam_session_id');
            $table->index('status');
            $table->index('confidence_score');
            $table->unique(['exam_answer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_gradings');
    }
};
