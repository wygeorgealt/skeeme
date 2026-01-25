<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skeeme</title>
    <?php echo $__env->make('partials.google-tag', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::styles(); ?>

</head>
<body class="bg-stone-900 text-white">
    <?php echo e($slot); ?>

    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::scripts(); ?>

    <script>
        console.log('Livewire loaded. Checking wire elements...');
        document.querySelectorAll('[wire\\:click]').forEach((el, i) => {
            console.log('Found wire:click element', i, el);
        });
    </script>
</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\layouts\blank.blade.php ENDPATH**/ ?>