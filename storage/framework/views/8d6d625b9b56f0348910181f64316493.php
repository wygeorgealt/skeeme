

<?php $__env->startSection('title', __('Unauthorized')); ?>
<?php $__env->startSection('code', '403'); ?>
<?php $__env->startSection('message', __('Access Denied')); ?>
<?php $__env->startSection('icon', 'lock-closed'); ?>

<?php $__env->startSection('description'); ?>
    Sorry, you are not authorized to access this page. Please contact support if you believe this is an error.
<?php $__env->stopSection(); ?>

<?php echo $__env->make('errors::minimal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\errors\403.blade.php ENDPATH**/ ?>