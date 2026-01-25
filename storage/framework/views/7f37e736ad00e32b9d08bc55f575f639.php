

<?php $__env->startSection('team-content'); ?>
<div class="admin-page">
    <div class="page-header">
        <div class="header-top">
            <div>
                <h1>System Monitoring</h1>
                <p class="page-subtitle">Monitor system health, errors, and API usage</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-secondary" onclick="clearLogs()">Clear Logs</button>
                <button class="btn btn-secondary" onclick="refreshLogs()">Refresh</button>
            </div>
        </div>
    </div>

    <!-- Tabs -->
    <div class="monitor-tabs">
        <button class="tab-btn active" onclick="switchMonitorTab('errors')">Error Logs</button>
        <button class="tab-btn" onclick="switchMonitorTab('api')">API Usage</button>
        <button class="tab-btn" onclick="switchMonitorTab('health')">Server Health</button>
    </div>

    <!-- Error Logs Tab -->
    <div id="errors" class="monitor-panel active">
        <div class="filter-section">
            <form method="GET" class="filter-form">
                <div class="filter-row">
                    <div class="filter-group">
                        <label>Level</label>
                        <select name="level" class="filter-select">
                            <option value="">All Levels</option>
                            <option value="critical">Critical</option>
                            <option value="error">Error</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status</label>
                        <select name="status" class="filter-select">
                            <option value="">All Status</option>
                            <option value="unresolved">Unresolved</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search</label>
                        <input type="text" name="search" placeholder="Search errors..." class="filter-input" />
                    </div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                </div>
            </form>
        </div>

        <div class="content-section">
            <table class="errors-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Level</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $errors; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr class="error-row-<?php echo e($error->is_resolved ? 'resolved' : 'unresolved'); ?>">
                        <td class="time-cell"><?php echo e($error->created_at->format('Y-m-d H:i:s')); ?></td>
                        <td><span class="level-badge level-<?php echo e(strtolower($error->severity)); ?>"><?php echo e(strtoupper($error->severity)); ?></span></td>
                        <td class="message-cell"><?php echo e($error->error_message); ?></td>
                        <td>
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($error->is_resolved): ?>
                                <span class="status-badge resolved">Resolved</span>
                            <?php else: ?>
                                <span class="status-badge unresolved">Unresolved</span>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </td>
                        <td>
                            <button class="btn-icon" onclick="viewError(this)" title="View Details">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$error->is_resolved): ?>
                                <form action="<?php echo e(route('team.errors.resolve', $error)); ?>" method="POST" style="display:inline;">
                                    <?php echo csrf_field(); ?>
                                    <button type="submit" class="btn-icon" title="Mark as Resolved" onclick="return confirm('Mark this error as resolved?')">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </button>
                                </form>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="5" class="empty-state">No errors found</td></tr>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- API Usage Tab -->
    <div id="api" class="monitor-panel">
        <div class="api-metrics">
            <div class="metric-card">
                <div class="metric-label">Total Requests (24h)</div>
                <div class="metric-value">12,543</div>
                <div class="metric-detail">↑ 15% from yesterday</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Avg Response Time</div>
                <div class="metric-value">145ms</div>
                <div class="metric-detail">Normal</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Error Rate</div>
                <div class="metric-value">0.2%</div>
                <div class="metric-detail">25 errors</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Rate Limit Usage</div>
                <div class="metric-value">35%</div>
                <div class="metric-detail">6,500 / 10,000 remaining</div>
            </div>
        </div>

        <div class="content-section" style="margin-top: 20px;">
            <h3 style="margin: 0 0 20px; color: #f1f5f9;">Top API Endpoints</h3>
            <table class="api-table">
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Requests</th>
                        <th>Avg Time</th>
                        <th>Success Rate</th>
                        <th>Last Called</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>/api/users</td>
                        <td>4,200</td>
                        <td>120ms</td>
                        <td><span class="success-rate">99.8%</span></td>
                        <td>Now</td>
                    </tr>
                    <tr>
                        <td>/api/payments</td>
                        <td>2,100</td>
                        <td>250ms</td>
                        <td><span class="success-rate">99.5%</span></td>
                        <td>1 min ago</td>
                    </tr>
                    <tr>
                        <td>/api/subscriptions</td>
                        <td>1,800</td>
                        <td>180ms</td>
                        <td><span class="success-rate">99.9%</span></td>
                        <td>3 min ago</td>
                    </tr>
                    <tr>
                        <td>/api/analytics</td>
                        <td>1,500</td>
                        <td>350ms</td>
                        <td><span class="success-rate">98.2%</span></td>
                        <td>2 min ago</td>
                    </tr>
                    <tr>
                        <td>/api/auth/login</td>
                        <td>943</td>
                        <td>215ms</td>
                        <td><span class="success-rate">99.2%</span></td>
                        <td>5 min ago</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Server Health Tab -->
    <div id="health" class="monitor-panel">
        <div class="health-grid">
            <div class="health-item">
                <div class="health-icon cpu">CPU</div>
                <div class="health-content">
                    <h4>CPU Usage</h4>
                    <div class="health-bar"><div class="bar-fill" style="width: 45%;"></div></div>
                    <p class="health-status">45% - Healthy</p>
                </div>
            </div>

            <div class="health-item">
                <div class="health-icon memory">MEM</div>
                <div class="health-content">
                    <h4>Memory Usage</h4>
                    <div class="health-bar"><div class="bar-fill" style="width: 62%;"></div></div>
                    <p class="health-status">62% - Good</p>
                </div>
            </div>

            <div class="health-item">
                <div class="health-icon disk">DISK</div>
                <div class="health-content">
                    <h4>Disk Space</h4>
                    <div class="health-bar"><div class="bar-fill" style="width: 78%;"></div></div>
                    <p class="health-status">78% - Warning (High)</p>
                </div>
            </div>

            <div class="health-item">
                <div class="health-icon network">NET</div>
                <div class="health-content">
                    <h4>Network</h4>
                    <div class="health-bar"><div class="bar-fill" style="width: 28%;"></div></div>
                    <p class="health-status">28% - Excellent</p>
                </div>
            </div>
        </div>

        <div class="content-section" style="margin-top: 20px;">
            <h3 style="margin: 0 0 20px; color: #f1f5f9;">Service Status</h3>
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Uptime</th>
                        <th>Last Check</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Database</td>
                        <td><span class="service-status online">Online</span></td>
                        <td>99.99%</td>
                        <td>2 seconds ago</td>
                    </tr>
                    <tr>
                        <td>API Server</td>
                        <td><span class="service-status online">Online</span></td>
                        <td>99.98%</td>
                        <td>1 second ago</td>
                    </tr>
                    <tr>
                        <td>Mail Service</td>
                        <td><span class="service-status online">Online</span></td>
                        <td>99.95%</td>
                        <td>5 seconds ago</td>
                    </tr>
                    <tr>
                        <td>Cache (Redis)</td>
                        <td><span class="service-status online">Online</span></td>
                        <td>99.97%</td>
                        <td>3 seconds ago</td>
                    </tr>
                    <tr>
                        <td>Queue Service</td>
                        <td><span class="service-status warning">Degraded</span></td>
                        <td>98.5%</td>
                        <td>10 seconds ago</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <a href="<?php echo e(route('team.dashboard')); ?>" class="btn btn-secondary" style="margin-top: 30px;">Back to Dashboard</a>
