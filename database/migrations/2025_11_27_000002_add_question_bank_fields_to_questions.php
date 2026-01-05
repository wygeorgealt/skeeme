<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('questions', 'question_bank_id')) {
                $table->unsignedBigInteger('question_bank_id')->nullable()->after('question_pool_id');
                $table->foreign('question_bank_id')->references('id')->on('question_banks')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('questions', 'difficulty_level')) {
                $table->enum('difficulty_level', ['easy', 'medium', 'hard'])->nullable()->after('bloom_level');
            }
            
            if (!Schema::hasColumn('questions', 'topic')) {
                $table->string('topic')->nullable()->after('difficulty_level');
            }
            
            if (!Schema::hasColumn('questions', 'learning_objective')) {
                $table->text('learning_objective')->nullable()->after('topic');
            }
            
            if (!Schema::hasColumn('questions', 'explanation')) {
                $table->text('explanation')->nullable()->after('learning_objective');
            }
            
            if (!Schema::hasColumn('questions', 'source')) {
                $table->enum('source', ['manual', 'ai_generated', 'imported'])->default('manual')->after('explanation');
            }
            
            if (!Schema::hasColumn('questions', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('source');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeignKeyIfExists('questions_question_bank_id_foreign');
            $table->dropForeignKeyIfExists('questions_created_by_foreign');
            $table->dropColumnIfExists(['question_bank_id', 'difficulty_level', 'topic', 'learning_objective', 'explanation', 'source', 'created_by']);
        });
    }
};
