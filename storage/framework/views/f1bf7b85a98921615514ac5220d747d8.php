<div class="exam-delivery-container">
        <!-- Header with Timer and Progress -->
        <div class="exam-header bg-white shadow-md p-4 sticky top-0 z-10">
        <div class="flex justify-between items-center gap-4 flex-wrap md:flex-nowrap">
            <div class="flex-1 min-w-0">
                <h2 class="text-xl font-bold truncate"><?php echo e($session->exam->title); ?></h2>
                <p class="text-sm text-gray-600">Question <?php echo e($currentQuestionIndex + 1); ?> of <?php echo e($totalQuestions); ?></p>
            </div>

            <!-- Timer -->
            <div class="text-center flex-shrink-0">
                <div class="text-2xl md:text-3xl font-mono font-bold <?php echo e($timeRemaining <= 300 ? 'text-red-600' : 'text-blue-600'); ?>">
                    <?php echo e($this->getFormattedTime()); ?>

                </div>
                <p class="text-xs text-gray-600">Time Remaining</p>
            </div>

            <!-- Progress (hidden on mobile) -->
            <div class="w-32 hidden md:block flex-shrink-0">
                <div class="text-right text-sm font-semibold mb-2"><?php echo e($this->getProgressPercentage()); ?>%</div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                         style="width: <?php echo e($this->getProgressPercentage()); ?>%"></div>
                </div>
            </div>

            <!-- Mobile Menu Button -->
            <button type="button" class="md:hidden p-2 hover:bg-gray-100 rounded-lg" title="Keyboard help (Press ?)">
                <i class="fas fa-keyboard text-gray-600"></i>
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto">
        <!-- Question Panel -->
        <div class="flex-1 min-w-0">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($currentQuestion): ?>
                <div class="bg-white rounded-lg shadow-md p-8">
                    <!-- Question Text -->
                    <div class="mb-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-semibold">
                                    Question <?php echo e($currentQuestionIndex + 1); ?>

                                    <span class="text-sm font-normal text-gray-600">
                                        (<?php echo e($currentQuestion['marks'] ?? 1); ?> mark<?php echo e($currentQuestion['marks'] > 1 ? 's' : ''); ?>)
                                    </span>
                                </h3>
                            </div>
                            <!-- Flag Button -->
                            <button type="button" 
                                    wire:click="toggleFlagQuestion"
                                    title="Flag for review (Keyboard: F)"
                                    class="flex-shrink-0 px-3 py-2 rounded-lg transition-colors <?php echo e($this->isQuestionFlagged($currentQuestionIndex) ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'); ?>">
                                <i class="fas fa-flag mr-2"></i><span class="hidden sm:inline"><?php echo e($this->isQuestionFlagged($currentQuestionIndex) ? 'Flagged' : 'Flag'); ?></span>
                            </button>
                        </div>
                        <div class="text-base leading-relaxed">
                            <?php echo e($currentQuestion['question_text']); ?>

                        </div>
                    </div>

                    <!-- Answer Area -->
                    <div class="mb-8">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($currentQuestion['type'] === 'multiple_choice' || $currentQuestion['type'] === 'mcq'): ?>
                            <!-- MCQ Options -->
                            <div class="space-y-3">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $currentQuestion['options']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $option): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                                           :class="{ 'border-blue-500 bg-blue-50': $answers[$currentQuestionIndex] === '<?php echo e($option['id'] ?? $index); ?>' }">
                                        <input type="radio"
                                               name="answer"
                                               value="<?php echo e($option['id'] ?? $index); ?>"
                                               <?php if($answers[$currentQuestionIndex] === ($option['id'] ?? $index)): ?> checked <?php endif; ?>
                                               wire:change="saveAnswer($event.target.value)"
                                               class="w-4 h-4 text-blue-600">
                                        <span class="ml-3 text-sm"><?php echo e($option['text'] ?? $option); ?></span>
                                    </label>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </div>
                        <?php elseif($currentQuestion['type'] === 'essay'): ?>
                            <!-- Essay Response -->
                            <textarea wire:model.debounce-500ms="answers.<?php echo e($currentQuestionIndex); ?>"
                                      wire:change="saveAnswer($event.target.value)"
                                      rows="8"
                                      placeholder="Type your answer here..."
                                      class="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"><?php echo e($answers[$currentQuestionIndex] ?? ''); ?></textarea>
                            <p class="text-xs text-gray-500 mt-2"><?php echo e(strlen($answers[$currentQuestionIndex] ?? '')); ?> characters</p>
                        <?php elseif($currentQuestion['type'] === 'true_false'): ?>
                            <!-- True/False -->
                            <div class="space-y-3 flex gap-4">
                                <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-400 flex-1"
                                       :class="{ 'border-green-500 bg-green-50': $answers[$currentQuestionIndex] === 'true' }">
                                    <input type="radio"
                                           name="answer"
                                           value="true"
                                           <?php if($answers[$currentQuestionIndex] === 'true'): ?> checked <?php endif; ?>
                                           wire:change="saveAnswer('true')"
                                           class="w-4 h-4 text-green-600">
                                    <span class="ml-3 text-sm font-semibold">True</span>
                                </label>
                                <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-400 flex-1"
                                       :class="{ 'border-red-500 bg-red-50': $answers[$currentQuestionIndex] === 'false' }">
                                    <input type="radio"
                                           name="answer"
                                           value="false"
                                           <?php if($answers[$currentQuestionIndex] === 'false'): ?> checked <?php endif; ?>
                                           wire:change="saveAnswer('false')"
                                           class="w-4 h-4 text-red-600">
                                    <span class="ml-3 text-sm font-semibold">False</span>
                                </label>
                            </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 gap-3 flex-wrap md:flex-nowrap">
                        <button wire:click="previousQuestion"
                                <?php if($currentQuestionIndex === 0): ?> disabled <?php endif; ?>
                                title="Previous question (Keyboard: ← or A)"
                                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base">
                            ← Previous
                        </button>

                        <div class="text-sm text-gray-600 text-center">
                            <?php echo e($currentQuestionIndex + 1); ?> / <?php echo e($totalQuestions); ?>

                        </div>

                        <button wire:click="nextQuestion"
                                <?php if($currentQuestionIndex === $totalQuestions - 1): ?> disabled <?php endif; ?>
                                title="Next question (Keyboard: → or D)"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base">
                            Next →
                        </button>

                        <!-- Preview and Help buttons (mobile friendly) -->
                        <button wire:click="toggleAnswerPreview"
                                title="Preview answers (Keyboard: P)"
                                class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <i class="fas fa-eye mr-1"></i><span class="hidden sm:inline">Preview</span>
                        </button>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

        <!-- Side Navigation Panel (hidden on mobile, shown as modal) -->
        <div class="w-full md:w-64 flex-shrink-0">
            <div class="bg-white rounded-lg shadow-md p-4 sticky top-24">
                <h4 class="font-semibold mb-4">Questions <?php echo e($answeredCount); ?>/<?php echo e($totalQuestions); ?></h4>
                <div class="grid grid-cols-4 md:grid-cols-5 gap-2 mb-6">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php for($i = 0; $i < $totalQuestions; $i++): ?>
                        <button wire:click="goToQuestion(<?php echo e($i); ?>)"
                                title="Question <?php echo e($i + 1); ?><?php echo e($this->isQuestionFlagged($i) ? ' (Flagged)' : ''); ?>"
                                class="relative w-full aspect-square rounded-lg font-semibold text-sm transition-colors
                                    <?php echo e($i === $currentQuestionIndex ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 
                                       ($this->isQuestionAnswered($i) ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200')); ?>">
                            <?php echo e($i + 1); ?>

                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->isQuestionFlagged($i)): ?>
                                <span class="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </button>
                    <?php endfor; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>

                <!-- Quick Stats -->
                <div class="bg-blue-50 rounded-lg p-3 mb-4 text-sm space-y-2">
                    <div class="flex justify-between">
                        <span>Answered:</span>
                        <strong><?php echo e($answeredCount); ?>/<?php echo e($totalQuestions); ?></strong>
                    </div>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($flaggedCount > 0): ?>
                        <div class="flex justify-between text-yellow-700">
                            <span>Flagged:</span>
                            <strong><?php echo e($flaggedCount); ?></strong>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>

                <!-- Legend -->
                <div class="text-xs space-y-2 border-t pt-4 mb-4">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-gray-100 rounded"></div>
                        <span>Not Answered</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-green-100 rounded"></div>
                        <span>Answered</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-blue-600 rounded"></div>
                        <span>Current</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Flagged</span>
                    </div>
                </div>

                <!-- Submit Button -->
                <button wire:click="confirmSubmit"
                        class="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors text-sm md:text-base">
                    <i class="fas fa-paper-plane mr-2"></i>Submit Exam
                </button>
            </div>
        </div>
    </div>

    <!-- Answer Preview Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showAnswerPreview): ?>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Answer Preview</h3>
                    <button wire:click="toggleAnswerPreview"
                            class="text-gray-500 hover:text-gray-700 transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-4 space-y-3">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $answerSummary; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                             wire:click="goToQuestion(<?php echo e($index); ?>)">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1">
                                    <p class="font-semibold text-sm">Q<?php echo e($index + 1); ?>: <?php echo e($item['question']); ?></p>
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($item['answered']): ?>
                                        <p class="text-sm text-gray-600 mt-1">
                                            <span class="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-2">Answered</span>
                                            <span class="text-gray-700"><?php echo e($item['answer']); ?></span>
                                        </p>
                                    <?php else: ?>
                                        <p class="text-sm text-gray-400 mt-1"><span class="inline-block px-2 py-1 bg-gray-100 rounded text-xs">Not answered</span></p>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($item['flagged']): ?>
                                    <span class="text-yellow-500 text-lg flex-shrink-0"><i class="fas fa-flag"></i></span>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Submit Confirmation Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showConfirmSubmit): ?>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-8 max-w-md">
                <h3 class="text-lg font-semibold mb-4">Confirm Submission</h3>
                <p class="text-gray-600 mb-2">You have answered <strong><?php echo e(count(array_filter($answers))); ?></strong> of <strong><?php echo e($totalQuestions); ?></strong> questions.</p>
                <p class="text-gray-600 mb-6">Are you sure you want to submit your exam? You cannot make changes after submission.</p>
                <div class="flex gap-4 justify-end">
                    <button wire:click="cancelSubmit"
                            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    <button wire:click="submit"
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Submit Exam
                    </button>
                </div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Session Expired Notification -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$session->isActive()): ?>
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                <h3 class="text-lg font-semibold text-red-600 mb-4">Exam Session Ended</h3>
                <p class="text-gray-600 mb-6">
                    Your exam has been <?php echo e($session->status === 'submitted' ? 'submitted' : ($session->status === 'abandoned' ? 'abandoned' : 'ended')); ?>.
                    Your responses have been saved.
                </p>
                <a href="<?php echo e(route('student.exams.results', $session)); ?>"
                   class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Results
                </a>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
