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
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('student_id');
            $table->enum('status', ['not_started', 'in_progress', 'submitted', 'graded', 'abandoned'])->default('not_started');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->integer('time_spent_seconds')->default(0); // Track how long student spent
            $table->integer('questions_answered')->default(0); // Progress tracking
            $table->decimal('score', 8, 2)->nullable();
            $table->json('answers')->nullable(); // Cached answers before submission
            $table->json('metadata')->nullable(); // Browser info, session info, etc
            $table->timestamps();
            
            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['exam_id', 'student_id']); // One session per student per exam
            $table->index('status');
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};
