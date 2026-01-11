<?php $__env->startSection('title', 'Analytics - ' . ($exam->title ?? $exam->name)); ?>

<div class="p-8 animate-fadeIn">
    <div class="max-w-7xl mx-auto">
        <!-- Premium Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">Exam Insights</span>
                    </div>
                    <div class="h-1 w-1 rounded-full bg-zinc-700"></div>
                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><?php echo e($exam->status ?? 'Active'); ?> Exam</span>
                </div>
                <?php if (isset($component)) { $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::heading','data' => ['size' => 'xl','level' => '1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::heading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'xl','level' => '1']); ?><?php echo e($exam->title ?? $exam->name); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9)): ?>
<?php $attributes = $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9; ?>
<?php unset($__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9)): ?>
<?php $component = $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9; ?>
<?php unset($__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::subheading','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::subheading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>Comprehensive performance diagnostics and AI-driven insights <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97)): ?>
<?php $attributes = $__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97; ?>
<?php unset($__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97)): ?>
<?php $component = $__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97; ?>
<?php unset($__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97); ?>
<?php endif; ?>
            </div>
            
                
                <?php if (isset($component)) { $__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::dropdown','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::dropdown'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['variant' => 'ghost','size' => 'sm','iconTrailing' => 'chevron-down']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'ghost','size' => 'sm','icon-trailing' => 'chevron-down']); ?>Export <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                    <?php if (isset($component)) { $__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                        <?php if (isset($component)) { $__componentOriginal5027d420cfeeb03dd925cfc08ae44851 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.item','data' => ['wire:click' => 'downloadReport','icon' => 'arrow-down-tray']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'downloadReport','icon' => 'arrow-down-tray']); ?>Download CSV Report <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $attributes = $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $component = $__componentOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginal5027d420cfeeb03dd925cfc08ae44851 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.item','data' => ['wire:click' => 'downloadPdfReport','icon' => 'printer']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'downloadPdfReport','icon' => 'printer']); ?>Print Summary <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $attributes = $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $component = $__componentOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a)): ?>
