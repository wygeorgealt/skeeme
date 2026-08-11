<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamMember extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'role',
        'is_active',
        'permissions',
        'two_factor_enabled',
        'two_factor_secret',
        'invited_at',
        'activated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'permissions' => 'array',
        'invited_at' => 'datetime',
        'activated_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    const ROLES = [
        'super-admin' => 'Super Admin',
        'admin' => 'Admin',
        'support' => 'Support',
        'finance' => 'Finance',
        'developer' => 'Developer',
        'analyst' => 'Analyst',
    ];

    const PERMISSIONS = [
        // User Management
        'users.view' => 'View Users',
        'users.create' => 'Create Users',
        'users.edit' => 'Edit Users',
        'users.delete' => 'Delete Users',
        'users.ban' => 'Ban/Unban Users',
        'users.export' => 'Export User Data',
        'users.impersonate' => 'Impersonate Users',

        // Subscription Management
        'subscriptions.view' => 'View Subscriptions',
        'subscriptions.edit' => 'Edit Subscriptions',
        'subscriptions.refund' => 'Process Refunds',
        'subscriptions.cancel' => 'Cancel Subscriptions',

        // Payment Management
        'payments.view' => 'View Payments',
        'payments.retry' => 'Retry Failed Payments',
        'payments.refund' => 'Refund Payments',

        // Communication
        'communications.send' => 'Send Announcements',
        'communications.email' => 'Send Emails',
        'support.tickets' => 'Manage Support Tickets',

        // System
        'system.logs' => 'View System Logs',
        'system.settings' => 'Modify System Settings',
        'system.features' => 'Toggle Features',

        // AI
        'ai.stats' => 'View AI Statistics',
        'ai.costs' => 'View AI Costs',
        'ai.moderate' => 'Content Moderation',

        // Team
        'team.manage' => 'Manage Team Members',
        'team.audit' => 'View Audit Logs',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasPermission(string $permission): bool
    {
        // Super admins have all permissions
        if ($this->role === 'super-admin') {
            return true;
        }

        // Check explicit permissions
        if ($this->permissions && in_array($permission, $this->permissions)) {
            return true;
        }

        // Check role-based permissions
        return $this->getRolePermissions()->contains($permission);
    }

    public function getRolePermissions(): array
    {
        return match ($this->role) {
            'admin' => array_keys(self::PERMISSIONS),
            'support' => [
                'users.view',
                'users.impersonate',
                'subscriptions.view',
                'payments.view',
                'support.tickets',
                'communications.send',
                'team.audit',
            ],
            'finance' => [
                'subscriptions.view',
                'subscriptions.refund',
                'payments.view',
                'payments.retry',
                'payments.refund',
            ],
            'developer' => [
                'system.logs',
                'system.settings',
                'ai.stats',
                'team.audit',
            ],
            'analyst' => [
                'users.view',
                'subscriptions.view',
                'ai.stats',
                'ai.costs',
            ],
            default => [],
        };
    }
}
