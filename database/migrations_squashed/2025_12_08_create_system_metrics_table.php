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
        Schema::create('system_metrics', function (Blueprint $table) {
            $table->id();
            $table->float('cpu_usage')->default(0);
            $table->float('memory_usage')->default(0);
            $table->float('disk_usage')->default(0);
            $table->integer('active_users')->default(0);
            $table->integer('total_requests')->default(0);
            $table->float('response_time_ms')->default(0);
            $table->integer('failed_requests')->default(0);
            $table->float('uptime_percentage')->default(100);
            $table->json('service_status')->nullable();
            $table->timestamp('recorded_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_metrics');
    }
};
