

<?php $__env->startSection('team-content'); ?>
<div class="admin-page">
    <div class="page-header">
        <div class="header-top">
            <div>
                <h1>Pages</h1>
                <p class="page-subtitle">Manage website content pages</p>
            </div>
            <a href="<?php echo e(route('team.content.pages.create')); ?>" class="btn btn-primary">+ New Page</a>
        </div>
    </div>

    <div class="filter-section">
        <form method="GET" class="filter-form">
            <div class="filter-row">
                <div class="filter-group">
                    <label>Status</label>
                    <select name="status" class="filter-select">
                        <option value="">All Pages</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Search</label>
                    <input type="text" name="search" placeholder="Search pages..." class="filter-input" />
                </div>
                <button type="submit" class="btn btn-primary">Filter</button>
            </div>
        </form>
    </div>

    <div class="content-section">
        <table class="pages-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $pages; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $page): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td><strong><?php echo e($page->title); ?></strong></td>
                    <td><code><?php echo e($page->slug); ?></code></td>
                    <td><span class="badge badge-<?php echo e($page->status); ?>"><?php echo e(ucfirst($page->status)); ?></span></td>
                    <td><?php echo e($page->views ?? 0); ?></td>
                    <td><?php echo e($page->created_at->format('M d, Y')); ?></td>
                    <td><?php echo e($page->updated_at->format('M d, Y')); ?></td>
                    <td>
                        <a href="<?php echo e(route('team.content.pages.edit', $page)); ?>" class="btn-icon" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </a>
                        <a href="/pages/<?php echo e($page->slug); ?>" class="btn-icon" title="View" target="_blank">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </a>
                        <form action="<?php echo e(route('team.content.pages.destroy', $page)); ?>" method="POST" style="display:inline;">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('DELETE'); ?>
                            <button type="submit" class="btn-icon" title="Delete" onclick="return confirm('Delete this page?')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr><td colspan="7" class="empty-state">No pages found - <a href="<?php echo e(route('team.content.pages.create')); ?>" style="color: #60a5fa;">Create your first page!</a></td></tr>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </table>
    </div>

    <a href="<?php echo e(route('team.dashboard')); ?>" class="btn btn-secondary" style="margin-top: 30px;">Back to Dashboard</a>
</div>

<style>
    .admin-page { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }

    .filter-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .filter-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 150px; }
    .filter-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    .filter-select, .filter-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; color: #f1f5f9; font-size: 12px; }

    .content-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; overflow: hidden; }
    .pages-table { width: 100%; border-collapse: collapse; }
    .pages-table thead { background: #0f172a; border-bottom: 2px solid #334155; }
    .pages-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #cbd5e1; }
    .pages-table td { padding: 12px 16px; border-bottom: 1px solid #334155; color: #f1f5f9; font-size: 12px; }
    .pages-table tbody tr:hover { background: rgba(96, 165, 250, 0.05); }

    .empty-state { text-align: center; padding: 40px 16px; color: #94a3b8; }

    .btn { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; text-decoration: none; display: inline-block; }
    .btn-primary { background: #60a5fa; color: white; }
    .btn-primary:hover { background: #3b82f6; }
    .btn-secondary { background: #475569; color: white; }
    .btn-secondary:hover { background: #64748b; }
</style>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('team.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\team\content\pages\index.blade.php ENDPATH**/ ?>