<div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">📧 Email Preview & Test</h1>
            <p class="text-slate-600">Send and preview multiple email types to test design and layout</p>
        </div>

        <!-- Main Container -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Panel: Controls -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                    <h2 class="text-xl font-bold text-slate-900 mb-6">Test Controls</h2>

                    <!-- Email Type Selection -->
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            📧 Email Type
                        </label>
                        <select
                            wire:model.live="selectedEmailType"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="invoice">📄 Invoice Email</option>
                            <option value="welcome">👋 Welcome Email</option>
                            <option value="upgrade">✨ Upgrade Confirmation</option>
                        </select>
                    </div>

                    <!-- Dynamic Selection Based on Email Type -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedEmailType === 'invoice'): ?>
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-slate-700 mb-2">
                                📄 Select Invoice
                            </label>
                            <select
                                wire:model="selectedInvoice"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose an invoice --</option>
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $invoices; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $invoice): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($invoice['id']); ?>">
                                        <?php echo e($invoice['label']); ?>

                                    </option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </select>
                        </div>
                    <?php elseif($selectedEmailType === 'welcome'): ?>
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-slate-700 mb-2">
                                👤 Select User
                            </label>
                            <select
                                wire:model="selectedUser"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose a user --</option>
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $users; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $user): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($user['id']); ?>">
                                        <?php echo e($user['label']); ?>

                                    </option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </select>
                        </div>
                    <?php elseif($selectedEmailType === 'upgrade'): ?>
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-slate-700 mb-2">
                                🔄 Select Subscription
                            </label>
                            <select
                                wire:model="selectedSubscription"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose a subscription --</option>
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $subscriptions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subscription): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($subscription['id']); ?>">
                                        <?php echo e($subscription['label']); ?>

                                    </option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </select>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <!-- Email Input -->
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            ✉️ Recipient Email
                        </label>
                        <input
                            type="email"
                            wire:model="testEmail"
                            placeholder="test@example.com"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p class="text-xs text-slate-500 mt-1">Check Mailtrap inbox after sending</p>
                    </div>

                    <!-- Buttons -->
                    <div class="space-y-3">
                        <button
                            wire:click="sendTestEmail"
                            wire:loading.attr="disabled"
                            class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <span wire:loading.remove wire:target="sendTestEmail">
                                <i class="fas fa-paper-plane"></i> Send Test Email
                            </span>
                            <span wire:loading wire:target="sendTestEmail">
                                <i class="fas fa-spinner animate-spin"></i> Sending...
                            </span>
                        </button>

                        <button
                            wire:click="previewEmail"
                            class="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <i class="fas fa-eye"></i> Refresh Preview
                        </button>
                    </div>

                    <!-- Message -->
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($message): ?>
                        <div class="mt-6 p-4 rounded-lg <?php echo e(str_contains($message, '✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'); ?>">
                            <?php echo $message; ?>

                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <!-- Info Box -->
                    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p class="text-sm text-blue-900 font-semibold mb-2">💡 How to Use:</p>
                        <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Select email type</li>
                            <li>Choose relevant item</li>
                            <li>Enter test email</li>
                            <li>Click "Send Test Email"</li>
                            <li>Check Mailtrap inbox</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Live Preview -->
            <div class="lg:col-span-2">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($previewData): ?>
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                        <!-- Preview Header -->
                        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h3 class="text-white font-semibold text-lg">📧 Live Email Preview</h3>
                            <p class="text-blue-100 text-sm">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($previewData['type'] === 'invoice'): ?>
                                    Invoice: <strong><?php echo e($previewData['invoice']->invoice_number); ?></strong>
                                <?php elseif($previewData['type'] === 'welcome'): ?>
                                    Welcome for: <strong><?php echo e($previewData['user']->first_name); ?> <?php echo e($previewData['user']->last_name); ?></strong>
                                <?php elseif($previewData['type'] === 'upgrade'): ?>
                                    Upgrade to: <strong><?php echo e($previewData['planName']); ?></strong>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </p>
                        </div>

                        <!-- Preview Container -->
                        <div class="p-6 max-h-[800px] overflow-y-auto">
                            <!-- Invoice Email Preview -->
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($previewData['type'] === 'invoice'): ?>
                                <?php echo $__env->make('emails.invoice', ['invoice' => $previewData['invoice'], 'school' => $previewData['school'], 'paymentLink' => $previewData['paymentLink']], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                            
                            <!-- Welcome Email Preview -->
                            <?php elseif($previewData['type'] === 'welcome'): ?>
                                <?php echo $__env->make('emails.welcome', ['user' => $previewData['user'], 'schoolName' => $previewData['schoolName']], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                            
                            <!-- Upgrade Confirmation Email Preview -->
                            <?php elseif($previewData['type'] === 'upgrade'): ?>
                                <?php echo $__env->make('emails.upgrade-confirmation', ['subscription' => $previewData['subscription'], 'planName' => $previewData['planName'], 'billingPeriod' => $previewData['subscription']->billing_period], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="bg-white rounded-lg shadow-lg p-12 text-center">
                        <i class="fas fa-envelope text-6xl text-slate-300 mb-4"></i>
                        <p class="text-slate-600 text-lg">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedEmailType === 'invoice'): ?>
                                Select an invoice to preview the email
                            <?php elseif($selectedEmailType === 'welcome'): ?>
                                Select a user to preview the email
                            <?php elseif($selectedEmailType === 'upgrade'): ?>
                                Select a subscription to preview the email
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </p>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
    </div>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\test-email-preview.blade.php ENDPATH**/ ?>