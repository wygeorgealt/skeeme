<div class="p-6 lg:p-10 space-y-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <?php if (isset($component)) { $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::heading','data' => ['size' => 'xl','level' => '1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::heading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'xl','level' => '1']); ?>Item Analysis <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9)): ?>
<?php $attributes = $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9; ?>
<?php unset($__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9)): ?>
<?php $component = $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9; ?>
<?php unset($__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9); ?>
<?php endif; ?>
                <div class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm">Psychometric Layer</div>
            </div>
            <?php if (isset($component)) { $__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::subheading','data' => ['class' => 'italic']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::subheading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'italic']); ?><?php echo e($this->exam->title); ?> <?php echo $__env->renderComponent(); ?>
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
        <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'refreshAnalysis','variant' => 'primary','icon' => 'arrow-path','class' => 'shadow-lg shadow-indigo-500/20']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'refreshAnalysis','variant' => 'primary','icon' => 'arrow-path','class' => 'shadow-lg shadow-indigo-500/20']); ?>Recompute Metrics <?php echo $__env->renderComponent(); ?>
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

    <!-- Summary Stats -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($examSummary) && !isset($examSummary['error'])): ?>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideIn">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-zinc-300 dark:border-l-zinc-700">
                <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Total Items</div>
                <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic"><?php echo e($examSummary['total_questions'] ?? 0); ?></div>
            </div>
            
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-amber-500">
                <div class="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-widest leading-none">Difficulty Index</div>
                <div class="text-3xl font-bold text-amber-500 italic"><?php echo e(number_format(($examSummary['average_difficulty'] ?? 0) * 100, 0)); ?>%</div>
                <?php
                    $diff = $examSummary['average_difficulty'] ?? 0;
                    $diffStatus = $diff < 0.45 ? ['Too Rigorous', 'text-rose-500'] : ($diff < 0.55 ? ['Balanced', 'text-amber-500'] : ['Accessible', 'text-emerald-500']);
                ?>
                <div class="text-[9px] font-bold uppercase <?php echo e($diffStatus[1]); ?> tracking-tighter"><?php echo e($diffStatus[0]); ?></div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-indigo-500">
                <div class="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/50 uppercase tracking-widest leading-none">Discrimination</div>
                <div class="text-3xl font-bold text-indigo-500 italic"><?php echo e(number_format(($examSummary['average_discrimination'] ?? 0), 2)); ?></div>
                <?php
                    $disc = $examSummary['average_discrimination'] ?? 0;
                    $discStatus = $disc > 0.3 ? ['High Precision', 'text-emerald-500'] : ($disc > 0.2 ? ['Acceptable', 'text-amber-500'] : ['Low Sensitivity', 'text-rose-500']);
                ?>
                <div class="text-[9px] font-bold uppercase <?php echo e($discStatus[1]); ?> tracking-tighter"><?php echo e($discStatus[0]); ?></div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-rose-500">
                <div class="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/50 uppercase tracking-widest leading-none">Anomalous Items</div>
                <div class="text-3xl font-bold text-rose-500 italic"><?php echo e($examSummary['problematic_count'] ?? 0); ?></div>
                <div class="text-[9px] font-bold uppercase text-rose-400 tracking-tighter">Requires Intervention</div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[600px] relative">
        <!-- Global Loading Layer -->
        <div wire:loading.flex wire:target="sortBy, toggleProblematicFilter, selectQuestion, refreshAnalysis" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Recalculating psychometrics...</p>
            </div>
        </div>

        <!-- Left Pane: Registry -->
        <div class="lg:col-span-4 xl:col-span-3 space-y-6">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
                <div class="p-5 border-b border-zinc-100 dark:border-zinc-800 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <?php if (isset($component)) { $__componentOriginala467913f9ff34913553be64599ec6e92 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala467913f9ff34913553be64599ec6e92 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::select.index','data' => ['wire:model.live' => 'sortBy','label' => 'Sort Metrics']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:model.live' => 'sortBy','label' => 'Sort Metrics']); ?>
                        <?php if (isset($component)) { $__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::select.option.index','data' => ['value' => 'order']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::select.option'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['value' => 'order']); ?>Examination Sequence <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745)): ?>
<?php $attributes = $__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745; ?>
<?php unset($__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745)): ?>
<?php $component = $__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745; ?>
<?php unset($__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::select.option.index','data' => ['value' => 'difficulty']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::select.option'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['value' => 'difficulty']); ?>Difficulty (Rigorous First) <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745)): ?>
<?php $attributes = $__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745; ?>
<?php unset($__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745)): ?>
<?php $component = $__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745; ?>
<?php unset($__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745); ?>
<?php endif; ?>
                        <?php if (isset($component)) { $__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::select.option.index','data' => ['value' => 'discrimination']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::select.option'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['value' => 'discrimination']); ?>Sensitivity (High First) <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745)): ?>