<?php $attributes = $__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a; ?>
<?php unset($__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a)): ?>
<?php $component = $__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a; ?>
<?php unset($__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888)): ?>
<?php $attributes = $__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888; ?>
<?php unset($__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888)): ?>
<?php $component = $__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888; ?>
<?php unset($__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888); ?>
<?php endif; ?>

                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('lecturer.exams')).'','variant' => 'ghost','size' => 'sm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('lecturer.exams')).'','variant' => 'ghost','size' => 'sm']); ?>
                    Back to Exams
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
            </div>
        </div>

        <!-- AI Advisor Dashboard -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($insights): ?>
            <div class="mb-12">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['variant' => 'solid']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'solid']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">AI Advisor</h3>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI-powered help & suggestions</p>
                        </div>
                    </div>
                    
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => '$toggle(\'showInsightsPanel\')','variant' => 'ghost','size' => 'xs','class' => '!text-[10px] !font-black !uppercase !tracking-widest']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => '$toggle(\'showInsightsPanel\')','variant' => 'ghost','size' => 'xs','class' => '!text-[10px] !font-black !uppercase !tracking-widest']); ?>
                        <?php echo e($showInsightsPanel ? 'Minimize Advisor' : 'Expand Advisor'); ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                </div>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showInsightsPanel): ?>
                    <!-- Key Findings Cards -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($insights['key_findings'])): ?>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $insights['key_findings']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $finding): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <?php
                                    $severityColor = match($finding['severity'] ?? 'info') {
                                        'critical' => 'rose',
                                        'warning' => 'amber',
                                        'success' => 'emerald',
                                        default => 'indigo',
                                    };
                                ?>
                                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:border-<?php echo e($severityColor); ?>-500/50 transition-all duration-300">
                                    <div class="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full bg-<?php echo e($severityColor); ?>-500 shadow-[0_0_8px_rgba(var(--<?php echo e($severityColor); ?>-500),0.5)]"></div>
                                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500"><?php echo e($finding['severity'] ?? 'Insight'); ?></span>
                                        </div>
                                        <i class="fas <?php echo e($finding['icon'] ?? 'fa-info-circle'); ?> text-xs text-zinc-300 dark:text-zinc-600 group-hover:text-<?php echo e($severityColor); ?>-500 transition-colors"></i>
                                    </div>
                                    <div class="p-6">
                                        <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2"><?php echo e($finding['title']); ?></h4>
                                        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"><?php echo e($finding['description']); ?></p>
                                    </div>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <!-- Premium At-Risk Students -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($insights['at_risk_students'])): ?>
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Students Who Need Help</h3>
                                <div class="flex items-center gap-2">
                                    <span class="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><?php echo e(count($insights['at_risk_students'])); ?> Students Flagged</span>
                                </div>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-zinc-50/50 dark:bg-zinc-800/30">
                                            <th class="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Student Profile</th>
                                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Performance</th>
                                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Risk Severity</th>
                                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Activity Metrics</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $insights['at_risk_students']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <tr class="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors group">
                                                <td class="px-8 py-5">
                                                    <div class="flex items-center gap-4">
                                                        <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                            <i class="fas fa-user-graduate text-xs"></i>
                                                        </div>
                                                        <div>
                                                            <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($student['student_name']); ?></p>
                                                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Student ID: <?php echo e(substr($student['student_id'] ?? 'N/A', 0, 8)); ?></p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <div class="flex items-center gap-3">
                                                        <span class="text-sm font-black text-rose-600 dark:text-rose-400"><?php echo e($student['percentage']); ?>%</span>
                                                        <div class="w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                                                            <div class="bg-rose-500 h-1.5 rounded-full" style="width: <?php echo e($student['percentage']); ?>%"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border <?php echo e(@$student['risk_level'] === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'); ?>">
                                                        <?php echo e(strtoupper($student['risk_level'] ?? 'HIGH')); ?>

                                                    </span>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <div class="flex flex-col gap-1">
                                                        <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                            <?php if (isset($component)) { $__componentOriginal4a4fffe04433d6d6be16f26ad2650578 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal4a4fffe04433d6d6be16f26ad2650578 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.clock','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.clock'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal4a4fffe04433d6d6be16f26ad2650578)): ?>
<?php $attributes = $__attributesOriginal4a4fffe04433d6d6be16f26ad2650578; ?>
<?php unset($__attributesOriginal4a4fffe04433d6d6be16f26ad2650578); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal4a4fffe04433d6d6be16f26ad2650578)): ?>
<?php $component = $__componentOriginal4a4fffe04433d6d6be16f26ad2650578; ?>
<?php unset($__componentOriginal4a4fffe04433d6d6be16f26ad2650578); ?>
<?php endif; ?>
                                                            <?php echo e(round($student['time_spent'], 1)); ?>m active
                                                        </div>
                                                        <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                            <?php if (isset($component)) { $__componentOriginal74697c151ccb8418c53b50a995b31225 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal74697c151ccb8418c53b50a995b31225 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.document-text','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.document-text'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal74697c151ccb8418c53b50a995b31225)): ?>
<?php $attributes = $__attributesOriginal74697c151ccb8418c53b50a995b31225; ?>
<?php unset($__attributesOriginal74697c151ccb8418c53b50a995b31225); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal74697c151ccb8418c53b50a995b31225)): ?>
<?php $component = $__componentOriginal74697c151ccb8418c53b50a995b31225; ?>
<?php unset($__componentOriginal74697c151ccb8418c53b50a995b31225); ?>
<?php endif; ?>
                                                            <?php echo e($student['questions_attempted']); ?>/<?php echo e($student['total_questions']); ?> attempted
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <!-- Learning Segments -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($insights['learning_groups'])): ?>
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Student Performance Groups</h3>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = ['advanced' => 'emerald', 'proficient' => 'indigo', 'developing' => 'amber', 'beginning' => 'rose']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $segmentName => $color): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($insights['learning_groups'][$segmentName])): ?>
                                            <?php $segment = $insights['learning_groups'][$segmentName]; ?>
                                            <div class="relative group">
                                                <div class="absolute -inset-0.5 bg-<?php echo e($color); ?>-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                                                <div class="relative p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
                                                    <div class="flex items-center justify-between mb-4">
                                                        <span class="text-[10px] font-black uppercase tracking-widest text-<?php echo e($color); ?>-600 dark:text-<?php echo e($color); ?>-400"><?php echo e($segmentName); ?></span>
                                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-500">
                                                            <?php echo e(round($segment['percentage'], 1)); ?>%
                                                        </span>
                                                    </div>
                                                    <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2"><?php echo e($segment['count']); ?></div>
                                                    <p class="text-[10px] text-zinc-500 leading-relaxed italic border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-3">
                                                        <?php echo e($segment['suggestion']); ?>

                                                    </p>
                                                </div>
                                            </div>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>


                    <!-- Anomalies -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($insights['performance_anomalies'])): ?>
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Unusual Results</h3>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $insights['performance_anomalies']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $anomaly): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <div class="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800">
                                            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <?php if (isset($component)) { $__componentOriginale0a0c12575af25a71f941c8515365d96 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0a0c12575af25a71f941c8515365d96 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.bolt','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.bolt'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale0a0c12575af25a71f941c8515365d96)): ?>
<?php $attributes = $__attributesOriginale0a0c12575af25a71f941c8515365d96; ?>
<?php unset($__attributesOriginale0a0c12575af25a71f941c8515365d96); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale0a0c12575af25a71f941c8515365d96)): ?>
<?php $component = $__componentOriginale0a0c12575af25a71f941c8515365d96; ?>
<?php unset($__componentOriginale0a0c12575af25a71f941c8515365d96); ?>
<?php endif; ?>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1"><?php echo e(str_replace('_', ' ', $anomaly['type'])); ?></p>
                                                <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($anomaly['title']); ?></h4>
                                                <p class="text-[10px] text-zinc-500 mt-1"><?php echo e($anomaly['description']); ?></p>
                                            </div>
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($anomaly['correct_rate']) || isset($anomaly['value'])): ?>
                                                <div class="text-right">
                                                    <span class="text-sm font-black text-indigo-600 dark:text-indigo-400"><?php echo e($anomaly['correct_rate'] ?? $anomaly['value']); ?><?php echo e(isset($anomaly['correct_rate']) ? '%' : ''); ?></span>
                                                </div>
                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        </div>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <!-- Improvement Areas -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($insights['improvement_areas'])): ?>
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Recommended Actions</h3>
                            </div>
                            <div class="p-8">
                                <div class="space-y-6">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $insights['improvement_areas']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $improvement): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <div class="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/5">
                                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div class="flex items-center gap-3">
                                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($improvement['question_id'])): ?>
                                                        <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0">
                                                            <span class="text-[10px] font-black">Q</span>
                                                        </div>
                                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                                        <div class="flex items-center gap-2">
                                                            <span class="text-sm font-black text-zinc-900 dark:text-zinc-100 block"><?php echo e($improvement['area']); ?></span>
                                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($improvement['is_ai_reasoned'] ?? false): ?>
                                                                <span class="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-500 uppercase tracking-tight flex items-center gap-1">
                                                                    <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['variant' => 'micro','class' => 'size-2.5']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => 'size-2.5']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                                                                    Deep Reasoning
                                                                </span>
                                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                                        </div>
                                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($improvement['question_id'])): ?>
                                                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Question #<?php echo e(substr($improvement['question_id'], 0, 8)); ?></span>
                                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                                </div>
                                                <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase <?php echo e($improvement['priority'] === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'); ?> w-fit">
                                                    <?php echo e($improvement['priority']); ?> Priority
                                                </span>
                                            </div>

                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($improvement['question_text'])): ?>
                                                <div class="mb-4 p-4 bg-zinc-100/30 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                                    <p class="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Problem Question Context</p>
                                                    <p class="text-xs text-zinc-600 dark:text-zinc-400 italic">"<?php echo e($improvement['question_text']); ?>"</p>
                                                </div>
                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                                            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium"><?php echo e($improvement['description']); ?></p>
                                            
                                            <div class="space-y-3">
                                                <p class="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Pedagogical Analysis & Advice</p>
                                                <div class="grid grid-cols-1 gap-3">
                                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $improvement['suggestions']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $suggestion): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                        <div class="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 shadow-sm group hover:border-indigo-500/30 transition-colors">
                                                            <div class="w-2 h-2 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1 shrink-0">
                                                                <div class="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                            </div>
                                                            <span class="leading-relaxed"><?php echo e($suggestion); ?></span>
                                                        </div>
                                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <!-- Comparative Analysis -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($comparison && $comparison['status'] === 'success'): ?>
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">How this Exam Compares</h3>
                                <div class="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-[8px] font-black text-indigo-600 uppercase border border-indigo-100 dark:border-indigo-800">vs Previous Exam</div>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <?php
                                        $avg = $comparison['comparison']['average_score'];
                                        $pass = $comparison['comparison']['pass_rate'];
                                        $std = $comparison['comparison']['std_deviation'];
                                    ?>
                                    
                                    <!-- Avg Score Compare -->
                                    <div class="flex flex-col gap-4">
                                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Average Performance</p>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($avg['current']); ?></div>
                                            <div class="flex items-center gap-1 <?php echo e($avg['change'] >= 0 ? 'text-emerald-500' : 'text-rose-500'); ?>">
                                                <?php if (isset($component)) { $__componentOriginalc8c9b708e33a0d493706af15486aa707 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc8c9b708e33a0d493706af15486aa707 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.arrow-trending-up','data' => ['variant' => 'micro','class' => ''.e($avg['change'] < 0 ? 'rotate-180' : '').'']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.arrow-trending-up'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => ''.e($avg['change'] < 0 ? 'rotate-180' : '').'']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc8c9b708e33a0d493706af15486aa707)): ?>
