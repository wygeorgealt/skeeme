<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['title' => 'We use cookies', 'message' => 'We use cookies to enhance your experience and analyze our traffic.']));

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

foreach (array_filter((['title' => 'We use cookies', 'message' => 'We use cookies to enhance your experience and analyze our traffic.']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<div
    x-data="{ 
        show: false,
        init() {
            if (!localStorage.getItem('cookie_consent')) {
                setTimeout(() => { this.show = true }, 2000);
            }
        },
        accept() {
            localStorage.setItem('cookie_consent', 'accepted');
            this.show = false;
        }
    }"
    x-show="show"
    x-transition:enter="transition ease-out duration-500"
    x-transition:enter-start="opacity-0 translate-y-10"
    x-transition:enter-end="opacity-100 translate-y-0"
    x-transition:leave="transition ease-in duration-300"
    x-transition:leave-start="opacity-100 translate-y-0"
    x-transition:leave-end="opacity-0 translate-y-10"
    class="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-12 lg:w-[400px] z-[100] pointer-events-none"
    style="display: none;"
>
    <div class="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-slate-200 p-6 rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative group">
        <!-- Accent Glow -->
        <div class="absolute -top-[50%] -right-[20%] w-[150px] h-[150px] bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-700"></div>

        <div class="relative z-10">
            <div class="flex items-center gap-3 mb-4">
                <div class="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <h4 class="font-extrabold text-slate-900 tracking-tight"><?php echo e($title); ?></h4>
            </div>

            <p class="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                <?php echo e($message); ?> By clicking "Accept", you agree to our use of cookies as outlined in our 
                <a href="<?php echo e(url('privacy')); ?>" class="text-indigo-600 hover:underline font-bold">Privacy Policy</a>.
            </p>

            <div class="flex items-center gap-3">
                <button 
                    @click="accept"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                    Accept All
                </button>
                <button 
                    @click="show = false"
                    class="px-4 py-3 text-xs font-extrabold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Decline
                </button>
            </div>
        </div>
    </div>
</div>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/components/cookie-consent.blade.php ENDPATH**/ ?>