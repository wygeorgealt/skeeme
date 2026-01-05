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
        Schema::create('subscription_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('team_members')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount'])->default('percentage');
            $table->float('discount_value');
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('max_per_school')->nullable();
            $table->boolean('applies_to_all_plans')->default(true);
            $table->json('applicable_plans')->nullable();
            $table->boolean('applies_to_first_month')->default(false);
            $table->boolean('applies_to_renewal')->default(true);
            $table->integer('duration_months')->nullable();
            $table->enum('status', ['active', 'paused', 'expired'])->default('active');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->float('min_subscription_amount')->default(0);
            $table->timestamps();
            $table->index('code');
            $table->index('status');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_promotions');
    }
};
