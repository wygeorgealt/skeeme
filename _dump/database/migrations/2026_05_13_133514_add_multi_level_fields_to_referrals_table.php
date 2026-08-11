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
        Schema::table('referrals', function (Blueprint $table) {
            $table->foreignId('indirect_referrer_user_id')->nullable()->after('referrer_user_id')->constrained('users')->onDelete('set null');
            $table->integer('direct_reward_amount')->default(200);
            $table->integer('indirect_reward_amount')->default(50);
            $table->timestamp('direct_reward_claimed_at')->nullable();
            $table->timestamp('indirect_reward_claimed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            $table->dropForeign(['indirect_referrer_user_id']);
            $table->dropColumn([
                'indirect_referrer_user_id',
                'direct_reward_amount',
                'indirect_reward_amount',
                'direct_reward_claimed_at',
                'indirect_reward_claimed_at'
            ]);
        });
    }
};