<?php $attributes = $__attributesOriginalc8c9b708e33a0d493706af15486aa707; ?>
<?php unset($__attributesOriginalc8c9b708e33a0d493706af15486aa707); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc8c9b708e33a0d493706af15486aa707)): ?>
<?php $component = $__componentOriginalc8c9b708e33a0d493706af15486aa707; ?>
<?php unset($__componentOriginalc8c9b708e33a0d493706af15486aa707); ?>
<?php endif; ?>
                                                <span class="text-xs font-bold"><?php echo e(abs(round($avg['change_percent'], 1))); ?>%</span>
                                            </div>
                                        </div>
                                        <div class="text-[10px] text-zinc-400">Baseline was <span class="font-bold text-zinc-500"><?php echo e($avg['previous']); ?></span></div>
                                    </div>

                                    <!-- Pass Rate Compare -->
                                    <div class="flex flex-col gap-4">
                                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Success Rate</p>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($pass['current']); ?>%</div>
                                            <div class="flex items-center gap-1 <?php echo e($pass['change'] >= 0 ? 'text-emerald-500' : 'text-rose-500'); ?>">
                                                <?php if (isset($component)) { $__componentOriginalc8c9b708e33a0d493706af15486aa707 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc8c9b708e33a0d493706af15486aa707 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.arrow-trending-up','data' => ['variant' => 'micro','class' => ''.e($pass['change'] < 0 ? 'rotate-180' : '').'']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.arrow-trending-up'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => ''.e($pass['change'] < 0 ? 'rotate-180' : '').'']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc8c9b708e33a0d493706af15486aa707)): ?>
