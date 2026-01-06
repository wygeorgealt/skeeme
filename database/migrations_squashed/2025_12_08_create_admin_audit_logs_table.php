<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_member_id')->nullable()->constrained('team_members')->nullOnDelete();
            $table->string('action'); // e.g., 'user.ban', 'subscription.refund', 'payment.retry'
            $table->string('resource_type'); // e.g., 'User', 'Subscription', 'Payment'
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->text('changes')->nullable(); // JSON of what changed
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['team_member_id', 'created_at']);
            $table->index(['resource_type', 'resource_id']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_logs');
    }
};
