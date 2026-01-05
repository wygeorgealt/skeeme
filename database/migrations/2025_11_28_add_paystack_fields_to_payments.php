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
        Schema::table('payments', function (Blueprint $table) {
            // Add Paystack-specific fields if they don't exist
            if (!Schema::hasColumn('payments', 'authorization_code')) {
                $table->string('authorization_code')->nullable()->after('failure_reason');
            }
            if (!Schema::hasColumn('payments', 'customer_code')) {
                $table->string('customer_code')->nullable()->after('authorization_code');
            }
            if (!Schema::hasColumn('payments', 'last_4')) {
                $table->string('last_4')->nullable()->after('customer_code');
            }
            if (!Schema::hasColumn('payments', 'card_type')) {
                $table->string('card_type')->nullable()->after('last_4');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'authorization_code',
                'customer_code',
                'last_4',
                'card_type',
            ]);
        });
    }
};
