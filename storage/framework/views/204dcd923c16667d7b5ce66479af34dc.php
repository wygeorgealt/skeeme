

<?php $__env->startSection('content'); ?>
    <div style="text-align: center; font-size: 50px; margin-bottom: 20px;">✓</div>
    <h1>Payment Confirmed</h1>
    <p>Thank you! Your payment has been processed successfully. Your subscription is now active and ready to use.</p>

    <div style="background: #27272a; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #10b981;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Transaction Summary</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 10px 0; color: #a1a1aa;">Invoice #</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff; font-weight: 600;"><?php echo e($invoiceNumber); ?></td>
            </tr>
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 10px 0; color: #a1a1aa;">Date</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;"><?php echo e($paymentDate); ?></td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #a1a1aa;">Total Paid</td>
                <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: 800; font-size: 16px;"><?php echo e($amount); ?></td>
            </tr>
        </table>
    </div>

    <div class="button-container">
        <a href="<?php echo e(route('invoices.view', ['invoice' => $invoice->id])); ?>" class="button">View Full Invoice</a>
    </div>

    <div class="hr"></div>

    <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 15px;">What's next?</h3>
    <p>Your premium features are now unlocked. You can start creating courses, managing exams, and setting up AI automations immediately from your dashboard.</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\emails\payment-confirmation.blade.php ENDPATH**/ ?>