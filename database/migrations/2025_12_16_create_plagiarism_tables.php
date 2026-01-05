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
        // Plagiarism checks table
        Schema::create('plagiarism_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->longText('student_answer');
            $table->float('plagiarism_score')->default(0); // 0-1 scale
            $table->enum('plagiarism_status', ['pending', 'checking', 'checked', 'flagged'])->default('pending');
            $table->json('similar_content')->nullable(); // Array of similar passages
            $table->json('sources')->nullable(); // Array of detected sources
            $table->dateTime('flagged_at')->nullable();
            $table->boolean('penalty_applied')->default(false);
            $table->enum('penalty_type', ['warning', 'mark_deduction', 'fail', 'investigation'])->nullable();
            $table->integer('penalty_amount')->nullable(); // Marks deducted
            $table->dateTime('checked_at')->nullable();
            $table->json('metadata')->nullable(); // Additional data from plagiarism service
            $table->timestamps();

            // Indexes
            $table->index(['exam_session_id', 'question_id']);
            $table->index(['plagiarism_status']);
            $table->index(['plagiarism_score']);
        });

        // Exam plagiarism settings table
        Schema::create('exam_plagiarism_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->boolean('plagiarism_check_enabled')->default(true);
            $table->float('plagiarism_threshold')->default(0.5); // 0-1 scale
            $table->enum('check_mode', ['manual', 'automatic', 'real_time'])->default('real_time');
            $table->json('checked_question_types')->nullable(); // JSON columns can't have defaults in MySQL
            $table->enum('penalty_for_flagged', ['warning', 'mark_deduction', 'fail', 'none'])->default('warning');
            $table->integer('penalty_marks')->nullable();
            $table->string('plagiarism_service')->default('internal'); // internal, turnitin, copyscape, etc.
            $table->json('service_config')->nullable(); // API keys, endpoints, etc.
            $table->text('detection_sources')->nullable(); // What sources to check against
            $table->boolean('check_student_submissions')->default(true);
            $table->boolean('check_internet')->default(true);
            $table->boolean('check_university_database')->default(false);
            $table->timestamps();

            // Index
            $table->unique('exam_id');
        });

        // Plagiarism penalties log table
        Schema::create('plagiarism_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plagiarism_check_id')->constrained('plagiarism_checks')->onDelete('cascade');
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
            $table->enum('penalty_type', ['warning', 'mark_deduction', 'fail', 'investigation'])->default('warning');
            $table->integer('marks_deducted')->default(0);
            $table->text('reason');
            $table->text('notes')->nullable();
            $table->foreignId('applied_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('applied_at')->nullable();
            $table->dateTime('appealed_at')->nullable();
            $table->text('appeal_reason')->nullable();
            $table->dateTime('appeal_resolved_at')->nullable();
            $table->enum('appeal_status', ['pending', 'approved', 'rejected', 'none'])->default('none');
            $table->timestamps();

            // Index
            $table->index(['exam_session_id']);
            $table->index(['plagiarism_check_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plagiarism_penalties');
        Schema::dropIfExists('exam_plagiarism_settings');
        Schema::dropIfExists('plagiarism_checks');
    }
};
