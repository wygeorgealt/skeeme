

<?php $__env->startSection('title', 'Skeeme for Students | AI Study Assistant'); ?>

<?php $__env->startSection('content'); ?>
<div class="relative bg-white min-h-screen pt-24 pb-12">
    <!-- Background Decor -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-50/50 blur-[80px]"></div>
        <div class="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[80px]"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 relative z-10">
        
        <!-- Hero Section -->
        <div class="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <br><br>
            <h1 class="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Ace your exams <br> <span class="text-gradient">with AI.</span>
            </h1>
            <p class="text-lg text-slate-500 font-medium leading-relaxed">
                Turn your messy notes into practice quizzes instantly. <br class="hidden md:block">
                The smart study companion that never sleeps.
            </p>
        </div>

        <!-- Interactive Demo / Tool -->
        <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('landing.student-ai-product', []);

$key = null;

$key ??= \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::generateKey('lw-3267880519-0', null);

$__html = app('livewire')->mount($__name, $__params, $key);

echo $__html;

unset($__html);
unset($__name);
unset($__params);
unset($__split);
if (isset($__slots)) unset($__slots);
?>

        <!-- Pricing / Access Section -->
        <div class="max-w-4xl mx-auto border-t border-slate-100 pt-24" id="pricing">
            <div class="text-center mb-16">
                 <h2 class="text-3xl font-extrabold text-slate-900 mb-4"><?php echo e(Auth::check() ? 'Your Subscription Plan' : 'Simple Student Pricing'); ?></h2>
                 <p class="text-slate-500 max-w-lg mx-auto">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(Auth::check() && Auth::user()->is_unlimited_student): ?>
                        You have full access to all features. Stay unstoppable!
                    <?php else: ?>
                        Get enough credits to ace your midterms, or go unlimited for finals week.
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                 </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Free -->
                <div class="p-8 rounded-[32px] <?php echo e((Auth::check() && !Auth::user()->is_unlimited_student) ? 'bg-indigo-50/50 ring-2 ring-indigo-100' : 'bg-slate-50'); ?> border border-slate-100 relative">
                    <?php if(Auth::check() && !Auth::user()->is_unlimited_student): ?>
                        <div class="absolute top-4 right-4 px-3 py-1 bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest rounded-full">Active Plan</div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    <h3 class="text-lg font-black text-slate-900 mb-2">Free Plan</h3>
                    <div class="text-4xl font-extrabold text-slate-900 mb-6">$0<span class="text-base text-slate-400 font-medium">/mo</span></div>
                    
                    <ul class="space-y-4 mb-8">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['class' => 'text-indigo-600 size-4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-indigo-600 size-4']); ?>
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
                            <?php if(Auth::check() && !Auth::user()->is_unlimited_student): ?>
                                <span class="text-indigo-600"><?php echo e(number_format(Auth::user()->credits)); ?> Credits Remaining</span>
                            <?php else: ?>
                                500 Credits / Month
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['class' => 'text-indigo-600 size-4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-indigo-600 size-4']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> ~10 Generated Quizzes
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['class' => 'text-indigo-600 size-4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-indigo-600 size-4']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> Basic History
                        </li>
                    </ul>

                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(auth()->guard()->guest()): ?>
                        <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('register')).'','variant' => 'outline','class' => 'w-full bg-white !border-slate-200 !text-slate-900 font-bold hover:!border-indigo-200 hover:!text-indigo-600']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('register')).'','variant' => 'outline','class' => 'w-full bg-white !border-slate-200 !text-slate-900 font-bold hover:!border-indigo-200 hover:!text-indigo-600']); ?>
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
                    <?php else: ?>
                        <div class="w-full h-12 flex items-center justify-center text-slate-400 font-bold text-sm tracking-tight italic">
                            Included in your account
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>

                <!-- Pro -->
                <div class="p-8 rounded-[32px] <?php echo e((Auth::check() && Auth::user()->is_unlimited_student) ? 'bg-slate-900 ring-4 ring-indigo-500/20 shadow-indigo-200 shadow-2xl' : 'bg-slate-900'); ?> text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                    
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(Auth::check() && Auth::user()->is_unlimited_student): ?>
                        <div class="absolute top-4 right-4 px-3 py-1 bg-white text-[10px] font-black text-indigo-900 uppercase tracking-widest rounded-full z-20 shadow-sm">Current Plan</div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

                    <div class="relative z-10">
                        <h3 class="text-lg font-black text-white mb-2">Unlimited</h3>
                        <div class="text-4xl font-extrabold text-white mb-6"><span id="student-price-value">₦5,000</span><span class="text-base text-slate-400 font-medium">/mo</span></div>
                        
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <div class="size-4 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px]"><i class="fas fa-infinity"></i></div>
                                Unlimited Credits
                            </li>
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['class' => 'text-indigo-400 size-4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-indigo-400 size-4']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> Priority Generation
                            </li>
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <?php if (isset($component)) { $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::icon.check','data' => ['class' => 'text-indigo-400 size-4']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::icon.check'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-indigo-400 size-4']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $attributes = $__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__attributesOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11)): ?>
<?php $component = $__componentOriginal9c2dfd6cb98f4df18e26d1694500af11; ?>
<?php unset($__componentOriginal9c2dfd6cb98f4df18e26d1694500af11); ?>
<?php endif; ?> Advanced File Inputs
                            </li>
                        </ul>

                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(Auth::check() && Auth::user()->is_unlimited_student): ?>
                            <div class="w-full h-12 flex items-center justify-center text-indigo-400 font-bold text-sm tracking-tight italic">
                                Plan active & ready
                            </div>
                        <?php else: ?>
                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['href' => ''.e(route('students.subscribe')).'','variant' => 'primary','class' => 'w-full !border-0 !bg-white !text-indigo-900 font-extrabold hover:!bg-indigo-50']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route('students.subscribe')).'','variant' => 'primary','class' => 'w-full !border-0 !bg-white !text-indigo-900 font-extrabold hover:!bg-indigo-50']); ?>
                                Get Unlimited
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
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script>
    const currencyMap = {
        'NG': { code: 'NGN', symbol: '₦', rate: 5000 / 39, basePrice: 39 }, // Adjusting to the $39 base if needed, or just hardcoding the 5000
        'GH': { code: 'GHS', symbol: '₵', rate: 40 / 2.99, basePrice: 2.99 },
        'KE': { code: 'KES', symbol: 'Ks', rate: 400 / 2.99, basePrice: 2.99 },
        'ZA': { code: 'ZAR', symbol: 'R', rate: 60 / 2.99, basePrice: 2.99 },
        'US': { code: 'USD', symbol: '$', rate: 1, basePrice: 2.99 },
        'default': { code: 'USD', symbol: '$', rate: 1, basePrice: 2.99 }
    };

    // Special case for Student Unlimited: USD 2.99 vs NGN 5000
    function updateStudentPricing(countryCode) {
        const display = document.getElementById('student-price-value');
        if (!display) return;

        if (countryCode === 'NG') {
            display.textContent = '₦5,000';
        } else {
            // For other countries, maybe stick to 2.99 or convert
            display.textContent = '$2.99';
        }
    }

    // Auto-detect on load
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            updateStudentPricing(data.country_code);
        } catch (e) {
            updateStudentPricing('US');
        }
    });
</script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\products\students.blade.php ENDPATH**/ ?>