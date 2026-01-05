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
        Schema::create('prompt_library', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('team_members')->cascadeOnDelete();
            $table->string('title');
            $table->text('prompt_text');
            $table->string('category');
            $table->text('description')->nullable();
            $table->json('variables')->nullable();
            $table->float('avg_cost_per_use')->default(0);
            $table->integer('usage_count')->default(0);
            $table->float('avg_quality_score')->default(0);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('category');
            $table->index('usage_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_library');
    }
};