<?php $attributes = $__attributesOriginalc8c9b708e33a0d493706af15486aa707; ?>
<?php unset($__attributesOriginalc8c9b708e33a0d493706af15486aa707); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc8c9b708e33a0d493706af15486aa707)): ?>
<?php $component = $__componentOriginalc8c9b708e33a0d493706af15486aa707; ?>
<?php unset($__componentOriginalc8c9b708e33a0d493706af15486aa707); ?>
<?php endif; ?>
                                                <span class="text-xs font-bold"><?php echo e(abs(round($pass['change'], 1))); ?>%</span>
                                            </div>
                                        </div>
                                        <div class="text-[10px] text-zinc-400">Baseline was <span class="font-bold text-zinc-500"><?php echo e($pass['previous']); ?>%</span></div>
                                    </div>

                                    <!-- Std Dev Compare -->
                                    <div class="flex flex-col gap-4">
                                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Distribution Stability</p>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($std['current']); ?></div>
                                            <div class="flex items-center gap-1 <?php echo e($std['trend'] === 'decreased' ? 'text-emerald-500' : 'text-amber-500'); ?>">
                                                <?php if (isset($component)) { $__componentOriginalda6e47aecf1695047ea823532321ccd7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalda6e47aecf1695047ea823532321ccd7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.arrows-right-left','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.arrows-right-left'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalda6e47aecf1695047ea823532321ccd7)): ?>
<?php $attributes = $__attributesOriginalda6e47aecf1695047ea823532321ccd7; ?>
<?php unset($__attributesOriginalda6e47aecf1695047ea823532321ccd7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalda6e47aecf1695047ea823532321ccd7)): ?>
<?php $component = $__componentOriginalda6e47aecf1695047ea823532321ccd7; ?>
<?php unset($__componentOriginalda6e47aecf1695047ea823532321ccd7); ?>
<?php endif; ?>
                                                <span class="text-xs font-bold uppercase"><?php echo e($std['trend']); ?></span>
                                            </div>
                                        </div>
                                        <div class="text-[10px] text-zinc-400">Baseline was <span class="font-bold text-zinc-500"><?php echo e($std['previous']); ?></span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <!-- Period & Date Selection -->
        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 mb-8 animate-fadeIn">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = ['week' => 'Week', 'month' => 'Month', 'quarter' => 'Quarter', 'year' => 'Year']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $period => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <button 
                            wire:click="changePeriod('<?php echo e($period); ?>')"
                            class="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all <?php echo e($selectedPeriod === $period ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'); ?>"
                        >
                            <?php echo e($label); ?>

                        </button>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <div class="flex items-center gap-2">
                        <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['type' => 'date','wire:model' => 'startDate','size' => 'sm','class' => '!w-36']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'date','wire:model' => 'startDate','size' => 'sm','class' => '!w-36']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                        <span class="text-zinc-400 text-xs font-bold">to</span>
                        <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['type' => 'date','wire:model' => 'endDate','size' => 'sm','class' => '!w-36']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'date','wire:model' => 'endDate','size' => 'sm','class' => '!w-36']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                    </div>
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'updateDateRange','variant' => 'primary','size' => 'sm','class' => '!bg-zinc-900 dark:!bg-white dark:!text-zinc-900']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'updateDateRange','variant' => 'primary','size' => 'sm','class' => '!bg-zinc-900 dark:!bg-white dark:!text-zinc-900']); ?>
                        Apply Filter
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Premium Key Metrics -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($currentSnapshot): ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
                <!-- Average Score Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <?php if (isset($component)) { $__componentOriginal82067727c95f13dc4198f80e35cb9c11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal82067727c95f13dc4198f80e35cb9c11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.chart-bar','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.chart-bar'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal82067727c95f13dc4198f80e35cb9c11)): ?>
<?php $attributes = $__attributesOriginal82067727c95f13dc4198f80e35cb9c11; ?>
<?php unset($__attributesOriginal82067727c95f13dc4198f80e35cb9c11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal82067727c95f13dc4198f80e35cb9c11)): ?>
<?php $component = $__componentOriginal82067727c95f13dc4198f80e35cb9c11; ?>
<?php unset($__componentOriginal82067727c95f13dc4198f80e35cb9c11); ?>
<?php endif; ?>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Average Score</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->average_score); ?></span>
                                <span class="text-xs font-bold text-zinc-400">/ <?php echo e($exam->total_marks ?? 100); ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pass Rate Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <?php if (isset($component)) { $__componentOriginaldb480e8d5d7476402b0c7e6f30ee2bdb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginaldb480e8d5d7476402b0c7e6f30ee2bdb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check-badge','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check-badge'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginaldb480e8d5d7476402b0c7e6f30ee2bdb)): ?>
<?php $attributes = $__attributesOriginaldb480e8d5d7476402b0c7e6f30ee2bdb; ?>
<?php unset($__attributesOriginaldb480e8d5d7476402b0c7e6f30ee2bdb); ?>
<?php endif; ?>
<?php if (isset($__componentOriginaldb480e8d5d7476402b0c7e6f30ee2bdb)): ?>
<?php $component = $__componentOriginaldb480e8d5d7476402b0c7e6f30ee2bdb; ?>
<?php unset($__componentOriginaldb480e8d5d7476402b0c7e6f30ee2bdb); ?>
<?php endif; ?>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pass Rate</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->pass_rate); ?>%</span>
                                <span class="text-xs font-bold text-zinc-400">Target: <?php echo e($exam->passing_marks ?? 40); ?>%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Confidence Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">AI Trust Index</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->average_confidence); ?>%</span>
                                <span class="text-xs font-bold text-zinc-400">Reliability</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Consistency Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <?php if (isset($component)) { $__componentOriginal5c19237769b07d4c2471af8642319894 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5c19237769b07d4c2471af8642319894 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.scale','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.scale'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5c19237769b07d4c2471af8642319894)): ?>
<?php $attributes = $__attributesOriginal5c19237769b07d4c2471af8642319894; ?>
<?php unset($__attributesOriginal5c19237769b07d4c2471af8642319894); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5c19237769b07d4c2471af8642319894)): ?>
<?php $component = $__componentOriginal5c19237769b07d4c2471af8642319894; ?>
<?php unset($__componentOriginal5c19237769b07d4c2471af8642319894); ?>
<?php endif; ?>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Score Spread</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->std_deviation); ?></span>
                                <span class="text-xs font-bold text-zinc-400">Points Gap</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Performance & Grading Details -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fadeIn">
                <!-- Performance Statistics -->
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Performance Summary</h3>
                    </div>
                    <div class="p-8 flex-1 grid grid-cols-2 gap-8">
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Completed Exams</p>
                            <p class="text-2xl font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->students_submitted); ?><span class="text-sm text-zinc-400 font-bold ml-1">/ <?php echo e($currentSnapshot->total_students); ?></span></p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Median Benchmark</p>
                            <p class="text-2xl font-black text-indigo-500"><?php echo e($currentSnapshot->median_score); ?></p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Highest Attained</p>
                            <p class="text-2xl font-black text-emerald-500"><?php echo e($currentSnapshot->max_score); ?></p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lowest Attained</p>
                            <p class="text-2xl font-black text-rose-500"><?php echo e($currentSnapshot->min_score ?? '0.0'); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Grading Pipeline -->
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Grading Status</h3>
                    </div>
                    <div class="p-8 space-y-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Algorithmic (MCQ)</span>
                            </div>
                            <span class="text-xs font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->questions_auto_graded); ?> units</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Neural Grading (AI)</span>
                            </div>
                            <span class="text-xs font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->questions_ai_graded); ?> units</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Finalized & Approved</span>
                            </div>
                            <span class="text-xs font-black text-zinc-900 dark:text-zinc-100"><?php echo e($currentSnapshot->grades_approved); ?> units</span>
                        </div>
                        <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Action Required</span>
                            <span class="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                <?php echo e($currentSnapshot->grades_pending_review); ?> Pending Review
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Engagement Metrics -->
            <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                    <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Student Activity</h3>
                </div>
                <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 text-center group">
                                <?php echo e(round($currentSnapshot->average_time_spent / 60, 1)); ?> <span class="text-xs font-bold text-zinc-400">min</span>
                            </p>
                            <p class="text-[10px] text-zinc-500 mt-2">Average Time Taken</p>
                        </div>
                        <div class="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 text-center group">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Early Submissions</p>
                            <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500"><?php echo e($currentSnapshot->early_submissions); ?></p>
                            <p class="text-[10px] text-zinc-500 mt-2">Submitted before 80% time</p>
                        </div>
                        <div class="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 text-center group">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Last-minute Submissions</p>
                            <p class="text-3xl font-black text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-500"><?php echo e($currentSnapshot->last_minute_submissions); ?></p>
                            <p class="text-[10px] text-zinc-500 mt-2">Submitted in final 5%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Question Analysis -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($currentSnapshot->question_performance): ?>
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Question Success Analysis</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-zinc-50/50 dark:bg-zinc-800/30">
                                    <th class="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Question</th>
                                    <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $currentSnapshot->question_performance; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $qId => $perf): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td class="px-8 py-5">
                                            <div class="flex items-start gap-4">
                                                <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                                    <span class="text-[10px] font-black text-zinc-500"><?php echo e($perf['number'] ?? ($loop->iteration)); ?></span>
                                                </div>
                                                <div class="flex flex-col gap-1">
                                                    <?php
                                                        $qText = $perf['text'] ?? null;
                                                        if (!$qText) {
                                                            $q = \App\Models\Question::find($qId);
                                                            $qText = $q ? $q->question_text : 'Unknown Question';
                                                        }
                                                    ?>
                                                    <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed"><?php echo e($qText); ?></span>
                                                    <span class="text-[9px] text-zinc-400 font-medium uppercase tracking-tighter"><?php echo e($perf['type'] ?? ''); ?> • <?php echo e($perf['bloom_level'] ?? ''); ?></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5">
                                            <div class="flex items-center gap-3">
                                                <span class="text-xs font-black text-zinc-900 dark:text-zinc-100"><?php echo e(round($perf['correct'] / $perf['total'] * 100)); ?>%</span>
                                                <div class="w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                    <?php $rate = ($perf['correct'] / $perf['total'] * 100); ?>
                                                    <div class="h-1.5 rounded-full <?php echo e($rate >= 70 ? 'bg-emerald-500' : ($rate >= 40 ? 'bg-indigo-500' : 'bg-rose-500')); ?>" style="width: <?php echo e($rate); ?>%"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Premium Historical Trends -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($historicalSnapshots->count() > 0): ?>
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Performance Over Time</h3>
                    </div>
                    <div class="p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <!-- Scores Trend -->
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Average Score History</p>
                                    <span class="text-[10px] font-black text-indigo-500 uppercase">Avg Score</span>
                                </div>
                                <div class="flex items-end h-40 gap-2 px-2">
                                    <?php $maxScore = max($trends['scores']) ?: 1; ?>
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $trends['scores']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $score): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <div class="flex-1 group relative">
                                            <div class="absolute -inset-1 bg-indigo-500/20 rounded-t-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                            <div class="relative bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-700 ease-out" 
                                                style="height: <?php echo e(($score / $maxScore) * 100); ?>%">
                                                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-xl border border-zinc-800 pointer-events-none">
                                                    <?php echo e($score); ?>

                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                                <div class="flex justify-between px-1">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $trends['dates']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $date): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <span class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter"><?php echo e($date); ?></span>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </div>

                            <!-- Pass Rate Trend -->
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pass Rate History</p>
                                    <span class="text-[10px] font-black text-emerald-500 uppercase">Pass Rate</span>
                                </div>
                                <div class="flex items-end h-40 gap-2 px-2">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $trends['passRates']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $rate): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <div class="flex-1 group relative">
                                            <div class="absolute -inset-1 bg-emerald-500/20 rounded-t-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                            <div class="relative bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-700 ease-out" 
                                                style="height: <?php echo e($rate ?: 0); ?>%">
                                                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-xl border border-zinc-800 pointer-events-none">
                                                    <?php echo e($rate); ?>%
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                                <div class="flex justify-between px-1">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $trends['dates']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $date): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <span class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter"><?php echo e($date); ?></span>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        <?php else: ?>
            <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-20 text-center animate-fadeIn">
                <div class="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800/10 flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
                    <?php if (isset($component)) { $__componentOriginal034523d705d4b4e6e19fdb0c8a89f076 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal034523d705d4b4e6e19fdb0c8a89f076 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.chart-pie','data' => ['variant' => 'solid']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.chart-pie'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'solid']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal034523d705d4b4e6e19fdb0c8a89f076)): ?>
<?php $attributes = $__attributesOriginal034523d705d4b4e6e19fdb0c8a89f076; ?>
<?php unset($__attributesOriginal034523d705d4b4e6e19fdb0c8a89f076); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal034523d705d4b4e6e19fdb0c8a89f076)): ?>
<?php $component = $__componentOriginal034523d705d4b4e6e19fdb0c8a89f076; ?>
<?php unset($__componentOriginal034523d705d4b4e6e19fdb0c8a89f076); ?>
<?php endif; ?>
                </div>
                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">No Intelligence Data Available</h3>
                <p class="text-sm text-zinc-500 max-w-xs mx-auto">Complete the exam and finalize grading to generate comprehensive AI-driven performance analytics.</p>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>
</div>

<?php $__env->startPush('scripts'); ?>
<script>
    document.addEventListener('refreshAnalytics', () => {
        console.log('Analytics refreshed');
    });
</script>
<?php $__env->stopPush(); ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/livewire/analytics-dashboard.blade.php ENDPATH**/ ?>