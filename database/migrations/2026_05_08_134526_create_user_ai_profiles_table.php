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
        Schema::create('user_ai_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('academic_level')->nullable(); // High School, University, etc.
            $table->string('learning_style')->nullable(); // Visual, Practical, Theoretical
            $table->text('strengths')->nullable();
            $table->text('weaknesses')->nullable();
            $table->text('interests')->nullable();
            $table->json('tone_preferences')->nullable(); // { "formality": 0.5, "humor": 0.2 }
            $table->text('custom_context')->nullable(); // Any extra info the student wants to share
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_ai_profiles');
    }
};
