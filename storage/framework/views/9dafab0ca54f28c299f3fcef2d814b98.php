<div class="h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 overflow-hidden">
    <!-- Global Loading Overlay -->
    <div wire:loading.flex wire:target="selectSession, autoGradeSession, publishAllGraded, publishResult" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Processing grading request...</p>
        </div>
    </div>

    <!-- Header -->
    <header class="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 h-16 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('lecturer.exams')).'','icon' => 'arrow-left','variant' => 'ghost','size' => 'sm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('lecturer.exams')).'','icon' => 'arrow-left','variant' => 'ghost','size' => 'sm']); ?>
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
            <h1 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                Grading: <?php echo e($exam->title); ?>

            </h1>
        </div>
        <div class="flex items-center gap-3">
             <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'publishAllGraded','variant' => 'filled','class' => 'bg-indigo-600 hover:bg-indigo-700 text-white']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'publishAllGraded','variant' => 'filled','class' => 'bg-indigo-600 hover:bg-indigo-700 text-white']); ?>
                Publish All Graded
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
    </header>

    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar: Student List -->
        <aside class="w-80 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col overflow-y-auto">
            <div class="p-4 border-b border-gray-200 dark:border-zinc-700/50">
                <?php if (isset($component)) { $__componentOriginala467913f9ff34913553be64599ec6e92 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala467913f9ff34913553be64599ec6e92 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::select.index','data' => ['wire:model.live' => 'filterStatus','placeholder' => 'Filter Status','class' => 'w-full']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::select'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:model.live' => 'filterStatus','placeholder' => 'Filter Status','class' => 'w-full']); ?>
                    <option value="all">All Submissions</option>
                    <option value="submitted">Needs Grading</option>
                    <option value="graded">Graded</option>
                    <option value="published">Published</option>
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
            </div>

            <div class="divide-y divide-gray-100 dark:divide-zinc-700/50">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $this->sessions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $session): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <button 
                        wire:click="selectSession(<?php echo e($session->id); ?>)"
                        class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors <?php echo e($selectedSessionId == $session->id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-2 border-indigo-600' : ''); ?>"
                    >
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-medium text-gray-900 dark:text-white truncate">
                                <?php echo e($session->student->name); ?>

                            </span>
                            <span class="text-xs px-2 py-0.5 rounded-full 
                                <?php if($session->status === 'submitted'): ?> bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
                                <?php elseif($session->status === 'graded'): ?> bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400
                                <?php elseif($session->status === 'published'): ?> bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400
                                <?php endif; ?>">
                                <?php echo e(ucfirst($session->status)); ?>

                            </span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            Submitted: <?php echo e($session->submitted_at->format('M d, H:i')); ?>

                        </div>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($session->score !== null): ?>
                            <div class="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Score: <?php echo e($session->score); ?> / <?php echo e($exam->total_marks ?? 'N/A'); ?>

                            </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </button>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <div class="p-8 text-center text-gray-500 text-sm">
                        No submissions found based on current filter.
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </aside>

        <!-- Main Content: Grading Area -->
        <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-900 p-6">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->selectedSession): ?>
                <div class="max-w-4xl mx-auto space-y-6">
                    <!-- Session Header -->
                    <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                        <div>
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white"><?php echo e($this->selectedSession->student->name); ?></h2>
                            <p class="text-sm text-gray-500"><?php echo e($this->selectedSession->student->email); ?></p>
                        </div>
                        
                        <div class="flex gap-3">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->selectedSession->status === 'submitted'): ?>
                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'autoGradeSession('.e($this->selectedSession->id).')','icon' => 'sparkles','variant' => 'primary']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'autoGradeSession('.e($this->selectedSession->id).')','icon' => 'sparkles','variant' => 'primary']); ?>
                                    Auto-Grade with AI
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
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->selectedSession->status === 'graded'): ?>
                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('lecturer.gradings.dashboard', $this->selectedSession->id)).'','icon' => 'chart-bar','variant' => 'ghost']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('lecturer.gradings.dashboard', $this->selectedSession->id)).'','icon' => 'chart-bar','variant' => 'ghost']); ?>
                                    Advanced Review
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
                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('exams.sessions.print.script', $this->selectedSession->id)).'','target' => '_blank','icon' => 'printer','variant' => 'ghost']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('exams.sessions.print.script', $this->selectedSession->id)).'','target' => '_blank','icon' => 'printer','variant' => 'ghost']); ?>
                                    Download Script
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
                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'publishResult('.e($this->selectedSession->id).')','icon' => 'paper-airplane','variant' => 'filled','class' => 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'publishResult('.e($this->selectedSession->id).')','icon' => 'paper-airplane','variant' => 'filled','class' => 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600']); ?>
                                    Publish Result
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
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    </div>

                    <!-- Questions & Grading -->
                    <div class="space-y-6">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->selectedSession->examAnswers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $answer): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex-1">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($answer->question): ?>
                                            <h3 class="font-medium text-gray-900 dark:text-white mb-2">
                                                Q<?php echo e($loop->iteration); ?>: <?php echo e($answer->question->question_text); ?>

                                            </h3>
                                            <div class="text-xs text-gray-500 mb-4 bg-gray-50 dark:bg-zinc-700/50 p-2 rounded">
                                                Max Marks: <?php echo e($answer->question->marks); ?> | Type: <?php echo e(ucfirst(str_replace('_', ' ', $answer->question->question_type))); ?>

                                            </div>
                                        <?php else: ?>
                                            <h3 class="font-medium text-gray-900 dark:text-white mb-2">
                                                Q<?php echo e($loop->iteration); ?>: <span class="text-amber-600">Question data missing</span>
                                            </h3>
                                            <div class="text-xs text-amber-600 mb-4 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                                ⚠️ This answer's question reference is missing. Please re-grade this exam.
                                            </div>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </div>
                                    <div class="ml-4 shrink-0 flex flex-col items-end gap-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm text-gray-500">Marks:</span>
                                            <input 
                                                type="number" 
                                                wire:change="updateMark(<?php echo e($answer->id); ?>, $event.target.value)"
                                                value="<?php echo e($answer->marks_obtained); ?>"
                                                class="w-20 px-2 py-1 text-right border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                min="0"
                                                max="<?php echo e($answer->question?->marks ?? 100); ?>"
                                                step="0.5"
                                            >
                                        </div>
                                    </div>
                                </div>

                                <!-- Student Answer -->
                                <div class="mb-6">
                                    <h4 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Student Answer</h4>
                                    <div class="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg text-gray-800 dark:text-indigo-100 whitespace-pre-wrap">
                                        <?php echo e($answer->student_answer ?? '(No Answer)'); ?>

                                    </div>
                                </div>

                                <!-- AI Feedback / Grading Info -->
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($answer->isAutoMarked() || $answer->isAIGraded()): ?>
                                    <div class="mb-4 p-4 border rounded-lg <?php echo e($answer->isAIGraded() ? 'border-purple-100 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-900/10' : 'border-gray-100 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-700/30'); ?>">
                                        <div class="flex items-center gap-2 mb-3">
                                            <?php if (isset($component)) { $__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.index','data' => ['name' => ''.e($answer->isAIGraded() ? 'sparkles' : 'check-circle').'','class' => 'w-4 h-4 text-purple-600 dark:text-purple-400']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => ''.e($answer->isAIGraded() ? 'sparkles' : 'check-circle').'','class' => 'w-4 h-4 text-purple-600 dark:text-purple-400']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2)): ?>
<?php $attributes = $__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2; ?>
<?php unset($__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2)): ?>
<?php $component = $__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2; ?>
<?php unset($__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2); ?>
<?php endif; ?>
                                            <span class="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                                <?php echo e($answer->isAIGraded() ? 'Advice' : 'Auto-Marked'); ?>

                                            </span>
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($answer->getConfidenceScore()): ?>
                                                <span class="text-xs font-medium text-purple-500/80 ml-auto bg-purple-100/50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                                                    Confidence: <?php echo e($answer->getConfidenceScore() * 100); ?>%
                                                </span>
                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        </div>
                                        
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($answer->getGradingReasoning()): ?>
                                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                <?php echo e($answer->getGradingReasoning()); ?>

                                            </p>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </div>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                                <!-- Manual Feedback Input -->
                                <div>
                                    <textarea
                                        wire:blur="updateMark(<?php echo e($answer->id); ?>, <?php echo e($answer->marks_obtained ?? 0); ?>, $event.target.value)"
                                        class="w-full text-sm rounded-lg border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add your feedback here..."
                                        rows="2"
                                    ><?php echo e($answer->feedback); ?></textarea>
                                </div>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>
                </div>
            <?php else: ?>
                <!-- Empty State -->
                <div class="h-full flex flex-col items-center justify-center text-center">
                    <div class="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <?php if (isset($component)) { $__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.index','data' => ['name' => 'user','class' => 'w-8 h-8 text-indigo-600 dark:text-indigo-400']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'user','class' => 'w-8 h-8 text-indigo-600 dark:text-indigo-400']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2)): ?>
<?php $attributes = $__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2; ?>
<?php unset($__attributesOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2)): ?>
<?php $component = $__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2; ?>
<?php unset($__componentOriginalc7d5f44bf2a2d803ed0b55f72f1f82e2); ?>
<?php endif; ?>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Select a Student</h3>
                    <p class="text-gray-500 dark:text-gray-400 max-w-sm">
                        Choose a student submission from the sidebar to view their answers and start grading.
                    </p>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </main>
    </div>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\lecturer-exam-grading.blade.php ENDPATH**/ ?>