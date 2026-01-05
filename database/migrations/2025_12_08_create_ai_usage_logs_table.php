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
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('model_used');
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->float('cost')->default(0);
            $table->enum('feature', ['chat', 'analysis', 'generation', 'correction', 'tutoring'])->default('chat');
            $table->json('metadata')->nullable();
            $table->timestamp('used_at')->index();
            $table->timestamps();
            $table->index('user_id');
            $table->index('school_id');
            $table->index('model_used');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
