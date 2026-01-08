

<?php $__env->startSection('content'); ?>
    <div style="text-align: center; font-size: 50px; margin-bottom: 20px;">🛡️</div>
    <h1>Security Notice</h1>
    <p>This is a confirmation that the password for your Skeeme account (<span class="highlight"><?php echo e($user->email); ?></span>) was successfully changed.</p>

    <div style="background: #27272a; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #3f3f46;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Activity Details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 10px 0; color: #a1a1aa;">Status</td>
                <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: 600;">Changed Successfully</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #a1a1aa;">Time</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;"><?php echo e(now()->format('M d, Y \a\t H:i A')); ?></td>
            </tr>
        </table>
    </div>

    <div style="background: #450a0a; border-left: 4px solid #ef4444; padding: 18px 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0; font-size: 13px; color: #fca5a5; line-height: 1.6;">
            <strong>⚠️ Didn't make this change?</strong><br>
            If you did not authorize this change, please contact our security team immediately to lock your account.
        </p>
    </div>

    <div class="hr"></div>

    <p style="text-align: center; font-size: 13px; color: #71717a;">
        Your security is our priority. If you recognize this activity, no further action is required.
    </p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/password-changed.blade.php ENDPATH**/ ?>