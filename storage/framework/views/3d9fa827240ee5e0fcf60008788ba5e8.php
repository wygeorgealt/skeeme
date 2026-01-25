<div class="overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 shadow-md dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-900/50">
    <div class="border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3 dark:border-gray-700/50 dark:from-gray-700/50 dark:to-gray-800/50">
        <div class="flex items-center gap-3 skeeme-widget">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a1 1 0 001 1h12a1 1 0 001-1V6a2 2 0 00-2-2H4zm12 12H4c-1.1 0-2-.9-2-2v-4a1 1 0 00-1-1H1a1 1 0 000 2h.01A2 2 0 001 14v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2z" clip-rule="evenodd" /></svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
        </div>
    </div>
    <div class="p-4">
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($this->recent_activities) > 0): ?>
            <div class="space-y-4">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->recent_activities; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $activity): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div class="flex gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-gray-200 hover:bg-white dark:border-gray-700/50 dark:bg-gray-800/30 dark:hover:bg-gray-800/60">
                        <div class="mt-1 flex-shrink-0">
                            <div class="h-3 w-3 rounded-full
                                <?php if($activity->status_color === 'success'): ?> bg-emerald-500
                                <?php elseif($activity->status_color === 'primary'): ?> bg-blue-500
                                <?php elseif($activity->status_color === 'info'): ?> bg-cyan-500
                                <?php else: ?> bg-gray-400
                                <?php endif; ?>
                            "></div>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activity->type === 'enrollment'): ?>
                                    Course "<?php echo e($activity->course_name); ?>" published
                                <?php else: ?>
                                    <?php echo e($activity->first_name); ?> <?php echo e($activity->last_name); ?> registered
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </h4>
                            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <?php echo e(\Carbon\Carbon::parse($activity->created_at)->diffForHumans()); ?> •
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activity->type === 'enrollment'): ?>
                                    Course Enrollment
                                <?php else: ?>
                                    <?php echo e(ucfirst($activity->course_name)); ?> Registration
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </p>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php else: ?>
            <div class="py-8 text-center">
                <div class="flex justify-center mb-2">
                    <svg class="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No recent activities</p>
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
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\filament\widgets\recent-activities-widget.blade.php ENDPATH**/ ?>