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
        // Mark schemes - reusable across exams
        Schema::create('mark_schemes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('name'); // e.g., "Standard Essay Marking Rubric"
            $table->text('description')->nullable();
            $table->text('instructions')->nullable(); // Detailed grading instructions
            $table->integer('total_marks')->default(10); // Total marks for this scheme
            $table->boolean('is_public')->default(false); // Can others use it?
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('created_by');
        });

        // Mark scheme items - rubric levels/criteria
        Schema::create('mark_scheme_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mark_scheme_id')->constrained('mark_schemes')->onDelete('cascade');
            $table->integer('level'); // 0, 1, 2, 3... (marks level)
            $table->string('level_name'); // e.g., "Excellent", "Good", "Average", "Poor"
            $table->text('criteria'); // What must be present to achieve this level
            $table->text('examples')->nullable(); // Example answers
            $table->integer('marks_awarded'); // Marks for this level
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('mark_scheme_id');
            $table->unique(['mark_scheme_id', 'level']);
        });

        // Mark scheme assignments to questions
        Schema::create('question_mark_schemes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignId('mark_scheme_id')->constrained('mark_schemes')->onDelete('cascade');
            $table->timestamps();

            // Unique constraint - one scheme per question
            $table->unique(['question_id', 'mark_scheme_id']);
            
            // Indexes
            $table->index('question_id');
            $table->index('mark_scheme_id');
        });

        // Mark scheme usage log - track which schemes were used
        Schema::create('mark_scheme_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mark_scheme_id')->constrained('mark_schemes')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->integer('questions_using')->default(0); // How many questions use this scheme
            $table->timestamp('last_used_at');
            $table->timestamps();

            // Indexes
            $table->unique(['mark_scheme_id', 'exam_id']);
            $table->index('exam_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mark_scheme_usages');
        Schema::dropIfExists('question_mark_schemes');
        Schema::dropIfExists('mark_scheme_items');
        Schema::dropIfExists('mark_schemes');
    }
};
