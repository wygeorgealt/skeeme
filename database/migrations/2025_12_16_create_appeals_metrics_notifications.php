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
        // Grade Appeals Table
        if (!Schema::hasTable('grade_appeals')) {
            Schema::create('grade_appeals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('lecturer_id')->nullable()->constrained('users')->onDelete('set null');
                $table->text('reason');
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->timestamp('submitted_at')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();

                $table->index('student_id');
                $table->index('lecturer_id');
                $table->index('exam_session_id');
                $table->index('status');
            });
        }

        // Appeal Decisions Table
        if (!Schema::hasTable('appeal_decisions')) {
            Schema::create('appeal_decisions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('grade_appeal_id')->constrained('grade_appeals')->onDelete('cascade');
                $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
                $table->enum('decision', ['approved', 'rejected'])->default('rejected');
                $table->text('reasoning');
                $table->decimal('original_score', 8, 2)->nullable();
                $table->decimal('revised_score', 8, 2)->nullable();
                $table->timestamp('decided_at')->nullable();
                $table->timestamps();

                $table->index('grade_appeal_id');
                $table->index('lecturer_id');
            });
        }

        // Grading Metrics Table
        if (!Schema::hasTable('grading_metrics')) {
            Schema::create('grading_metrics', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
                $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
                $table->timestamp('grading_started_at')->nullable();
                $table->timestamp('grading_completed_at')->nullable();
                $table->integer('total_time_seconds')->default(0);
                $table->integer('question_index')->default(0);
                $table->integer('time_per_question_seconds')->default(0);
                $table->integer('comments_added')->default(0);
                $table->integer('revision_count')->default(0);
                $table->timestamps();

                $table->index('exam_session_id');
                $table->index('lecturer_id');
                $table->index('grading_started_at');
            });
        }

        // Notifications Table
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('type');
                $table->string('title');
                $table->text('message');
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
        }

        // Exam Session Recovery Table
        if (!Schema::hasTable('exam_session_recoveries')) {
            Schema::create('exam_session_recoveries', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->integer('last_question_index')->default(0);
                $table->json('auto_saved_data')->nullable();
                $table->timestamp('connection_lost_at')->nullable();
                $table->timestamp('recovered_at')->nullable();
                $table->boolean('is_recovered')->default(false);
                $table->timestamps();

                $table->index('exam_session_id');
                $table->index('student_id');
                $table->index('is_recovered');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_session_recoveries');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('grading_metrics');
        Schema::dropIfExists('appeal_decisions');
        Schema::dropIfExists('grade_appeals');
    }
};
