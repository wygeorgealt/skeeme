

<?php $__env->startSection('title', __('Service Unavailable')); ?>
<?php $__env->startSection('code', '503'); ?>
<?php $__env->startSection('message', __('Maintenance Mode')); ?>
<?php $__env->startSection('icon', 'wrench-screwdriver'); ?>

<?php $__env->startSection('description'); ?>
    We are currently performing scheduled maintenance. We'll be back shortly.
<?php $__env->stopSection(); ?>

<?php echo $__env->make('errors::minimal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\errors\503.blade.php ENDPATH**/ ?>