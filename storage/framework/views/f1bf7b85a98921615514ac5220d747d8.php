<div 
    x-data="examDelivery(<?php echo e(Js::from([
        'timer' => $timeRemaining,
        'questions' => $this->getAllQuestionsForClientSide(),
        'answers' => (object) $answers,
        'flaggedQuestions' => $flaggedQuestions,
        'sessionId' => $session->id,
        'examTitle' => $session->exam->title,
        'totalQuestions' => $totalQuestions,
        'currentIndex' => $currentQuestionIndex,
    ])); ?>)"
    class="exam-delivery-wrapper"
    x-cloak
>
    <!-- Fullscreen Start Overlay -->
    <div x-show="!examStarted" 
         class="fixed inset-0 z-[100] bg-zinc-900 flex flex-col items-center justify-center p-4 text-center transition-opacity"
         x-transition:leave="duration-300 opacity-0">
        
        <div class="bg-white dark:bg-zinc-800 rounded-xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-700">
            <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                <i class="fas fa-expand text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Ready to Start?</h2>
            <p class="text-zinc-500 dark:text-zinc-400 mb-8">This exam requires fullscreen mode. Click below to begin your assessment.</p>
            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => 'startExam()','variant' => 'primary','class' => 'w-full justify-center']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'startExam()','variant' => 'primary','class' => 'w-full justify-center']); ?>Enter Fullscreen & Start <?php echo $__env->renderComponent(); ?>
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

    <!-- Main Exam Interface -->
    <div x-show="examStarted && !$wire.showReviewPage" class="min-h-screen bg-white dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <div class="max-w-[1600px] mx-auto">
            
            <!-- Header Section -->
            <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100" x-text="examTitle"></h1>
                    <p class="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Live Exam
                        </span>
                        <span>&bull;</span>
                        <span>Question <span x-text="currentIndex + 1"></span> of <span x-text="totalQuestions"></span></span>
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <!-- Timer Pill -->
                    <div class="flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <i class="fas fa-clock text-zinc-500"></i>
                        <span class="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-lg tabular-nums" 
                              x-text="formattedTime" 
                              :class="{ 'text-red-500 animate-pulse': timer < 300 }"></span>
                    </div>
                    
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => 'toggleFullscreen()','variant' => 'ghost']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'toggleFullscreen()','variant' => 'ghost']); ?>
                        <i class="fas fa-expand mr-2"></i> Fullscreen
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => '$wire.goToReview()','variant' => 'primary']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => '$wire.goToReview()','variant' => 'primary']); ?>Submit Exam <?php echo $__env->renderComponent(); ?>
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

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Main Question Area -->
                <div class="lg:col-span-8 flex flex-col gap-6">
                    <template x-if="currentQuestion">
                        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <!-- Question Header -->
                            <div class="p-4 md:px-8 md:py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Question <span x-text="currentIndex + 1"></span></span>
                                    <span class="px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                        <span x-text="currentQuestion.marks"></span> Mark<span x-show="currentQuestion.marks > 1">s</span>
                                    </span>
                                </div>
                                <button @click="toggleFlag()" 
                                        class="flex items-center gap-2 text-sm font-medium transition-colors"
                                        :class="isFlagged ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'">
                                    <i class="fas" :class="isFlagged ? 'fa-flag' : 'fa-flag'"></i>
                                    Flag
                                </button>
                            </div>

                            <!-- Question Content -->
                            <div class="p-6 md:p-8">
                                <div class="prose prose-zinc dark:prose-invert max-w-none mb-8">
                                    <h3 class="text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed" x-html="currentQuestion.text.replace(/\n/g, '<br>')"></h3>
                                    <template x-if="currentQuestion.image_path">
                                        <img :src="currentQuestion.image_path" class="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-700 max-h-96 object-contain">
                                    </template>
                                </div>

                                <!-- Answer Input Area -->
                                <div class="space-y-4">
                                    <!-- MCQ Options -->
                                    <template x-if="['multiple_choice', 'mcq'].includes(currentQuestion.type)">
                                        <div class="grid grid-cols-1 gap-3">
                                            <template x-for="(option, optIndex) in currentQuestion.options" :key="optIndex">
                                                <label class="group relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
                                                       :class="answers[currentIndex] == option.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 bg-transparent'">
                                                    <input type="radio" 
                                                           :name="'answer_' + currentIndex" 
                                                           :value="option.id" 
                                                           @click="selectAnswer(option.id)" 
                                                           class="sr-only"
                                                           :checked="answers[currentIndex] == option.id">
                                                    <div class="flex items-center gap-4 w-full">
                                                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                                                             :class="answers[currentIndex] == option.id ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-300 dark:border-zinc-600'">
                                                            <i x-show="answers[currentIndex] == option.id" class="fas fa-check text-[10px] text-white"></i>
                                                        </div>
                                                        <span class="text-base"
                                                              :class="answers[currentIndex] == option.id ? 'font-medium text-indigo-900 dark:text-indigo-100' : 'text-zinc-600 dark:text-zinc-400'"
                                                              x-text="option.text"></span>
                                                    </div>
                                                </label>
                                            </template>
                                        </div>
                                    </template>

                                    <!-- Essay/Theory -->
                                    <template x-if="['essay', 'theory', 'short_answer', 'fill_blank'].includes(currentQuestion.type)">
                                        <div>
                                            <textarea 
                                                x-model="answers[currentIndex]"
                                                @input.debounce.500ms="saveCurrentAnswer()"
                                                rows="10"
                                                placeholder="Type your answer here..."
                                                class="w-full font-mono text-sm leading-relaxed rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                                            <div class="flex justify-end mt-2">
                                                <span class="text-xs text-zinc-500" x-text="(answers[currentIndex] || '').length + ' chars'"></span>
                                            </div>
                                        </div>
                                    </template>

                                    <!-- True/False -->
                                    <template x-if="['true_false', 'boolean'].includes(currentQuestion.type)">
                                        <div class="grid grid-cols-2 gap-4">
                                            <template x-for="(label, val) in {true: 'True', false: 'False'}" :key="val">
                                                <label class="flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200"
                                                       :class="answers[currentIndex] === val 
                                                           ? (val === 'true' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-red-500 bg-red-50 dark:bg-red-500/10')
                                                           : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'">
                                                    <input type="radio" 
                                                           :name="'answer_' + currentIndex" 
                                                           :value="val"
                                                           @click="selectAnswer(val)"
                                                           class="sr-only">
                                                    <span class="text-xl font-bold mb-2"
                                                          :class="answers[currentIndex] === val 
                                                              ? (val === 'true' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')
                                                              : 'text-zinc-500 dark:text-zinc-400'"
                                                          x-text="label"></span>
                                                    <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                                                         :class="answers[currentIndex] === val 
                                                             ? (val === 'true' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-red-500 bg-red-500 text-white')
                                                             : 'border-zinc-300 dark:border-zinc-600'">
                                                        <i x-show="answers[currentIndex] === val" class="fas fa-check text-xs"></i>
                                                    </div>
                                                </label>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            
                            <!-- Card Footer -->
                            <div class="bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 p-4 md:px-8 md:py-4 flex items-center justify-between">
                                 <button 
                                    @click="previousQuestion()"
                                    :disabled="currentIndex === 0"
                                    class="px-4 py-2 rounded-lg text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <i class="fas fa-arrow-left"></i> Previous
                                </button>
        
                                 <button 
                                    @click="nextQuestion()"
                                    :disabled="currentIndex === totalQuestions - 1"
                                    class="px-6 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    Next Question <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Sidebar -->
                <div class="lg:col-span-4 space-y-4">
                    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden sticky top-8">
                        <div class="p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 class="font-bold text-zinc-900 dark:text-white">Question Map</h3>
                            <div class="flex gap-3 mt-2 text-xs">
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Current</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Done</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></span> Queue</span>
                            </div>
                        </div>
                        
                        <div class="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                             <div class="grid grid-cols-5 gap-2">
                                <template x-for="(q, i) in questions" :key="i">
                                    <button 
                                        @click="goToQuestion(i)"
                                        class="relative aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all border"
                                        :class="{
                                            'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20': currentIndex === i,
                                            'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50': currentIndex !== i && isAnswered(i),
                                            'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500': currentIndex !== i && !isAnswered(i)
                                        }"
                                    >
                                        <span x-text="i + 1"></span>
                                        <div x-show="flaggedQuestions.includes(i)" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                                    </button>
                                </template>
                             </div>
                        </div>

                        <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                            <div class="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                 <span>Progress</span>
                                 <span class="text-zinc-900 dark:text-zinc-200 font-bold"><span x-text="getAnsweredCount()"></span> / <span x-text="totalQuestions"></span></span>
                            </div>
                            <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mb-4">
                                 <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" :style="'width: ' + (getAnsweredCount() / totalQuestions * 100) + '%'"></div>
                            </div>
                             <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => '$wire.goToReview()','class' => 'w-full']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => '$wire.goToReview()','class' => 'w-full']); ?>Submit All Answers <?php echo $__env->renderComponent(); ?>
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

        </div>
    </div>

    <!-- Review Page -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showReviewPage): ?>
    <div class="min-h-screen bg-white dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div class="max-w-4xl mx-auto">
            <div class="mb-12 text-center">
                <h1 class="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">Review Your Answers</h1>
                <p class="text-zinc-500 dark:text-zinc-400">Please carefully check your work before final submission.</p>
            </div>

            <div class="space-y-6 mb-12">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->getAllQuestionsForClientSide(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $q): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div class="bg-white dark:bg-zinc-900 rounded-xl border <?php echo e(isset($answers[$index]) && $answers[$index] !== '' ? 'border-zinc-200 dark:border-zinc-800' : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10'); ?> p-6 shadow-sm">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Question <?php echo e($index + 1); ?></span>
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($answers[$index]) && $answers[$index] !== ''): ?>
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <i class="fas fa-check"></i> ANSWERED
                                        </span>
                                    <?php else: ?>
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                            <i class="fas fa-exclamation-circle"></i> NOT ANSWERED
                                        </span>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                                <h4 class="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4"><?php echo nl2br(e($q['text'])); ?></h4>
                                
                                <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
                                    <span class="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-tight">Your Answer:</span>
                                    <div class="text-zinc-700 dark:text-zinc-300 italic">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($answers[$index]) && $answers[$index] !== ''): ?>
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($q['type'] === 'multiple_choice' || $q['type'] === 'mcq'): ?>
                                                <?php
                                                    $selectedOption = collect($q['options'])->firstWhere('id', $answers[$index]);
                                                ?>
                                                <?php echo e($selectedOption['text'] ?? 'Unknown Option'); ?>

                                            <?php elseif($q['type'] === 'true_false' || $q['type'] === 'boolean'): ?>
                                                <?php echo e(ucfirst($answers[$index])); ?>

                                            <?php else: ?>
                                                <?php echo nl2br(e($answers[$index])); ?>

                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        <?php else: ?>
                                            <span class="text-zinc-400">— No answer provided —</span>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </div>
                                </div>
                            </div>
                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => '$wire.set(\'showReviewPage\', false); goToQuestion('.e($index).')','variant' => 'ghost','size' => 'sm','class' => 'flex-shrink-0']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => '$wire.set(\'showReviewPage\', false); goToQuestion('.e($index).')','variant' => 'ghost','size' => 'sm','class' => 'flex-shrink-0']); ?>
                                Edit
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
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                <div class="text-center sm:text-left">
                    <h3 class="text-xl font-bold text-indigo-900 dark:text-indigo-400 mb-1">Finished Reviewing?</h3>
                    <p class="text-indigo-700/60 dark:text-indigo-400/60 text-sm">Once you confirm, you cannot change your answers.</p>
                </div>
                <div class="flex gap-4 w-full sm:w-auto">
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => '$wire.backToExam()','variant' => 'ghost','class' => 'flex-1 sm:flex-initial']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => '$wire.backToExam()','variant' => 'ghost','class' => 'flex-1 sm:flex-initial']); ?>Back to Exam <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => 'Flux.modal(\'confirm-submit\').show()','variant' => 'primary','class' => 'flex-1 sm:flex-initial !bg-indigo-600 !hover:bg-indigo-500']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'Flux.modal(\'confirm-submit\').show()','variant' => 'primary','class' => 'flex-1 sm:flex-initial !bg-indigo-600 !hover:bg-indigo-500']); ?>Confirm Submission <?php echo $__env->renderComponent(); ?>
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
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    
    <!-- Confirm Modal -->
    <?php if (isset($component)) { $__componentOriginal8cc9d3143946b992b324617832699c5f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8cc9d3143946b992b324617832699c5f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::modal.index','data' => ['name' => 'confirm-submit','class' => 'min-w-[400px]']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'confirm-submit','class' => 'min-w-[400px]']); ?>
         <div class="text-center mb-6">
            <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                <i class="fas fa-question-circle text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-1">Submit Assessment?</h3>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm">You are about to submit your answers. This action cannot be undone.</p>
        </div>
        
         <div class="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 mb-6">
             <div class="flex justify-between text-sm mb-1">
                 <span class="text-zinc-500 dark:text-zinc-400">Questions Answered</span>
                 <span class="text-zinc-900 dark:text-white font-bold"><span x-text="getAnsweredCount()"></span> / <span x-text="totalQuestions"></span></span>
             </div>
             <template x-if="getAnsweredCount() < totalQuestions">
                <div class="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 mt-2">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span x-text="(totalQuestions - getAnsweredCount()) + ' questions are still unanswered.'"></span>
                </div>
             </template>
         </div>

        <div class="flex gap-3">
            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => 'Flux.modal(\'confirm-submit\').close()','variant' => 'ghost','class' => 'flex-1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'Flux.modal(\'confirm-submit\').close()','variant' => 'ghost','class' => 'flex-1']); ?>Cancel <?php echo $__env->renderComponent(); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['@click' => 'submitExam()','variant' => 'primary','class' => 'flex-1']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['@click' => 'submitExam()','variant' => 'primary','class' => 'flex-1']); ?>Confirm Submit <?php echo $__env->renderComponent(); ?>
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
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8cc9d3143946b992b324617832699c5f)): ?>
<?php $attributes = $__attributesOriginal8cc9d3143946b992b324617832699c5f; ?>
<?php unset($__attributesOriginal8cc9d3143946b992b324617832699c5f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8cc9d3143946b992b324617832699c5f)): ?>
<?php $component = $__componentOriginal8cc9d3143946b992b324617832699c5f; ?>
<?php unset($__componentOriginal8cc9d3143946b992b324617832699c5f); ?>
<?php endif; ?>

    <!-- Session Ended Overlay -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$session->isActive()): ?>
         <div class="fixed inset-0 bg-zinc-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-xl border border-zinc-200 dark:border-zinc-800">
                <div class="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <i class="fas fa-clock text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-2">Time's Up!</h3>
                <p class="text-zinc-500 dark:text-zinc-400 mb-6">Your session has expired. We've saved your progress.</p>
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('student.exams.results', $session)).'','variant' => 'primary','class' => 'w-full justify-center']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('student.exams.results', $session)).'','variant' => 'primary','class' => 'w-full justify-center']); ?>View Results <?php echo $__env->renderComponent(); ?>
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
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
</div>

