<div>
    <!-- Floating Button -->
    <button 
        wire:click="togglePanel"
        class="fixed bottom-6 right-6 z-40 group"
        aria-label="Ask Skeemy">
        <div class="relative">
            <!-- Pulsing Ring Animation -->
            <div class="absolute inset-0 bg-indigo-500 rounded-full opacity-75 animate-ping"></div>
            
            <!-- Main Button -->
            <div class="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105">
                <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['class' => 'w-5 h-5 text-white']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-5 h-5 text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
            </div>
        </div>
    </button>

    <!-- Slide-out Panel -->
    <div 
        x-data="{ open: <?php if ((object) ('isOpen') instanceof \Livewire\WireDirective) : ?>window.Livewire.find('<?php echo e($__livewire->getId()); ?>').entangle('<?php echo e('isOpen'->value()); ?>')<?php echo e('isOpen'->hasModifier('live') ? '.live' : ''); ?><?php else : ?>window.Livewire.find('<?php echo e($__livewire->getId()); ?>').entangle('<?php echo e('isOpen'); ?>')<?php endif; ?> }"
        x-show="open"
        x-cloak
        class="fixed inset-0 z-50 overflow-hidden"
        @click.self="open = false">
        
        <!-- Backdrop -->
        <div 
            x-show="open"
            x-transition:enter="transition-opacity ease-linear duration-300"
            x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100"
            x-transition:leave="transition-opacity ease-linear duration-300"
            x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="open = false"></div>

        <!-- Panel -->
        <div 
            x-show="open"
            x-transition:enter="transform transition ease-in-out duration-500"
            x-transition:enter-start="translate-x-full"
            x-transition:enter-end="translate-x-0"
            x-transition:leave="transform transition ease-in-out duration-500"
            x-transition:leave-start="translate-x-0"
            x-transition:leave-end="translate-x-full"
            class="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['class' => 'w-6 h-6 text-white']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-6 h-6 text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-white">Skeemy AI</h2>
                        <p class="text-xs text-white/80">Your intelligent assistant</p>
                    </div>
                </div>
                <button wire:click="togglePanel" class="text-white/80 hover:text-white transition-colors">
                    <?php if (isset($component)) { $__componentOriginal155e76c41fe51242bc25d269fabf82f5 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal155e76c41fe51242bc25d269fabf82f5 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.x-mark','data' => ['class' => 'w-6 h-6']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.x-mark'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-6 h-6']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal155e76c41fe51242bc25d269fabf82f5)): ?>
<?php $attributes = $__attributesOriginal155e76c41fe51242bc25d269fabf82f5; ?>
<?php unset($__attributesOriginal155e76c41fe51242bc25d269fabf82f5); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal155e76c41fe51242bc25d269fabf82f5)): ?>
<?php $component = $__componentOriginal155e76c41fe51242bc25d269fabf82f5; ?>
<?php unset($__componentOriginal155e76c41fe51242bc25d269fabf82f5); ?>
<?php endif; ?>
                </button>
            </div>

            <!-- Quick Actions -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($quickActions)): ?>
            <div class="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <p class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</p>
                <div class="flex flex-wrap gap-2">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $quickActions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $action): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <button 
                            wire:click="useQuickAction('<?php echo e($action['prompt']); ?>')"
                            class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                            <?php echo e($action['label']); ?>

                        </button>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Conversation -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $conversation; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $message): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div class="flex <?php echo e($message['role'] === 'user' ? 'justify-end' : 'justify-start'); ?>">
                        <div class="max-w-[80%]">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($message['role'] === 'system'): ?>
                                <div class="text-center">
                                    <p class="text-xs text-zinc-500 dark:text-zinc-400 italic"><?php echo e($message['content']); ?></p>
                                </div>
                            <?php elseif($message['role'] === 'user'): ?>
                                <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                                    <p class="text-sm"><?php echo e($message['content']); ?></p>
                                </div>
                                <p class="text-xs text-zinc-400 mt-1 text-right"><?php echo e($message['timestamp']->format('g:i A')); ?></p>
                            <?php else: ?>
                                <div class="flex items-start gap-2">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['class' => 'w-4 h-4 text-white']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-4 h-4 text-white']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                                    </div>
                                    <div>
                                        <div class="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                            <p class="text-sm text-zinc-900 dark:text-zinc-100"><?php echo e($message['content']); ?></p>
                                        </div>
                                        <p class="text-xs text-zinc-400 mt-1"><?php echo e($message['timestamp']->format('g:i A')); ?></p>
                                    </div>
                                </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <div class="flex items-center justify-center h-full text-zinc-400">
                        <div class="text-center">
                            <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['class' => 'w-12 h-12 mx-auto mb-3 opacity-20']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-12 h-12 mx-auto mb-3 opacity-20']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                            <p class="text-sm">Start a conversation with Skeemy</p>
                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                <!-- Processing Indicator -->
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($isProcessing): ?>
                    <div class="flex justify-start">
                        <div class="flex items-start gap-2">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                                <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['class' => 'w-4 h-4 text-white animate-pulse']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-4 h-4 text-white animate-pulse']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $attributes = $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99)): ?>
<?php $component = $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99; ?>
<?php unset($__componentOriginalcf196058b51a9cb5c102083fc6b9bc99); ?>
<?php endif; ?>
                            </div>
                            <div class="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div class="flex gap-1">
                                    <span class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                                    <span class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                                    <span class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>

            <!-- Input Area -->
            <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <form wire:submit.prevent="sendMessage" class="flex gap-2">
                    <input 
                        type="text" 
                        wire:model="userMessage"
                        placeholder="Ask Skeemy anything..."
                        class="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                        :disabled="$isProcessing">
                    <button 
                        type="submit"
                        :disabled="$isProcessing || empty(trim($userMessage))"
                        class="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <?php if (isset($component)) { $__componentOriginal42dcb69862a510f1b92ffbdd4006e172 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal42dcb69862a510f1b92ffbdd4006e172 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.paper-airplane','data' => ['class' => 'w-5 h-5']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.paper-airplane'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-5 h-5']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal42dcb69862a510f1b92ffbdd4006e172)): ?>
<?php $attributes = $__attributesOriginal42dcb69862a510f1b92ffbdd4006e172; ?>
<?php unset($__attributesOriginal42dcb69862a510f1b92ffbdd4006e172); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal42dcb69862a510f1b92ffbdd4006e172)): ?>
<?php $component = $__componentOriginal42dcb69862a510f1b92ffbdd4006e172; ?>
<?php unset($__componentOriginal42dcb69862a510f1b92ffbdd4006e172); ?>
<?php endif; ?>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/livewire/skeemy-assistant.blade.php ENDPATH**/ ?>