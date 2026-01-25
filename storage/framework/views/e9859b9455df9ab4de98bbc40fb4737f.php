

<?php $__env->startSection('title', 'Your Profile | Skeeme'); ?>

<?php $__env->startSection('content'); ?>
<div class="relative bg-white min-h-screen pt-24 pb-12">
    <!-- Background Decor -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-50/50 blur-[80px]"></div>
        <div class="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[80px]"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 relative z-10">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <br><br>
            <h1 class="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Your <span class="text-gradient">Profile.</span>
            </h1>
            <p class="text-lg text-slate-500 font-medium leading-relaxed">
                Manage your personal info, subscription, and credits.
            </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <!-- Sidebar / Plan Card -->
            <div class="lg:col-span-1 space-y-6" data-aos="fade-right">
                <!-- User Info Pill -->
                <div class="premium-card p-6 bg-slate-50/50 border-slate-100 flex flex-col items-center text-center">
                    <div class="size-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 ring-2 ring-indigo-50">
                        <img src="https://ui-avatars.com/api/?name=<?php echo e(urlencode($user->name ?: $user->email)); ?>&background=6366f1&color=fff&size=200" alt="Avatar" class="w-full h-full object-cover">
                    </div>
                    <h2 class="text-xl font-black text-slate-900 tracking-tight"><?php echo e($user->name ?: 'New Student'); ?></h2>
                    <p class="text-sm text-slate-500 font-bold mb-4"><?php echo e($user->email); ?></p>
                    <div class="px-4 py-1.5 bg-indigo-600 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-100">
                        <?php echo e($user->is_unlimited_student ? 'Unlimited Pro' : 'Free Member'); ?>

                    </div>
                </div>

                <!-- Credit Balance Card -->
                <div class="premium-card p-8 !bg-slate-900 !text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20" id="billing">
                    <div class="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                    <div class="relative z-10">
                        <h3 class="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Credit Balance</h3>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($user->is_unlimited_student): ?>
                            <div class="text-5xl font-extrabold flex items-center gap-2 !text-white">
                                <i class="fas fa-infinity text-3xl"></i>
                                <span>Unlimited</span>
                            </div>
                            <p class="text-[11px] text-slate-300 font-bold mt-4 leading-relaxed tracking-tight">
                                Your account is Pro. <br>You have infinite credits for this month.
                            </p>
                        <?php else: ?>
                            <div class="text-5xl font-black tracking-tighter !text-white"><?php echo e(number_format($user->credits)); ?></div>
                            <p class="text-[11px] text-slate-300 font-bold mt-4 leading-relaxed tracking-tight mb-8">
                                Credits remaining in your free trial. <br>Refills on the 1st of every month.
                            </p>

                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('products.students')).'#pricing','variant' => 'primary','class' => 'w-full !bg-white !text-indigo-900 font-black !py-3 shadow-lg shadow-black/20']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('products.students')).'#pricing','variant' => 'primary','class' => 'w-full !bg-white !text-indigo-900 font-black !py-3 shadow-lg shadow-black/20']); ?>
                                Get Unlimited Pro
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
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>
                </div>

                <!-- Billing History -->
                <div class="premium-card bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
                    <div class="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Billing History</h4>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight"><?php echo e(count($invoices)); ?> Records</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/50 border-b border-slate-100">
                                    <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                    <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $invoices; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $invoice): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                    <tr class="hover:bg-slate-50/30 transition-colors group">
                                        <td class="p-4">
                                            <p class="text-xs font-black text-slate-700"><?php echo e($invoice->invoice_date->format('M d, Y')); ?></p>
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter"><?php echo e($invoice->invoice_number); ?></p>
                                        </td>
                                        <td class="p-4 text-right">
                                            <span class="text-xs font-black text-slate-900"><?php echo e($invoice->currency); ?> <?php echo e(number_format($invoice->amount, 2)); ?></span>
                                        </td>
                                        <td class="p-4 text-center">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight border
                                                <?php if($invoice->status === 'paid'): ?> bg-emerald-50 text-emerald-600 border-emerald-100
                                                <?php elseif($invoice->status === 'pending'): ?> bg-amber-50 text-amber-600 border-amber-100
                                                <?php else: ?> bg-slate-50 text-slate-400 border-slate-100 <?php endif; ?>">
                                                <?php echo e($invoice->status); ?>

                                            </span>
                                        </td>
                                        <td class="p-4 text-right">
                                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => route('invoices.download', $invoice),'variant' => 'ghost','size' => 'xs','icon' => 'arrow-down-tray','inset' => 'top bottom']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('invoices.download', $invoice)),'variant' => 'ghost','size' => 'xs','icon' => 'arrow-down-tray','inset' => 'top bottom']); ?>
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
                                        </td>
                                    </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                    <tr>
                                        <td colspan="4" class="p-12 text-center">
                                            <div class="inline-flex items-center justify-center size-12 rounded-2xl bg-slate-50 mb-4 border border-slate-100">
                                                <i class="fas fa-file-invoice text-xl text-slate-200"></i>
                                            </div>
                                            <h5 class="text-xs font-black text-slate-900 uppercase tracking-widest">No Invoices Yet</h5>
                                            <p class="text-[10px] text-slate-400 font-bold mt-1">Upgrade to Pro to see your billing history.</p>
                                        </td>
                                    </tr>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Main Content / Forms -->
            <div class="lg:col-span-2 space-y-8" data-aos="fade-left">
                <!-- Personal Information -->
                <div class="premium-card p-8 bg-white shadow-xl shadow-slate-200/50">
                    <div class="flex items-center gap-3 mb-8">
                        <div class="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                            <?php if (isset($component)) { $__componentOriginalcbe89caa4ae8c58f7efd0ed6343c35ff = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcbe89caa4ae8c58f7efd0ed6343c35ff = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.user','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.user'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcbe89caa4ae8c58f7efd0ed6343c35ff)): ?>
