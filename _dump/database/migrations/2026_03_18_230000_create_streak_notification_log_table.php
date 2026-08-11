<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('streak_notification_log');

        Schema::create('streak_notification_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('milestone_target'); // 7, 14, 30, or 60
            $table->string('notification_type'); // countdown_4, countdown_1, day_of, achievement
            $table->timestamp('sent_at');
            $table->boolean('delivered')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'milestone_target', 'notification_type'], 'streak_notif_log_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('streak_notification_log');
    }
};
