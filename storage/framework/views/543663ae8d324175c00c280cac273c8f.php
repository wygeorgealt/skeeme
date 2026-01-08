

<?php $__env->startSection('content'); ?>
    <div style="text-align: center; font-size: 50px; margin-bottom: 20px;">🔑</div>
    <h1>Reset Your Password</h1>
    <p>We received a request to reset the password for your Skeeme account. Click the button below to create a new secure password.</p>

    <div class="button-container">
        <a href="<?php echo e($resetUrl); ?>" class="button">Reset Password</a>
    </div>

    <div style="background: #27272a; padding: 20px; border-radius: 12px; margin-top: 40px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 13px; color: #fbbf24; line-height: 1.6;">
            <strong>⏱️ Expiration Notice</strong><br>
            This link expires in 1 hour. If you didn't request this reset, no action is needed.
        </p>
    </div>

    <div class="hr"></div>

    <p style="font-size: 13px; color: #71717a; text-align: center;">
        Can't click the button? Copy and paste this link in your browser:<br>
        <span style="word-break: break-all; color: #6366f1;"><?php echo e($resetUrl); ?></span>
    </p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/password-reset.blade.php ENDPATH**/ ?>