<?php $attributes = $__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745; ?>
<?php unset($__attributesOriginalc7395a5f1f6c2e275d1dc4ea0be0c745); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745)): ?>
<?php $component = $__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745; ?>
<?php unset($__componentOriginalc7395a5f1f6c2e275d1dc4ea0be0c745); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala467913f9ff34913553be64599ec6e92)): ?>
<?php $attributes = $__attributesOriginala467913f9ff34913553be64599ec6e92; ?>
<?php unset($__attributesOriginala467913f9ff34913553be64599ec6e92); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala467913f9ff34913553be64599ec6e92)): ?>
<?php $component = $__componentOriginala467913f9ff34913553be64599ec6e92; ?>
<?php unset($__componentOriginala467913f9ff34913553be64599ec6e92); ?>
<?php endif; ?>
                    
                    <button wire:click="toggleProblematicFilter" class="w-full h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border <?php echo e($showProblematicOnly ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700'); ?>">
                        <i class="fas fa-triangle-exclamation mr-2"></i>
                        <?php echo e($showProblematicOnly ? 'Showing Faulty Items' : 'Show All Items'); ?>

                    </button>
                </div>

                <div class="max-h-[700px] overflow-y-auto scroll-smooth pr-1">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $filteredItems; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <button wire:click="selectQuestion('<?php echo e($item['question_id']); ?>')" class="w-full text-left p-5 border-b border-zinc-100 dark:border-zinc-800/50 transition-all group <?php echo e($selectedQuestionId === (string) $item['question_id'] ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-l-4 border-l-indigo-500' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'); ?>">
                            <div class="flex items-start justify-between gap-4">
                                <div class="space-y-1">
                                    <div class="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 italic">Reference #<?php echo e($loop->iteration); ?></div>
                                    <div class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border <?php echo e($this->getAssessmentColor($item['assessment'])); ?> shadow-sm">
                                        <?php echo e($item['assessment']); ?>

                                    </div>
                                </div>
                                <div class="text-right flex flex-col gap-1 pl-2">
                                    <div class="text-[10px] font-bold <?php echo e($this->getDifficultyColor($item['difficulty_index'])); ?> italic uppercase tracking-tighter">D: <?php echo e(number_format($item['difficulty_index'] * 100, 0)); ?>%</div>
                                    <div class="text-[10px] font-bold <?php echo e($this->getDiscriminationColor($item['discrimination_index'])); ?> italic uppercase tracking-tighter">S: <?php echo e(number_format($item['discrimination_index'], 2)); ?></div>
                                </div>
                            </div>
                        </button>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <div class="p-10 text-center space-y-2">
                            <i class="fas fa-database text-2xl text-zinc-100 dark:text-zinc-800"></i>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No analytic data</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Right Pane: Detailed Metrics -->
        <div class="lg:col-span-8 xl:col-span-9 space-y-8 sticky top-6">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedItem): ?>
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 rounded-3xl shadow-sm animate-fadeIn space-y-10 relative overflow-hidden group/panel">
                    <div class="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.07] text-zinc-900 dark:text-white pointer-events-none group-hover/panel:scale-110 transition-transform">
                        <i class="fas fa-magnifying-glass-chart text-9xl"></i>
                    </div>

                    <div>
                        <?php if (isset($component)) { $__componentOriginal8a84eac5abb8af1e2274971f8640b38f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::label','data' => ['class' => 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::label'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1']); ?>Instrument Prompt <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $attributes = $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $component = $__componentOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
                        <div class="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed pr-20 italic">
                            "<?php echo nl2br(e($selectedItem['question_text'])); ?>"
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 rounded-3xl shadow-inner border-l-4 <?php echo e($this->getDifficultyColor($selectedItem['difficulty_index'])); ?>">
                            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Granular Difficulty</div>
                            <div class="flex items-end justify-between">
                                <div class="space-y-1">
                                    <div class="text-5xl font-bold italic <?php echo e($this->getDifficultyColor($selectedItem['difficulty_index'])); ?>">
                                        <?php echo e(number_format($selectedItem['difficulty_index'] * 100, 0)); ?>%
                                    </div>
                                    <div class="text-[10px] font-bold uppercase text-zinc-400 tracking-tighter"><?php echo e($selectedItem['difficulty_label']); ?> Classification</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-[10px] font-bold text-zinc-500 uppercase">Success Rate</div>
                                    <div class="text-lg font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($selectedItem['correct_answer_count'] ?? 0); ?> / <?php echo e($selectedItem['total_attempts'] ?? 0); ?></div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 rounded-3xl shadow-inner border-l-4 <?php echo e($this->getDiscriminationColor($selectedItem['discrimination_index'])); ?>">
                            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Correlation Sensitivity</div>
                            <div class="flex items-end justify-between">
                                <div class="space-y-1">
                                    <div class="text-5xl font-bold italic <?php echo e($this->getDiscriminationColor($selectedItem['discrimination_index'])); ?>">
                                        <?php echo e(number_format($selectedItem['discrimination_index'], 2)); ?>

                                    </div>
                                    <div class="text-[10px] font-bold uppercase text-zinc-400 tracking-tighter"><?php echo e($selectedItem['discrimination_label']); ?> Discriminator</div>
                                </div>
                                <i class="fas fa-bullseye text-4xl opacity-10 mb-2"></i>
                            </div>
                        </div>
                    </div>

                    <div class="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 p-6 rounded-2xl flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 shadow-sm">
                                <i class="fas fa-certificate text-sm"></i>
                            </div>
                            <div>
                                <div class="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Global Evaluation</div>
                                <div class="text-sm font-bold text-indigo-700 dark:text-indigo-300 italic mt-1"><?php echo e($selectedItem['assessment']); ?></div>
                            </div>
                        </div>
                    </div>

                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($selectedItem['response_distribution'])): ?>
                        <div class="space-y-6">
                            <?php if (isset($component)) { $__componentOriginal8a84eac5abb8af1e2274971f8640b38f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::label','data' => ['class' => 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::label'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1']); ?>Synthesized Response spread <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $attributes = $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $component = $__componentOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $selectedItem['response_distribution']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $option => $count): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <?php
                                        $total = array_sum($selectedItem['response_distribution']) ?: 1;
                                        $pct = ($count / $total) * 100;
                                    ?>
                                    <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 italic"><?php echo e($option); ?></span>
                                            <span class="text-[10px] font-bold text-zinc-400 tracking-tighter"><?php echo e($count); ?> Students</span>
                                        </div>
                                        <div class="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner relative">
                                            <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000" style="width: <?php echo e($pct); ?>%"></div>
                                        </div>
                                        <div class="text-[10px] font-bold text-right text-indigo-500 italic"><?php echo e(number_format($pct, 1)); ?>%</div>
                                    </div>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showRecommendations && !empty($selectedItem['recommendation'])): ?>
                        <div class="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-3xl animate-slideUp">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 mt-1">
                                    <i class="fas fa-lightbulb"></i>
                                </div>
                                <div class="flex-1 space-y-1">
                                    <?php if (isset($component)) { $__componentOriginal8a84eac5abb8af1e2274971f8640b38f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::label','data' => ['class' => 'text-[10px] font-bold text-amber-600/70 dark:text-amber-400 uppercase tracking-widest']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::label'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-[10px] font-bold text-amber-600/70 dark:text-amber-400 uppercase tracking-widest']); ?>Heuristic Optimization <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $attributes = $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $component = $__componentOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
                                    <p class="text-sm font-medium text-amber-900 dark:text-amber-200/80 leading-relaxed italic pr-6 group-hover:pr-0 transition-all">
                                        <?php echo e($selectedItem['recommendation']); ?>

                                    </p>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            <?php else: ?>
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-3xl text-center space-y-4 shadow-sm h-[500px] flex flex-col items-center justify-center animate-fadeIn">
                    <div class="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-200 dark:text-zinc-700 scale-125">
                        <i class="fas fa-layer-group text-4xl"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest italic">Awaiting Selection</h3>
                        <?php if (isset($component)) { $__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::subheading','data' => ['class' => 'text-center max-w-xs uppercase tracking-widest text-[9px] font-bold mt-2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::subheading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-center max-w-xs uppercase tracking-widest text-[9px] font-bold mt-2']); ?>Initialize instrumentation by selecting an assessment metric from the left registry. <?php echo $__env->renderComponent(); ?>
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
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>
    </div>

    <!-- Global Exam Recommendations -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($examSummary['recommendations']) && $showRecommendations): ?>
        <div class="pt-10 border-t border-zinc-100 dark:border-zinc-800 animate-slideUp">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[40px] shadow-sm space-y-8">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <i class="fas fa-clipboard-check text-xl"></i>
                    </div>
                    <div>
                        <?php if (isset($component)) { $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::heading','data' => ['size' => 'lg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::heading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'lg']); ?>Instrument Oversight Report <?php echo $__env->renderComponent(); ?>
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
<?php $component->withAttributes([]); ?>Strategic refinements for future evaluation cycles. <?php echo $__env->renderComponent(); ?>
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
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $examSummary['recommendations']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $recommendation): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl flex items-start gap-4 transition-all hover:border-indigo-500/30 group">
                            <i class="fas fa-arrow-right text-[10px] mt-2 text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            <p class="text-xs font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed italic"><?php echo e($recommendation); ?></p>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Visibility Control -->
    <div class="flex justify-center pt-8">
        <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'toggleRecommendations','variant' => 'ghost','size' => 'sm','icon' => ''.e($showRecommendations ? 'eye-slash' : 'eye').'','class' => 'text-[10px] font-bold uppercase tracking-widest']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'toggleRecommendations','variant' => 'ghost','size' => 'sm','icon' => ''.e($showRecommendations ? 'eye-slash' : 'eye').'','class' => 'text-[10px] font-bold uppercase tracking-widest']); ?>
            <?php echo e($showRecommendations ? 'Conceal Heuristics' : 'Divulge Insights'); ?>

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
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\lecturer-item-analysis.blade.php ENDPATH**/ ?>