<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['title']));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter((['title']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="scroll-smooth" data-flux-appearance="light">
    <head>
        <?php echo $__env->make('partials.head', ['title' => $title], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
        
        <!-- Google Fonts: Manrope -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
        
        <style>
            body {
                font-family: 'Manrope', sans-serif;
            }
            /* Force visible outlines for Inputs in Auth Card */
            [data-flux-input], [data-flux-control] {
                border: 1px solid #e2e8f0 !important; /* slate-200 */
                background-color: #f8fafc !important; /* slate-50 */
                border-radius: 0.75rem !important; /* rounded-xl */
            }
            [data-flux-input]:focus, [data-flux-control]:focus-within {
                border-color: #6366f1 !important; /* indigo-500 */
                background-color: #ffffff !important;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
            }
            /* Force Text Visibility */
            [data-flux-label], [data-flux-checkbox-label] {
                color: #475569 !important; /* slate-600 */
                font-weight: 500 !important;
            }
            a {
                color: #4f46e5 !important; /* indigo-600 */
            }
            a:hover {
                color: #4338ca !important; /* indigo-700 */
            }
            .text-gradient {
                background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        </style>
    </head>
    <body class="min-h-screen antialiased bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
        <!-- Abstract Background Elements (Premium) -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
             <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-slate-50/50"></div>
             <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
             <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        </div>

        <div class="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 p-4 md:p-6 text-center">
            <div class="flex w-full max-w-sm flex-col gap-4">
                <!-- Brand/Logo -->
                <a href="<?php echo e(route('home')); ?>" class="flex flex-col items-center justify-center gap-2 transition-transform duration-300 hover:scale-105">
                     <img src="<?php echo e(asset('images/logo.png')); ?>" alt="Skeeme Logo" class="h-8 w-auto filter brightness-0" />
                </a>

                <!-- Auth Container -->
                <div class="relative">
                    <div class="relative bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden text-left">
                        <!-- Subtitle/Slot Container -->
                        <div class="flex flex-col gap-4">
                            <?php echo e($slot); ?>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php app('livewire')->forceAssetInjection(); ?>
<?php echo app('flux')->scripts(); ?>

    </body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\components\layouts\auth\simple.blade.php ENDPATH**/ ?>