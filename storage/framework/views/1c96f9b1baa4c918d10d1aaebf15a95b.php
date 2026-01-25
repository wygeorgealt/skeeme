<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    Performance Analytics
                </h1>
                <p class="text-slate-400"><?php echo e($this->exam->title); ?></p>
            </div>
            <button 
                wire:click="$toggle('showExportModal')"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
                <span class="inline-block mr-2">📥</span> Export Report
            </button>
        </div>
    </div>

    <!-- Overview Statistics -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($classPerformance)): ?>
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <!-- Total Students -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Total Students</p>
                <p class="text-3xl font-bold text-white mt-2"><?php echo e($classPerformance['total_students']); ?></p>
            </div>

            <!-- Average Score -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Average Score</p>
                <p class="text-3xl font-bold text-white mt-2"><?php echo e($classPerformance['average_score']); ?></p>
            </div>

            <!-- Highest Score -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Highest Score</p>
                <p class="text-3xl font-bold text-green-400 mt-2"><?php echo e($classPerformance['highest_score']); ?></p>
            </div>

            <!-- Lowest Score -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Lowest Score</p>
                <p class="text-3xl font-bold text-red-400 mt-2"><?php echo e($classPerformance['lowest_score']); ?></p>
            </div>

            <!-- Pass Rate -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Pass Rate</p>
                <p class="text-3xl font-bold text-blue-400 mt-2"><?php echo e($classPerformance['pass_rate']); ?>%</p>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Tab Navigation -->
    <div class="max-w-7xl mx-auto mb-6">
        <div class="flex gap-2 border-b border-slate-600">
            <button 
                wire:click="setActiveTab('overview')"
                class="px-4 py-3 font-medium transition
                    <?php if($activeTab === 'overview'): ?>
                        text-indigo-400 border-b-2 border-b-indigo-400
                    <?php else: ?>
                        text-slate-400 hover:text-slate-300
                    <?php endif; ?>
                "
            >
                📊 Overview
            </button>
            <button 
                wire:click="setActiveTab('distribution')"
                class="px-4 py-3 font-medium transition
                    <?php if($activeTab === 'distribution'): ?>
                        text-indigo-400 border-b-2 border-b-indigo-400
                    <?php else: ?>
                        text-slate-400 hover:text-slate-300
                    <?php endif; ?>
                "
            >
                📈 Distribution
            </button>
            <button 
                wire:click="setActiveTab('questions')"
                class="px-4 py-3 font-medium transition
                    <?php if($activeTab === 'questions'): ?>
                        text-indigo-400 border-b-2 border-b-indigo-400
                    <?php else: ?>
                        text-slate-400 hover:text-slate-300
                    <?php endif; ?>
                "
            >
                ❓ Questions
            </button>
            <button 
                wire:click="setActiveTab('trends')"
                class="px-4 py-3 font-medium transition
                    <?php if($activeTab === 'trends'): ?>
                        text-indigo-400 border-b-2 border-b-indigo-400
                    <?php else: ?>
                        text-slate-400 hover:text-slate-300
                    <?php endif; ?>
                "
            >
                📉 Trends
            </button>
        </div>
    </div>

    <!-- Tab: Overview -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'overview'): ?>
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Top Performers -->
            <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                <h3 class="text-lg font-bold text-white mb-4">🏆 Top 10 Performers</h3>
                <div class="space-y-2 max-h-80 overflow-y-auto">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $topPerformers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $performer): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <div class="flex items-center justify-between p-3 bg-slate-600/20 rounded-lg border border-slate-600">
                            <div class="flex items-center gap-3">
                                <span class="text-xl font-bold text-yellow-400 w-6 text-center">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($index === 0): ?> 🥇
                                    <?php elseif($index === 1): ?> 🥈
                                    <?php elseif($index === 2): ?> 🥉
                                    <?php else: ?> <?php echo e($index + 1); ?>

                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </span>
                                <div>
                                    <p class="text-sm font-medium text-slate-100"><?php echo e($performer['student_name']); ?></p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold <?php echo e($this->getPercentageColor($performer['percentage'])); ?>">
                                    <?php echo e($performer['percentage']); ?>%
                                </p>
                                <p class="text-xs text-slate-500"><?php echo e($performer['marks']); ?> marks</p>
                            </div>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <p class="text-slate-400 text-sm text-center py-4">No graded exams yet</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>

            <!-- Grade Distribution -->
            <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                <h3 class="text-lg font-bold text-white mb-4">📊 Grade Distribution</h3>
                <div class="space-y-3">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $gradeDistribution; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $grade => $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-bold text-sm">Grade <?php echo e($grade); ?>: <?php echo e($data['label']); ?></span>
                                <span class="text-sm font-medium text-slate-300"><?php echo e($data['count']); ?> (<?php echo e($data['percentage']); ?>%)</span>
                            </div>
                            <div class="h-2 bg-slate-600/30 rounded-full overflow-hidden">
                                <div 
                                    class="h-full transition-all duration-300"
                                    style="width: <?php echo e($data['percentage']); ?>%;
                                            background: <?php if($grade === 'A'): ?> rgb(34, 197, 94) <?php elseif($grade === 'B'): ?> rgb(59, 130, 246) <?php elseif($grade === 'C'): ?> rgb(234, 179, 8) <?php elseif($grade === 'D'): ?> rgb(249, 115, 22) <?php else: ?> rgb(239, 68, 68) <?php endif; ?>"
                                ></div>
                            </div>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <p class="text-slate-400 text-sm text-center py-4">No data available</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Bottom Performers -->
        <div class="max-w-7xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 mb-8">
            <h3 class="text-lg font-bold text-white mb-4">📉 Bottom Performers (May Need Support)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $bottomPerformers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $performer): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div class="bg-red-600/10 border-l-4 border-l-red-600 rounded-lg p-4">
                        <p class="text-sm font-bold text-slate-100 mb-1"><?php echo e($performer['student_name']); ?></p>
                        <p class="text-2xl font-bold text-red-400"><?php echo e($performer['percentage']); ?>%</p>
                        <p class="text-xs text-slate-500"><?php echo e($performer['marks']); ?> marks</p>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <p class="text-slate-400 text-sm col-span-full text-center py-4">All students performing well!</p>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Tab: Score Distribution -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'distribution'): ?>
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Score Range Distribution -->
            <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                <h3 class="text-lg font-bold text-white mb-4">Score Range Distribution</h3>
                <div class="space-y-3">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $scoreDistribution; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $range): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-slate-300"><?php echo e($range['range']); ?></span>
                                <span class="text-sm font-medium text-slate-300"><?php echo e($range['count']); ?> (<?php echo e($range['percentage']); ?>%)</span>
                            </div>
                            <div class="h-6 bg-slate-600/30 rounded-lg overflow-hidden flex items-center">
                                <div 
                                    class="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
                                    style="width: <?php echo e($range['percentage']); ?>%"
                                ></div>
                                <span class="text-xs font-bold text-white ml-2"><?php echo e($range['percentage']); ?>%</span>
                            </div>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <p class="text-slate-400 text-sm text-center py-4">No score data available</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>

            <!-- Grade Letter Distribution -->
            <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                <h3 class="text-lg font-bold text-white mb-4">Grade Letters</h3>
                <div class="grid grid-cols-5 gap-2">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $gradeDistribution; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $grade => $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <div class="text-center">
                            <div class="mb-2 h-16 rounded-lg <?php echo e($this->getGradeColor($grade)); ?> flex items-center justify-center">
                                <span class="text-2xl font-bold"><?php echo e($grade); ?></span>
                            </div>
                            <p class="text-xs font-medium text-slate-300"><?php echo e($data['count']); ?></p>
                            <p class="text-xs text-slate-500"><?php echo e($data['percentage']); ?>%</p>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <p class="text-slate-400 text-sm text-center col-span-5 py-4">No data</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Tab: Question Performance -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'questions'): ?>
        <div class="max-w-7xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-600/20 border-b border-slate-600">
                        <tr>
                            <th class="px-6 py-3 text-left text-sm font-bold text-slate-300">Question</th>
                            <th class="px-6 py-3 text-left text-sm font-bold text-slate-300">Total Answers</th>
                            <th class="px-6 py-3 text-left text-sm font-bold text-slate-300">Correct</th>
                            <th class="px-6 py-3 text-left text-sm font-bold text-slate-300">Percentage</th>
                            <th class="px-6 py-3 text-left text-sm font-bold text-slate-300">Difficulty</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $questionPerformance; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $question): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <tr class="border-b border-slate-600 hover:bg-slate-600/20 transition">
                                <td class="px-6 py-4 text-sm text-slate-300">
                                    <span class="font-medium">Q<?php echo e($question['question_id']); ?></span>
                                    <p class="text-xs text-slate-500 truncate"><?php echo e($question['question_text']); ?></p>
                                </td>
                                <td class="px-6 py-4 text-sm font-medium text-slate-100"><?php echo e($question['total_answers']); ?></td>
                                <td class="px-6 py-4 text-sm font-medium text-green-400"><?php echo e($question['correct_count']); ?></td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-20 h-2 bg-slate-600/30 rounded-full overflow-hidden">
                                            <div 
                                                class="h-full bg-green-500 transition-all duration-300"
                                                style="width: <?php echo e($question['correct_percentage']); ?>%"
                                            ></div>
                                        </div>
                                        <span class="text-sm font-medium <?php echo e($this->getPercentageColor($question['correct_percentage'])); ?>">
                                            <?php echo e($question['correct_percentage']); ?>%
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <span class="px-2 py-1 rounded text-xs font-bold
                                        <?php if($question['difficulty'] === 'Easy'): ?> bg-green-600/20 text-green-300
                                        <?php elseif($question['difficulty'] === 'Moderate'): ?> bg-yellow-600/20 text-yellow-300
                                        <?php elseif($question['difficulty'] === 'Difficult'): ?> bg-orange-600/20 text-orange-300
                                        <?php else: ?> bg-red-600/20 text-red-300
                                        <?php endif; ?>
                                    ">
                                        <?php echo e($question['difficulty']); ?>

                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                                    No question data available
                                </td>
                            </tr>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Tab: Trends -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'trends'): ?>
        <div class="max-w-7xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
            <h3 class="text-lg font-bold text-white mb-4">Performance Trends (Last 30 Days)</h3>
            
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($performanceTrends)): ?>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-slate-600">
                                <th class="px-4 py-3 text-left font-bold text-slate-300">Date</th>
                                <th class="px-4 py-3 text-left font-bold text-slate-300">Count</th>
                                <th class="px-4 py-3 text-left font-bold text-slate-300">Average</th>
                                <th class="px-4 py-3 text-left font-bold text-slate-300">Highest</th>
                                <th class="px-4 py-3 text-left font-bold text-slate-300">Lowest</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $performanceTrends; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $trend): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <tr class="border-b border-slate-600 hover:bg-slate-600/20 transition">
                                    <td class="px-4 py-3 text-slate-300"><?php echo e($trend['date']); ?></td>
                                    <td class="px-4 py-3 text-slate-300 font-medium"><?php echo e($trend['count']); ?></td>
                                    <td class="px-4 py-3 text-blue-400 font-medium"><?php echo e($trend['average']); ?></td>
                                    <td class="px-4 py-3 text-green-400 font-medium"><?php echo e($trend['highest']); ?></td>
                                    <td class="px-4 py-3 text-red-400 font-medium"><?php echo e($trend['lowest']); ?></td>
                                </tr>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <p class="text-slate-400 text-center py-8">No trend data available for the last 30 days</p>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Export Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showExportModal): ?>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-slate-800 rounded-lg border border-slate-600 p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-white mb-6">Export Performance Report</h3>
                
                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-slate-300 font-medium mb-2">Format</label>
                        <select 
                            wire:model="exportFormat"
                            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100"
                        >
                            <option value="csv">📄 CSV (Excel)</option>
                            <option value="pdf">📊 PDF Report</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button 
                        wire:click="exportReport"
                        class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                        Download
                    </button>
                    <button 
                        wire:click="$toggle('showExportModal')"
                        class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <style>
        ::-webkit-scrollbar {
            height: 6px;
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.5);
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.8);
        }
    </style>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\student-performance-reports.blade.php ENDPATH**/ ?>