<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames(([
    'config',
    'imageClass' => '',
    'videoClass' => '',
]));

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

foreach (array_filter(([
    'config',
    'imageClass' => '',
    'videoClass' => '',
]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($config->isVideo()): ?>
    <video
        autoplay
        loop
        muted
        playsinline
        class="<?php echo e($videoClass); ?>"
    >
        <source src="<?php echo e($config->media); ?>" type="<?php echo e($config->mediaMimeType); ?>">
    </video>
<?php else: ?>
    <img
        src="<?php echo e($config->media); ?>"
        alt="<?php echo e($config->mediaAlt ?? 'Authentication'); ?>"
        class="<?php echo e($imageClass); ?>"
    />
<?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\vendor\caresome\filament-auth-designer\resources\views\components\partials\media.blade.php ENDPATH**/ ?>