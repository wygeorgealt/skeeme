<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    📋 Mark Scheme Builder
                </h1>
                <p class="text-slate-400">Create and manage marking rubrics</p>
            </div>
        </div>
    </div>

    <!-- Scheme Info Section -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$scheme): ?>
        <!-- Create New Scheme -->
        <div class="max-w-6xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 mb-8">
            <h2 class="text-lg font-bold text-white mb-4">Create New Mark Scheme</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-2">Scheme Name</label>
                    <input 
                        type="text" 
                        wire:model="schemeName"
                        placeholder="e.g., Standard Essay Rubric"
                        class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                </div>
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-2">Total Marks</label>
                    <input 
                        type="number" 
                        wire:model="totalMarks"
                        min="1"
                        class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-slate-300 text-sm font-medium mb-2">Description</label>
                <textarea 
                    wire:model="schemeDescription"
                    rows="2"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                ></textarea>
            </div>
            <div class="mb-4">
                <label class="block text-slate-300 text-sm font-medium mb-2">Grading Instructions</label>
                <textarea 
                    wire:model="schemeInstructions"
                    rows="3"
                    placeholder="Detailed instructions for graders"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                ></textarea>
            </div>
            <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" wire:model="isPublic" class="w-4 h-4">
                    <span class="text-slate-300 text-sm">Make scheme public (others can use)</span>
                </label>
                <button 
                    wire:click="createScheme"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                >
                    Create Scheme
                </button>
            </div>
        </div>
    <?php else: ?>
        <!-- Edit Existing Scheme -->
        <div class="max-w-6xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-white"><?php echo e($scheme->name); ?></h2>
                <div class="flex gap-2">
                    <button 
                        wire:click="$toggle('showCloneModal')"
                        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                    >
                        🔄 Clone
                    </button>
                    <button 
                        wire:click="$toggle('showAssignModal')"
                        class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                    >
                        ✓ Assign to Questions
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-2">Scheme Name</label>
                    <input 
                        type="text" 
                        wire:model="schemeName"
                        class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                </div>
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-2">Total Marks</label>
                    <input 
                        type="number" 
                        wire:model="totalMarks"
                        min="1"
                        class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-slate-300 text-sm font-medium mb-2">Description</label>
                <textarea 
                    wire:model="schemeDescription"
                    rows="2"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                ></textarea>
            </div>
            <div class="mb-4">
                <label class="block text-slate-300 text-sm font-medium mb-2">Grading Instructions</label>
                <textarea 
                    wire:model="schemeInstructions"
                    rows="3"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                ></textarea>
            </div>
            <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" wire:model="isPublic" class="w-4 h-4">
                    <span class="text-slate-300 text-sm">Make scheme public</span>
                </label>
                <button 
                    wire:click="updateScheme"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                    Update Scheme
                </button>
            </div>
        </div>

        <!-- Tab Navigation -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($scheme): ?>
            <div class="max-w-6xl mx-auto mb-6">
                <div class="flex gap-2 border-b border-slate-600">
                    <button 
                        wire:click="setActiveTab('items')"
                        class="px-4 py-3 font-medium transition
                            <?php if($activeTab === 'items'): ?>
                                text-indigo-400 border-b-2 border-b-indigo-400
                            <?php else: ?>
                                text-slate-400 hover:text-slate-300
                            <?php endif; ?>
                        "
                    >
                        📝 Items
                    </button>
                    <button 
                        wire:click="setActiveTab('assignments')"
                        class="px-4 py-3 font-medium transition
                            <?php if($activeTab === 'assignments'): ?>
                                text-indigo-400 border-b-2 border-b-indigo-400
                            <?php else: ?>
                                text-slate-400 hover:text-slate-300
                            <?php endif; ?>
                        "
                    >
                        ✓ Assignments
                    </button>
                    <button 
                        wire:click="setActiveTab('preview')"
                        class="px-4 py-3 font-medium transition
                            <?php if($activeTab === 'preview'): ?>
                                text-indigo-400 border-b-2 border-b-indigo-400
                            <?php else: ?>
                                text-slate-400 hover:text-slate-300
                            <?php endif; ?>
                        "
                    >
                        👁️ Preview
                    </button>
                </div>
            </div>

            <!-- Tab: Items -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'items'): ?>
                <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Add Item Form -->
                    <div class="lg:col-span-1 bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 h-fit">
                        <h3 class="text-lg font-bold text-white mb-4">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($editingItemId): ?>
                                Edit Item
                            <?php else: ?>
                                Add New Item
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </h3>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-slate-300 text-sm font-medium mb-1">Level (0-10)</label>
                                <input 
                                    type="number" 
                                    wire:model="newItemLevel"
                                    min="0"
                                    max="10"
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                >
                            </div>
                            <div>
                                <label class="block text-slate-300 text-sm font-medium mb-1">Level Name</label>
                                <input 
                                    type="text" 
                                    wire:model="newItemName"
                                    placeholder="e.g., Excellent, Good, Fair"
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                >
                            </div>
                            <div>
                                <label class="block text-slate-300 text-sm font-medium mb-1">Marks Awarded</label>
                                <input 
                                    type="number" 
                                    wire:model="newItemMarks"
                                    min="0"
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                >
                            </div>
                            <div>
                                <label class="block text-slate-300 text-sm font-medium mb-1">Criteria</label>
                                <textarea 
                                    wire:model="newItemCriteria"
                                    rows="4"
                                    placeholder="What must be present to achieve this level?"
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                ></textarea>
                            </div>
                            <div>
                                <label class="block text-slate-300 text-sm font-medium mb-1">Examples (Optional)</label>
                                <textarea 
                                    wire:model="newItemExamples"
                                    rows="3"
                                    placeholder="Example answers"
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                ></textarea>
                            </div>
                            <div class="flex gap-2 pt-2">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($editingItemId): ?>
                                    <button 
                                        wire:click="saveItem"
                                        class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition text-sm"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        wire:click="resetItemForm"
                                        class="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition text-sm"
                                    >
                                        Cancel
                                    </button>
                                <?php else: ?>
                                    <button 
                                        wire:click="addItem"
                                        class="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition text-sm"
                                    >
                                        Add Item
                                    </button>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Items List -->
                    <div class="lg:col-span-2 bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                        <h3 class="text-lg font-bold text-white mb-4">Marking Levels</h3>
                        <div class="space-y-3 max-h-96 overflow-y-auto">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <div class="bg-slate-600/20 border-l-4 border-l-indigo-500 rounded-lg p-4">
                                    <div class="flex items-start justify-between mb-2">
                                        <div>
                                            <p class="font-bold text-white">
                                                <?php echo e($item['level_name']); ?> 
                                                <span class="text-green-400"><?php echo e($item['marks_awarded']); ?>/<?php echo e($totalMarks); ?> marks</span>
                                            </p>
                                            <p class="text-slate-400 text-xs mt-1">Level <?php echo e($item['level']); ?></p>
                                        </div>
                                        <div class="flex gap-1">
                                            <button 
                                                wire:click="editItem(<?php echo e($item['id']); ?>)"
                                                class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                wire:click="deleteItem(<?php echo e($item['id']); ?>)"
                                                class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p class="text-slate-300 text-sm mb-2"><?php echo e($item['criteria']); ?></p>
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($item['examples']): ?>
                                        <details class="text-xs">
                                            <summary class="text-slate-400 cursor-pointer hover:text-slate-300">Show examples</summary>
                                            <p class="text-slate-400 mt-2 pl-2 border-l border-slate-500"><?php echo e($item['examples']); ?></p>
                                        </details>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <p class="text-slate-400 text-center py-8">No items yet. Add one to get started.</p>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Tab: Assignments -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'assignments'): ?>
                <div class="max-w-6xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 mb-8">
                    <h3 class="text-lg font-bold text-white mb-4">Questions Using This Scheme</h3>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($assignedQuestions->count() > 0): ?>
                        <div class="space-y-2">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $assignedQuestions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $question): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="flex items-center justify-between p-3 bg-slate-600/20 rounded border border-slate-600">
                                    <div>
                                        <p class="font-medium text-slate-100">Q<?php echo e($question->id); ?>: <?php echo e(Str::limit($question->question_text, 60)); ?></p>
                                        <p class="text-xs text-slate-500"><?php echo e($question->exam->title ?? 'N/A'); ?></p>
                                    </div>
                                    <button 
                                        class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                                    >
                                        Unassign
                                    </button>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <p class="text-slate-400 text-center py-8">No questions assigned yet</p>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Tab: Preview -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activeTab === 'preview'): ?>
                <div class="max-w-6xl mx-auto bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 mb-8">
                    <h3 class="text-lg font-bold text-white mb-4">Grader Preview</h3>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($schemeInstructions): ?>
                        <div class="bg-blue-600/20 border-l-4 border-l-blue-500 rounded-lg p-4 mb-6">
                            <p class="font-bold text-blue-300 mb-2">📋 Instructions</p>
                            <p class="text-slate-300 whitespace-pre-wrap"><?php echo e($schemeInstructions); ?></p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    
                    <div class="space-y-4">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <div class="border border-slate-600 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <h4 class="font-bold text-lg">
                                        <span class="text-green-400"><?php echo e($item['marks_awarded']); ?>/<?php echo e($totalMarks); ?></span>
                                        <span class="text-white ml-2"><?php echo e($item['level_name']); ?></span>
                                    </h4>
                                    <span class="text-sm text-slate-400"><?php echo e(number_format(($item['marks_awarded'] / $totalMarks) * 100, 0)); ?>%</span>
                                </div>
                                <p class="text-slate-300 mb-2"><?php echo e($item['criteria']); ?></p>
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($item['examples']): ?>
                                    <div class="bg-slate-600/30 rounded p-3 mt-2 border-l-2 border-l-slate-400">
                                        <p class="text-xs text-slate-400 font-bold mb-1">Example:</p>
                                        <p class="text-sm text-slate-300"><?php echo e($item['examples']); ?></p>
                                    </div>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <p class="text-slate-400 text-center py-8">No items to preview</p>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Clone Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showCloneModal && $scheme): ?>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-slate-800 rounded-lg border border-slate-600 p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-white mb-6">🔄 Clone Mark Scheme</h3>
                <div class="mb-6">
                    <label class="block text-slate-300 font-medium mb-2">New Scheme Name</label>
                    <input 
                        type="text" 
                        wire:model="cloneName"
                        placeholder="e.g., My Custom Essay Rubric"
                        class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                </div>
                <div class="flex gap-2">
                    <button 
                        wire:click="cloneScheme"
                        class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                    >
                        Clone
                    </button>
                    <button 
                        wire:click="$toggle('showCloneModal')"
                        class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <!-- Assign Modal -->
    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showAssignModal && $scheme): ?>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div class="bg-slate-800 rounded-lg border border-slate-600 p-6 w-full max-w-2xl my-4">
                <h3 class="text-xl font-bold text-white mb-6">✓ Assign Scheme to Questions</h3>
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
                        wire:click="assignToQuestions"
                        class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                    >
                        Assign Selected
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
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\mark-scheme-builder.blade.php ENDPATH**/ ?>