</div>

<style>
    .admin-page { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { margin-bottom: 30px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }
    .header-actions { display: flex; gap: 10px; }

    .monitor-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #334155; }
    .tab-btn { padding: 12px 20px; background: none; border: none; color: #cbd5e1; cursor: pointer; font-size: 12px; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.3s; }
    .tab-btn:hover { color: #60a5fa; border-bottom-color: #60a5fa; }
    .tab-btn.active { color: #60a5fa; border-bottom-color: #60a5fa; }

    .monitor-panel { display: none; }
    .monitor-panel.active { display: block; }

    .filter-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .filter-form { }
    .filter-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 150px; }
    .filter-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    .filter-select, .filter-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; color: #f1f5f9; font-size: 12px; }
    .filter-select:focus, .filter-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1); }

    .content-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; overflow: hidden; }

    .errors-table, .api-table, .services-table { width: 100%; border-collapse: collapse; }
    .errors-table thead, .api-table thead, .services-table thead { background: #0f172a; border-bottom: 2px solid #334155; }
    .errors-table th, .api-table th, .services-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
    .errors-table td, .api-table td, .services-table td { padding: 12px 16px; border-bottom: 1px solid #334155; color: #f1f5f9; font-size: 12px; }
    .errors-table tbody tr:hover, .api-table tbody tr:hover, .services-table tbody tr:hover { background: rgba(96, 165, 250, 0.05); }

    .message-cell { max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .time-cell { color: #94a3b8; font-size: 11px; }

    .level-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .level-critical { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .level-error { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .level-warning { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
    .level-info { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }

    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .status-badge.unresolved { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .status-badge.resolved { background: rgba(34, 197, 94, 0.2); color: #86efac; }

    .error-row-unresolved { background: rgba(239, 68, 68, 0.05); }
    .error-row-resolved { background: rgba(34, 197, 94, 0.05); }

    .btn-icon { background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.3s; margin-right: 4px; }
    .btn-icon:hover { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }

    .empty-state { text-align: center; padding: 40px 16px; color: #94a3b8; }

    /* API Metrics */
    .api-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .metric-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; }
    .metric-label { font-size: 11px; color: #cbd5e1; margin-bottom: 8px; font-weight: 500; }
    .metric-value { font-size: 24px; font-weight: 700; color: #60a5fa; margin-bottom: 4px; }
    .metric-detail { font-size: 11px; color: #94a3b8; }

    .success-rate { color: #86efac; font-weight: 600; }

    /* Health Dashboard */
    .health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .health-item { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; display: flex; gap: 16px; }
    .health-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; }
    .health-icon.cpu { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
    .health-icon.memory { background: rgba(34, 211, 153, 0.2); color: #34d399; }
    .health-icon.disk { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .health-icon.network { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
    .health-content { flex: 1; }
    .health-content h4 { margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #f1f5f9; }
    .health-bar { width: 100%; height: 6px; background: #334155; border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
    .bar-fill { height: 100%; background: #60a5fa; border-radius: 3px; }
    .health-status { margin: 0; font-size: 11px; color: #94a3b8; }

    .service-status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .service-status.online { background: rgba(34, 197, 94, 0.2); color: #86efac; }
    .service-status.warning { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
    .service-status.offline { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

    .btn { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; }
    .btn-primary { background: #60a5fa; color: white; }
    .btn-primary:hover { background: #3b82f6; }
    .btn-secondary { background: #475569; color: white; }
    .btn-secondary:hover { background: #64748b; }
</style>

<script>
    function switchMonitorTab(tab) {
        document.querySelectorAll('.monitor-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(tab).classList.add('active');
        event.target.classList.add('active');
    }

    function viewError(btn) {
        alert('Error details coming soon...');
    }

    function markResolved(btn) {
        if (confirm('Mark this error as resolved?')) {
            btn.closest('tr').classList.add('error-row-resolved');
            btn.closest('tr').classList.remove('error-row-unresolved');
            btn.remove();
            alert('Error marked as resolved');
        }
    }

    function clearLogs() {
        if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
            alert('Logs cleared');
            location.reload();
        }
    }

    function refreshLogs() {
        alert('Logs refreshed');
    }
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('team.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\team\monitoring\errors\index.blade.php ENDPATH**/ ?>