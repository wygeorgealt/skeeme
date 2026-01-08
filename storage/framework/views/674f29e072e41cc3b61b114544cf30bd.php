

<?php $__env->startSection('content'); ?>
    <div style="text-align: center; font-size: 50px; margin-bottom: 20px;">✓</div>
    <h1>You're Approved!</h1>
    <p>Congratulations <span class="highlight"><?php echo e($lecturer->first_name); ?></span>! Your account has been approved by <?php echo e($adminName); ?>. You are now part of the <?php echo e($school->name); ?> academic network on Skeeme.</p>

    <div style="background: #27272a; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #10b981;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Account Status</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 10px 0; color: #a1a1aa;">School</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff; font-weight: 600;"><?php echo e($school->name); ?></td>
            </tr>
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 10px 0; color: #a1a1aa;">Access</td>
                <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: 600;">✓ Active</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #a1a1aa;">Approved By</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;"><?php echo e($adminName); ?></td>
            </tr>
        </table>
    </div>

    <div class="button-container">
        <a href="<?php echo e($firstLoginUrl); ?>" class="button">Access Your Dashboard</a>
    </div>

    <div class="hr"></div>

    <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 15px;">Next Steps:</h3>
    <p style="font-size: 14px; margin-bottom: 8px;">• Update your profile information</p>
    <p style="font-size: 14px; margin-bottom: 8px;">• Explore your courses and assigned classes</p>
    <p style="font-size: 14px;">• Review our documentation for AI features</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/lecturer-approval-notification.blade.php ENDPATH**/ ?>