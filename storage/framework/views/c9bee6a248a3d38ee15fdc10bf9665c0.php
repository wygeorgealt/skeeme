<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Toastr Notification Tester
            </h1>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Custom Notification Test -->
                <div class="space-y-6">
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Custom Notification Test</h2>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Message
                            </label>
                            <input type="text" wire:model="testMessage"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
                                   placeholder="Enter notification message">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__errorArgs = ['testMessage'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> <span class="text-red-500 text-sm"><?php echo e($message); ?></span> <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title (Optional)
                            </label>
                            <input type="text" wire:model="testTitle"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
                                   placeholder="Enter notification title">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__errorArgs = ['testTitle'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> <span class="text-red-500 text-sm"><?php echo e($message); ?></span> <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type
                            </label>
                            <select wire:model="selectedType"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white">
                                <option value="success">Success</option>
                                <option value="error">Error</option>
                                <option value="warning">Warning</option>
                                <option value="info">Info</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration (ms)
                            </label>
                            <input type="number" wire:model="duration" min="1000" max="30000" step="1000"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white">
                        </div>

                        <div class="flex items-center">
                            <input type="checkbox" wire:model="includeAction" id="includeAction"
                                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="includeAction" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Include Action Button
                            </label>
                        </div>

                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($includeAction): ?>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Action Text
                                </label>
                                <input type="text" wire:model="actionText"
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
                                       placeholder="View Details">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Action URL
                                </label>
                                <input type="url" wire:model="actionUrl"
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
                                       placeholder="https://example.com">
                            </div>
                        </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                        <button wire:click="testNotification"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                            Test Notification
                        </button>

                        <button wire:click="testBroadcastNotification"
                                class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                            Test Broadcast to All Users
                        </button>
                    </div>
                </div>

                <!-- Use Case Tests -->
                <div class="space-y-6">
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Use Case Tests</h2>

                    <div class="space-y-4">
                        <div class="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg">
                            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Lecturer Uploads Notes</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Shows success notification to lecturer and broadcast to students
                            </p>
                            <button wire:click="testUseCaseLecturerUpload"
                                    class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                                Test Lecturer Upload
                            </button>
                        </div>

                        <div class="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg">
                            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Student Submits Exam</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Shows success notification to student and notification to lecturer
                            </p>
                            <button wire:click="testUseCaseStudentSubmit"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                                Test Student Submit
                            </button>
                        </div>

                        <div class="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg">
                            <h3 class="font-medium text-gray-900 dark:text-white mb-2">New Content Available</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Shows info notification about new content to students
                            </p>
                            <button wire:click="testUseCaseNewContent"
                                    class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                                Test New Content
                            </button>
                        </div>

                        <div class="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg">
                            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Submission Received</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Shows info notification to lecturer about student submission
                            </p>
                            <button wire:click="testUseCaseSubmissionReceived"
                                    class="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                                Test Submission Received
                            </button>
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Testing Instructions</h3>
                        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Test individual notifications with different types and durations</li>
                            <li>• Try broadcast notifications to see real-time updates</li>
                            <li>• Test use cases to see contextual notifications</li>
                            <li>• Check mobile responsiveness and dark mode</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\notification-tester.blade.php ENDPATH**/ ?>