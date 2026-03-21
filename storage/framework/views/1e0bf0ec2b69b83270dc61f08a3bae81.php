<?php $__env->startSection('hero-label', 'Account Security'); ?>
<?php $__env->startSection('hero-title', 'Verify Your Identity'); ?>
<?php $__env->startSection('hero-subtitle', 'Enter your 6-digit code'); ?>

<?php $__env->startSection('hero-icon'); ?>
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0c0914" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
</svg>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('main-content'); ?>
<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:18px; font-weight:600; line-height:1.5; text-align:center; margin: 0 0 24px;">
	Thanks for signing up for Skeeme! To finalize your account setup, please use the following verification code:
</p>

<!-- OTP Display -->
<div style="text-align: center; margin-bottom: 40px;">
    <div style="background-color: #0c0914; color: #8B5CF6; font-family: 'Orbit', sans-serif; font-size: 48px; font-weight: 800; letter-spacing: 12px; padding: 24px 32px; display: inline-block; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <?php echo e($code); ?>

    </div>
</div>

<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:16px; font-weight:500; line-height:1.5; text-align:center; margin: 0 0 32px; opacity: 0.8;">
	This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
</p>

<!-- App store buttons placeholder -->
<div style="text-align: center; margin-bottom: 10px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
    <div style="background: #0c0914; color: #8B5CF6; border-radius: 8px; padding: 12px 24px; font-family: 'Instrument Sans', sans-serif; font-size: 13px; display: inline-block; border: 1px solid rgba(139, 92, 246, 0.2);">
        <span style="font-size: 9px; display: block; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 4px; font-weight: 800; text-transform: uppercase;">Download on the</span>
        <span style="font-size: 16px; font-weight: 800;">App Store</span>
    </div>
    <div style="background: #0c0914; color: #8B5CF6; border-radius: 8px; padding: 12px 24px; font-family: 'Instrument Sans', sans-serif; font-size: 13px; display: inline-block; border: 1px solid rgba(139, 92, 246, 0.2);">
        <span style="font-size: 9px; display: block; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 4px; font-weight: 800; text-transform: uppercase;">Get it on</span>
        <span style="font-size: 16px; font-weight: 800;">Google Play</span>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app_email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/signup_verification.blade.php ENDPATH**/ ?>