</div>

<?php $__env->startPush('scripts'); ?>
<script>
    document.addEventListener('livewire:navigated', function() {
        // Auto-update timer every second
        setInterval(() => {
            window.Livewire.find('<?php echo e($_instance->getId()); ?>').dispatch('timer');
        }, 1000);

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Only trigger if not in a text input/textarea (except for specific cases)
            const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            
            // Arrow keys / A, D for navigation
            if (e.key === 'ArrowRight' || (e.key.toLowerCase() === 'd' && !isInput)) {
                e.preventDefault();
                window.Livewire.find('<?php echo e($_instance->getId()); ?>').call('nextQuestion');
            } else if (e.key === 'ArrowLeft' || (e.key.toLowerCase() === 'a' && !isInput)) {
                e.preventDefault();
                window.Livewire.find('<?php echo e($_instance->getId()); ?>').call('previousQuestion');
            }
            
            // F for flag
            if (e.key.toLowerCase() === 'f' && !isInput) {
                e.preventDefault();
                window.Livewire.find('<?php echo e($_instance->getId()); ?>').call('toggleFlagQuestion');
            }
            
            // P for preview
            if (e.key.toLowerCase() === 'p' && !isInput) {
                e.preventDefault();
                window.Livewire.find('<?php echo e($_instance->getId()); ?>').call('toggleAnswerPreview');
            }
            
            // ? or / for help
            if ((e.key === '?' || e.key === '/') && !isInput) {
                e.preventDefault();
                showKeyboardHelp();
            }
        });
    });

    // Save answers before leaving page
    window.addEventListener('beforeunload', function(e) {
        if (<?php echo \Illuminate\Support\Js::from($session->isActive())->toHtml() ?>) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    function showKeyboardHelp() {
        alert('⌨️ Keyboard Shortcuts:\n\n' +
              '→ or D: Next question\n' +
              '← or A: Previous question\n' +
              'F: Flag question for review\n' +
              'P: Preview all answers\n' +
              '?: Show this help\n\n' +
              'Answers auto-save as you type!');
    }
</script>

<script>
    // Request fullscreen on component load
    document.addEventListener('DOMContentLoaded', function() {
        requestFullscreenMode();
    });

    document.addEventListener('livewire:navigated', function() {
        requestFullscreenMode();
    });

    function requestFullscreenMode() {
        const element = document.documentElement;
        const container = document.querySelector('.exam-delivery-container');
        
        // Try to go fullscreen
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.log('Fullscreen request denied:', err);
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }

        // Add fullscreen class to container
        if (container) {
            container.classList.add('fullscreen');
        }

        // Lock screen orientation if possible
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait-primary').catch(err => {
                console.log('Could not lock orientation:', err);
            });
        }
    }

    // Handle fullscreen exit
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            // User exited fullscreen - warn them
            showFullscreenWarning();
        }
    });

    function showFullscreenWarning() {
        const confirmed = confirm('⚠️ Fullscreen mode exited. Please enable fullscreen to continue the exam.');
        if (confirmed) {
            requestFullscreenMode();
        }
    }

    // Prevent right-click in exam mode
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Warn on page unload
    window.addEventListener('beforeunload', function(e) {
        const isExamActive = document.querySelector('.exam-delivery-container') !== null;
        if (isExamActive) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
</script>
<?php $__env->stopPush(); ?>

    <?php
        $__assetKey = '3072897931-0';

        ob_start();
    ?>
<style>
    .exam-delivery-container {
        background-color: #f9fafb;
        min-height: 100vh;
    }

    html.fullscreen-mode {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    body.exam-mode-active {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    @media (max-width: 768px) {
        .exam-header {
            position: sticky;
            top: 0;
            z-index: 10;
        }
    }

    /* Fullscreen mode styles */
    .exam-delivery-container.fullscreen {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .exam-delivery-container.fullscreen .exam-header {
        flex-shrink: 0;
        height: auto;
    }

    .exam-delivery-container.fullscreen > div:nth-child(2) {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>
    <?php
        $__output = ob_get_clean();

        // If the asset has already been loaded anywhere during this request, skip it...
        if (in_array($__assetKey, \Livewire\Features\SupportScriptsAndAssets\SupportScriptsAndAssets::$alreadyRunAssetKeys)) {
            // Skip it...
        } else {
            \Livewire\Features\SupportScriptsAndAssets\SupportScriptsAndAssets::$alreadyRunAssetKeys[] = $__assetKey;

            // Check if we're in a Livewire component or not and store the asset accordingly...
            if (isset($this)) {
                \Livewire\store($this)->push('assets', $__output, $__assetKey);
            } else {
                \Livewire\Features\SupportScriptsAndAssets\SupportScriptsAndAssets::$nonLivewireAssets[$__assetKey] = $__output;
            }
        }
    ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/livewire/student-exam-delivery.blade.php ENDPATH**/ ?>