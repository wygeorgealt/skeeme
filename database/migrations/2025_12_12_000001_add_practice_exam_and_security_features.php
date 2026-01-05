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
        // Add fields to exams table for practice exams and exam security
        Schema::table('exams', function (Blueprint $table) {
            $table->boolean('is_practice')->default(false)->after('status');
            $table->boolean('allow_review_after_submit')->default(false)->after('is_practice');
            $table->boolean('require_fullscreen')->default(true)->after('allow_review_after_submit');
            $table->boolean('show_instant_feedback')->default(false)->after('require_fullscreen');
            $table->integer('max_attempts')->nullable()->after('show_instant_feedback');
        });

        // Add fields to exam_sessions table for enhanced tracking
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dateTime('last_accessed_at')->nullable()->after('submitted_at');
            $table->boolean('is_practice')->default(false)->after('last_accessed_at');
            $table->integer('access_count')->default(0)->after('is_practice');
            $table->text('security_violations')->nullable()->after('access_count');
        });

        // Add fields to ai_gradings table for enhanced feedback
        Schema::table('ai_gradings', function (Blueprint $table) {
            $table->text('ai_feedback')->nullable()->after('reasoning');
            $table->text('feedback')->nullable()->after('ai_feedback');
            $table->unsignedBigInteger('feedback_provided_by')->nullable()->after('feedback');
            $table->dateTime('feedback_provided_at')->nullable()->after('feedback_provided_by');
            $table->decimal('plagiarism_score', 5, 2)->default(0)->after('feedback_provided_at');
            $table->decimal('consistency_score', 5, 2)->default(100)->after('plagiarism_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn([
                'is_practice',
                'allow_review_after_submit',
                'require_fullscreen',
                'show_instant_feedback',
                'max_attempts',
            ]);
        });

        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'last_accessed_at',
                'is_practice',
                'access_count',
                'security_violations',
            ]);
        });

        Schema::table('ai_gradings', function (Blueprint $table) {
            $table->dropColumn([
                'ai_feedback',
                'feedback',
                'feedback_provided_by',
                'feedback_provided_at',
                'plagiarism_score',
                'consistency_score',
            ]);
        });
    }
};
