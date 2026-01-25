

<?php $__env->startSection('content'); ?>
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Personalized Walkthrough</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    See Skeeme in <br> 
                    <span class="text-gradient">action.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Book a live demo with our education specialists to see how Skeeme can transform your institution.
                </p>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <section class="relative z-10 py-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <!-- Book Demo Form -->
                <div data-aos="fade-right">
                    <div class="premium-card p-10">
                        <div class="mb-10">
                            <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Schedule your demo</h2>
                            <p class="text-sm text-slate-500 font-medium">Fill out the form and we'll be in touch to schedule a time that works for you.</p>
                        </div>

                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(session('success')): ?>
                            <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-6 mb-8 flex items-center gap-4">
                                <div class="size-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
                                </div>
                                <p class="text-sm font-bold"><?php echo e(session('success')); ?></p>
                            </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                        <form action="<?php echo e(route('book-demo.store')); ?>" method="POST" class="space-y-6">
                            <?php echo csrf_field(); ?>
                            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['label' => 'Full Name','name' => 'name','placeholder' => 'John Doe','value' => ''.e(old('name')).'','required' => true,'class' => '!rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Full Name','name' => 'name','placeholder' => 'John Doe','value' => ''.e(old('name')).'','required' => true,'class' => '!rounded-xl']); ?>
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
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['label' => 'School Name','name' => 'school_name','placeholder' => 'Springfield High','value' => ''.e(old('school_name')).'','required' => true,'class' => '!rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'School Name','name' => 'school_name','placeholder' => 'Springfield High','value' => ''.e(old('school_name')).'','required' => true,'class' => '!rounded-xl']); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['label' => 'Role','name' => 'role','placeholder' => 'Principal / Administrator','value' => ''.e(old('role')).'','class' => '!rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Role','name' => 'role','placeholder' => 'Principal / Administrator','value' => ''.e(old('role')).'','class' => '!rounded-xl']); ?>
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

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['label' => 'Email Address','type' => 'email','name' => 'email','placeholder' => 'john@school.edu','value' => ''.e(old('email')).'','required' => true,'class' => '!rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Email Address','type' => 'email','name' => 'email','placeholder' => 'john@school.edu','value' => ''.e(old('email')).'','required' => true,'class' => '!rounded-xl']); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['label' => 'Phone Number','type' => 'tel','name' => 'phone','placeholder' => '+234...','value' => ''.e(old('phone')).'','class' => '!rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Phone Number','type' => 'tel','name' => 'phone','placeholder' => '+234...','value' => ''.e(old('phone')).'','class' => '!rounded-xl']); ?>
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
                            
                            <?php if (isset($component)) { $__componentOriginal0ee30026125d1a66523211147b00e4dc = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal0ee30026125d1a66523211147b00e4dc = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::textarea','data' => ['label' => 'What are you looking to improve?','name' => 'message','placeholder' => 'e.g. Automated grading, Attendance tracking...','rows' => '4','class' => '!rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::textarea'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'What are you looking to improve?','name' => 'message','placeholder' => 'e.g. Automated grading, Attendance tracking...','rows' => '4','class' => '!rounded-xl']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal0ee30026125d1a66523211147b00e4dc)): ?>
<?php $attributes = $__attributesOriginal0ee30026125d1a66523211147b00e4dc; ?>
<?php unset($__attributesOriginal0ee30026125d1a66523211147b00e4dc); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal0ee30026125d1a66523211147b00e4dc)): ?>
<?php $component = $__componentOriginal0ee30026125d1a66523211147b00e4dc; ?>
<?php unset($__componentOriginal0ee30026125d1a66523211147b00e4dc); ?>
<?php endif; ?>

                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['type' => 'submit','variant' => 'primary','class' => 'w-full !rounded-2xl !py-4 font-extrabold shadow-xl shadow-indigo-100']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'submit','variant' => 'primary','class' => 'w-full !rounded-2xl !py-4 font-extrabold shadow-xl shadow-indigo-100']); ?>
                                Request Demo <?php if (isset($component)) { $__componentOriginal5c84e1af936cb00c34687173a7f14ca8 = $component; } ?>
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
                        </form>
                    </div>
                </div>

                <!-- Info Column -->
                <div class="space-y-12" data-aos="fade-left">
                    <div class="space-y-6">
                        <h3 class="text-xl font-extrabold text-slate-900">What to expect?</h3>
                        
                        <div class="flex items-start gap-4">
                            <div class="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                1
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 mb-1">Tailored Walkthrough</div>
                                <div class="text-sm text-slate-500 font-medium">We'll show you features relevant to your specific challenges.</div>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                2
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 mb-1">Pricing Discussion</div>
                                <div class="text-sm text-slate-500 font-medium">Get a clear understanding of costs and plans suitable for your institution size.</div>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                3
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 mb-1">Q&A Session</div>
                                <div class="text-sm text-slate-500 font-medium">Ask any technical or operational questions you have.</div>
                            </div>
                        </div>
                    </div>

                    <div class="premium-card p-8 bg-slate-900 text-white">
                        <h3 class="text-lg font-extrabold mb-4">Trusted by modern schools</h3>
                        <p class="text-slate-400 text-sm font-medium mb-6">
                            Join the institutions that have modernized their operations with Skeeme.
                        </p>
                        <div class="flex flex-wrap gap-4 opacity-50 grayscale">
                            <!-- Placeholders for logos if needed, or just text -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\book-demo.blade.php ENDPATH**/ ?>