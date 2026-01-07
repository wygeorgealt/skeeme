<?php $__env->startSection('content'); ?>
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse"></div>
        <div class="absolute top-[15%] -right-[5%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[120px]"></div>
    </div>

    <!-- Hero Section -->
    <section class="relative z-10 pt-32 pb-24 lg:pt-40 lg:pb-40 overflow-hidden">
        <!-- Background Orbital System (Centered) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <!-- Glows -->
            <div class="absolute w-full h-full bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>

            <!-- Enhanced Rings (Scaled Up for Background) -->
            <svg class="w-[150%] h-[150%] lg:w-[120%] lg:h-[120%] opacity-25" viewBox="0 0 500 500">
                <circle cx="250" cy="250" r="140" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="12 12" class="text-indigo-400 animate-[spin_40s_linear_infinite]" />
                <circle cx="250" cy="250" r="210" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="8 20" class="text-blue-400 animate-[spin_70s_linear_infinite_reverse]" />
                <circle cx="250" cy="250" r="280" fill="none" stroke="currentColor" stroke-width="0.5" class="text-slate-200 animate-[spin_100s_linear_infinite]" />
                <circle cx="250" cy="250" r="350" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 30" class="text-slate-100 animate-[spin_120s_linear_infinite_reverse]" />
            </svg>
        </div>

        <div class="max-w-4xl mx-auto px-6 relative z-10 text-center">

            <!-- Heading -->
            <!-- Heading -->
            <h1 data-aos="fade-up" data-aos-delay="100" class="mt-8 text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                The AI your <br class="hidden lg:block"> 
                <span class="text-gradient">school deserves.</span>
            </h1>

            <!-- Body -->
            <p data-aos="fade-up" data-aos-delay="200" class="text-base lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
                Automated attendance, AI-powered exam management, and real-time analytics. Save 20+ hours weekly with Nigeria's most advanced school platform.
            </p>

            <!-- Buttons -->
            <div data-aos="fade-up" data-aos-delay="250" class="flex flex-col sm:flex-row items-center gap-3 justify-center mb-16">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-xl !px-8 !py-3 text-sm font-extrabold shadow-xl shadow-indigo-100']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('register')).'','variant' => 'primary','class' => '!rounded-xl !px-8 !py-3 text-sm font-extrabold shadow-xl shadow-indigo-100']); ?>
                    Get Started Free
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
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => '#solutions','variant' => 'ghost','class' => '!rounded-xl !px-6 !py-3 !text-sm !font-extrabold !text-slate-900 hover:!text-indigo-600 hover:!bg-indigo-50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => '#solutions','variant' => 'ghost','class' => '!rounded-xl !px-6 !py-3 !text-sm !font-extrabold !text-slate-900 hover:!text-indigo-600 hover:!bg-indigo-50']); ?>
                    Explore Platform <?php if (isset($component)) { $__componentOriginal5c84e1af936cb00c34687173a7f14ca8 = $component; } ?>
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

            <!-- Trust Bar -->
            <div data-aos="fade-up" data-aos-delay="300" class="pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
                <span class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Powered by Leading AI</span>
                <div class="flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <img src="<?php echo e(asset('landing/Deepseek-Logo-White-PNG.png')); ?>" alt="Deepseek" class="h-6 filter brightness-0">
                    <img src="<?php echo e(asset('landing/OpenAI-Logo-PNG.png')); ?>" alt="OpenAI" class="h-6 filter brightness-0">
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Row (Premium dashboard style) - Voided for launch
    <section class="py-12 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                <div class="text-center lg:text-left" data-aos="fade-up">
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Total Students</div>
                    <div class="text-3xl font-black text-slate-900 tracking-tight">50,000+</div>
                </div>
                <div class="text-center lg:text-left" data-aos="fade-up" data-aos-delay="100">
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Exams Created</div>
                    <div class="text-3xl font-black text-slate-900 tracking-tight">1.2M</div>
                </div>
                <div class="text-center lg:text-left" data-aos="fade-up" data-aos-delay="200">
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Time Saved</div>
                    <div class="text-3xl font-black text-indigo-600 tracking-tight">20h/wk</div>
                </div>
                <div class="text-center lg:text-left" data-aos="fade-up" data-aos-delay="300">
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">User Rating</div>
                    <div class="text-3xl font-black text-slate-900 tracking-tight">4.9/5</div>
                </div>
            </div>
        </div>
    </section>
    -->

    <!-- SaaS Feature Showcase (Replacing Problems) -->
    <section class="py-32 relative overflow-hidden">
        <!-- Background Decorative Bloom -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
            <div class="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
            <div class="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        </div>

        <div class="max-w-7xl mx-auto px-6 relative z-10">
            <div class="text-center max-w-3xl mx-auto mb-32">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Product Experience</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Master your school with <br>surgical precision.</h3>
                <p data-aos="fade-up" data-aos-delay="200" class="text-lg text-slate-500 font-medium leading-relaxed">We've broken down complex campus operations into three core pillars of excellence. Beautifully simple, incredibly powerful.</p>
            </div>

            <div class="space-y-48">
                <!-- Pillar 1: Intelligence -->
                <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div class="flex-1 order-2 lg:order-1" data-aos="fade-right">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
                            <span class="size-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Intelligence
                        </div>
                        <h4 class="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-[1.1]">Actionable insights, <br>not just data.</h4>
                        <p class="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                            Our dark-mode analytics engine transforms raw attendance and grade data into predictive trends. Know which students need help before they even ask.
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div class="text-indigo-600 mb-2"><i class="fas fa-chart-line text-xl"></i></div>
                                <div class="text-sm font-black text-slate-900 mb-1">Predictive Trends</div>
                                <div class="text-xs text-slate-500 font-medium">Spot performance dips early.</div>
                            </div>
                            <div class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div class="text-emerald-500 mb-2"><i class="fas fa-user-check text-xl"></i></div>
                                <div class="text-sm font-black text-slate-900 mb-1">Live Attendance</div>
                                <div class="text-xs text-slate-500 font-medium">Real-time engagement tracking.</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 order-1 lg:order-2" data-aos="zoom-in">
                        <div class="relative group">
                            <div class="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div class="relative z-10 w-full overflow-hidden rounded-2xl" style="-webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); mask-image: linear-gradient(to bottom, black 50%, transparent 100%);">
                                <img src="<?php echo e(asset('landing/analytics.png')); ?>" alt="Intelligence Analytics" class="w-full h-auto drop-shadow-2xl">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pillar 2: Construction -->
                <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div class="flex-1" data-aos="zoom-in">
                        <div class="relative group">
                            <div class="absolute -inset-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div class="relative z-10 w-full overflow-hidden rounded-2xl" style="-webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); mask-image: linear-gradient(to bottom, black 50%, transparent 100%);">
                                <img src="<?php echo e(asset('landing/ai preview-modified.png')); ?>" alt="AI Exam Preview" class="w-full h-auto drop-shadow-2xl">
                            </div>
                        </div>
                    </div>
                    <div class="flex-1" data-aos="fade-left">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest mb-6">
                            <span class="size-1.5 rounded-full bg-orange-500 animate-pulse"></span> Construction
                        </div>
                        <h4 class="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-[1.1]">Build world-class <br>exams in minutes.</h4>
                        <p class="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                            Our AI Exam Kit handles the heavy lifting. From question generation to automatic grading, we ensure every assessment is balanced, rigorous, and completely secure.
                        </p>
                        <div class="flex flex-col gap-4">
                            <div class="flex items-start gap-4">
                                <div class="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    <i class="fas fa-magic text-sm"></i>
                                </div>
                                <div class="text-sm font-bold text-slate-700">Auto-generate questions based on your curriculum.</div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    <i class="fas fa-shield-halved text-sm"></i>
                                </div>
                                <div class="text-sm font-bold text-slate-700">Advanced proctoring and leak prevention.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pillar 3: Organization -->
                <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div class="flex-1 order-2 lg:order-1" data-aos="fade-right">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
                            <span class="size-1.5 rounded-full bg-blue-500 animate-pulse"></span> Organization
                        </div>
                        <h4 class="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-[1.1]">The Student Hub. <br>Refined & Centralized.</h4>
                        <p class="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                            Discard the spreadsheets. Skeeme provides a beautiful, centralized records system for students, lecturers, and staff. Everything you need, one click away.
                        </p>
                        <ul class="space-y-3">
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <div class="size-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
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
                                360-degree Student Profiles
                            </li>
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <div class="size-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
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
                                Dynamic Course Assignments
                            </li>
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <div class="size-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
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
                                Interactive Note & Library System
                            </li>
                        </ul>
                    </div>
                    <div class="flex-1 order-1 lg:order-2" data-aos="zoom-in">
                        <div class="relative group">
                            <div class="absolute -inset-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div class="relative z-10 w-full overflow-hidden rounded-2xl" style="-webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); mask-image: linear-gradient(to bottom, black 50%, transparent 100%);">
                                <img src="<?php echo e(asset('landing/student.png')); ?>" alt="Student Management" class="w-full h-auto drop-shadow-2xl">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>



    <!-- Why Skeeme? Comparison Section -->
    <section class="py-32 bg-white relative">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto mb-20">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">The Comparison</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Built for the future of <br>education.</h3>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <!-- Legacy Systems -->
                <div class="p-12 rounded-[32px] bg-slate-50 border border-slate-100" data-aos="fade-right">
                    <h4 class="text-xl font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                        <i class="fas fa-history"></i> Legacy Systems
                    </h4>
                    <ul class="space-y-8">
                        <li class="flex items-start gap-4">
                            <div class="size-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1">
                                <i class="fas fa-times text-[10px]"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-slate-700 mb-1">Manual Paperwork</div>
                                <div class="text-sm text-slate-500 font-medium">Hours spent every day on spreadsheets and physical files.</div>
                            </div>
                        </li>
                        <li class="flex items-start gap-4">
                            <div class="size-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1">
                                <i class="fas fa-times text-[10px]"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-slate-700 mb-1">Fragmented Data</div>
                                <div class="text-sm text-slate-500 font-medium">Student records scattered across different, disconnected platforms.</div>
                            </div>
                        </li>
                        <li class="flex items-start gap-4">
                            <div class="size-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1">
                                <i class="fas fa-times text-[10px]"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-slate-700 mb-1">Slow Reporting</div>
                                <div class="text-sm text-slate-500 font-medium">Generating performance reports takes days of manual compilation.</div>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Skeeme -->
                <div class="p-12 rounded-[32px] bg-slate-900 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden" data-aos="fade-left">
                    <!-- Accent Glow -->
                    <div class="absolute -top-[20%] -right-[10%] size-64 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>
                    
                    <h4 class="text-xl font-black text-indigo-400 uppercase tracking-widest mb-10 flex items-center gap-3 relative z-10">
                        <i class="fas fa-bolt"></i> Skeeme AI
                    </h4>
                    <ul class="space-y-8 relative z-10">
                        <li class="flex items-start gap-4">
                            <div class="size-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-1">
                                <i class="fas fa-check text-[10px]"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-white mb-1">Automated Workflows</div>
                                <div class="text-sm text-slate-400 font-medium">AI handles the routine, giving teachers 5+ hours back weekly.</div>
                            </div>
                        </li>
                        <li class="flex items-start gap-4">
                            <div class="size-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-1">
                                <i class="fas fa-check text-[10px]"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-white mb-1">Unified Command Center</div>
                                <div class="text-sm text-slate-400 font-medium">One platform for everything: from attendance to AI exams.</div>
                            </div>
                        </li>
                        <li class="flex items-start gap-4">
                            <div class="size-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-1">
                                <i class="fas fa-check text-[10px]"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-white mb-1">Instant Insights</div>
                                <div class="text-sm text-slate-400 font-medium">Real-time analytics dashboards available at a single glance.</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Integrations Section -->
    <section class="py-32 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-6 text-center">
            <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Integrations</h2>
            <h3 data-aos="fade-up" data-aos-delay="100" class="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-16">Connects with your ecosystem.</h3>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="200">
                <!-- Google Workspace -->
                <div class="premium-card p-6 flex flex-col items-center justify-center gap-3 group">
                    <div class="size-12 flex items-center justify-center text-3xl text-slate-400 group-hover:text-[#4285F4] transition-colors duration-500">
                        <i class="fab fa-google"></i>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace</span>
                </div>
                <!-- Slack -->
                <div class="premium-card p-6 flex flex-col items-center justify-center gap-3 group">
                    <div class="size-12 flex items-center justify-center text-3xl text-slate-400 group-hover:text-[#4A154B] transition-colors duration-500">
                        <i class="fab fa-slack"></i>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Slack</span>
                </div>
                <!-- Zoom -->
                <div class="premium-card p-6 flex flex-col items-center justify-center gap-3 group">
                    <div class="size-12 flex items-center justify-center text-3xl text-slate-400 group-hover:text-[#2D8CFF] transition-colors duration-500">
                        <i class="fas fa-video"></i>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Zoom</span>
                </div>
            </div>
        </div>
    </section>
    <section class="py-32 relative overflow-hidden bg-slate-900 text-white">
        <!-- Abstract Bg -->
        <div class="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div class="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]"></div>

        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 data-aos="fade-up" class="text-4xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Ready to transform <br> your school?
            </h2>
            <p data-aos="fade-up" data-aos-delay="100" class="text-lg lg:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                Join thousands of forward-thinking educators using Skeeme to build a smarter, faster, and more efficient campus.
            </p>
            <div data-aos="fade-up" data-aos-delay="200" class="flex flex-col sm:flex-row items-center gap-6 justify-center">
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
                    Create Free Account
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
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(url('contact')).'','variant' => 'ghost','class' => '!rounded-2xl !px-10 !py-4 text-base font-extrabold !text-white !bg-white/5 !border-white/10 hover:!bg-white/10']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(url('contact')).'','variant' => 'ghost','class' => '!rounded-2xl !px-10 !py-4 text-base font-extrabold !text-white !bg-white/5 !border-white/10 hover:!bg-white/10']); ?>
                    Contact Sales
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
<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/landing/index.blade.php ENDPATH**/ ?>