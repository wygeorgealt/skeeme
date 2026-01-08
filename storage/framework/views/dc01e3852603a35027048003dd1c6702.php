

<?php $__env->startSection('content'); ?>
    <h1>Verification Code</h1>
    <p>Use the code below to complete your verification process. This code will expire in <span class="highlight">10 minutes</span>.</p>
    
    <div class="code">
        <?php echo e($otp); ?>

    </div>

    <p style="text-align: center; font-size: 14px; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/otp.blade.php ENDPATH**/ ?>