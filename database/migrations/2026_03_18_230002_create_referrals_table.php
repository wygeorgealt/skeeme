<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('referral_code', 12);
            $table->enum('status', ['pending', 'completed', 'credited'])->default('pending');
            $table->timestamp('referred_at')->nullable();
            $table->timestamp('credited_at')->nullable();
            $table->timestamps();

            $table->index('referral_code');
            $table->index('referrer_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
