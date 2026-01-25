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

<?php if (isset($component)) { $__componentOriginalce5847ac41e2319cc94841d423efce16 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalce5847ac41e2319cc94841d423efce16 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.layouts.auth.simple','data' => ['title' => $title ?? 'Login']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('layouts.auth.simple'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($title ?? 'Login')]); ?>
    <?php echo e($slot); ?>

 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalce5847ac41e2319cc94841d423efce16)): ?>
<?php $attributes = $__attributesOriginalce5847ac41e2319cc94841d423efce16; ?>
<?php unset($__attributesOriginalce5847ac41e2319cc94841d423efce16); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalce5847ac41e2319cc94841d423efce16)): ?>
<?php $component = $__componentOriginalce5847ac41e2319cc94841d423efce16; ?>
<?php unset($__componentOriginalce5847ac41e2319cc94841d423efce16); ?>
<?php endif; ?>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\components\layouts\auth.blade.php ENDPATH**/ ?>