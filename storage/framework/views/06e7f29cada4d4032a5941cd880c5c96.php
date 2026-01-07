

<?php $__env->startSection('content'); ?>
<div class="team-dashboard">
    <!-- Sidebar Navigation -->
    <div class="team-sidebar">
        <div class="sidebar-header">
            <h3>Team Dashboard</h3>
            <span class="role-badge"><?php echo e(auth()->user()->teamMember?->role ?? 'Team User'); ?></span>
        </div>

        <nav class="sidebar-nav">
            <a href="<?php echo e(route('team.dashboard')); ?>" class="nav-item <?php echo e(request()->routeIs('team.dashboard') ? 'active' : ''); ?>">
                <i class="fas fa-chart-line"></i> Dashboard
            </a>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('users.view')): ?>
            <a href="<?php echo e(route('team.users.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.users.*') ? 'active' : ''); ?>">
                <i class="fas fa-users"></i> Users
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('system.logs')): ?>
            <a href="<?php echo e(route('team.analytics.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.analytics.*') ? 'active' : ''); ?>">
                <i class="fas fa-bar-chart"></i> Analytics
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('system.logs')): ?>
            <a href="<?php echo e(route('team.errors.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.errors.*') ? 'active' : ''); ?>">
                <i class="fas fa-exclamation-triangle"></i> Error Tracking
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('subscriptions.view')): ?>
            <a href="<?php echo e(route('team.subscriptions.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.subscriptions.*') ? 'active' : ''); ?>">
                <i class="fas fa-credit-card"></i> Subscriptions
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('payments.view')): ?>
            <a href="<?php echo e(route('team.payments.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.payments.*') ? 'active' : ''); ?>">
                <i class="fas fa-wallet"></i> Payments
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('communications.send')): ?>
            <a href="<?php echo e(route('team.communications.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.communications.*') ? 'active' : ''); ?>">
                <i class="fas fa-envelope"></i> Communications
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('support.tickets')): ?>
            <a href="<?php echo e(route('team.support.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.support.*') ? 'active' : ''); ?>">
                <i class="fas fa-ticket-alt"></i> Support
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('system.logs')): ?>
            <a href="<?php echo e(route('team.monitoring.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.monitoring.*') ? 'active' : ''); ?>">
                <i class="fas fa-heartbeat"></i> Monitoring
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('team.manage')): ?>
            <a href="<?php echo e(route('team.members.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.members.*') ? 'active' : ''); ?>">
                <i class="fas fa-user-tie"></i> Team Members
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('team.audit')): ?>
            <a href="<?php echo e(route('team.audit-logs.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.audit-logs.*') ? 'active' : ''); ?>">
                <i class="fas fa-history"></i> Audit Logs
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('communications.send')): ?>
            <a href="<?php echo e(route('team.communications.emails.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.communications.emails.*') ? 'active' : ''); ?>">
                <i class="fas fa-envelope"></i> Email Campaigns
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('communications.send')): ?>
            <a href="<?php echo e(route('team.communications.toasts.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.communications.toasts.*') ? 'active' : ''); ?>">
                <i class="fas fa-bell"></i> Toast Alerts
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('subscriptions.manage')): ?>
            <a href="<?php echo e(route('team.promotions.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.promotions.*') ? 'active' : ''); ?>">
                <i class="fas fa-gift"></i> Promotions
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('ai.stats')): ?>
            <a href="<?php echo e(route('team.ai.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.ai.*') ? 'active' : ''); ?>">
                <i class="fas fa-brain"></i> AI Stats
            </a>
            <?php endif; ?>

            <?php if (app(\Illuminate\Contracts\Auth\Access\Gate::class)->check('system.settings')): ?>
            <a href="<?php echo e(route('team.settings.index')); ?>" class="nav-item <?php echo e(request()->routeIs('team.settings.*') ? 'active' : ''); ?>">
                <i class="fas fa-cog"></i> Settings
            </a>
            <?php endif; ?>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="team-content">
        <?php echo $__env->yieldContent('team-content'); ?>
    </div>
</div>

<style>
    .team-dashboard {
        display: grid;
        grid-template-columns: 280px 1fr;
        min-height: 100vh;
        background: #0f172a;
        color: #e2e8f0;
    }

    .team-sidebar {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border-right: 1px solid #334155;
        padding: 20px 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
    }

    .sidebar-header {
        padding: 20px;
        border-bottom: 1px solid #334155;
        margin-bottom: 10px;
    }

    .sidebar-header h3 {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 700;
        color: #f1f5f9;
    }

    .role-badge {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .sidebar-nav {
        list-style: none;
        padding: 10px 0;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        color: #cbd5e1;
        text-decoration: none;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
        margin: 0 10px;
        border-radius: 6px;
    }

    .nav-item:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
        border-left-color: #60a5fa;
    }

    .nav-item.active {
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%);
        color: #60a5fa;
        border-left-color: #3b82f6;
        font-weight: 600;
        box-shadow: inset 0 1px 3px rgba(59, 130, 246, 0.1);
    }

    .nav-item i {
        width: 20px;
        text-align: center;
        font-size: 14px;
    }

    .team-content {
        padding: 30px 40px;
        background: #0f172a;
    }

    /* Dark Mode Card Styling */
    .team-content .card,
    .team-content .panel {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        color: #e2e8f0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .team-content .card-header {
        background: rgba(59, 130, 246, 0.1);
        border-bottom: 1px solid #334155;
        padding: 15px 20px;
        color: #60a5fa;
        font-weight: 600;
    }

    .team-content h2,
    .team-content h3 {
        color: #f1f5f9;
    }

    .team-content .btn {
        transition: all 0.3s ease;
    }

    .team-content .btn-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border: none;
        color: white;
    }

    .team-content .btn-primary:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .team-content table {
        background: #1e293b;
    }

    .team-content table thead {
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
    }

    .team-content table tbody tr {
        border-bottom: 1px solid #334155;
    }

    .team-content table tbody tr:hover {
        background: rgba(59, 130, 246, 0.05);
    }

    /* Scrollbar styling for dark mode */
    .team-sidebar::-webkit-scrollbar {
        width: 6px;
    }

    .team-sidebar::-webkit-scrollbar-track {
        background: transparent;
    }

    .team-sidebar::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 3px;
    }

    .team-sidebar::-webkit-scrollbar-thumb:hover {
        background: #475569;
    }

    @media (max-width: 768px) {
        .team-dashboard {
            grid-template-columns: 1fr;
        }

        .team-sidebar {
            display: none;
        }

        .team-content {
            padding: 20px;
        }
    }
</style>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/team/layout.blade.php ENDPATH**/ ?>