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
        // Question pools - for adaptive/branching exams
        if (!Schema::hasTable('question_pools')) {
            Schema::create('question_pools', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
                $table->string('name'); // e.g., "Easy Math Questions", "Hard Physics Questions"
                $table->text('description')->nullable();
                $table->enum('difficulty', ['easy', 'moderate', 'difficult', 'very_difficult'])->default('moderate');
                $table->integer('pool_order')->default(0); // For sequencing
                $table->boolean('is_adaptive')->default(false); // True if used for adaptive routing
                $table->timestamps();

                // Indexes
                $table->unique(['exam_id', 'name']);
                $table->index('exam_id');
                $table->index(['exam_id', 'difficulty']);
            });
        }

        // Questions assigned to pools (many-to-many)
        if (!Schema::hasTable('question_pool_questions')) {
            Schema::create('question_pool_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('question_pool_id')->constrained('question_pools')->onDelete('cascade');
                $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
                $table->integer('pool_order')->default(0); // Order within pool
                $table->timestamps();

                // Unique constraint
                $table->unique(['question_pool_id', 'question_id']);
                
                // Indexes
                $table->index('question_pool_id');
                $table->index('question_id');
            });
        }

        // Adaptive routing rules - define how exams branch
        if (!Schema::hasTable('adaptive_routing_rules')) {
            Schema::create('adaptive_routing_rules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
                $table->string('rule_name'); // e.g., "90% Correct -> Hard Pool"
                $table->text('description')->nullable();
                $table->integer('question_sequence'); // Which question answered triggers this
                $table->float('performance_threshold'); // 0-1 scale (e.g., 0.9 = 90%)
                $table->enum('operator', ['>=', '>', '<', '<=', '=='])->default('>=');
                $table->foreignId('target_pool_id')->constrained('question_pools')->onDelete('cascade');
                $table->integer('questions_to_present')->default(1); // How many questions from pool
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Indexes
                $table->index(['exam_id', 'question_sequence']);
                $table->index('target_pool_id');
            });
        }

        // Adaptive exam sessions - track which questions students get
        if (!Schema::hasTable('adaptive_session_paths')) {
            Schema::create('adaptive_session_paths', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
                $table->foreignId('question_pool_id')->nullable()->constrained('question_pools')->onDelete('set null');
                $table->integer('sequence_number'); // Order presented
                $table->float('student_performance_at_point')->default(0); // Student's score before this question
                $table->string('routing_reason')->nullable(); // Why this pool was selected
                $table->timestamp('presented_at');
                $table->timestamps();

                // Indexes
                $table->index(['exam_session_id', 'sequence_number']);
                $table->index('question_pool_id');
            });
        }

        // Exam config for adaptive settings
        if (Schema::hasTable('exams')) {
            Schema::table('exams', function (Blueprint $table) {
                // Check if columns don't already exist
                if (!Schema::hasColumn('exams', 'is_adaptive')) {
                    $table->boolean('is_adaptive')->default(false);
                }
                if (!Schema::hasColumn('exams', 'adaptive_type')) {
                    $table->enum('adaptive_type', ['linear', 'branching', 'pool_based'])->nullable();
                }
                if (!Schema::hasColumn('exams', 'adaptive_config')) {
                    $table->json('adaptive_config')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adaptive_session_paths');
        Schema::dropIfExists('adaptive_routing_rules');
        Schema::dropIfExists('question_pool_questions');
        Schema::dropIfExists('question_pools');

        if (Schema::hasTable('exams')) {
            Schema::table('exams', function (Blueprint $table) {
                if (Schema::hasColumn('exams', 'is_adaptive')) {
                    $table->dropColumn('is_adaptive');
                }
                if (Schema::hasColumn('exams', 'adaptive_type')) {
                    $table->dropColumn('adaptive_type');
                }
                if (Schema::hasColumn('exams', 'adaptive_config')) {
                    $table->dropColumn('adaptive_config');
                }
            });
        }
    }
};
