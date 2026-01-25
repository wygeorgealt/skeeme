<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Practice Exams</h1>
            <p class="text-gray-600">Strengthen your skills with unlimited practice exams and instant feedback</p>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-book text-blue-600 text-2xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm font-medium">Total Attempts</p>
                        <p class="text-2xl font-bold text-gray-900"><?php echo e($practiceStats['total_attempts'] ?? 0); ?></p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-chart-line text-green-600 text-2xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm font-medium">Average Score</p>
                        <p class="text-2xl font-bold text-gray-900"><?php echo e(round($practiceStats['avg_score'] ?? 0, 1)); ?>%</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-star text-yellow-600 text-2xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm font-medium">Best Score</p>
                        <p class="text-2xl font-bold text-gray-900"><?php echo e($practiceStats['best_score'] ?? 0); ?>%</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-clock text-purple-600 text-2xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm font-medium">Time Spent</p>
                        <p class="text-2xl font-bold text-gray-900"><?php echo e(round(($practiceStats['total_time_spent'] ?? 0) / 3600, 1)); ?>h</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-arrow-trend-up <?php echo e($practiceStats['improvement_trend'] > 0 ? 'text-green-600' : 'text-red-600'); ?> text-2xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm font-medium">Improvement</p>
                        <p class="text-2xl font-bold <?php echo e($practiceStats['improvement_trend'] > 0 ? 'text-green-600' : 'text-red-600'); ?>">
                            <?php echo e($practiceStats['improvement_trend'] > 0 ? '+' : ''); ?><?php echo e($practiceStats['improvement_trend']); ?>%
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Learning Insights -->
        <?php $insights = $this->getLearningInsights(); ?>
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($insights)): ?>
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-4">📊 Learning Insights</h2>
                <div class="space-y-3">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $insights; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $insight): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="p-4 rounded-lg <?php echo e($insight['type'] === 'strength' ? 'bg-green-50 border-l-4 border-green-500' :
                            ($insight['type'] === 'progress' ? 'bg-blue-50 border-l-4 border-blue-500' :
                            ($insight['type'] === 'attention' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                            'bg-gray-50 border-l-4 border-gray-500'))); ?>">
                            <p class="text-sm text-gray-800"><?php echo e($insight['message']); ?></p>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Available Practice Exams -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900">Available Practice Exams</h2>
                    </div>

                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($availablePracticeExams)): ?>
                        <div class="divide-y divide-gray-200">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $availablePracticeExams; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $exam): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="p-6 hover:bg-blue-50 transition">
                                    <div class="flex justify-between items-start gap-4">
                                        <div class="flex-1 min-w-0">
                                            <h3 class="text-lg font-semibold text-gray-900 mb-2"><?php echo e($exam['title']); ?></h3>
                                            <p class="text-gray-600 text-sm mb-3"><?php echo e($exam['description'] ?? 'Practice exam'); ?></p>

                                            <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                                <span><i class="fas fa-clock text-blue-600 mr-1"></i><?php echo e($exam['duration'] ?? '60'); ?> min</span>
                                                <span><i class="fas fa-star text-yellow-600 mr-1"></i><?php echo e($exam['total_marks'] ?? '100'); ?> marks</span>
                                                <span><i class="fas fa-book text-purple-600 mr-1"></i><?php echo e($exam['question_count']); ?> questions</span>
                                                <span><i class="fas fa-signal text-green-600 mr-1"></i><?php echo e(ucfirst($exam['difficulty'])); ?></span>
                                            </div>

                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($exam['attempts'] > 0): ?>
                                                <div class="bg-blue-50 rounded p-3">
                                                    <p class="text-sm text-blue-900">
                                                        <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                                                        Attempted <?php echo e($exam['attempts']); ?> time<?php echo e($exam['attempts'] > 1 ? 's' : ''); ?> 
                                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($exam['best_score']): ?>
                                                            - Best Score: <strong><?php echo e($exam['best_score']); ?>%</strong>
                                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                                    </p>
                                                </div>
                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        </div>

                                        <div class="flex-shrink-0">
                                            <button 
                                                wire:click="retryPracticeExam(<?php echo e($exam['id']); ?>)"
                                                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
                                            >
                                                <i class="fas fa-play mr-2"></i><?php echo e($exam['attempts'] > 0 ? 'Retry' : 'Start'); ?>

                                            </button>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="p-6 text-center">
                            <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600">No practice exams available yet.</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>

            <!-- Performance by Difficulty -->
            <div class="space-y-6">
                <!-- Difficulty Performance -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Performance by Difficulty</h3>
                    <?php $difficultyMetrics = $this->getDifficultyMetrics(); ?>
                    <div class="space-y-4">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = ['Easy', 'Medium', 'Hard']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $difficulty): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <div class="border rounded-lg p-4">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="font-semibold text-gray-900"><?php echo e($difficulty); ?></span>
                                    <span class="text-2xl font-bold <?php echo e($difficultyMetrics[$difficulty]['avg_score'] >= 80 ? 'text-green-600' :
                                        ($difficultyMetrics[$difficulty]['avg_score'] >= 60 ? 'text-yellow-600' : 'text-red-600')); ?>">
                                        <?php echo e(round($difficultyMetrics[$difficulty]['avg_score'], 1)); ?>%
                                    </span>
                                </div>

                                <div class="space-y-1 text-xs text-gray-600">
                                    <p>Attempts: <?php echo e($difficultyMetrics[$difficulty]['attempts']); ?></p>
                                    <p>Best: <?php echo e($difficultyMetrics[$difficulty]['best_score'] ?? 'N/A'); ?>%</p>
                                </div>

                                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div class="bg-blue-600 h-2 rounded-full transition-all" 
                                         style="width: <?php echo e($difficultyMetrics[$difficulty]['avg_score'] ?? 0); ?>%">
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>
                </div>

                <!-- Recommended Next Exam -->
                <?php $recommendedExam = $this->getRecommendedExam(); ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($recommendedExam): ?>
                    <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow p-6 border border-purple-200">
                        <h3 class="text-lg font-bold text-gray-900 mb-3">
                            <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>Recommended Next
                        </h3>
                        <div class="bg-white rounded-lg p-4 mb-4">
                            <p class="font-semibold text-gray-900"><?php echo e($recommendedExam['title']); ?></p>
                            <p class="text-sm text-gray-600 mt-1"><?php echo e(ucfirst($recommendedExam['difficulty'])); ?> Level</p>
                        </div>
                        <button 
                            wire:click="retryPracticeExam(<?php echo e($recommendedExam['id']); ?>)"
                            class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                        >
                            <i class="fas fa-play mr-2"></i>Start Now
                        </button>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
    </div>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\practice-exams.blade.php ENDPATH**/ ?>