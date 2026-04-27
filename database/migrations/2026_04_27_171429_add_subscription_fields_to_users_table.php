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
        Schema::table('users', function (Blueprint $table) {
            $table->string('subscription_tier')->default('free')->after('credits'); // 'free', 'pro', 'max'
            $table->integer('daily_free_scans_used')->default(0)->after('subscription_tier');
            $table->timestamp('last_free_scan_at')->nullable()->after('daily_free_scans_used');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['subscription_tier', 'daily_free_scans_used', 'last_free_scan_at']);
        });
    }
};
