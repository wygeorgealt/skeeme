<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('notifications_enabled')->default(true)->after('expo_push_token');
            $table->string('referral_code', 12)->unique()->nullable()->after('notifications_enabled');
            $table->timestamp('last_credit_alert_at')->nullable()->after('referral_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notifications_enabled', 'referral_code', 'last_credit_alert_at']);
        });
    }
};
