<?php $__env->startSection('title', 'Skeeme for Students | AI Study Assistant'); ?>

<?php $__env->startSection('content'); ?>
<div class="relative bg-[#FAFAFC] min-h-screen pt-32 pb-12 overflow-hidden font-sans">
    <!-- Background Decor (subtle glow) -->
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <!-- Main Hero Grid -->
        <div class="grid lg:grid-cols-12 gap-12 items-center mb-24">
            
            <!-- Left Column: Content -->
            <div class="lg:col-span-5" data-aos="fade-right" data-aos-duration="800">
                <!-- Pill -->
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-6 shadow-sm">
                    <svg class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
                    AI Study Companion for Students
                </div>
                
                <!-- Headline -->
                <h1 class="text-6xl lg:text-[5rem] font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-6">
                    Study smarter.<br>
                    <span class="text-blue-600">Score higher.</span>
                </h1>
                
                <!-- Subheadline -->
                <p class="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                    Snap questions, solve with AI, generate quizzes, revise with flashcards, and build study streaks.<br>
                    <span class="font-bold text-slate-800">Everything you need to <span class="text-indigo-600">ace your exams</span>.</span>
                </p>
                
                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-4 mb-8">

                    <!-- Google Play -->
                    <a href="https://play.google.com/store/apps/details?id=com.skeeme.app" class="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl transition-colors shadow-lg">
                        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.5 1.5L14.5 12L2.5 22.5V1.5Z" fill="#3BCAE6"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 12L21.5 16L18 19L14.5 12Z" fill="#D5163D"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M22 15.5L14.5 12L18 9L22 15.5Z" fill="#F4B400"/>
                            <path d="M14.5 12L2.5 1.5L12.5 7L14.5 12Z" fill="#25A054"/>
                        </svg>
                        <div class="text-left">
                            <div class="text-[11px] leading-tight text-slate-300">GET IT ON</div>
                            <div class="text-xl font-semibold leading-tight">Google Play</div>
                        </div>
                    </a>
                </div>

                <!-- Try Scan & Solve Link -->
                <a href="<?php echo e(route('register')); ?>" class="inline-flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl shadow-sm transition-colors mb-12 w-full max-w-sm group">
                    <div class="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                        <?php if (isset($component)) { $__componentOriginalf0d0b0ef1601864f79cd5a4fe6f86b73 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf0d0b0ef1601864f79cd5a4fe6f86b73 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.viewfinder-circle','data' => ['class' => 'w-6 h-6']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.viewfinder-circle'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-6 h-6']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf0d0b0ef1601864f79cd5a4fe6f86b73)): ?>
<?php $attributes = $__attributesOriginalf0d0b0ef1601864f79cd5a4fe6f86b73; ?>
<?php unset($__attributesOriginalf0d0b0ef1601864f79cd5a4fe6f86b73); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf0d0b0ef1601864f79cd5a4fe6f86b73)): ?>
<?php $component = $__componentOriginalf0d0b0ef1601864f79cd5a4fe6f86b73; ?>
<?php unset($__componentOriginalf0d0b0ef1601864f79cd5a4fe6f86b73); ?>
<?php endif; ?>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-900 text-lg">Try Scan & Solve</div>
                        <div class="text-slate-500 text-sm">See how it works in seconds</div>
                    </div>
                    <?php if (isset($component)) { $__componentOriginal31cb76c8d087d4f00797aeea7232b4c3 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal31cb76c8d087d4f00797aeea7232b4c3 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.chevron-right','data' => ['class' => 'w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.chevron-right'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal31cb76c8d087d4f00797aeea7232b4c3)): ?>
<?php $attributes = $__attributesOriginal31cb76c8d087d4f00797aeea7232b4c3; ?>
<?php unset($__attributesOriginal31cb76c8d087d4f00797aeea7232b4c3); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal31cb76c8d087d4f00797aeea7232b4c3)): ?>
<?php $component = $__componentOriginal31cb76c8d087d4f00797aeea7232b4c3; ?>
<?php unset($__componentOriginal31cb76c8d087d4f00797aeea7232b4c3); ?>
<?php endif; ?>
                </a>

                <!-- Stats Box -->
                <div class="bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6">
                    <div class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 text-center lg:text-left">Trusted by thousands of students</div>
                    <div class="grid grid-cols-4 gap-4 text-center lg:text-left divide-x divide-slate-200/60">
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-yellow-500 mb-1">
                                <?php if (isset($component)) { $__componentOriginal0bc6ca59f258b8d2577c76df279598af = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal0bc6ca59f258b8d2577c76df279598af = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.star','data' => ['class' => 'w-4 h-4 fill-current']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.star'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-4 h-4 fill-current']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal0bc6ca59f258b8d2577c76df279598af)): ?>
<?php $attributes = $__attributesOriginal0bc6ca59f258b8d2577c76df279598af; ?>
<?php unset($__attributesOriginal0bc6ca59f258b8d2577c76df279598af); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal0bc6ca59f258b8d2577c76df279598af)): ?>
<?php $component = $__componentOriginal0bc6ca59f258b8d2577c76df279598af; ?>
<?php unset($__componentOriginal0bc6ca59f258b8d2577c76df279598af); ?>
<?php endif; ?>
                                <span class="font-bold text-slate-900 text-xl">4.9</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium">App Rating</div>
                        </div>
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-blue-500 mb-1">
                                <?php if (isset($component)) { $__componentOriginal91fd129b4949918c402a9ed21c33e67f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal91fd129b4949918c402a9ed21c33e67f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.chat-bubble-left-right','data' => ['class' => 'w-4 h-4 fill-current']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.chat-bubble-left-right'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-4 h-4 fill-current']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal91fd129b4949918c402a9ed21c33e67f)): ?>
<?php $attributes = $__attributesOriginal91fd129b4949918c402a9ed21c33e67f; ?>
<?php unset($__attributesOriginal91fd129b4949918c402a9ed21c33e67f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal91fd129b4949918c402a9ed21c33e67f)): ?>
<?php $component = $__componentOriginal91fd129b4949918c402a9ed21c33e67f; ?>
<?php unset($__componentOriginal91fd129b4949918c402a9ed21c33e67f); ?>
<?php endif; ?>
                                <span class="font-bold text-slate-900 text-xl">120K+</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium leading-tight">Questions<br>Solved</div>
                        </div>
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-green-500 mb-1">
                                <?php if (isset($component)) { $__componentOriginal1f1cf28325f5fdde2b0b6888802d899e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1f1cf28325f5fdde2b0b6888802d899e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.document-check','data' => ['class' => 'w-4 h-4 fill-current']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.document-check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-4 h-4 fill-current']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1f1cf28325f5fdde2b0b6888802d899e)): ?>
