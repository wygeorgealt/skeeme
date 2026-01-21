<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    📊 Weighted Marking
                </h1>
                <p class="text-slate-400"><?php echo e($this->exam->title); ?></p>
            </div>
            <button 
                wire:click="$toggle('showSettingsModal')"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
                ⚙️ Settings
            </button>
        </div>
    </div>

    <!-- Overall Statistics -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($hasWeights): ?>
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Total Marks</p>
                <p class="text-3xl font-bold text-white mt-2"><?php echo e(number_format($totalExamMarks, 2)); ?></p>
            </div>
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Questions Weighted</p>
                <p class="text-3xl font-bold text-blue-400 mt-2"><?php echo e(count($questions)); ?></p>
            </div>
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Weighting Status</p>
                <p class="text-lg font-bold text-green-400 mt-2">✓ Configured</p>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Questions Weight Table -->
    <div class="max-w-6xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 overflow-hidden mb-8">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-600/20 border-b border-slate-600">
                    <tr>
                        <th class="px-6 py-4 text-left text-sm font-bold text-slate-300 w-1/3">Question</th>
                        <th class="px-6 py-4 text-center text-sm font-bold text-slate-300">Weight</th>
                        <th class="px-6 py-4 text-center text-sm font-bold text-slate-300">Total Marks</th>
                        <th class="px-6 py-4 text-center text-sm font-bold text-slate-300">Possible</th>
                        <th class="px-6 py-4 text-center text-sm font-bold text-slate-300">% of Exam</th>
                        <th class="px-6 py-4 text-center text-sm font-bold text-slate-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $questions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $question): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <tr class="border-b border-slate-600 hover:bg-slate-600/20 transition">
                            <td class="px-6 py-4">
                                <div>
                                    <p class="font-medium text-slate-100">Q<?php echo e($question['id']); ?></p>
                                    <p class="text-xs text-slate-500 truncate"><?php echo e(Str::limit($question['question_text'], 50)); ?></p>
                                    <span class="inline-block mt-1 px-2 py-1 bg-slate-600/30 rounded text-xs text-slate-400">
                                        <?php echo e($question['question_type']); ?>

                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($editingId === $question['id']): ?>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        min="0.1"
                                        wire:model.live="newWeight"
                                        class="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                                    >
                                <?php else: ?>
                                    <span class="font-bold text-blue-400"><?php echo e(isset($weights[$question['id']]) ? number_format($weights[$question['id']]['weight'], 2) : '1.00'); ?>x</span>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($editingId === $question['id']): ?>
                                    <input 
                                        type="number" 
                                        min="1"
                                        wire:model.live="newTotalMarks"
                                        class="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                                    >
                                <?php else: ?>
                                    <span class="font-bold"><?php echo e(isset($weights[$question['id']]) ? $weights[$question['id']]['total_marks'] : '1'); ?></span>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="font-bold text-green-400">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($weights[$question['id']])): ?>
                                        <?php echo e(number_format($weights[$question['id']]['weight'] * $weights[$question['id']]['total_marks'], 2)); ?>

                                    <?php else: ?>
                                        1.00
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="w-24 h-2 bg-slate-600/30 rounded-full overflow-hidden">
                                        <div 
                                            class="h-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                                            style="width: <?php echo e($this->getWeightPercentage($question['id'])); ?>%"
                                        ></div>
                                    </div>
                                    <span class="text-sm font-medium text-slate-300 w-12 text-right">
                                        <?php echo e(number_format($this->getWeightPercentage($question['id']), 1)); ?>%
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($editingId === $question['id']): ?>
                                    <div class="flex gap-2 justify-center">
                                        <button 
                                            wire:click="saveWeight(<?php echo e($question['id']); ?>)"
                                            class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition"
                                        >
                                            Save
                                        </button>
                                        <button 
                                            wire:click="cancelEdit"
                                            class="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                <?php else: ?>
                                    <button 
                                        wire:click="editWeight(<?php echo e($question['id']); ?>)"
                                        class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition"
                                    >
                                        Edit
                                    </button>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                                No questions found
                            </td>
                        </tr>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Weight Distribution Bar -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($hasWeights && $totalExamMarks > 0): ?>
        <div class="max-w-6xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 mb-8">
            <h3 class="text-lg font-bold text-white mb-4">📊 Weight Distribution</h3>
            <div class="space-y-2">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $questions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $question): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm text-slate-300">Q<?php echo e($question['id']); ?>: <?php echo e(Str::limit($question['question_text'], 40)); ?></span>
                            <span class="text-sm font-bold text-slate-100"><?php echo e(number_format($this->getWeightPercentage($question['id']), 1)); ?>%</span>
                        </div>
                        <div class="h-3 bg-slate-600/30 rounded-full overflow-hidden">
                            <div 
                                class="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300"
                                style="width: <?php echo e($this->getWeightPercentage($question['id'])); ?>%"
                            ></div>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Settings Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showSettingsModal): ?>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-slate-800 rounded-lg border border-slate-600 p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-white mb-6">⚙️ Weighting Settings</h3>
                
                <div class="space-y-6">
                    <!-- Uniform Weights Section -->
                    <div class="border-b border-slate-600 pb-6">
                        <h4 class="font-bold text-slate-200 mb-3">Apply Uniform Weights</h4>
                        <div class="mb-3">
                            <label class="block text-slate-400 text-sm mb-2">Marks per Question</label>
                            <input 
                                type="number" 
                                min="1"
                                wire:model="newTotalMarks"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                            >
                        </div>
                        <button 
                            wire:click="applyUniformWeights"
                            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                            Apply Uniform Weights
                        </button>
                    </div>

                    <!-- Reset Section -->
                    <div>
                        <h4 class="font-bold text-slate-200 mb-3">Reset Configuration</h4>
                        <button 
                            wire:click="resetWeights"
                            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                        >
                            Reset All Weights to Default
                        </button>
                    </div>
                </div>

                <button 
                    wire:click="$toggle('showSettingsModal')"
                    class="w-full mt-6 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition"
                >
                    Close
                </button>
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
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\weighted-marking-manager.blade.php ENDPATH**/ ?>