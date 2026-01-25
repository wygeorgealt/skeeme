<div class="space-y-6 skeeme-widget">
    <!-- Alert Banner -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->subscription_expired || ($this->days_left && $this->days_left <= 7) || $this->student_limit_reached || $this->stats['pending_lecturers'] > 0): ?>
    <div class="relative overflow-hidden rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-6 shadow-lg dark:border-amber-900/30 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-rose-950/40">
        <div class="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-b from-amber-200 to-transparent opacity-20 dark:from-amber-700/30"></div>
        <?php use ToneGabes\Filament\Icons\Enums\Phosphor; ?>
        <div class="relative z-10">
            <div class="mb-4 flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                    <svg class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2m6-14h.01M18 5h.01M6 5h.01M6 9h.01M6 13h.01M6 17h.01M12 13h.01M12 17h.01M18 9h.01M18 13h.01M18 17h.01" /></svg>
                </div>
                <h3 class="text-lg font-bold text-amber-900 dark:text-amber-100">Account Status</h3>
            </div>
            <div class="flex flex-wrap gap-3">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->subscription_expired): ?>
                    <div class="inline-flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm backdrop-blur dark:bg-amber-950/50 dark:text-amber-200">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        <span>Trial Expired</span>
                    </div>
                <?php elseif($this->days_left && $this->days_left <= 7): ?>
                    <div class="inline-flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm backdrop-blur dark:bg-amber-950/50 dark:text-amber-200">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" /></svg>
                        <span><?php echo e($this->days_left); ?> days remaining</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->student_limit_reached): ?>
                    <div class="inline-flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm backdrop-blur dark:bg-amber-950/50 dark:text-amber-200">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        <span>Student limit reached</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->stats['pending_lecturers'] > 0): ?>
                    <div class="inline-flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm backdrop-blur dark:bg-amber-950/50 dark:text-amber-200">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 100-2 1 1 0 000 2zM8 7a1 1 0 100-2 1 1 0 000 2zm5-1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" /></svg>
                        <span><?php echo e($this->stats['pending_lecturers']); ?> approvals pending</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
    </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Students Card -->
        <div class="group relative overflow-hidden rounded-2xl border border-blue-200/30 bg-gradient-to-br from-blue-50 via-blue-50/50 to-indigo-50 p-6 shadow-md transition-all hover:shadow-xl dark:border-blue-900/30 dark:from-blue-950/40 dark:via-blue-950/20 dark:to-indigo-950/40">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-b from-blue-300 to-transparent opacity-20 transition-transform group-hover:scale-110 dark:from-blue-600/20"></div>
            <div class="relative z-10">
                <div class="mb-4 flex items-center justify-between">
                        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg skeeme-icon-wrap">
                            <?php if (isset($component)) { $__componentOriginal606b6d7eddc2e418f11096356be15e19 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal606b6d7eddc2e418f11096356be15e19 = $attributes; } ?>
