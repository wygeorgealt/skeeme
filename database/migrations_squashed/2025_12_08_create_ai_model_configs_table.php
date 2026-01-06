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
        Schema::create('ai_model_configs', function (Blueprint $table) {
            $table->id();
            $table->string('model_name')->unique();
            $table->string('provider');
            $table->float('cost_per_1k_input_tokens')->default(0);
            $table->float('cost_per_1k_output_tokens')->default(0);
            $table->integer('max_tokens')->default(4096);
            $table->boolean('is_active')->default(true);
            $table->json('capabilities')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_model_configs');
    }
};
