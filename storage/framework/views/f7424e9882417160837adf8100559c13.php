

<?php $__env->startSection('title', __('Page Expired')); ?>
<?php $__env->startSection('code', '419'); ?>
<?php $__env->startSection('message', __('Page Expired')); ?>
<?php $__env->startSection('icon', 'clock'); ?>

<?php $__env->startSection('description'); ?>
    Your session has expired due to inactivity. Please refresh the page and try again.
<?php $__env->stopSection(); ?>

<?php echo $__env->make('errors::minimal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\errors\419.blade.php ENDPATH**/ ?>