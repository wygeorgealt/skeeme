<?php if (isset($component)) { $__componentOriginal6107cafe1a6b2bb3ae2fbdc60a313162 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6107cafe1a6b2bb3ae2fbdc60a313162 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.layouts.auth','data' => ['title' => 'Select Your Role']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('layouts.auth'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Select Your Role']); ?>
    <div class="flex flex-col gap-8">
        <div class="text-center space-y-2">
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">Step 1: <span class="text-gradient">Who are you?</span></h1>
            <p class="text-sm text-slate-500 font-medium">Choose your account type to continue.</p>
        </div>

        <form action="<?php echo e(route('role-selection.store')); ?>" method="POST" class="flex flex-col gap-4">
            <?php echo csrf_field(); ?>
            
            <!-- School Admin -->
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="admin" class="peer sr-only" required>
                <div class="p-5 border-2 rounded-3xl transition-all duration-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/30 border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 size-24 bg-indigo-500/5 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-indigo-100">
                            <?php if (isset($component)) { $__componentOriginalf432e86c7e5ebcd2aa197aac0894d525 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf432e86c7e5ebcd2aa197aac0894d525 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.building-library','data' => ['variant' => 'solid','class' => 'size-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.building-library'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'solid','class' => 'size-7']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf432e86c7e5ebcd2aa197aac0894d525)): ?>
<?php $attributes = $__attributesOriginalf432e86c7e5ebcd2aa197aac0894d525; ?>
<?php unset($__attributesOriginalf432e86c7e5ebcd2aa197aac0894d525); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf432e86c7e5ebcd2aa197aac0894d525)): ?>
<?php $component = $__componentOriginalf432e86c7e5ebcd2aa197aac0894d525; ?>
<?php unset($__componentOriginalf432e86c7e5ebcd2aa197aac0894d525); ?>
<?php endif; ?>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-slate-900 tracking-tight">School Admin</h3>
                            <p class="text-[11px] text-slate-500 mt-1 font-bold leading-tight">I want to manage my entire school, teachers, and students.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-indigo-600">
                            <div class="size-3 rounded-full bg-indigo-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            <!-- Lecturer -->
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="lecturer" class="peer sr-only">
                <div class="p-5 border-2 rounded-3xl transition-all duration-300 peer-checked:border-blue-600 peer-checked:bg-blue-50/30 border-slate-100 hover:border-blue-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 size-24 bg-blue-500/5 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm border border-blue-100">
                            <?php if (isset($component)) { $__componentOriginale0880cb6488d85d9ca54288aa080a834 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0880cb6488d85d9ca54288aa080a834 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.academic-cap','data' => ['variant' => 'solid','class' => 'size-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.academic-cap'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'solid','class' => 'size-7']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginale0880cb6488d85d9ca54288aa080a834)): ?>
<?php $attributes = $__attributesOriginale0880cb6488d85d9ca54288aa080a834; ?>
<?php unset($__attributesOriginale0880cb6488d85d9ca54288aa080a834); ?>
<?php endif; ?>
<?php if (isset($__componentOriginale0880cb6488d85d9ca54288aa080a834)): ?>
<?php $component = $__componentOriginale0880cb6488d85d9ca54288aa080a834; ?>
<?php unset($__componentOriginale0880cb6488d85d9ca54288aa080a834); ?>
<?php endif; ?>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-slate-900 tracking-tight">Lecturer</h3>
                            <p class="text-[11px] text-slate-500 mt-1 font-bold leading-tight">I want to create exams and grade my classes.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-blue-600">
                            <div class="size-3 rounded-full bg-blue-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            <!-- Student -->
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="student" class="peer sr-only">
                <div class="p-5 border-2 rounded-3xl transition-all duration-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-50/30 border-slate-100 hover:border-emerald-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 size-24 bg-emerald-500/5 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-emerald-100">
                            <?php if (isset($component)) { $__componentOriginalcf196058b51a9cb5c102083fc6b9bc99 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcf196058b51a9cb5c102083fc6b9bc99 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.sparkles','data' => ['variant' => 'solid','class' => 'size-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.sparkles'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'solid','class' => 'size-7']); ?>
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
                        <div class="flex-1 text-left">
                            <h3 class="font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                                Independent Student 
                                <span class="bg-emerald-100 text-[10px] text-emerald-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">New</span>
                            </h3>
                            <p class="text-[11px] text-slate-500 mt-1 font-bold leading-tight">Use AI tools to generate quizzes and study smarter.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-emerald-600">
                            <div class="size-3 rounded-full bg-emerald-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__errorArgs = ['role'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                <p class="text-xs text-red-500 font-bold px-2 animate-bounce"><?php echo e($message); ?></p>
            <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <div class="pt-4">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['type' => 'submit','variant' => 'primary','class' => 'w-full !rounded-2xl !py-4 font-black text-base tracking-tight shadow-xl shadow-indigo-100']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'submit','variant' => 'primary','class' => 'w-full !rounded-2xl !py-4 font-black text-base tracking-tight shadow-xl shadow-indigo-100']); ?>
                    <?php echo e(__('Continue to Set Up')); ?> <?php if (isset($component)) { $__componentOriginal5c84e1af936cb00c34687173a7f14ca8 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5c84e1af936cb00c34687173a7f14ca8 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.arrow-right','data' => ['variant' => 'micro','class' => 'ml-2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.arrow-right'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => 'ml-2']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5c84e1af936cb00c34687173a7f14ca8)): ?>
<?php $attributes = $__attributesOriginal5c84e1af936cb00c34687173a7f14ca8; ?>
<?php unset($__attributesOriginal5c84e1af936cb00c34687173a7f14ca8); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5c84e1af936cb00c34687173a7f14ca8)): ?>
<?php $component = $__componentOriginal5c84e1af936cb00c34687173a7f14ca8; ?>
<?php unset($__componentOriginal5c84e1af936cb00c34687173a7f14ca8); ?>
<?php endif; ?>
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
        </form>

        <div class="text-center pt-2">
            <?php if (isset($component)) { $__componentOriginal54ddb5b70b37b1e1cf0f2f95e4c53477 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal54ddb5b70b37b1e1cf0f2f95e4c53477 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::link','data' => ['href' => route('home'),'class' => 'text-[10px] text-slate-400 hover:text-indigo-600 uppercase font-black tracking-[0.2em] no-underline transition-all duration-300 group']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::link'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('home')),'class' => 'text-[10px] text-slate-400 hover:text-indigo-600 uppercase font-black tracking-[0.2em] no-underline transition-all duration-300 group']); ?>
                <i class="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i> Back to Home
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal54ddb5b70b37b1e1cf0f2f95e4c53477)): ?>
<?php $attributes = $__attributesOriginal54ddb5b70b37b1e1cf0f2f95e4c53477; ?>
<?php unset($__attributesOriginal54ddb5b70b37b1e1cf0f2f95e4c53477); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal54ddb5b70b37b1e1cf0f2f95e4c53477)): ?>
<?php $component = $__componentOriginal54ddb5b70b37b1e1cf0f2f95e4c53477; ?>
<?php unset($__componentOriginal54ddb5b70b37b1e1cf0f2f95e4c53477); ?>
<?php endif; ?>
        </div>
    </div>

    <style>
        /* Custom radio logic */
        input:checked[value="admin"] + div { border-color: #4f46e5 !important; background-color: rgb(79 70 229 / 0.05) !important; }
        input:checked[value="lecturer"] + div { border-color: #2563eb !important; background-color: rgb(37 99 235 / 0.05) !important; }
        input:checked[value="student"] + div { border-color: #059669 !important; background-color: rgb(5 150 105 / 0.05) !important; }
        
        input:checked + div div:last-child { border-color: currentColor !important; }
        input:checked + div div:last-child div { transform: scale(1) !important; }
    </style>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6107cafe1a6b2bb3ae2fbdc60a313162)): ?>
<?php $attributes = $__attributesOriginal6107cafe1a6b2bb3ae2fbdc60a313162; ?>
<?php unset($__attributesOriginal6107cafe1a6b2bb3ae2fbdc60a313162); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6107cafe1a6b2bb3ae2fbdc60a313162)): ?>
<?php $component = $__componentOriginal6107cafe1a6b2bb3ae2fbdc60a313162; ?>
<?php unset($__componentOriginal6107cafe1a6b2bb3ae2fbdc60a313162); ?>
<?php endif; ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\role-selection.blade.php ENDPATH**/ ?>