<?php $attributes = $__attributesOriginalcbe89caa4ae8c58f7efd0ed6343c35ff; ?>
<?php unset($__attributesOriginalcbe89caa4ae8c58f7efd0ed6343c35ff); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcbe89caa4ae8c58f7efd0ed6343c35ff)): ?>
<?php $component = $__componentOriginalcbe89caa4ae8c58f7efd0ed6343c35ff; ?>
<?php unset($__componentOriginalcbe89caa4ae8c58f7efd0ed6343c35ff); ?>
<?php endif; ?>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">Personal Details</h3>
                    </div>

                    <form action="<?php echo e(route('student.profile.update')); ?>" method="POST" class="space-y-6">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PATCH'); ?>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['name' => 'name','label' => __('Full Name'),'value' => ''.e(old('name', $user->name)).'','required' => true,'class' => '!rounded-2xl !bg-slate-50/50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'name','label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(__('Full Name')),'value' => ''.e(old('name', $user->name)).'','required' => true,'class' => '!rounded-2xl !bg-slate-50/50']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['name' => 'email','label' => __('Email Address'),'type' => 'email','value' => ''.e(old('email', $user->email)).'','required' => true,'class' => '!rounded-2xl !bg-slate-50/50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'email','label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(__('Email Address')),'type' => 'email','value' => ''.e(old('email', $user->email)).'','required' => true,'class' => '!rounded-2xl !bg-slate-50/50']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                        </div>

                        <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['name' => 'phone_number','label' => __('Phone Number (Optional)'),'value' => ''.e(old('phone_number', $user->phone_number)).'','placeholder' => 'e.g. +234...','class' => '!rounded-2xl !bg-slate-50/50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'phone_number','label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(__('Phone Number (Optional)')),'value' => ''.e(old('phone_number', $user->phone_number)).'','placeholder' => 'e.g. +234...','class' => '!rounded-2xl !bg-slate-50/50']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>

                        <div class="pt-4 flex justify-end">
                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['type' => 'submit','variant' => 'primary','class' => '!rounded-xl !px-8 !py-3 font-black text-sm shadow-xl shadow-indigo-100']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'submit','variant' => 'primary','class' => '!rounded-xl !px-8 !py-3 font-black text-sm shadow-xl shadow-indigo-100']); ?>
                                Save Changes
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
                </div>

                <!-- Security / Password -->
                <div class="premium-card p-8 bg-white shadow-xl shadow-slate-200/50">
                    <div class="flex items-center gap-3 mb-8">
                        <div class="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
                            <?php if (isset($component)) { $__componentOriginal4047c68fd4c048751805a94f84af9876 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal4047c68fd4c048751805a94f84af9876 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.key','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.key'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal4047c68fd4c048751805a94f84af9876)): ?>
<?php $attributes = $__attributesOriginal4047c68fd4c048751805a94f84af9876; ?>
<?php unset($__attributesOriginal4047c68fd4c048751805a94f84af9876); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal4047c68fd4c048751805a94f84af9876)): ?>
<?php $component = $__componentOriginal4047c68fd4c048751805a94f84af9876; ?>
<?php unset($__componentOriginal4047c68fd4c048751805a94f84af9876); ?>
<?php endif; ?>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">Security</h3>
                    </div>

                    <form action="<?php echo e(route('student.profile.password')); ?>" method="POST" class="space-y-6">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PUT'); ?>
                        
                        <div class="grid md:grid-cols-3 gap-6">
                            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['name' => 'current_password','type' => 'password','label' => __('Current Password'),'required' => true,'class' => '!rounded-2xl !bg-slate-50/50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'current_password','type' => 'password','label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(__('Current Password')),'required' => true,'class' => '!rounded-2xl !bg-slate-50/50']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['name' => 'password','type' => 'password','label' => __('New Password'),'required' => true,'class' => '!rounded-2xl !bg-slate-50/50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'password','type' => 'password','label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(__('New Password')),'required' => true,'class' => '!rounded-2xl !bg-slate-50/50']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['name' => 'password_confirmation','type' => 'password','label' => __('Confirm Password'),'required' => true,'class' => '!rounded-2xl !bg-slate-50/50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['name' => 'password_confirmation','type' => 'password','label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(__('Confirm Password')),'required' => true,'class' => '!rounded-2xl !bg-slate-50/50']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
                        </div>

                        <div class="pt-4 flex justify-end">
                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['type' => 'submit','variant' => 'ghost','class' => '!rounded-xl !px-8 !py-3 font-bold text-sm hover:!bg-slate-50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'submit','variant' => 'ghost','class' => '!rounded-xl !px-8 !py-3 font-bold text-sm hover:!bg-slate-50']); ?>
                                Update Password
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
                </div>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\products\student-profile.blade.php ENDPATH**/ ?>