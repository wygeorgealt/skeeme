

<?php $__env->startSection('content'); ?>
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Feature Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center lg:text-left max-w-4xl">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Precision Reporting</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Insights ready for <br> 
                    <span class="text-gradient">any stakeholder.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                    Generate detailed reports on student progress, exam performance, attendance, and learning outcomes with professional formatting.
                </p>

                <div data-aos="fade-up" data-aos-delay="300" class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-10 !py-4 font-extrabold shadow-xl shadow-emerald-100 border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-10 !py-4 font-extrabold shadow-xl shadow-emerald-100 border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700']); ?>
                        Generate Your First Report
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
                    <div class="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Student Progress</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Individual reports showing exam performance, grades, mastery levels, and personalize growth recommendations.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Class Analytics</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Comprehensive class-wide performance analysis with score distributions, pass rates, and trend analysis.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Attendance Logs</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Detailed attendance tracking with patterns, trends, and compliance documentation for all stakeholders.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Row -->
    <section class="py-32 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto mb-24">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Built for clarity</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need in a report.</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" data-aos="fade-up">
                    <div class="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><?php if (isset($component)) { $__componentOriginal82067727c95f13dc4198f80e35cb9c11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal82067727c95f13dc4198f80e35cb9c11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.chart-bar','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.chart-bar'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal82067727c95f13dc4198f80e35cb9c11)): ?>
<?php $attributes = $__attributesOriginal82067727c95f13dc4198f80e35cb9c11; ?>
<?php unset($__attributesOriginal82067727c95f13dc4198f80e35cb9c11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal82067727c95f13dc4198f80e35cb9c11)): ?>
<?php $component = $__componentOriginal82067727c95f13dc4198f80e35cb9c11; ?>
<?php unset($__componentOriginal82067727c95f13dc4198f80e35cb9c11); ?>
<?php endif; ?></div>
                    <div>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Visual Insight</h4>
                        <p class="text-xs text-slate-500 font-medium">Interactive charts that make complex data easy to understand at a glance.</p>
                    </div>
                </div>
                <div class="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><?php if (isset($component)) { $__componentOriginal2ec15606c28ac475c0acbe5c53b8b490 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2ec15606c28ac475c0acbe5c53b8b490 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.arrow-down-tray','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.arrow-down-tray'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2ec15606c28ac475c0acbe5c53b8b490)): ?>
<?php $attributes = $__attributesOriginal2ec15606c28ac475c0acbe5c53b8b490; ?>
<?php unset($__attributesOriginal2ec15606c28ac475c0acbe5c53b8b490); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2ec15606c28ac475c0acbe5c53b8b490)): ?>
<?php $component = $__componentOriginal2ec15606c28ac475c0acbe5c53b8b490; ?>
<?php unset($__componentOriginal2ec15606c28ac475c0acbe5c53b8b490); ?>
<?php endif; ?></div>
                    <div>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Multiple Formats</h4>
                        <p class="text-xs text-slate-500 font-medium">Export seamlessly as professional PDFs, CSVs for Excel, or view securely online.</p>
                    </div>
                </div>
                <div class="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><?php if (isset($component)) { $__componentOriginal7649f9fde3f65e39f506d39dd1ac88cb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal7649f9fde3f65e39f506d39dd1ac88cb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.lock-closed','data' => ['variant' => 'micro']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.lock-closed'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'micro']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal7649f9fde3f65e39f506d39dd1ac88cb)): ?>
<?php $attributes = $__attributesOriginal7649f9fde3f65e39f506d39dd1ac88cb; ?>
<?php unset($__attributesOriginal7649f9fde3f65e39f506d39dd1ac88cb); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal7649f9fde3f65e39f506d39dd1ac88cb)): ?>
<?php $component = $__componentOriginal7649f9fde3f65e39f506d39dd1ac88cb; ?>
<?php unset($__componentOriginal7649f9fde3f65e39f506d39dd1ac88cb); ?>
<?php endif; ?></div>
                    <div>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Secure Sharing</h4>
                        <p class="text-xs text-slate-500 font-medium">Role-based access ensures only authorized stakeholders see sensitive data.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-32 relative overflow-hidden bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 data-aos="fade-up" class="text-4xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Simple reports. <br> Better outcomes.
            </h2>
            <p data-aos="fade-up" data-aos-delay="100" class="text-lg lg:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                Join the educators using precision data to guide their school's success.
            </p>
            <div data-aos="fade-up" data-aos-delay="200" class="flex justify-center">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-12 !py-4 text-base font-extrabold !bg-emerald-600 border-emerald-600 hover:!bg-emerald-700']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-12 !py-4 text-base font-extrabold !bg-emerald-600 border-emerald-600 hover:!bg-emerald-700']); ?>
                    Start Reporting Now
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

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/landing/features/reports.blade.php ENDPATH**/ ?>