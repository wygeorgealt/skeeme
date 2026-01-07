<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title><?php echo e($title ?? 'Exam'); ?></title>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::styles(); ?>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        (function() {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const date = new Date();
                date.setTime(date.getTime() + (365*24*60*60*1000)); // 1 year
                const expires = "; expires=" + date.toUTCString();
                const match = document.cookie.match(new RegExp('(^| )user_timezone=([^;]+)'));
                if (!match || match[2] !== tz) {
                    document.cookie = "user_timezone=" + tz + expires + "; path=/; SameSite=Lax";
                }
            } catch(e) { console.error('Timezone detection failed', e); }
        })();
    </script>
    <?php echo e($head ?? ''); ?>

</head>
<body class="bg-zinc-950 text-zinc-100 exam-mode-active">
    
    <?php echo e($slot); ?>


    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::scripts(); ?>

    
    <!-- KaTeX for Math Rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>
    <script>
        document.addEventListener('livewire:initialized', () => {
            const renderMath = () => {
                if (typeof renderMathInElement === 'function') {
                    renderMathInElement(document.body, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ],
                        throwOnError: false
                    });
                }
            };
            renderMath();
            Livewire.on('render-math', () => setTimeout(renderMath, 100));
            document.addEventListener('livewire:navigated', renderMath);
        });
    </script>

    <?php app('livewire')->forceAssetInjection(); ?>
<?php echo app('flux')->scripts(); ?>

    <?php echo $__env->yieldPushContent('scripts'); ?>
    <?php echo e($scripts ?? ''); ?>

</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/layouts/exam.blade.php ENDPATH**/ ?>