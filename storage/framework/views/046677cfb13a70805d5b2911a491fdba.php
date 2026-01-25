<div class="p-6 lg:p-10 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <?php if (isset($component)) { $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::heading','data' => ['size' => 'xl','level' => '1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::heading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'xl','level' => '1']); ?>Manage Exam Questions <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9)): ?>
<?php $attributes = $__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9; ?>
<?php unset($__attributesOriginale0fd5b6a0986beffac17a0a103dfd7b9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9)): ?>
<?php $component = $__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9; ?>
<?php unset($__componentOriginale0fd5b6a0986beffac17a0a103dfd7b9); ?>
<?php endif; ?>
                <div class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm">Configuring</div>
            </div>
            <?php if (isset($component)) { $__componentOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal43e8c568bbb8b06b9124aad3ccf4ec97 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::subheading','data' => ['class' => 'flex items-center gap-2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::subheading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'flex items-center gap-2']); ?>
                <span class="font-bold text-zinc-900 dark:text-zinc-100 italic"><?php echo e($exam->title); ?></span>
                <span class="text-zinc-400">•</span>
                <span class="text-xs uppercase tracking-tighter font-bold text-zinc-500"><?php echo e($exam->course->name); ?></span>
             <?php echo $__env->renderComponent(); ?>
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
        
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center gap-6">
            <div class="text-center px-4 border-r border-zinc-100 dark:border-zinc-800">
                <div class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Marks</div>
                <div class="text-2xl font-bold text-indigo-500 italic font-mono"><?php echo e($this->totalMarks); ?></div>
            </div>
            <div class="text-center px-4">
                <div class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Questions</div>
                <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 italic font-mono"><?php echo e($this->questionCount); ?></div>
            </div>
            <div class="pl-4 border-l border-zinc-100 dark:border-zinc-800">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('exams.print.paper', $exam)).'','target' => '_blank','icon' => 'printer','variant' => 'ghost','size' => 'sm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('exams.print.paper', $exam)).'','target' => '_blank','icon' => 'printer','variant' => 'ghost','size' => 'sm']); ?>Print Paper <?php echo $__env->renderComponent(); ?>
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

    <!-- Navigation Tabs -->
    <div class="flex flex-col lg:flex-row gap-8">
        <div class="w-full lg:w-64 flex-shrink-0">
            <div class="flex flex-col gap-2 sticky top-6">
                <button wire:click="$set('activeTab', 'review')" class="group flex items-center gap-3 p-4 rounded-2xl transition-all border <?php echo e($activeTab === 'review' ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg dark:bg-white dark:border-white dark:text-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-white shadow-sm'); ?>">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center border <?php echo e($activeTab === 'review' ? 'bg-white/10 border-white/20' : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700'); ?>">
                        <i class="fas fa-eye text-sm"></i>
                    </div>
                    <div class="flex flex-col items-start transition-transform group-hover:translate-x-1">
                        <span class="text-xs font-bold uppercase tracking-widest">Review</span>
                        <span class="text-[9px] opacity-60">Manage existing questions</span>
                    </div>
                </button>

                <button wire:click="$set('activeTab', 'manual')" class="group flex items-center gap-3 p-4 rounded-2xl transition-all border <?php echo e($activeTab === 'manual' ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg dark:bg-white dark:border-white dark:text-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-white shadow-sm'); ?>">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center border <?php echo e($activeTab === 'manual' ? 'bg-white/10 border-white/20' : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700'); ?>">
                        <i class="fas fa-keyboard text-sm"></i>
                    </div>
                    <div class="flex flex-col items-start transition-transform group-hover:translate-x-1">
                        <span class="text-xs font-bold uppercase tracking-widest">Manual Entry</span>
                        <span class="text-[9px] opacity-60">Add questions manually</span>
                    </div>
                </button>

                <button wire:click="$set('activeTab', 'bank')" class="group flex items-center gap-3 p-4 rounded-2xl transition-all border <?php echo e($activeTab === 'bank' ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg dark:bg-white dark:border-white dark:text-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-white shadow-sm'); ?>">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center border <?php echo e($activeTab === 'bank' ? 'bg-white/10 border-white/20' : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700'); ?>">
                        <i class="fas fa-database text-sm"></i>
                    </div>
                    <div class="flex flex-col items-start transition-transform group-hover:translate-x-1">
                        <span class="text-xs font-bold uppercase tracking-widest">Question Bank</span>
                        <span class="text-[9px] opacity-60">Import from your courses</span>
                    </div>
                </button>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->canAccessAI): ?>
                <button wire:click="$set('activeTab', 'ai_generator')" class="group flex items-center gap-3 p-4 rounded-2xl transition-all border <?php echo e($activeTab === 'ai_generator' ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg dark:bg-white dark:border-white dark:text-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-white shadow-sm'); ?>">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center border <?php echo e($activeTab === 'ai_generator' ? 'bg-white/10 border-white/20' : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700'); ?>">
                        <i class="fas fa-brain text-sm"></i>
                    </div>
                    <div class="flex flex-col items-start transition-transform group-hover:translate-x-1">
                        <span class="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Generator</span>
                        <span class="text-[9px] opacity-60">Generate with Intelligence</span>
                    </div>
                </button>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>

        <div class="flex-1 min-w-0">
            <div class="relative min-h-[500px]">
                <!-- Tab Specific Loading Overlay -->
                <div wire:loading.flex wire:target="activeTab, reorderQuestions, deleteQuestion, addQuestion" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
                    <div class="flex flex-col items-center gap-4">
                        <div class="w-12 h-12 border-4 border-zinc-900/10 dark:border-white/10 border-t-zinc-900 dark:border-t-white rounded-full animate-spin"></div>
                        <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Loading...</p>
                    </div>
                </div>

                <div class="animate-fadeIn">
                    <?php echo $__env->make('livewire.partials.exam-questions-review', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <?php echo $__env->make('livewire.partials.exam-questions-manual', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <?php echo $__env->make('livewire.partials.exam-questions-bank', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <?php echo $__env->make('livewire.partials.exam-questions-ai', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Question Preview Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showQuestionPreview && $previewQuestion): ?>
        <?php echo $__env->make('livewire.partials.question-preview-modal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

</div>

<?php $__env->startPush('scripts'); ?>
<script>
    // Handle sortable questions for reordering
    if (typeof Sortable !== 'undefined') {
        const initSortable = () => {
            const sortable = document.getElementById('sortable-questions');
            if (sortable) {
                Sortable.create(sortable, {
                    ghostClass: 'sortable-ghost',
                    animation: 200,
                    handle: '.drag-handle',
                    onEnd: function(evt) {
                        const orders = Array.from(sortable.children).map((el, idx) => ({
                            id: el.dataset.id,
                            order: idx
                        }));
                        Livewire.dispatch('reorderQuestions', { orders });
                    }
                });
            }
        };

        initSortable();
        document.addEventListener('livewire:load', initSortable);
        document.addEventListener('livewire:navigated', initSortable);
    }
</script>
<?php $__env->stopPush(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\lecturer-exam-questions.blade.php ENDPATH**/ ?>