<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Analytics snapshots - store aggregated metrics
        Schema::create('analytics_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained();
            $table->foreignUuid('course_id')->nullable()->constrained();
            $table->foreignUuid('lecturer_id')->nullable()->constrained('users');
            
            // Timing metrics
            $table->dateTime('snapshot_date');
            $table->enum('period', ['daily', 'weekly', 'monthly'])->default('daily');
            
            // Student performance
            $table->integer('total_students')->default(0);
            $table->integer('students_submitted')->default(0);
            $table->decimal('average_score', 8, 2)->default(0);
            $table->decimal('median_score', 8, 2)->default(0);
            $table->decimal('std_deviation', 8, 2)->default(0);
            $table->decimal('min_score', 8, 2)->nullable();
            $table->decimal('max_score', 8, 2)->nullable();
            
            // Question analysis
            $table->integer('total_questions')->default(0);
            $table->decimal('average_difficulty', 5, 2)->default(0);
            $table->json('difficulty_distribution')->nullable(); // {easy: x, medium: y, hard: z}
            $table->json('bloom_level_distribution')->nullable(); // {remember: x, understand: y, ...}
            
            // Grading metrics
            $table->integer('questions_auto_graded')->default(0);
            $table->integer('questions_ai_graded')->default(0);
            $table->decimal('average_confidence', 5, 2)->default(0);
            $table->integer('grades_pending_review')->default(0);
            $table->integer('grades_approved')->default(0);
            $table->integer('grades_overridden')->default(0);
            
            // Engagement metrics
            $table->decimal('average_time_spent', 8, 2)->default(0); // seconds
            $table->integer('early_submissions')->default(0);
            $table->integer('last_minute_submissions')->default(0); // submitted in last 5 mins
            $table->decimal('average_autosave_frequency', 8, 2)->default(0); // saves per minute
            
            // Learning analytics
            $table->json('question_performance')->nullable(); // {question_id: {correct: x, total: y, difficulty: z}, ...}
            $table->json('skill_mastery')->nullable(); // {bloom_level: {mastery: x%}, ...}
            $table->json('common_mistakes')->nullable(); // Top 5 mistakes across students
            
            // Comparison metrics
            $table->decimal('class_average_change', 8, 2)->nullable(); // vs previous snapshot
            $table->decimal('pass_rate', 5, 2)->default(0); // % passing
            $table->integer('improvement_count')->default(0); // students with higher score than previous
            
            // Additional metadata
            $table->json('metadata')->nullable(); // flexible field for additional data
            $table->timestamps();
            
            $table->index(['exam_id', 'snapshot_date']);
            $table->index(['course_id', 'period']);
            $table->index(['lecturer_id', 'snapshot_date']);
        });

        // Question performance history - track how questions perform over time
        Schema::create('question_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('question_id')->constrained();
            $table->foreignUuid('exam_id')->nullable()->constrained();
            
            // Attempt data
            $table->integer('total_attempts')->default(0);
            $table->integer('correct_attempts')->default(0);
            $table->decimal('correct_rate', 5, 2)->default(0); // %
            
            // Difficulty analysis
            $table->integer('bloom_level')->nullable(); // 1-6
            $table->decimal('difficulty_index', 5, 2)->default(0); // 0-100
            $table->decimal('discrimination_index', 5, 2)->default(0); // negative to positive
            
            // Student response patterns
            $table->json('option_selection_count')->nullable(); // for MCQ: {a: x, b: y, c: z, d: w}
            $table->json('common_distractors')->nullable(); // most selected wrong answers
            $table->decimal('average_time_spent', 8, 2)->default(0); // seconds
            
            // Metadata
            $table->timestamp('last_used_at')->nullable();
            $table->integer('uses_count')->default(0); // how many exams used this
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['question_id', 'exam_id']);
            $table->index(['difficulty_index']);
            $table->index(['correct_rate']);
        });

        // Student learning progress - track individual student progression
        Schema::create('student_learning_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('users');
            $table->foreignUuid('course_id')->constrained();
            
            // Progression data
            $table->decimal('overall_progress', 5, 2)->default(0); // 0-100%
            $table->decimal('mastery_level', 5, 2)->default(0); // 0-100%
            $table->json('skill_levels')->nullable(); // {bloom_level: mastery%, ...}
            
            // Performance trends
            $table->decimal('average_score_trend', 8, 2)->default(0); // vs historical avg
            $table->integer('improvement_streak')->default(0); // consecutive improvements
            $table->integer('struggle_areas')->default(0); // count of weak areas
            
            // Engagement metrics
            $table->integer('exams_completed')->default(0);
            $table->decimal('average_completion_time', 8, 2)->default(0);
            $table->integer('times_reviewed_feedback')->default(0);
            
            // Recommendations
            $table->json('recommended_topics')->nullable(); // Topics to focus on
            $table->json('strengths')->nullable(); // What student does well
            $table->json('weaknesses')->nullable(); // Areas needing improvement
            
            $table->timestamp('last_exam_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'course_id']);
            $table->index(['mastery_level']);
            $table->index(['last_exam_at']);
        });

        // Grading trend analysis
        Schema::create('grading_trends', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained();
            $table->foreignUuid('lecturer_id')->nullable()->constrained('users');
            
            // Timeline
            $table->dateTime('trend_date');
            $table->enum('period', ['hourly', 'daily', 'weekly'])->default('daily');
            
            // MCQ metrics
            $table->integer('mcq_graded_count')->default(0);
            $table->decimal('mcq_average_score', 8, 2)->default(0);
            
            // Essay metrics
            $table->integer('essays_graded_count')->default(0);
            $table->decimal('essays_average_score', 8, 2)->default(0);
            $table->decimal('essays_average_confidence', 5, 2)->default(0);
            
            // Override analysis
            $table->integer('overrides_count')->default(0);
            $table->decimal('override_rate', 5, 2)->default(0); // % of total
            $table->json('override_patterns')->nullable(); // common types of overrides
            
            // Speed metrics
            $table->decimal('average_grading_time', 8, 2)->default(0); // minutes per answer
            $table->integer('grades_per_hour')->default(0);
            
            // Quality metrics
            $table->decimal('consistency_score', 5, 2)->default(0); // how consistent overrides
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['exam_id', 'trend_date']);
            $table->index(['lecturer_id', 'period']);
        });

        // Comparison snapshots - for benchmarking
        Schema::create('class_comparison_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained();
            $table->foreignUuid('course_id')->constrained();
            
            // Comparison baseline
            $table->timestamp('comparison_date');
            $table->string('comparison_type'); // 'national', 'school', 'course'
            
            // Class metrics
            $table->decimal('class_average', 8, 2)->default(0);
            $table->decimal('median_score', 8, 2)->default(0);
            $table->decimal('pass_rate', 5, 2)->default(0);
            $table->decimal('high_achiever_rate', 5, 2)->default(0); // % scoring A
            
            // Comparison benchmark
            $table->decimal('benchmark_average', 8, 2)->nullable();
            $table->decimal('benchmark_pass_rate', 5, 2)->nullable();
            $table->decimal('performance_gap', 8, 2)->nullable(); // vs benchmark
            
            // Distribution
            $table->json('score_distribution')->nullable(); // A, B, C, D, F counts
            $table->json('performance_vs_benchmark')->nullable();
            
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['exam_id', 'course_id']);
            $table->index(['comparison_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_comparison_data');
        Schema::dropIfExists('grading_trends');
        Schema::dropIfExists('student_learning_progress');
        Schema::dropIfExists('question_analytics');
        Schema::dropIfExists('analytics_snapshots');
    }
};
