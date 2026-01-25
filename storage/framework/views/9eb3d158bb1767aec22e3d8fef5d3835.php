

<?php $__env->startSection('content'); ?>
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[5%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[15%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Feature Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center lg:text-left max-w-4xl">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">Connected Ecosystem</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Integrate your tools <br> 
                    <span class="text-gradient">with every workflow.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                    Connect Skeeme with your existing SIS, LMS, and communication tools through powerful APIs and pre-built integrations.
                </p>

                <div data-aos="fade-up" data-aos-delay="300" class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('contact')).'','variant' => 'primary','class' => '!rounded-2xl !px-10 !py-4 font-extrabold shadow-xl shadow-blue-100 !bg-blue-600 border-blue-600 hover:!bg-blue-700']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('contact')).'','variant' => 'primary','class' => '!rounded-2xl !px-10 !py-4 font-extrabold shadow-xl shadow-blue-100 !bg-blue-600 border-blue-600 hover:!bg-blue-700']); ?>
                        Explore Our API
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
            </div>
        </div>
    </section>

    <!-- Capabilities Grid -->
    <section class="relative z-10 pb-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="premium-card p-10" data-aos="fade-up">
                    <div class="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-plug"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">RESTful API</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Full access to exams, grades, and student data. Build custom integrations with complete documentation and SDKs.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-database"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">SIS Synchronization</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Automatic enrollment and profile updates. Keep your student records perfectly in sync with your central database.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-webhook"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Webhooks</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Real-time event notifications. Trigger actions in external systems when exams are submitted or grades are ready.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Developer Section -->
    <section class="py-32 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
             <div class="flex flex-col lg:flex-row items-center gap-24">
                <div class="flex-1 order-2 lg:order-1" data-aos="zoom-in">
                    <div class="premium-card !bg-slate-900 p-8 shadow-2xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <?php if (isset($component)) { $__componentOriginal0b9090dbc825cd3c1739a67277493948 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal0b9090dbc825cd3c1739a67277493948 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.code-bracket','data' => ['variant' => 'micro','class' => 'text-white size-12']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.code-bracket'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => 'text-white size-12']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal0b9090dbc825cd3c1739a67277493948)): ?>
<?php $attributes = $__attributesOriginal0b9090dbc825cd3c1739a67277493948; ?>
<?php unset($__attributesOriginal0b9090dbc825cd3c1739a67277493948); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal0b9090dbc825cd3c1739a67277493948)): ?>
<?php $component = $__componentOriginal0b9090dbc825cd3c1739a67277493948; ?>
<?php unset($__componentOriginal0b9090dbc825cd3c1739a67277493948); ?>
<?php endif; ?>
                        </div>
                        <pre class="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre"><code><span class="text-indigo-400">POST</span> /api/v1/exams
<span class="text-slate-400">Authorization:</span> Bearer <span class="text-amber-400">EY_7392...</span>

{
  <span class="text-blue-400">"name"</span>: <span class="text-amber-400">"Final Assessment"</span>,
  <span class="text-blue-400">"course_id"</span>: <span class="text-slate-200">102</span>,
  <span class="text-blue-400">"duration"</span>: <span class="text-slate-200">120</span>,
  <span class="text-blue-400">"automatic_grading"</span>: <span class="text-indigo-400">true</span>
}</code></pre>
                    </div>
                </div>
                <div class="flex-1 order-1 lg:order-2" data-aos="fade-left">
                    <h4 class="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">Developer-First <br>Platform.</h4>
                    <p class="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                        Our API is purpose-built for institutions that need custom workflows. With exhaustive documentation and interactive testing tools.
                    </p>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['variant' => 'micro','class' => 'text-indigo-600']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => 'text-indigo-600']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> Complete API documentation
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-700">
                             <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['variant' => 'micro','class' => 'text-indigo-600']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => 'text-indigo-600']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> Interactive API explorer
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-700">
                             <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['variant' => 'micro','class' => 'text-indigo-600']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro','class' => 'text-indigo-600']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> Enterprise-grade SSO support
                        </li>
                    </ul>
                </div>
             </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-32 relative overflow-hidden bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 data-aos="fade-up" class="text-4xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Endless possibilities. <br> One platform.
            </h2>
            <p data-aos="fade-up" data-aos-delay="100" class="text-lg lg:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                Connect your existing infrastructure to Nigeria's most advanced management platform.
            </p>
            <div data-aos="fade-up" data-aos-delay="200" class="flex justify-center">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('contact')).'','variant' => 'primary','class' => '!rounded-2xl !px-12 !py-4 text-base font-extrabold !bg-blue-600 border-blue-600 hover:!bg-blue-700']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('contact')).'','variant' => 'primary','class' => '!rounded-2xl !px-12 !py-4 text-base font-extrabold !bg-blue-600 border-blue-600 hover:!bg-blue-700']); ?>
                    Get Access
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
        </div>
    </section>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\features\integrations.blade.php ENDPATH**/ ?>