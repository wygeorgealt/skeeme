<div class="overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 shadow-md dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-900/50 skeeme-widget">
    <div class="border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-5 dark:border-gray-700/50 dark:from-gray-700/50 dark:to-gray-800/50">
        <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 skeeme-icon-wrap">
                <svg class="skeeme-icon skeeme-icon-md text-white" fill="currentColor" viewBox="0 0 20 20" width="20" height="20"><path d="M2 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1h-6a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Classes Overview</h3>
        </div>
    </div>
    <div class="p-6">
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($this->classes) > 0): ?>
            <div class="space-y-3">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->classes; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $class): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div class="group flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50 p-4 transition-all hover:border-cyan-200 hover:bg-cyan-50 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-800/30 dark:hover:border-cyan-700/50 dark:hover:bg-cyan-950/30">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 transition-all group-hover:scale-110 dark:from-cyan-900/50 dark:to-teal-900/50 skeeme-icon-wrap">
                                <svg class="skeeme-icon skeeme-icon-sm text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20" width="18" height="18"><path d="M2 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1h-6a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-gray-900 dark:text-white"><?php echo e($class->name); ?></h4>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-gray-900 dark:text-white"><?php echo e($class->student_count); ?></div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">students</div>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php else: ?>
            <div class="py-12 text-center">
                <div class="flex justify-center mb-3">
                    <svg class="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /></svg>
                </div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No classes found</p>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>
</div>
<style>
    .skeeme-widget .skeeme-icon { display:inline-block; width:auto; height:auto; max-width:32px; max-height:32px; }
    .skeeme-widget .skeeme-icon-sm { max-width:20px; max-height:20px; }
    .skeeme-widget .skeeme-icon-md { max-width:28px; max-height:28px; }
    .skeeme-widget .skeeme-icon-lg { max-width:56px; max-height:56px; }
    .skeeme-widget .skeeme-icon-wrap svg { width:100%; height:100%; }
</style>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\filament\widgets\classes-overview-widget.blade.php ENDPATH**/ ?>