<!-- Review Tab -->
<div id="tab-review" class="space-y-6 <?php echo e($activeTab === 'review' ? 'block' : 'hidden'); ?>">
    <div class="flex items-center justify-between">
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
<?php $component->withAttributes(['size' => 'lg']); ?>Review & Manage Questions <?php echo $__env->renderComponent(); ?>
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
<?php $component->withAttributes([]); ?>Reorder, edit, or remove questions from this exam. <?php echo $__env->renderComponent(); ?>
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

    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(session()->has('message')): ?>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-400 animate-fadeIn">
            <i class="fas fa-check-circle"></i>
            <span class="text-xs font-bold"><?php echo e(session('message')); ?></span>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($examQuestions) === 0): ?>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-24 text-center space-y-4">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                <i class="fas fa-inbox text-3xl"></i>
            </div>
            <div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Question Registry Empty</h3>
                <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Populate your exam using the manual entry, question bank, or AI generation tools.</p>
            </div>
        </div>
    <?php else: ?>
        <div id="sortable-questions" class="space-y-4">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $examQuestions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $eq): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md group relative isolate" data-id="<?php echo e($eq['id']); ?>">
                    <!-- Drag Handle -->
                    <div class="drag-handle absolute left-0 top-0 bottom-0 w-2 cursor-grab active:cursor-grabbing hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <i class="fas fa-grip-vertical text-zinc-300 dark:text-zinc-600 text-[10px]"></i>
                    </div>

                    <div class="flex flex-col md:flex-row gap-6">
                        <div class="flex-1 space-y-4">
                            <div class="flex items-center gap-3">
                                <span class="h-6 w-8 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold shadow-sm">Q<?php echo e($index + 1); ?></span>
                                <div class="flex items-center gap-1.5">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border
                                        <?php if($eq['question']->question_type === 'multiple_choice'): ?> bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800
                                        <?php elseif($eq['question']->question_type === 'true_false'): ?> bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                        <?php else: ?> bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 <?php endif; ?> shadow-sm">
                                        <?php echo e(str_replace('_', ' ', $eq['question']->question_type)); ?>

                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border
                                        <?php if($eq['question']->difficulty_level === 'easy'): ?> bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                        <?php elseif($eq['question']->difficulty_level === 'hard'): ?> bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800
                                        <?php else: ?> bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 <?php endif; ?> shadow-sm">
                                        <?php echo e($eq['question']->difficulty_level); ?>

                                    </span>
                                </div>
                            </div>

                            <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                                <?php echo nl2br(e($eq['question']->question_text)); ?>

                            </div>

                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($eq['question']->image_path): ?>
                                <div class="mt-4">
                                    <img src="<?php echo e(Storage::url($eq['question']->image_path)); ?>" class="max-h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform hover:scale-[1.02]" />
                                </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($eq['question']->topic): ?>
                                <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <i class="fas fa-tag text-[10px] text-zinc-400"></i>
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-tight"><?php echo e($eq['question']->topic); ?></span>
                                </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                            <div class="space-y-2 mt-4">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($eq['question']->question_type === 'true_false'): ?>
                                    <div class="grid grid-cols-2 gap-2">
                                        <?php
                                            $correctAnswer = is_array($eq['question']->correct_answer) ? ($eq['question']->correct_answer[0] ?? 'false') : $eq['question']->correct_answer;
                                            $isTrue = in_array(strtolower((string)$correctAnswer), ['true', '1']);
                                        ?>
                                        <div class="px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 <?php echo e($isTrue ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-800/30 dark:border-zinc-800'); ?>">
                                            <i class="fas <?php echo e($isTrue ? 'fa-check-circle' : 'fa-circle'); ?>"></i>
                                            <span>TRUE <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($isTrue): ?> (Correct) <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?></span>
                                        </div>
                                        <div class="px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 <?php echo e(!$isTrue ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-800/30 dark:border-zinc-800'); ?>">
                                            <i class="fas <?php echo e(!$isTrue ? 'fa-check-circle' : 'fa-circle'); ?>"></i>
                                            <span>FALSE <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$isTrue): ?> (Correct) <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?></span>
                                        </div>
                                    </div>
                                <?php elseif($eq['question']->question_type === 'multiple_choice'): ?>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $eq['question']->options; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $option): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <?php
                                                $optionText = is_array($option) ? ($option['text'] ?? $option) : $option;
                                                $isCorrect = $option == $eq['question']->correct_answer || (is_array($eq['question']->correct_answer) && in_array($option, $eq['question']->correct_answer));
                                            ?>
                                            <div class="px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 <?php echo e($isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800/30 dark:border-zinc-800'); ?>">
                                                <i class="fas <?php echo e($isCorrect ? 'fa-check-circle' : 'fa-circle text-zinc-300 dark:text-zinc-700'); ?>"></i>
                                                <span><?php echo e($optionText); ?> <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($isCorrect): ?> (Correct) <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?></span>
                                            </div>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </div>
                                <?php else: ?>
                                    <div class="px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-400">
                                        <div class="flex items-center gap-2 mb-1">
                                            <i class="fas fa-info-circle"></i>
                                            <span class="font-bold uppercase tracking-widest text-[9px]">Reference Answer</span>
                                        </div>
                                        <div class="italic line-clamp-2">
                                            <?php
                                                $correctAnswer = is_array($eq['question']->correct_answer) ? ($eq['question']->correct_answer[0] ?? '') : $eq['question']->correct_answer;
                                            ?>
                                            <?php echo e($correctAnswer); ?>

                                        </div>
                                    </div>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </div>
                        </div>

                        <div class="w-full md:w-32 flex flex-col gap-3 justify-between">
                            <div class="space-y-2">
                                <?php if (isset($component)) { $__componentOriginal8a84eac5abb8af1e2274971f8640b38f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::label','data' => ['class' => 'text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::label'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1']); ?>Allotted Marks <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $attributes = $__attributesOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__attributesOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f)): ?>
