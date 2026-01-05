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
        Schema::create('exam_blueprints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('total_questions');
            $table->decimal('total_marks', 8, 2);
            $table->json('difficulty_distribution')->nullable();
            $table->json('question_type_distribution')->nullable();
            $table->json('topic_distribution')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('exam_id');
        });

        Schema::create('blueprint_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_blueprint_id')->constrained('exam_blueprints')->onDelete('cascade');
            $table->string('topic');
            $table->enum('difficulty_level', ['easy', 'medium', 'hard']);
            $table->string('question_type');
            $table->integer('required_count')->default(1);
            $table->decimal('required_marks', 8, 2)->default(1);
            $table->json('learning_objectives')->nullable();
            $table->timestamps();
            
            $table->index(['exam_blueprint_id', 'topic']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blueprint_requirements');
        Schema::dropIfExists('exam_blueprints');
    }
};
