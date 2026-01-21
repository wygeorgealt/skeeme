<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    🎯 Adaptive Exam Builder
                </h1>
                <p class="text-slate-400"><?php echo e($exam->title); ?></p>
            </div>
            <button 
                wire:click="toggleAdaptiveMode"
                class="px-4 py-2 rounded-lg transition font-medium
                    <?php if($isAdaptive): ?>
                        bg-green-600 hover:bg-green-700 text-white
                    <?php else: ?>
                        bg-slate-600 hover:bg-slate-500 text-slate-100
                    <?php endif; ?>
                "
            >
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($isAdaptive): ?>
                    ✓ Adaptive Mode: ON
                <?php else: ?>
                    ◯ Adaptive Mode: OFF
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </button>
        </div>
    </div>

    <!-- Adaptive Type Selection -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$isAdaptive): ?>
        <div class="max-w-6xl mx-auto bg-blue-600/20 border-l-4 border-l-blue-600 rounded-lg p-6 mb-8">
            <h3 class="font-bold text-blue-300 mb-2">💡 Enable Adaptive Mode</h3>
            <p class="text-blue-100 text-sm mb-4">Adaptive exams automatically adjust difficulty based on student performance.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-700/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition"
                    wire:click="$set('adaptiveType', 'branching'); toggleAdaptiveMode()">
                    <p class="font-bold text-white">🌳 Branching</p>
                    <p class="text-sm text-slate-400">Route based on performance thresholds</p>
                </div>
                <div class="bg-slate-700/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition"
                    wire:click="$set('adaptiveType', 'pool_based'); toggleAdaptiveMode()">
                    <p class="font-bold text-white">📚 Pool-Based</p>
                    <p class="text-sm text-slate-400">Select from predefined question pools</p>
                </div>
                <div class="bg-slate-700/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition"
                    wire:click="$set('adaptiveType', 'linear'); toggleAdaptiveMode()">
                    <p class="font-bold text-white">📋 Linear</p>
                    <p class="text-sm text-slate-400">Sequential with no branching</p>
                </div>
            </div>
        </div>
    <?php else: ?>
        <!-- Statistics -->
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Type</p>
                <p class="text-2xl font-bold text-blue-400 mt-2 capitalize"><?php echo e($adaptiveType); ?></p>
            </div>
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Question Pools</p>
                <p class="text-2xl font-bold text-indigo-400 mt-2"><?php echo e(count($pools)); ?></p>
            </div>
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Routing Rules</p>
                <p class="text-2xl font-bold text-purple-400 mt-2"><?php echo e(count($rules)); ?></p>
            </div>
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <p class="text-slate-400 text-sm font-medium">Total Questions</p>
                <p class="text-2xl font-bold text-green-400 mt-2"><?php echo e(count($allQuestions)); ?></p>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="max-w-6xl mx-auto mb-6">
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
                    wire:click="setActiveTab('pools')"
                    class="px-4 py-3 font-medium transition
                        <?php if($activeTab === 'pools'): ?>
                            text-indigo-400 border-b-2 border-b-indigo-400
                        <?php else: ?>
                            text-slate-400 hover:text-slate-300
                        <?php endif; ?>
                    "
                >
                    📚 Question Pools
                </button>
                <button 
                    wire:click="setActiveTab('rules')"
                    class="px-4 py-3 font-medium transition
                        <?php if($activeTab === 'rules'): ?>
                            text-indigo-400 border-b-2 border-b-indigo-400
                        <?php else: ?>
                            text-slate-400 hover:text-slate-300
                        <?php endif; ?>
                    "
                >
                    🔀 Routing Rules
                </button>
            </div>
        </div>

        <!-- Tab: Overview -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'overview'): ?>
            <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- How It Works -->
                <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                    <h3 class="text-lg font-bold text-white mb-4">📚 How Adaptive Exams Work</h3>
                    <div class="space-y-3 text-sm text-slate-300">
                        <div class="flex gap-3">
                            <span class="text-xl">1️⃣</span>
                            <p>Create question pools organized by difficulty level</p>
                        </div>
                        <div class="flex gap-3">
                            <span class="text-xl">2️⃣</span>
                            <p>Define routing rules based on student performance</p>
                        </div>
                        <div class="flex gap-3">
                            <span class="text-xl">3️⃣</span>
                            <p>System automatically selects appropriate difficulty</p>
                        </div>
                        <div class="flex gap-3">
                            <span class="text-xl">4️⃣</span>
                            <p>Adjust on-the-fly based on correct/incorrect answers</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                    <h3 class="text-lg font-bold text-white mb-4">⚡ Configuration Status</h3>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($pools) > 0): ?> ✓ <?php else: ?> ✗ <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?></span>
                            <span class="text-slate-300"><?php echo e(count($pools)); ?> question pool(s) created</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($rules) > 0): ?> ✓ <?php else: ?> ✗ <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?></span>
                            <span class="text-slate-300"><?php echo e(count($rules)); ?> routing rule(s) defined</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span><?php if(count($pools) > 0 && count($rules) > 0): ?> ✓ <?php else: ?> ✗ <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?></span>
                            <span class="text-slate-300">Ready for deployment</span>
                        </div>
                    </div>
                    <button 
                        wire:click="$set('activeTab', 'pools')"
                        class="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                    >
                        Setup Pools →
                    </button>
                </div>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <!-- Tab: Question Pools -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'pools'): ?>
            <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Create Pool -->
                <div class="lg:col-span-1 bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 h-fit">
                    <h3 class="text-lg font-bold text-white mb-4">Create Pool</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-slate-300 text-sm font-medium mb-2">Pool Name</label>
                            <input 
                                type="text" 
                                wire:model="newPoolName"
                                placeholder="e.g., Difficult Questions"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                            >
                        </div>
                        <div>
                            <label class="block text-slate-300 text-sm font-medium mb-2">Difficulty Level</label>
                            <select wire:model="newPoolDifficulty" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                                <option value="easy">Easy</option>
                                <option value="moderate" selected>Moderate</option>
                                <option value="difficult">Difficult</option>
                                <option value="very_difficult">Very Difficult</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 text-sm font-medium mb-2">Description</label>
                            <textarea 
                                wire:model="newPoolDescription"
                                rows="2"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            ></textarea>
                        </div>
                        <button 
                            wire:click="createPool"
                            class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                        >
                            Create Pool
                        </button>
                    </div>
                </div>

                <!-- Pools List -->
                <div class="lg:col-span-2 bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Question Pools</h3>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($pools) > 0): ?>
                        <div class="space-y-3">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $pools; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pool): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="bg-slate-600/20 rounded-lg p-4 border-l-4 border-l-indigo-500">
                                    <div class="flex items-start justify-between mb-2">
                                        <div>
                                            <p class="font-bold text-white"><?php echo e($pool['name']); ?></p>
                                            <div class="flex gap-2 mt-1">
                                                <span class="px-2 py-1 bg-slate-600/30 rounded text-xs text-slate-400">
                                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php switch($pool['difficulty']):
                                                        case ('easy'): ?> 🟢 Easy
                                                        <?php case ('moderate'): ?> 🟡 Moderate
                                                        <?php case ('difficult'): ?> 🟠 Difficult
                                                        <?php case ('very_difficult'): ?> 🔴 Very Difficult
                                                        <?php default: ?> <?php echo e($pool['difficulty']); ?>

                                                    <?php endswitch; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            wire:click="deletePool(<?php echo e($pool['id']); ?>)"
                                            class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($pool['description']): ?>
                                        <p class="text-xs text-slate-400 mb-2"><?php echo e($pool['description']); ?></p>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    <button 
                                        wire:click="$set('selectedPoolForQuestions', <?php echo e($pool['id']); ?>); $toggle('showAssignModal')"
                                        class="text-xs text-indigo-400 hover:text-indigo-300"
                                    >
                                        + Assign Questions
                                    </button>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <p class="text-slate-400 text-center py-8">No pools created yet</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <!-- Tab: Routing Rules -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'rules'): ?>
            <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Create Rule -->
                <div class="lg:col-span-1 bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 h-fit">
                    <h3 class="text-lg font-bold text-white mb-4">Create Rule</h3>
                    <div class="space-y-3 text-sm">
                        <div>
                            <label class="block text-slate-300 font-medium mb-1">Rule Name</label>
                            <input 
                                type="text" 
                                wire:model="newRuleName"
                                placeholder="e.g., High Performance"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            >
                        </div>
                        <div>
                            <label class="block text-slate-300 font-medium mb-1">After Question #</label>
                            <input 
                                type="number" 
                                wire:model="newRuleSequence"
                                min="1"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                            >
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-slate-300 font-medium mb-1">Performance</label>
                                <input 
                                    type="number" 
                                    wire:model="newRuleThreshold"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                >
                            </div>
                            <div>
                                <label class="block text-slate-300 font-medium mb-1">Operator</label>
                                <select wire:model="newRuleOperator" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                                    <option value=">=">&GreaterEqual;</option>
                                    <option value=">">></option>
                                    <option value="<">&LessThan;</option>
                                    <option value="<=">&LessEqual;</option>
                                    <option value="==">=</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-slate-300 font-medium mb-1">Target Pool</label>
                            <select wire:model="newRulePoolId" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                                <option value="">Select a pool...</option>
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $pools; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pool): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($pool['id']); ?>"><?php echo e($pool['name']); ?></option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 font-medium mb-1">Questions to Present</label>
                            <input 
                                type="number" 
                                wire:model="newRuleQuestionCount"
                                min="1"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                            >
                        </div>
                        <button 
                            wire:click="createRule"
                            class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                        >
                            Create Rule
                        </button>
                    </div>
                </div>

                <!-- Rules List -->
                <div class="lg:col-span-2 bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Routing Rules</h3>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($rules) > 0): ?>
                        <div class="space-y-3">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $rules; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $rule): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="bg-slate-600/20 rounded-lg p-4 border-l-4 border-l-green-500">
                                    <div class="flex items-start justify-between mb-2">
                                        <div>
                                            <p class="font-bold text-white"><?php echo e($rule['rule_name']); ?></p>
                                            <p class="text-xs text-slate-400 mt-1">
                                                After Q<?php echo e($rule['question_sequence']); ?>: If performance <?php echo e($rule['operator']); ?> <?php echo e(number_format($rule['performance_threshold'] * 100, 0)); ?>%
                                            </p>
                                            <p class="text-xs text-slate-400">→ Show <?php echo e($rule['questions_to_present']); ?> from pool: <strong><?php echo e($rule['target_pool_name'] ?? 'Unknown'); ?></strong></p>
                                        </div>
                                        <button 
                                            wire:click="deleteRule(<?php echo e($rule['id']); ?>)"
                                            class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <p class="text-slate-400 text-center py-8">No routing rules created yet</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Assign Questions Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showAssignModal && $selectedPoolForQuestions): ?>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div class="bg-slate-800 rounded-lg border border-slate-600 p-6 w-full max-w-2xl my-4">
                <h3 class="text-xl font-bold text-white mb-6">Add Questions to Pool</h3>
                <div class="bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto mb-6">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $allQuestions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $question): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <label class="flex items-center gap-3 p-2 hover:bg-slate-600/20 rounded cursor-pointer">
                            <input 
                                type="checkbox" 
                                wire:model="selectedQuestions"
                                value="<?php echo e($question['id']); ?>"
                                class="w-4 h-4"
                            >
                            <div class="flex-1">
                                <p class="font-medium text-slate-100">Q<?php echo e($question['id']); ?>: <?php echo e(Str::limit($question['question_text'], 50)); ?></p>
                                <p class="text-xs text-slate-500"><?php echo e($question['question_type']); ?></p>
                            </div>
                        </label>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <p class="text-slate-400 text-center py-4">No questions found</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                <div class="flex gap-2">
                    <button 
                        wire:click="assignQuestionsToPool"
                        class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                    >
                        Add Selected Questions
                    </button>
                    <button 
                        wire:click="$toggle('showAssignModal')"
                        class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition"
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
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\adaptive-exam-builder.blade.php ENDPATH**/ ?>