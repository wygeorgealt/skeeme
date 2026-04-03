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
        Schema::table('individual_subscriptions', function (Blueprint $table) {
            $table->boolean('is_trial')->default(false)->after('status');
            $table->timestamp('trial_ends_at')->nullable()->after('is_trial');
            $table->string('paystack_authorization')->nullable()->after('trial_ends_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('individual_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['is_trial', 'trial_ends_at', 'paystack_authorization']);
        });
    }
};
