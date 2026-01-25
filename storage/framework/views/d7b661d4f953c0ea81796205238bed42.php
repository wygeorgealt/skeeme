

<?php $__env->startSection('team-content'); ?>
<div class="admin-page">
    <div class="page-header">
        <h1>Create New Page</h1>
        <p class="page-subtitle">Create and publish a new content page</p>
    </div>

    <form id="pageForm" onsubmit="savePage(event)" class="page-form">
        <?php echo csrf_field(); ?>
        
        <div class="form-section">
            <h3>Page Details</h3>
            <div class="form-row">
                <div class="form-col">
                    <div class="form-group">
                        <label>Page Title</label>
                        <input type="text" name="title" placeholder="Enter page title" class="form-input" required />
                    </div>
                </div>
                <div class="form-col">
                    <div class="form-group">
                        <label>Page Slug</label>
                        <input type="text" name="slug" placeholder="page-url-slug" class="form-input" />
                    </div>
                </div>
            </div>
        </div>

        <div class="form-section">
            <h3>Content</h3>
            <div class="editor-toolbar">
                <button type="button" class="toolbar-btn"><strong>B</strong></button>
                <button type="button" class="toolbar-btn"><em>I</em></button>
                <button type="button" class="toolbar-btn">H2</button>
                <button type="button" class="toolbar-btn">H3</button>
                <button type="button" class="toolbar-btn">List</button>
                <button type="button" class="toolbar-btn">Link</button>
                <button type="button" class="toolbar-btn">Image</button>
            </div>
            <textarea id="contentEditor" name="content" placeholder="Enter page content here..." class="editor-input" rows="20" required></textarea>
        </div>

        <div class="form-section">
            <h3>Publishing</h3>
            <div class="form-row">
                <div class="form-col">
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status" class="form-input">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                    </div>
                </div>
                <div class="form-col">
                    <div class="form-group">
                        <label>Publish Date (if scheduled)</label>
                        <input type="datetime-local" name="publish_date" class="form-input" />
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label>Meta Description</label>
                <textarea name="meta_description" placeholder="Enter SEO meta description..." class="form-input" rows="3"></textarea>
            </div>
        </div>

        <div class="form-actions">
            <a href="<?php echo e(route('team.content.pages.index')); ?>" class="btn btn-secondary">Cancel</a>
            <button type="button" class="btn btn-secondary" onclick="saveDraft()">Save as Draft</button>
            <button type="submit" class="btn btn-primary">Publish Page</button>
        </div>
    </form>

    <a href="<?php echo e(route('team.dashboard')); ?>" class="btn btn-secondary" style="margin-top: 30px;">Back to Dashboard</a>
</div>

<style>
    .admin-page { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .page-header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }

    .page-form { }
    .form-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 24px; margin-bottom: 20px; }
    .form-section h3 { margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #f1f5f9; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-col { }

    .form-group { margin-bottom: 16px; }
    .form-group:last-child { margin-bottom: 0; }
    .form-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 8px; font-weight: 500; }
    .form-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 12px; color: #f1f5f9; font-size: 12px; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1); }

    .editor-toolbar { display: flex; gap: 8px; padding: 12px; background: #0f172a; border: 1px solid #334155; border-bottom: none; border-radius: 6px 6px 0 0; }
    .toolbar-btn { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; }
    .toolbar-btn:hover { background: #334155; color: #60a5fa; border-color: #60a5fa; }

    .editor-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 0 0 6px 6px; padding: 12px; color: #f1f5f9; font-size: 12px; font-family: 'Monaco', 'Courier New', monospace; resize: vertical; }
    .editor-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1); }

    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

    .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; text-decoration: none; display: inline-block; }
    .btn-primary { background: #60a5fa; color: white; }
    .btn-primary:hover { background: #3b82f6; }
    .btn-secondary { background: #475569; color: white; }
    .btn-secondary:hover { background: #64748b; }
</style>

<script>
    function savePage(e) {
        e.preventDefault();
        alert('Page published!')
    }

    function saveDraft() {
        alert('Page saved as draft');
    }
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('team.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\team\content\pages\create.blade.php ENDPATH**/ ?>