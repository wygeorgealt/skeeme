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
        Schema::table('transactions', function (Blueprint $table) {
            // Granular action type (quiz_generation, flashcard_generation, scan_solve, etc.)
            $table->string('action_type')->nullable()->after('type');
            // AI model used for the operation (claude-3-5-haiku-20241022, deepseek-chat, etc.)
            $table->string('model_used')->nullable()->after('action_type');
            // Idempotency / correlation key for dedup and support tracing
            $table->string('request_id')->nullable()->after('model_used')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['action_type', 'model_used', 'request_id']);
        });
    }
};
