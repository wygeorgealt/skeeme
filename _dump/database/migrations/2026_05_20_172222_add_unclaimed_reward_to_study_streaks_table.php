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
        Schema::table('study_streaks', function (Blueprint $table) {
            $table->integer('unclaimed_reward')->default(0)->after('longest_streak');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('study_streaks', function (Blueprint $table) {
            $table->dropColumn('unclaimed_reward');
        });
    }
};
