

<?php $__env->startSection('team-content'); ?>
<div class="admin-page">
    <div class="page-header">
        <div class="header-top">
            <div>
                <h1>Support Tickets</h1>
                <p class="page-subtitle">Manage and respond to customer support tickets</p>
            </div>
            <div class="header-stats">
                <div class="stat-card">
                    <div class="stat-value"><?php echo e($openCount); ?></div>
                    <div class="stat-label">Open</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value"><?php echo e($resolvedCount); ?></div>
                    <div class="stat-label">Resolved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value"><?php echo e($inProgressCount); ?></div>
                    <div class="stat-label">In Progress</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="filter-section">
        <form method="GET" class="filter-form">
            <div class="filter-row">
                <div class="filter-group">
                    <label>Status</label>
                    <select name="status" class="filter-select">
                        <option value="">All Tickets</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Priority</label>
                    <select name="priority" class="filter-select">
                        <option value="">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Search</label>
                    <input type="text" name="search" placeholder="Search by ticket ID or subject" class="filter-input" />
                </div>
                <button type="submit" class="btn btn-primary">Filter</button>
                <a href="<?php echo e(route('team.support.tickets.index')); ?>" class="btn btn-secondary">Clear</a>
            </div>
        </form>
    </div>

    <!-- Tickets Table -->
    <div class="content-section">
        <table class="tickets-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $tickets; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ticket): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td><span class="ticket-id">#<?php echo e($ticket->id); ?></span></td>
                    <td><span class="ticket-subject"><?php echo e($ticket->title); ?></span></td>
                    <td><?php echo e($ticket->user?->name ?? 'Unknown'); ?></td>
                    <td>
                        <span class="badge badge-<?php echo e($ticket->status); ?>">
                            <?php echo e(ucfirst(str_replace('_', ' ', $ticket->status))); ?>

                        </span>
                    </td>
                    <td>
                        <span class="priority-badge priority-<?php echo e($ticket->priority); ?>">
                            <?php echo e(ucfirst($ticket->priority)); ?>

                        </span>
                    </td>
                    <td class="time-cell"><?php echo e($ticket->created_at->diffForHumans()); ?></td>
                    <td>
                        <button class="btn-icon" onclick="openTicketModal('<?php echo e($ticket->id); ?>', '<?php echo e($ticket->title); ?>')" title="Respond">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($ticket->status !== 'resolved'): ?>
                        <form action="<?php echo e(route('team.support.tickets.resolve', $ticket)); ?>" method="POST" style="display:inline;">
                            <?php echo csrf_field(); ?>
                            <button type="submit" class="btn-icon" title="Mark as resolved" onclick="return confirm('Mark this ticket as resolved?')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                        </form>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr>
                    <td colspan="7" class="empty-state">No tickets found</td>
                </tr>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Respond Modal -->
    <div id="respondModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Respond to Ticket</h2>
                <button class="modal-close" onclick="closeTicketModal()">&times;</button>
            </div>
            <form id="respondForm" onsubmit="submitResponse(event)">
                <?php echo csrf_field(); ?>
                <div class="form-group">
                    <label>Ticket</label>
                    <input type="text" id="ticketInfo" readonly class="form-input">
                </div>
                <div class="form-group">
                    <label>Response</label>
                    <textarea id="response" name="response" placeholder="Type your response here..." class="form-input" rows="8" required></textarea>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="mark_resolved" id="markResolved">
                        <span>Mark as resolved</span>
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeTicketModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Send Response</button>
                </div>
            </form>
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
    
    .header-stats { display: flex; gap: 15px; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #60a5fa; }
    .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }

    .filter-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
    .filter-form { }
    .filter-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 150px; }
    .filter-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    .filter-select, .filter-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; color: #f1f5f9; font-size: 12px; }
    .filter-select:focus, .filter-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1); }

    .content-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; overflow: hidden; }
    .tickets-table { width: 100%; border-collapse: collapse; }
    .tickets-table thead { background: #0f172a; border-bottom: 2px solid #334155; }
    .tickets-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
    .tickets-table td { padding: 12px 16px; border-bottom: 1px solid #334155; color: #f1f5f9; font-size: 12px; }
    .tickets-table tbody tr:hover { background: rgba(96, 165, 250, 0.05); }
    
    .ticket-id { font-family: 'Courier New', monospace; color: #60a5fa; font-weight: 600; }
    .ticket-subject { color: #e2e8f0; }
    .time-cell { color: #94a3b8; }
    
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-open { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .badge-in_progress { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    .badge-resolved { background: rgba(34, 197, 94, 0.2); color: #86efac; }
    .badge-closed { background: rgba(107, 114, 128, 0.2); color: #d1d5db; }
    
    .priority-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .priority-urgent { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .priority-high { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
    .priority-normal { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    .priority-low { background: rgba(34, 197, 94, 0.2); color: #86efac; }
    
    .btn-icon { background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.3s; margin-right: 4px; }
    .btn-icon:hover { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }

    .empty-state { text-align: center; padding: 40px 16px; color: #94a3b8; }

    .btn { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; text-decoration: none; display: inline-block; font-weight: 500; transition: all 0.3s; }
    .btn-primary { background: #60a5fa; color: white; }
    .btn-primary:hover { background: #3b82f6; }
    .btn-secondary { background: #475569; color: white; }
    .btn-secondary:hover { background: #64748b; }

    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; justify-content: center; align-items: center; }
    .modal.active { display: flex; }
    .modal-content { background: #1e293b; border-radius: 12px; box-shadow: 0 20px 25px rgba(0,0,0,0.5); width: 90%; max-width: 600px; }
    .modal-header { padding: 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { margin: 0; color: #f1f5f9; font-size: 16px; }
    .modal-close { background: none; border: none; color: #cbd5e1; font-size: 24px; cursor: pointer; padding: 0; }
    .modal-close:hover { color: #f1f5f9; }

    .form-group { padding: 16px 20px; border-bottom: 1px solid #334155; }
    .form-group:last-of-type { border-bottom: none; }
    .form-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 8px; font-weight: 500; }
    .form-group input[type="checkbox"] { margin-right: 6px; }
    .form-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 12px; color: #f1f5f9; font-size: 12px; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1); }

    .form-actions { padding: 20px; display: flex; justify-content: flex-end; gap: 10px; }
</style>

<script>
    function openTicketModal(ticketId, subject) {
        document.getElementById('ticketInfo').value = ticketId + ' - ' + subject;
        document.getElementById('respondForm').reset();
        document.getElementById('respondModal').classList.add('active');
    }

    function closeTicketModal() {
        document.getElementById('respondModal').classList.remove('active');
    }

    function submitResponse(e) {
        e.preventDefault();
        const response = document.getElementById('response').value;
        alert('Response submitted: ' + response.substring(0, 50) + '...');
        closeTicketModal();
    }

    function markResolved(ticketId) {
        if (confirm('Mark ticket ' + ticketId + ' as resolved?')) {
            alert('Ticket marked as resolved');
            location.reload();
        }
    }

    window.onclick = function(event) {
        const modal = document.getElementById('respondModal');
        if (event.target === modal) {
            closeTicketModal();
        }
    }
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('team.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\team\support\tickets\index.blade.php ENDPATH**/ ?>