<?php $attributes = $__attributesOriginal1f1cf28325f5fdde2b0b6888802d899e; ?>
<?php unset($__attributesOriginal1f1cf28325f5fdde2b0b6888802d899e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1f1cf28325f5fdde2b0b6888802d899e)): ?>
<?php $component = $__componentOriginal1f1cf28325f5fdde2b0b6888802d899e; ?>
<?php unset($__componentOriginal1f1cf28325f5fdde2b0b6888802d899e); ?>
<?php endif; ?>
                                <span class="font-bold text-slate-900 text-xl">35K+</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium leading-tight">Quizzes<br>Generated</div>
                        </div>
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-purple-500 mb-1">
                                <?php if (isset($component)) { $__componentOriginale0880cb6488d85d9ca54288aa080a834 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginale0880cb6488d85d9ca54288aa080a834 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.academic-cap','data' => ['class' => 'w-4 h-4 fill-current']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.academic-cap'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-4 h-4 fill-current']); ?>
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
                                <span class="font-bold text-slate-900 text-xl">40+</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium leading-tight">Schools<br>Worldwide</div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right Column: Hero Image -->
            <div class="lg:col-span-7 relative flex justify-center lg:justify-end" data-aos="fade-left" data-aos-duration="1000">
                <div class="relative w-full max-w-[800px] xl:max-w-[950px] lg:-mr-12 xl:-mr-24">
                    <img src="<?php echo e(asset('images/student_app_mockup.png')); ?>" class="w-full h-auto object-contain scale-[1.05] lg:scale-[1.15] origin-right mix-blend-multiply" alt="Skeeme App Experience" />
                </div>
            </div>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-200/60 pt-12 mb-20" data-aos="fade-up">
            <!-- Feature 1 -->
            <div class="flex items-start gap-4">
                <div class="bg-blue-50 text-blue-600 p-3.5 rounded-2xl shrink-0">
                    <?php if (isset($component)) { $__componentOriginal1b4a7fc77dda99afab79e49ee452ebcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1b4a7fc77dda99afab79e49ee452ebcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.camera','data' => ['class' => 'w-7 h-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.camera'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-7 h-7']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1b4a7fc77dda99afab79e49ee452ebcb)): ?>
<?php $attributes = $__attributesOriginal1b4a7fc77dda99afab79e49ee452ebcb; ?>
<?php unset($__attributesOriginal1b4a7fc77dda99afab79e49ee452ebcb); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1b4a7fc77dda99afab79e49ee452ebcb)): ?>
<?php $component = $__componentOriginal1b4a7fc77dda99afab79e49ee452ebcb; ?>
<?php unset($__componentOriginal1b4a7fc77dda99afab79e49ee452ebcb); ?>
<?php endif; ?>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Snap & Solve</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Snap any question and get instant AI-powered step-by-step solutions.</p>
                </div>
            </div>
            <!-- Feature 2 -->
            <div class="flex items-start gap-4">
                <div class="bg-green-50 text-green-600 p-3.5 rounded-2xl shrink-0">
                    <?php if (isset($component)) { $__componentOriginal74697c151ccb8418c53b50a995b31225 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal74697c151ccb8418c53b50a995b31225 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.document-text','data' => ['class' => 'w-7 h-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.document-text'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-7 h-7']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal74697c151ccb8418c53b50a995b31225)): ?>