<?php $component = BladeUI\Icons\Components\Icon::resolve(['name' => Phosphor::Users->getLabel()] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\BladeUI\Icons\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'skeeme-icon skeeme-icon-lg text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $attributes = $__attributesOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__attributesOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $component = $__componentOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__componentOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
                        </div>
                </div>
                <h3 class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</h3>
                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-4xl font-bold text-blue-900 dark:text-blue-100"><?php echo e(number_format($this->stats['total_students'])); ?></span>
                </div>
                <div class="mt-4 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1">
                        <svg class="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 5a1 1 0 10-2 0v5.757l-1.879-1.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L12 10.757V5z" clip-rule="evenodd" /></svg>
                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400"><?php echo e($this->stats['students_mom_growth']); ?>% MoM</span>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Active: <?php echo e(number_format($this->stats['active_students_week'])); ?></span>
                </div>
            </div>
        </div>

        <!-- Lecturers Card -->
        <div class="group relative overflow-hidden rounded-2xl border border-purple-200/30 bg-gradient-to-br from-purple-50 via-purple-50/50 to-pink-50 p-6 shadow-md transition-all hover:shadow-xl dark:border-purple-900/30 dark:from-purple-950/40 dark:via-purple-950/20 dark:to-pink-950/40">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-b from-purple-300 to-transparent opacity-20 transition-transform group-hover:scale-110 dark:from-purple-600/20"></div>
            <div class="relative z-10">
                <div class="mb-4 flex items-center justify-between">
                        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg skeeme-icon-wrap">
                            <?php if (isset($component)) { $__componentOriginal606b6d7eddc2e418f11096356be15e19 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal606b6d7eddc2e418f11096356be15e19 = $attributes; } ?>
<?php $component = BladeUI\Icons\Components\Icon::resolve(['name' => Phosphor::Chalkboard->getLabel()] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\BladeUI\Icons\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'skeeme-icon skeeme-icon-lg text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $attributes = $__attributesOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__attributesOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $component = $__componentOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__componentOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
                        </div>
                </div>
                <h3 class="text-sm font-medium text-purple-600 dark:text-purple-400">Total Lecturers</h3>
                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-4xl font-bold text-purple-900 dark:text-purple-100"><?php echo e(number_format($this->stats['total_lecturers'])); ?></span>
                </div>
                <div class="mt-4 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1">
                        <svg class="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 5a1 1 0 10-2 0v5.757l-1.879-1.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L12 10.757V5z" clip-rule="evenodd" /></svg>
                        <?php
                            $percentage = $this->stats['total_lecturers'] > 0 ? round(($this->stats['new_lecturers_month'] / max($this->stats['total_lecturers'] - $this->stats['new_lecturers_month'], 1)) * 100, 1) : 0;
                        ?>
                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400"><?php echo e($percentage); ?>%</span>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">New: <?php echo e($this->stats['new_lecturers_month']); ?></span>
                </div>
            </div>
        </div>

        <!-- Classes Card -->
        <div class="group relative overflow-hidden rounded-2xl border border-cyan-200/30 bg-gradient-to-br from-cyan-50 via-cyan-50/50 to-teal-50 p-6 shadow-md transition-all hover:shadow-xl dark:border-cyan-900/30 dark:from-cyan-950/40 dark:via-cyan-950/20 dark:to-teal-950/40">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-b from-cyan-300 to-transparent opacity-20 transition-transform group-hover:scale-110 dark:from-cyan-600/20"></div>
            <div class="relative z-10">
                <div class="mb-4 flex items-center justify-between">
                        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg skeeme-icon-wrap">
                            <?php if (isset($component)) { $__componentOriginal606b6d7eddc2e418f11096356be15e19 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal606b6d7eddc2e418f11096356be15e19 = $attributes; } ?>
<?php $component = BladeUI\Icons\Components\Icon::resolve(['name' => Phosphor::Books->getLabel()] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\BladeUI\Icons\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'skeeme-icon skeeme-icon-lg text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $attributes = $__attributesOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__attributesOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $component = $__componentOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__componentOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
                        </div>
                </div>
                <h3 class="text-sm font-medium text-cyan-600 dark:text-cyan-400">Total Classes</h3>
                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-4xl font-bold text-cyan-900 dark:text-cyan-100"><?php echo e(number_format($this->stats['total_classes'])); ?></span>
                </div>
                <div class="mt-4">
                    <span class="text-xs text-gray-500 dark:text-gray-400">All classes active</span>
                </div>
            </div>
        </div>

        <!-- Engagement Card -->
        <div class="group relative overflow-hidden rounded-2xl border border-rose-200/30 bg-gradient-to-br from-rose-50 via-rose-50/50 to-red-50 p-6 shadow-md transition-all hover:shadow-xl dark:border-rose-900/30 dark:from-rose-950/40 dark:via-rose-950/20 dark:to-red-950/40">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-b from-rose-300 to-transparent opacity-20 transition-transform group-hover:scale-110 dark:from-rose-600/20"></div>
            <div class="relative z-10">
                <div class="mb-4 flex items-center justify-between">
                        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg skeeme-icon-wrap">
                            <?php if (isset($component)) { $__componentOriginal606b6d7eddc2e418f11096356be15e19 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal606b6d7eddc2e418f11096356be15e19 = $attributes; } ?>
<?php $component = BladeUI\Icons\Components\Icon::resolve(['name' => Phosphor::ChartBar->getLabel()] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\BladeUI\Icons\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'skeeme-icon skeeme-icon-lg text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $attributes = $__attributesOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__attributesOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal606b6d7eddc2e418f11096356be15e19)): ?>
<?php $component = $__componentOriginal606b6d7eddc2e418f11096356be15e19; ?>
<?php unset($__componentOriginal606b6d7eddc2e418f11096356be15e19); ?>
<?php endif; ?>
                        </div>

    
    <style>
        .skeeme-widget .skeeme-icon { display:inline-block; width:auto; height:auto; max-width:32px; max-height:32px; }
        .skeeme-widget .skeeme-icon-lg { max-width:56px; max-height:56px; }
        .skeeme-widget .skeeme-icon-wrap svg { width:100%; height:100%; }
    </style>
                </div>
                <h3 class="text-sm font-medium text-rose-600 dark:text-rose-400">Engagement Rate</h3>
                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-4xl font-bold text-rose-900 dark:text-rose-100"><?php echo e($this->stats['engagement_rate']); ?>%</span>
                </div>
                <div class="mt-4">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Avg session: <?php echo e($this->stats['avg_session_time']); ?>m</span>
                </div>
            </div>
        </div>
    </div>
</div>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\filament\widgets\admin-stats-widget.blade.php ENDPATH**/ ?>