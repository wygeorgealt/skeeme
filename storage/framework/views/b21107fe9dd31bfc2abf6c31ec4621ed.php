

<?php $__env->startSection('team-content'); ?>
<div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
        <div>
            <h1>Admin Control Center</h1>
            <p class="subtitle">Welcome back, <strong><?php echo e(auth()->user()->name); ?></strong> (<?php echo e(auth()->user()->teamMember->role); ?>)</p>
        </div>
    </div>

    <!-- Key Metrics Row -->
    <div class="metrics-row">
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-users"></i></div>
            <div class="metric-content">
                <div class="metric-label">Total Users</div>
                <div class="metric-value"><?php echo e($metrics['total_users']); ?></div>
                <div class="metric-detail"><?php echo e($metrics['active_users']); ?> active</div>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
            <div class="metric-content">
                <div class="metric-label">Revenue (This Month)</div>
                <div class="metric-value">$<?php echo e(number_format($metrics['revenue_this_month'], 0)); ?></div>
                <div class="metric-detail"><?php echo e($metrics['active_subscriptions']); ?> active subs</div>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-school"></i></div>
            <div class="metric-content">
                <div class="metric-label">Schools</div>
                <div class="metric-value"><?php echo e($metrics['total_schools']); ?></div>
                <div class="metric-detail"><?php echo e($metrics['total_subscriptions']); ?> subscriptions</div>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="metric-content">
                <div class="metric-label">System Issues</div>
                <div class="metric-value"><?php echo e($recentErrors->count()); ?></div>
                <div class="metric-detail">Unresolved errors</div>
            </div>
        </div>
    </div>

    <!-- Main Admin Sections Grid -->
    <div class="admin-sections">
        <!-- USER MANAGEMENT SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-users-cog"></i> User Management</h3>
                <a href="<?php echo e(route('team.users.index')); ?>" class="card-action-btn" title="Full User Management"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-user"></i></span>
                        <span class="feature-text">View & Manage Accounts</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-key"></i></span>
                        <span class="feature-text">Reset Passwords</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-clock"></i></span>
                        <span class="feature-text">Extend Trials</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-message"></i></span>
                        <span class="feature-text">View Conversations</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-sticky-note"></i></span>
                        <span class="feature-text">Add Internal Notes</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- FINANCIAL MANAGEMENT SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-money-bill-wave"></i> Financial Management</h3>
                <a href="<?php echo e(route('team.financial.dashboard')); ?>" class="card-action-btn" title="Financial Dashboard"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-chart-line"></i></span>
                        <span class="feature-text">Revenue Dashboard</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-undo"></i></span>
                        <span class="feature-text">Process Refunds</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-file-invoice"></i></span>
                        <span class="feature-text">Manage Invoices</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-history"></i></span>
                        <span class="feature-text">Billing History</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-tag"></i></span>
                        <span class="feature-text">Create Discount Codes</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- SUPPORT & TICKETS SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-headset"></i> Support & Communications</h3>
                <a href="<?php echo e(route('team.support.tickets.index')); ?>" class="card-action-btn" title="Support Management"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-ticket-alt"></i></span>
                        <span class="feature-text">Support Tickets (<?php echo e($contactMessages->count()); ?>)</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-envelope"></i></span>
                        <span class="feature-text">Send User Emails</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-bullhorn"></i></span>
                        <span class="feature-text">System Announcements (<?php echo e($announcements->count()); ?>)</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-envelope-open-text"></i></span>
                        <span class="feature-text">Marketing Emails</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-newspaper"></i></span>
                        <span class="feature-text">Changelog Updates</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ANALYTICS & REPORTING SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-chart-bar"></i> Analytics & Reporting</h3>
                <a href="<?php echo e(route('team.analytics.dashboard')); ?>" class="card-action-btn" title="Analytics Dashboard"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-chart-line"></i></span>
                        <span class="feature-text">User Activity Analytics</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-arrow-up-right-dot"></i></span>
                        <span class="feature-text">Signups & Conversions</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-flask"></i></span>
                        <span class="feature-text">A/B Testing</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-download"></i></span>
                        <span class="feature-text">Export Data</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-file-pdf"></i></span>
                        <span class="feature-text">Financial Reports</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- SYSTEM MONITORING SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-server"></i> System Monitoring</h3>
                <a href="<?php echo e(route('team.monitoring.errors')); ?>" class="card-action-btn" title="System Health"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-heartbeat"></i></span>
                        <span class="feature-text">Server Health & Uptime</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-bug"></i></span>
                        <span class="feature-text">Error Logs (<?php echo e($recentErrors->count()); ?>)</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-wifi"></i></span>
                        <span class="feature-text">API Usage & Performance</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-cogs"></i></span>
                        <span class="feature-text">Feature Flags</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-wrench"></i></span>
                        <span class="feature-text">Debug User Issues</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- SYSTEM SETTINGS SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-sliders-h"></i> System Settings</h3>
                <a href="<?php echo e(route('team.settings.system')); ?>" class="card-action-btn" title="Settings Management"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-cog"></i></span>
                        <span class="feature-text">Modify System Configuration</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-database"></i></span>
                        <span class="feature-text">Database Tools (Read-Only)</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-lock"></i></span>
                        <span class="feature-text">Manage Permissions</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-shield-alt"></i></span>
                        <span class="feature-text">Security Settings</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-save"></i></span>
                        <span class="feature-text">Backup Management</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- CONTENT MANAGEMENT SECTION -->
        <div class="admin-card">
            <div class="card-header">
                <h3><i class="fas fa-file-alt"></i> Content Management</h3>
                <a href="<?php echo e(route('team.content.pages')); ?>" class="card-action-btn" title="Content Management"><i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="card-content">
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-globe"></i></span>
                        <span class="feature-text">Landing Pages</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-newspaper"></i></span>
                        <span class="feature-text">Changelog Posts</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-image"></i></span>
                        <span class="feature-text">Media Library</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-pen-fancy"></i></span>
                        <span class="feature-text">Content Editor</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon"><i class="fas fa-calendar"></i></span>
                        <span class="feature-text">Schedule Publications</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity Dashboard -->
    <div class="dashboard-grid mt-5">
        <!-- Recent Errors -->
        <div class="recent-section">
            <div class="section-header">
                <h3><i class="fas fa-exclamation-circle"></i> Recent System Errors</h3>
            </div>
            <div class="error-list">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $recentErrors; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div class="error-item">
                        <div class="error-code"><?php echo e($error->error_code ?? 'N/A'); ?></div>
                        <div class="error-message"><?php echo e(substr($error->error_message, 0, 60)); ?>...</div>
                        <div class="error-time"><?php echo e($error->created_at->diffForHumans()); ?></div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <p class="empty-state">No errors</p>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>

        <!-- System Announcements -->
        <div class="recent-section">
            <div class="section-header">
                <h3><i class="fas fa-bullhorn"></i> System Announcements</h3>
            </div>
            <div class="announcement-list">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $announcements; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $announcement): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div class="announcement-item">
                        <div class="announcement-badge">
                            <span class="badge badge-<?php echo e($announcement->priority ?? 'info'); ?>">
                                <?php echo e(ucfirst($announcement->priority ?? 'normal')); ?>

                            </span>
                        </div>
                        <div class="announcement-content">
                            <div class="announcement-title"><?php echo e($announcement->title); ?></div>
                            <div class="announcement-message"><?php echo e(substr($announcement->content ?? $announcement->message, 0, 80)); ?>...</div>
                            <div class="announcement-date"><?php echo e($announcement->published_at?->diffForHumans() ?? $announcement->created_at?->diffForHumans()); ?></div>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <p class="empty-state">No announcements</p>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>

        <!-- Contact Messages -->
        <div class="recent-section full-width">
            <div class="section-header">
                <h3><i class="fas fa-envelope"></i> Contact Messages & Support Tickets</h3>
            </div>
            <div class="contact-list">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $contactMessages; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $message): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div class="contact-item">
                        <div class="contact-avatar"><?php echo e(strtoupper(substr($message->name ?? $message->sender_name ?? 'U', 0, 1))); ?></div>
                        <div class="contact-content">
                            <div class="contact-name"><?php echo e($message->name ?? $message->sender_name ?? 'Unknown'); ?></div>
                            <div class="contact-email"><?php echo e($message->email ?? $message->sender_email ?? 'N/A'); ?></div>
                            <div class="contact-subject"><?php echo e(substr($message->subject ?? $message->message ?? '', 0, 100)); ?></div>
                            <div class="contact-date"><?php echo e($message->created_at->diffForHumans()); ?></div>
                        </div>
                        <div class="contact-action">
                            <button class="btn btn-sm btn-primary">Respond</button>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <p class="empty-state">No messages</p>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>

        <!-- Failed Payments -->
        <div class="recent-section full-width">
            <div class="section-header">
                <h3><i class="fas fa-credit-card"></i> Failed Payments & Issues</h3>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $failedPayments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $payment): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <tr>
                            <td>#<?php echo e($payment->id); ?></td>
                            <td><?php echo e($payment->user?->name ?? 'Unknown'); ?></td>
                            <td>$<?php echo e($payment->amount); ?></td>
                            <td><span class="badge badge-danger"><?php echo e($payment->status); ?></span></td>
                            <td><?php echo e($payment->created_at->format('M d, Y')); ?></td>
                            <td><button class="btn btn-sm btn-warning">Refund</button></td>
                        </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <tr><td colspan="6" class="text-center">No failed payments</td></tr>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    .dashboard-container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 20px;
    }

    .dashboard-header {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #334155;
    }

    .dashboard-header h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 700;
        color: #f1f5f9;
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .subtitle {
        margin: 8px 0 0;
        color: #cbd5e1;
        font-size: 14px;
    }

    /* Metrics Row */
    .metrics-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .metric-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .metric-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        transform: translateY(-4px);
    }

    .metric-icon {
        font-size: 40px;
        color: #60a5fa;
        opacity: 0.9;
    }

    .metric-content {
        flex: 1;
    }

    .metric-label {
        font-size: 12px;
        color: #94a3b8;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 4px 0;
    }

    .metric-detail {
        font-size: 12px;
        color: #cbd5e1;
    }

    /* Admin Sections Grid */
    .admin-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .admin-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .admin-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
        transform: translateY(-4px);
    }

    .card-header {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
        padding: 18px 20px;
        border-bottom: 1px solid #334155;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .card-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .card-header h3 i {
        font-size: 18px;
        color: #60a5fa;
    }

    .card-action-btn {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid #3b82f6;
        color: #60a5fa;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
    }

    .card-action-btn:hover {
        background: #3b82f6;
        color: white;
    }

    .card-content {
        padding: 20px;
    }

    /* Feature List */
    .feature-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border-radius: 6px;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .feature-item:hover {
        background: rgba(59, 130, 246, 0.1);
        padding-left: 15px;
    }

    .feature-icon {
        font-size: 18px;
        color: #60a5fa;
        width: 24px;
        text-align: center;
        flex-shrink: 0;
    }

    .feature-text {
        color: #cbd5e1;
        font-size: 14px;
        font-weight: 500;
    }

    .feature-item:hover .feature-text {
        color: #f1f5f9;
    }

    /* Dashboard Grid */
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .recent-section {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .recent-section.full-width {
        grid-column: 1 / -1;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #334155;
    }

    .section-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .section-header h3 i {
        color: #60a5fa;
    }

    /* Error List */
    .error-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .error-item {
        padding: 12px;
        border-bottom: 1px solid #334155;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.2s ease;
    }

    .error-item:hover {
        background: rgba(59, 130, 246, 0.05);
    }

    .error-code {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        min-width: 60px;
    }

    .error-message {
        flex: 1;
        margin: 0 15px;
        color: #cbd5e1;
        font-size: 13px;
    }

    .error-time {
        color: #94a3b8;
        font-size: 12px;
        white-space: nowrap;
    }

    /* Announcement List */
    .announcement-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .announcement-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid #334155;
        transition: background 0.2s ease;
    }

    .announcement-item:hover {
        background: rgba(59, 130, 246, 0.05);
    }

    .announcement-badge {
        flex-shrink: 0;
        padding-top: 2px;
    }

    .announcement-content {
        flex: 1;
        min-width: 0;
    }

    .announcement-title {
        font-weight: 600;
        color: #f1f5f9;
        font-size: 13px;
        margin-bottom: 4px;
    }

    .announcement-message {
        color: #cbd5e1;
        font-size: 12px;
        margin-bottom: 4px;
        line-height: 1.4;
    }

    .announcement-date {
        color: #94a3b8;
        font-size: 11px;
    }

    /* Contact List */
    .contact-list {
        max-height: 500px;
        overflow-y: auto;
    }

    .contact-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px;
        border-bottom: 1px solid #334155;
        transition: background 0.2s ease;
    }

    .contact-item:hover {
        background: rgba(59, 130, 246, 0.05);
    }

    .contact-avatar {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
    }

    .contact-content {
        flex: 1;
        min-width: 0;
    }

    .contact-name {
        font-weight: 600;
        color: #f1f5f9;
        font-size: 13px;
        margin-bottom: 2px;
    }

    .contact-email {
        color: #60a5fa;
        font-size: 11px;
        margin-bottom: 4px;
    }

    .contact-subject {
        color: #cbd5e1;
        font-size: 12px;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .contact-date {
        color: #94a3b8;
        font-size: 11px;
    }

    .contact-action {
        flex-shrink: 0;
        margin-left: 10px;
    }

    /* Badges */
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
    }

    .badge-danger {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
    }

    .badge-success {
        background: rgba(34, 197, 94, 0.2);
        color: #86efac;
    }

    .badge-warning {
        background: rgba(234, 179, 8, 0.2);
        color: #facc15;
    }

    .badge-info {
        background: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
    }

    /* Tables */
    .table {
        width: 100%;
        border-collapse: collapse;
        background: #1e293b;
    }

    .table td,
    .table th {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #334155;
        color: #cbd5e1;
    }

    .table th {
        background: rgba(59, 130, 246, 0.1);
        font-weight: 600;
        color: #60a5fa;
    }

    .table tr:hover {
        background: rgba(59, 130, 246, 0.05);
    }

    /* Buttons */
    .btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #334155;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }

    .btn-primary:hover {
        background: #2563eb;
        border-color: #2563eb;
    }

    .btn-warning {
        background: rgba(234, 179, 8, 0.2);
        color: #facc15;
        border-color: #facc15;
    }

    .btn-warning:hover {
        background: rgba(234, 179, 8, 0.3);
    }

    .btn-sm {
        padding: 6px 10px;
        font-size: 11px;
    }

    .empty-state {
        text-align: center;
        padding: 20px;
        color: #94a3b8;
    }

    .mt-5 {
        margin-top: 40px;
    }

    .text-center {
        text-align: center;
    }

    @media (max-width: 1200px) {
        .admin-sections {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
    }

    @media (max-width: 768px) {
        .metrics-row {
            grid-template-columns: 1fr;
        }

        .admin-sections {
            grid-template-columns: 1fr;
        }

        .dashboard-grid {
            grid-template-columns: 1fr;
        }

        .dashboard-header h1 {
            font-size: 24px;
        }

        .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .contact-action {
            flex-direction: column;
        }
    }
</style>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('team.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\team\dashboard\index.blade.php ENDPATH**/ ?>