<?php $__env->startPush('scripts'); ?>
<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('examDelivery', (config) => ({
        timer: config.timer,
        timerInterval: null,
        isFullscreen: false,
        examStarted: false,
        questions: config.questions,
        answers: config.answers || {},
        flaggedQuestions: config.flaggedQuestions || [],
        sessionId: config.sessionId,
        examTitle: config.examTitle,
        totalQuestions: config.totalQuestions,
        currentIndex: config.currentIndex || 0,
        saving: false,
        heartbeatInterval: null,
        lastWarningShown: null,
        
        init() {
            this.startTimer();
            this.startHeartbeat();

            this.$cleanup(() => {
                this.stopTimer();
                this.stopHeartbeat();
            });

            this.$watch('timer', value => {
                this.checkWarnings(value);
                if (value <= 0) {
                    this.stopTimer();
                    this.stopHeartbeat();
                    this.forceSubmit();
                }
            });
        },

        checkWarnings(seconds) {
            if (seconds === 300 && this.lastWarningShown !== 300) { // 5 minutes
                this.showWarning("5 minutes remaining! Please start finalizing your answers.");
                this.lastWarningShown = 300;
            } else if (seconds === 60 && this.lastWarningShown !== 60) { // 1 minute
                this.showWarning("Only 1 minute left! The exam will auto-submit soon.");
                this.lastWarningShown = 60;
            } else if (seconds === 10 && this.lastWarningShown !== 10) { // 10 seconds
                 this.showWarning("10 seconds remaining! AUTO-SUBMITTING NOW.");
                 this.lastWarningShown = 10;
            }
        },

        showWarning(message) {
            // Use existing flux notification or standard alert for critical warnings
            if (window.Flux) {
                // Flash the timer red as well
            }
            // Standard browser notification for extreme cases or local toast
            console.warn(message);
             this.$dispatch('notify', {
                type: 'warning',
                message: message
            });
        },
        
        get currentQuestion() {
            return this.questions[this.currentIndex] || null;
        },
        
        get isFlagged() {
            return this.flaggedQuestions.includes(this.currentIndex);
        },
        
        get formattedTime() {
            const date = new Date(0);
            date.setSeconds(this.timer);
            return date.toISOString().substr(11, 8);
        },
        
        startExam() {
            this.examStarted = true;
            this.toggleFullscreen();
        },
        
        nextQuestion() {
            if (this.currentIndex < this.totalQuestions - 1) {
                this.currentIndex++;
            }
        },
        
        previousQuestion() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            }
        },
        
        goToQuestion(index) {
            if (index >= 0 && index < this.totalQuestions) {
                this.currentIndex = index;
            }
        },
        
        selectAnswer(value) {
            this.answers[this.currentIndex] = value;
            this.saveCurrentAnswer();
        },
        
        saveCurrentAnswer() {
            if (this.saving) return;
            this.saving = true;
            
            const answer = this.answers[this.currentIndex];
            if (answer !== undefined && answer !== null && answer !== '') {
                this.$wire.saveAnswer(this.currentIndex, answer);
            }
            
            setTimeout(() => { this.saving = false; }, 300);
        },
        
        toggleFlag() {
            const idx = this.flaggedQuestions.indexOf(this.currentIndex);
            if (idx > -1) {
                this.flaggedQuestions.splice(idx, 1);
            } else {
                this.flaggedQuestions.push(this.currentIndex);
            }
        },
        
        isAnswered(index) {
            const ans = this.answers[index];
            return ans !== undefined && ans !== null && ans !== '';
        },
        
        getAnsweredCount() {
            return Object.values(this.answers).filter(a => a !== undefined && a !== null && a !== '').length;
        },

        startTimer() {
            if (this.timerInterval) return;
            this.timerInterval = setInterval(() => {
                if (this.timer > 0) {
                    this.timer--;
                }
            }, 1000);
        },
        
        stopTimer() {
            clearInterval(this.timerInterval);
        },

        startHeartbeat() {
            if (this.heartbeatInterval) return;
            this.heartbeatInterval = setInterval(() => {
                this.$wire.heartbeat(this.currentIndex);
            }, 30000); // 30 seconds
        },

        stopHeartbeat() {
            clearInterval(this.heartbeatInterval);
        },
        
        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    this.isFullscreen = true;
                }).catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    this.isFullscreen = false;
                }
            }
        },
        
        forceSubmit() {
            this.$wire.forceSubmit();
        },
        
        submitExam() {
            Flux.modal('confirm-submit').close();
            this.$wire.submit();
        }
    }));
});

window.addEventListener('beforeunload', function(e) {
    if (<?php echo \Illuminate\Support\Js::from($session->isActive())->toHtml() ?>) { e.preventDefault(); e.returnValue = ''; }
});
</script>
<style>
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.3); border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(161, 161, 170, 0.5); }
    [x-cloak] { display: none !important; }
</style>
<?php $__env->stopPush(); ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/livewire/student-exam-delivery.blade.php ENDPATH**/ ?>