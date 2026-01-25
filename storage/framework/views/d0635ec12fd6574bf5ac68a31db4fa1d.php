<div class="space-y-4 skeeme-widget">
    <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Announcements</h3>
    </div>
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($this->announcements) > 0): ?>
        <div class="space-y-3">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->announcements; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $announcement): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <div class="group overflow-hidden rounded-xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 shadow-md transition-all hover:shadow-lg dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-900/50">
                    <div class="p-4">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <h4 class="text-sm font-bold text-gray-900 dark:text-white"><?php echo e($announcement->title); ?></h4>
                                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <svg class="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2a1 1 0 100 2h4a1 1 0 100-2H6zm0 4a1 1 0 100 2h4a1 1 0 100-2H6z"/></svg>
                                    Sent to: All students • Visibility: Portal & Email
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 border-t border-gray-200/50 bg-gray-50/50 px-4 py-3 dark:border-gray-700/50 dark:bg-gray-900/50">
                        <a href="#" class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-blue-950/30">
                            <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                            View
                        </a>
                        <a href="#" class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            Duplicate
                        </a>
                    </div>
                </div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>
    <?php else: ?>
        <div class="rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-50/50 p-8 text-center dark:border-gray-600 dark:from-gray-800/50 dark:to-gray-900/50">
            <div class="flex justify-center mb-3">
                <svg class="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.536 15.464a5 5 0 10-7.072 0m7.072 0l2.828 2.829m-2.828-2.829l-2.829-2.829m2.829 2.829L20.485 24M9.172 9.172L4.343 4.343m4.829 4.829l2.828-2.829m-2.828 2.829L4.343 4.343m11.314 0L20.485 0m-7.071 7.071L4.343 4.343" /></svg>
            </div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No recent announcements</p>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
</div>
<style>
    .skeeme-widget .skeeme-icon { display:inline-block; width:auto; height:auto; max-width:32px; max-height:32px; }
    .skeeme-widget .skeeme-icon-sm { max-width:20px; max-height:20px; }
    .skeeme-widget .skeeme-icon-md { max-width:28px; max-height:28px; }
    .skeeme-widget .skeeme-icon-lg { max-width:56px; max-height:56px; }
    .skeeme-widget .skeeme-icon-wrap svg { width:100%; height:100%; }
</style>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\filament\widgets\announcements-widget.blade.php ENDPATH**/ ?>