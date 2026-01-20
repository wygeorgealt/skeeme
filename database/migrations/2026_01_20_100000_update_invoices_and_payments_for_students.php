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
        Schema::table('invoices', function (Blueprint $blueprint) {
            // Make existing fields nullable for independent students
            $blueprint->unsignedBigInteger('school_id')->nullable()->change();
            $blueprint->unsignedBigInteger('subscription_id')->nullable()->change();
            
            // Add user_id for direct student billing
            if (!Schema::hasColumn('invoices', 'user_id')) {
                $blueprint->foreignId('user_id')->nullable()->after('subscription_id')->constrained()->cascadeOnDelete();
            }
        });

        Schema::table('payments', function (Blueprint $blueprint) {
            // Also make school/subscription nullable in payments
            $blueprint->unsignedBigInteger('school_id')->nullable()->change();
            $blueprint->unsignedBigInteger('subscription_id')->nullable()->change();
            
            // Add user_id for payments tracking
            if (!Schema::hasColumn('payments', 'user_id')) {
                $blueprint->foreignId('user_id')->nullable()->after('subscription_id')->constrained()->cascadeOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $blueprint) {
            $blueprint->unsignedBigInteger('school_id')->nullable(false)->change();
            $blueprint->unsignedBigInteger('subscription_id')->nullable(false)->change();
            $blueprint->dropForeign(['user_id']);
            $blueprint->dropColumn('user_id');
        });

        Schema::table('payments', function (Blueprint $blueprint) {
            $blueprint->unsignedBigInteger('school_id')->nullable(false)->change();
            $blueprint->unsignedBigInteger('subscription_id')->nullable(false)->change();
            $blueprint->dropForeign(['user_id']);
            $blueprint->dropColumn('user_id');
        });
    }
};
