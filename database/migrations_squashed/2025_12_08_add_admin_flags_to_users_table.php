<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_flagged')) {
                $table->boolean('is_flagged')->default(false)->after('status');
                $table->string('flag_reason')->nullable()->after('is_flagged');
                $table->boolean('is_vip')->default(false)->after('flag_reason');
                $table->boolean('is_beta_tester')->default(false)->after('is_vip');
                $table->boolean('is_banned')->default(false)->after('is_beta_tester');
                $table->text('ban_reason')->nullable()->after('is_banned');
                $table->integer('custom_api_limit')->nullable()->after('ban_reason'); // tokens per month
                $table->string('preferred_ai_model')->nullable()->after('custom_api_limit'); // force specific model
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_flagged',
                'flag_reason',
                'is_vip',
                'is_beta_tester',
                'is_banned',
                'ban_reason',
                'custom_api_limit',
                'preferred_ai_model',
            ]);
        });
    }
};
