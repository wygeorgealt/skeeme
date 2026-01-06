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
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_session_id');
            $table->integer('question_index'); // Position in exam.questions array
            $table->string('question_id')->nullable(); // Optional: UUID for generated questions
            $table->longText('student_answer'); // Store the selected option or essay response
            $table->decimal('marks_obtained', 8, 2)->nullable();
            $table->enum('marking_status', ['not_marked', 'auto_marked', 'ai_graded', 'manual_graded'])->default('not_marked');
            $table->json('grading_details')->nullable(); // Confidence score, reasoning, rubric scores
            $table->text('feedback')->nullable(); // Feedback for student
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
            
            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->index('exam_session_id');
            $table->index('marking_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_answers');
    }
};