<?php $attributes = $__attributesOriginal74697c151ccb8418c53b50a995b31225; ?>
<?php unset($__attributesOriginal74697c151ccb8418c53b50a995b31225); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal74697c151ccb8418c53b50a995b31225)): ?>
<?php $component = $__componentOriginal74697c151ccb8418c53b50a995b31225; ?>
<?php unset($__componentOriginal74697c151ccb8418c53b50a995b31225); ?>
<?php endif; ?>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Quiz Generator</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Turn notes, PDFs, and chapters into smart quizzes in seconds.</p>
                </div>
            </div>
            <!-- Feature 3 -->
            <div class="flex items-start gap-4">
                <div class="bg-yellow-50 text-yellow-600 p-3.5 rounded-2xl shrink-0">
                    <?php if (isset($component)) { $__componentOriginalcaa03e8fc15ab90e8c6ae38e9943c027 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcaa03e8fc15ab90e8c6ae38e9943c027 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.square-3-stack-3d','data' => ['class' => 'w-7 h-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.square-3-stack-3d'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-7 h-7']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcaa03e8fc15ab90e8c6ae38e9943c027)): ?>
<?php $attributes = $__attributesOriginalcaa03e8fc15ab90e8c6ae38e9943c027; ?>
<?php unset($__attributesOriginalcaa03e8fc15ab90e8c6ae38e9943c027); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcaa03e8fc15ab90e8c6ae38e9943c027)): ?>
<?php $component = $__componentOriginalcaa03e8fc15ab90e8c6ae38e9943c027; ?>
<?php unset($__componentOriginalcaa03e8fc15ab90e8c6ae38e9943c027); ?>
<?php endif; ?>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Smart Flashcards</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Revise efficiently with spaced repetition and smart flashcards.</p>
                </div>
            </div>
            <!-- Feature 4 -->
            <div class="flex items-start gap-4">
                <div class="bg-red-50 text-red-600 p-3.5 rounded-2xl shrink-0">
                    <?php if (isset($component)) { $__componentOriginalf13555dd990bd0b89c6e99ca2677e0f7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf13555dd990bd0b89c6e99ca2677e0f7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.fire','data' => ['class' => 'w-7 h-7']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.fire'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-7 h-7']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf13555dd990bd0b89c6e99ca2677e0f7)): ?>
<?php $attributes = $__attributesOriginalf13555dd990bd0b89c6e99ca2677e0f7; ?>
<?php unset($__attributesOriginalf13555dd990bd0b89c6e99ca2677e0f7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf13555dd990bd0b89c6e99ca2677e0f7)): ?>
<?php $component = $__componentOriginalf13555dd990bd0b89c6e99ca2677e0f7; ?>
<?php unset($__componentOriginalf13555dd990bd0b89c6e99ca2677e0f7); ?>
<?php endif; ?>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Study Streaks</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Build consistency, track progress, and stay motivated daily.</p>
                </div>
            </div>
        </div>

        <!-- CTA Banner -->
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8" data-aos="fade-up">
            <div class="flex items-center gap-6">
                <div class="bg-white p-4 rounded-full shadow-sm shrink-0">
                    <div class="bg-yellow-100 p-3 rounded-full text-yellow-500">
                        <?php if (isset($component)) { $__componentOriginaldeb62ee1e967a53f5445cdde4b762abc = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginaldeb62ee1e967a53f5445cdde4b762abc = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.trophy','data' => ['class' => 'w-10 h-10']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.trophy'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'w-10 h-10']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginaldeb62ee1e967a53f5445cdde4b762abc)): ?>
<?php $attributes = $__attributesOriginaldeb62ee1e967a53f5445cdde4b762abc; ?>
<?php unset($__attributesOriginaldeb62ee1e967a53f5445cdde4b762abc); ?>
<?php endif; ?>
<?php if (isset($__componentOriginaldeb62ee1e967a53f5445cdde4b762abc)): ?>
<?php $component = $__componentOriginaldeb62ee1e967a53f5445cdde4b762abc; ?>
<?php unset($__componentOriginaldeb62ee1e967a53f5445cdde4b762abc); ?>
<?php endif; ?>
                    </div>
                </div>
                <div>
                    <h2 class="text-2xl md:text-3xl font-medium text-slate-900 mb-2">
                        Your best <span class="font-bold text-indigo-700">grades are one smart study away.</span>
                    </h2>
                    <p class="text-slate-600">Join thousands of students who are already studying smarter with Skeeme.</p>
                </div>
            </div>
        </div>

    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/landing/products/students.blade.php ENDPATH**/ ?>