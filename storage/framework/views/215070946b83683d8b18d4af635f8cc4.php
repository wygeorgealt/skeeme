

<?php $__env->startSection('content'); ?>
<div class="pt-32 pb-24 bg-white dark:bg-zinc-950 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
            <h1 class="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 tracking-tight">
                Seamless <span class="text-gradient">Integrations</span>
            </h1>
            <p class="text-lg text-zinc-600 dark:text-zinc-400">
                Skeeme connects with the tools you already use to create a unified, high-performance academic ecosystem.
            </p>
        </div>

        <!-- Integration Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Slack -->
            <div class="premium-card p-10 group" data-aos="fade-up" data-aos-delay="100">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <i class="fab fa-slack text-3xl text-[#4A154B]"></i>
                </div>
                <h3 class="text-xl font-bold mb-4 dark:text-zinc-100">Slack</h3>
                <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    Turn your workspace into an automated headquarters. Get real-time alerts for exam completions, attendance dips, and system health.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Automated Grading Alerts
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Live Class Pings
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Admin Health Reports
                    </li>
                </ul>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(auth()->guard()->check()): ?>
                    <div class="mt-8">
                        <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('integrations.redirect', 'slack')).'','variant' => 'primary','size' => 'sm','class' => 'w-full !rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('integrations.redirect', 'slack')).'','variant' => 'primary','size' => 'sm','class' => 'w-full !rounded-xl']); ?>Connect Slack <?php echo $__env->renderComponent(); ?>
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
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>

            <!-- Zoom -->
            <div class="premium-card p-10 group" data-aos="fade-up" data-aos-delay="200">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <i class="fas fa-video text-3xl text-[#2D8CFF]"></i>
                </div>
                <h3 class="text-xl font-bold mb-4 dark:text-zinc-100">Zoom</h3>
                <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    The Virtual Classroom Hub. Start live sessions instantly and let automation handle the rest—from recording to student rewind.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> One-Click Join Now
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Automated Recording Sync
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Class Summary Archive
                    </li>
                </ul>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(auth()->guard()->check()): ?>
                    <div class="mt-8">
                        <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('integrations.redirect', 'zoom')).'','variant' => 'primary','size' => 'sm','class' => 'w-full !rounded-xl']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('integrations.redirect', 'zoom')).'','variant' => 'primary','size' => 'sm','class' => 'w-full !rounded-xl']); ?>Connect Zoom <?php echo $__env->renderComponent(); ?>
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
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>

            <!-- Google Calendar -->
            <div class="premium-card p-10 group" data-aos="fade-up" data-aos-delay="300">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <i class="fas fa-calendar-alt text-3xl text-[#4285F4]"></i>
                </div>
                <h3 class="text-xl font-bold mb-4 dark:text-zinc-100">Google Calendar</h3>
                <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    Keep everyone on the same page. Synchronize exams, deadlines, and class schedules across students' personal calendars.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> 2-Way Schedule Sync
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Automated Reminders
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Resource Conflict Detection
                    </li>
                </ul>
            </div>
        </div>

        <!-- CTA -->
        <div class="mt-24 p-12 rounded-[2.5rem] bg-zinc-900 text-center relative overflow-hidden" data-aos="fade-up">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 opacity-50"></div>
            <h2 class="text-3xl font-bold text-white mb-6 relative z-10">Connect Your Entire School</h2>
            <p class="text-zinc-400 mb-10 max-w-2xl mx-auto relative z-10">Experience the power of a fully integrated academic platform and transform your school's management today.</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!px-8 !py-3 !rounded-xl !font-bold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!px-8 !py-3 !rounded-xl !font-bold']); ?>Get Started Free <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('contact')).'','variant' => 'ghost','class' => '!text-white hover:!bg-white/10 !px-8 !py-3 !rounded-xl !font-bold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('contact')).'','variant' => 'ghost','class' => '!text-white hover:!bg-white/10 !px-8 !py-3 !rounded-xl !font-bold']); ?>Contact Sales <?php echo $__env->renderComponent(); ?>
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
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/landing/integrations.blade.php ENDPATH**/ ?>