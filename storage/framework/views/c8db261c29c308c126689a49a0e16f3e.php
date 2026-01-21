<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['position']));

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

foreach (array_filter((['position']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<?php
    use Filament\Facades\Filament;

    $styles = '';

    if (is_array($position)) {
        $styles = 'style="';
        foreach ($position as $key => $value) {
            $styles .= "--ad-theme-switcher-{$key}: {$value}; ";
        }
        $styles .= '"';
    }

    $hasDarkMode = Filament::hasDarkMode();
    $hasDarkModeForced = Filament::hasDarkModeForced();
?>

<?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($hasDarkMode && !$hasDarkModeForced): ?>
    <div class="fi-auth-theme-switcher-wrapper" <?php echo $styles; ?>>
        <?php if (isset($component)) { $__componentOriginal388e1416f496c833c11c2ba7d86d1f07 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal388e1416f496c833c11c2ba7d86d1f07 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament-panels::components.theme-switcher.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament-panels::theme-switcher'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal388e1416f496c833c11c2ba7d86d1f07)): ?>
<?php $attributes = $__attributesOriginal388e1416f496c833c11c2ba7d86d1f07; ?>
<?php unset($__attributesOriginal388e1416f496c833c11c2ba7d86d1f07); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal388e1416f496c833c11c2ba7d86d1f07)): ?>
<?php $component = $__componentOriginal388e1416f496c833c11c2ba7d86d1f07; ?>
<?php unset($__componentOriginal388e1416f496c833c11c2ba7d86d1f07); ?>
<?php endif; ?>
    </div>
<?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\vendor\caresome\filament-auth-designer\resources\views\components\partials\theme-toggle.blade.php ENDPATH**/ ?>