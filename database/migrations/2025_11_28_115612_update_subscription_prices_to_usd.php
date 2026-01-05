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
        // Only update if subscriptions table exists
        if (Schema::hasTable('subscriptions')) {
            \Illuminate\Support\Facades\DB::table('subscriptions')
                ->where('plan_name', 'Pro')
                ->update(['price' => 59.99]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only revert if subscriptions table exists
        if (Schema::hasTable('subscriptions')) {
            \Illuminate\Support\Facades\DB::table('subscriptions')
                ->where('plan_name', 'Pro')
                ->update(['price' => 99.00]);
        }
    }
};
