

<?php $__env->startSection('title', __('Server Error')); ?>
<?php $__env->startSection('code', '500'); ?>
<?php $__env->startSection('message', __('Server Error')); ?>
<?php $__env->startSection('icon', 'server'); ?>

<?php $__env->startSection('description'); ?>
    Whoops, something went wrong on our servers. We are already working to fix it.
<?php $__env->stopSection(); ?>

<?php echo $__env->make('errors::minimal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/errors/500.blade.php ENDPATH**/ ?>