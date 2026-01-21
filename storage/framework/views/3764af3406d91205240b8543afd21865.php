

<?php $__env->startSection('content'); ?>
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Feature Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center lg:text-left max-w-4xl">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">Advanced Analytics</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Data-driven insights <br> 
                    <span class="text-gradient">for every student.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                    Deep insights into exam performance, student learning patterns, and question effectiveness powered by AI-driven analysis.
                </p>

                <div data-aos="fade-up" data-aos-delay="300" class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-10 !py-4 font-extrabold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-10 !py-4 font-extrabold']); ?>
                        Try Analytics Now
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
                <!-- Capability 1 -->
                <div class="premium-card p-10" data-aos="fade-up">
                    <div class="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Performance Trends</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Track score trends over time, identify improving and struggling students, and monitor class-wide performance patterns in real-time.</p>
                </div>

                <!-- Capability 2 -->
                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Question Analysis</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Analyze question effectiveness, difficulty levels, discrimination indices, and identify problematic questions automatically using AI.</p>
                </div>

                <!-- Capability 3 -->
                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Learning Insights</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Understand student learning patterns, skill mastery levels, knowledge gaps, and Bloom's taxonomy performance breakdown.</p>
                </div>

                <!-- Capability 4 -->
                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="300">
                    <div class="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Mastery Tracking</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Monitor each student's mastery level across different skills and topics. Get personalized recommendations for early intervention.</p>
                </div>

                <!-- Capability 5 -->
                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="400">
                    <div class="size-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-users-viewfinder"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Class Benchmarks</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Compare class performance against national benchmarks, identify performance gaps, and visualize grade distribution patterns.</p>
                </div>

                <!-- Capability 6 -->
                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="500">
                    <div class="size-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">AI Recommendations</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Get intelligent recommendations for curriculum adjustments, targeted interventions, and areas needing focus for each class.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Metrics Row -->
    <section class="py-32 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto mb-24">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">The Engine</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl font-extrabold text-slate-900 tracking-tight">Key Metrics Tracked</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm" data-aos="fade-up">
                    <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Performance</h4>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-indigo-500"></div> Medians & SD</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-indigo-500"></div> Pass Rates</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-indigo-500"></div> Grade Distribution</li>
                    </ul>
                </div>
                <div class="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="100">
                    <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Engagement</h4>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-blue-500"></div> Time on Task</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-blue-500"></div> Attempt Counts</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-blue-500"></div> Submission Speed</li>
                    </ul>
                </div>
                <div class="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="200">
                    <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Questions</h4>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-emerald-500"></div> Difficulty Index</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-emerald-500"></div> Discrimination</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-emerald-500"></div> Distractor Success</li>
                    </ul>
                </div>
                <div class="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="300">
                    <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Reporting</h4>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-amber-500"></div> CSV Exports</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-amber-500"></div> Stakeholder PDFs</li>
                        <li class="flex items-center gap-3 text-xs font-bold text-slate-500"><div class="size-1.5 rounded-full bg-amber-500"></div> Audit Logs</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-32 relative overflow-hidden bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 data-aos="fade-up" class="text-4xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Stop guessing. <br> Start knowing.
            </h2>
            <p data-aos="fade-up" data-aos-delay="100" class="text-lg lg:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                Join the schools using data to drive student success today.
            </p>
            <div data-aos="fade-up" data-aos-delay="200" class="flex justify-center">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-12 !py-4 text-base font-extrabold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-2xl !px-12 !py-4 text-base font-extrabold']); ?>
                    Unlock Insights
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

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\features\analytics.blade.php ENDPATH**/ ?>