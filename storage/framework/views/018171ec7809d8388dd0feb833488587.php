

<?php $__env->startSection('title', __('Not Found')); ?>
<?php $__env->startSection('code', '404'); ?>
<?php $__env->startSection('message', __('Page Not Found')); ?>
<?php $__env->startSection('icon', 'magnifying-glass'); ?>

<?php $__env->startSection('description'); ?>
    Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
<?php $__env->stopSection(); ?>

<?php echo $__env->make('errors::minimal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\errors\404.blade.php ENDPATH**/ ?>