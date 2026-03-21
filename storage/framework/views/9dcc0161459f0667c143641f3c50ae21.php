<?php $__env->startSection('hero-label', 'Account Recovery'); ?>
<?php $__env->startSection('hero-title', 'Reset Your Password'); ?>
<?php $__env->startSection('hero-subtitle', 'Secure your account now'); ?>

<?php $__env->startSection('hero-icon'); ?>
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0c0914" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
    <path d="M12 8V12L15 15"></path>
</svg>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('main-content'); ?>
<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:18px; font-weight:600; line-height:1.5; text-align:center; margin: 0 0 24px;">
	We received a request to reset your Skeeme password. Please use the following code in the app to proceed:
</p>

<!-- OTP Display -->
<div style="text-align: center; margin-bottom: 40px;">
    <div style="background-color: #0c0914; color: #8B5CF6; font-family: 'Orbit', sans-serif; font-size: 48px; font-weight: 800; letter-spacing: 12px; padding: 24px 32px; display: inline-block; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <?php echo e($code); ?>

    </div>
</div>

<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:16px; font-weight:500; line-height:1.5; text-align:center; margin: 0 0 32px; opacity: 0.8;">
	This code is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email; your account is still secure.
</p>

<div style="text-align: center; margin-bottom: 10px;">
    <p style="color:#0c0914; font-family:'Instrument Sans', sans-serif; font-size:14px; font-weight:800; line-height:1.5; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">Stay Secure.</p>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app_email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/forgot_password.blade.php ENDPATH**/ ?>