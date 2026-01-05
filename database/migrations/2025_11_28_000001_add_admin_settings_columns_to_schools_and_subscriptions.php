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
        if (Schema::hasTable('schools')) {
            Schema::table('schools', function (Blueprint $table) {
                if (!Schema::hasColumn('schools', 'website')) {
                    $table->string('website')->nullable()->after('email');
                }
                if (!Schema::hasColumn('schools', 'timezone')) {
                    $table->string('timezone')->default('UTC')->after('website');
                }
                if (!Schema::hasColumn('schools', 'language')) {
                    $table->string('language')->default('en')->after('timezone');
                }
                if (!Schema::hasColumn('schools', 'grading_scale')) {
                    $table->string('grading_scale')->default('0-100')->after('language');
                }
                if (!Schema::hasColumn('schools', 'logo_path')) {
                    $table->string('logo_path')->nullable()->after('grading_scale');
                }
            });
        }

        if (Schema::hasTable('subscriptions')) {
            Schema::table('subscriptions', function (Blueprint $table) {
                if (!Schema::hasColumn('subscriptions', 'auto_renew')) {
                    $table->boolean('auto_renew')->default(false)->after('is_active');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn(['website', 'timezone', 'language', 'grading_scale', 'logo_path']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'auto_renew')) {
                $table->dropColumn('auto_renew');
            }
        });
    }
};
