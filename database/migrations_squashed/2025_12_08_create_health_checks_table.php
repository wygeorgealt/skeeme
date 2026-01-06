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
        Schema::create('health_checks', function (Blueprint $table) {
            $table->id();
            $table->string('service_name');
            $table->enum('status', ['healthy', 'degraded', 'down'])->default('healthy');
            $table->text('error_message')->nullable();
            $table->float('response_time_ms')->default(0);
            $table->integer('consecutive_failures')->default(0);
            $table->timestamp('last_checked_at')->index();
            $table->timestamp('last_failure_at')->nullable();
            $table->timestamps();
            $table->unique('service_name');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_checks');
    }
};