<?php $component = $__componentOriginal8a84eac5abb8af1e2274971f8640b38f; ?>
<?php unset($__componentOriginal8a84eac5abb8af1e2274971f8640b38f); ?>
<?php endif; ?>
                                <div class="relative group/marks">
                                    <input type="number" 
                                        wire:change="updateQuestionMarks(<?php echo e($eq['id']); ?>, $event.target.value)"
                                        class="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 px-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                                        value="<?php echo e($eq['marks']); ?>" 
                                        min="0.5" 
                                        step="0.5">
                                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 opacity-0 group-focus-within/marks:opacity-100 transition-opacity">
                                        <i class="fas fa-edit text-[10px]"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex flex-col gap-1.5">
                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'editQuestion('.e($eq['id']).')','variant' => 'ghost','size' => 'xs','icon' => 'pencil-square','class' => 'justify-start']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'editQuestion('.e($eq['id']).')','variant' => 'ghost','size' => 'xs','icon' => 'pencil-square','class' => 'justify-start']); ?>Edit <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'removeQuestion('.e($eq['id']).')','variant' => 'ghost','size' => 'xs','icon' => 'trash','class' => 'justify-start text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'removeQuestion('.e($eq['id']).')','variant' => 'ghost','size' => 'xs','icon' => 'trash','class' => 'justify-start text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20']); ?>Remove <?php echo $__env->renderComponent(); ?>
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
                </div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

        <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 mt-10">
            <a href="<?php echo e(route('lecturer.exams')); ?>" class="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 group transition-colors">
                <i class="fas fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
                <span class="text-xs font-bold uppercase tracking-widest">Exit Management</span>
            </a>
            
            <div class="flex items-center gap-3">

                
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($exam->status !== 'published'): ?>
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'publishExam','variant' => 'primary','icon' => 'check-circle']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'publishExam','variant' => 'primary','icon' => 'check-circle']); ?>Publish Exam <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                <?php else: ?>
                    <div class="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <i class="fas fa-check-circle text-xs"></i>
                        <span class="text-xs font-bold uppercase tracking-widest">Published</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\partials\exam-questions-review.blade.php ENDPATH**/ ?>