

<?php $__env->startSection('content'); ?>
    <div style="text-align: center; font-size: 50px; margin-bottom: 20px;">💳</div>
    <h1>Invoice Received</h1>
    <p>Thank you for your payment. Your receipt and invoice details are provided below. This is your official confirmation of purchase.</p>

    <div style="background: #27272a; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #6366f1;">
        <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Invoice Details</h3>
        
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 12px 0; color: #a1a1aa; font-weight: 600;">Invoice Number</td>
                <td style="padding: 12px 0; text-align: right; color: #ffffff; font-weight: 600;">#<?php echo e($invoice->invoice_number); ?></td>
            </tr>
            <tr style="border-bottom: 1px solid #3f3f46;">
                <td style="padding: 12px 0; color: #a1a1aa; font-weight: 600;">Invoice Date</td>
                <td style="padding: 12px 0; text-align: right; color: #ffffff; font-weight: 600;"><?php echo e($invoice->invoice_date->format('M d, Y')); ?></td>
            </tr>
            <tr>
                <td style="padding: 12px 0; color: #a1a1aa; font-weight: 600;">Status</td>
                <td style="padding: 12px 0; text-align: right;">
                    <span style="background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 11px; text-transform: uppercase;"><?php echo e($invoice->status); ?></span>
                </td>
            </tr>
        </table>
    </div>

    <div style="margin: 35px 0;">
        <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 2px solid #6366f1;">
                <td style="padding: 12px; color: #ffffff; font-weight: 600; text-align: left;">Plan</td>
                <td style="padding: 12px; color: #ffffff; font-weight: 600; text-align: right;">Amount</td>
            </tr>
            <tr>
                <td style="padding: 12px; color: #a1a1aa; text-align: left;"><?php echo e($invoice->plan_name ?? 'Course/Subscription'); ?></td>
                <td style="padding: 12px; color: #ffffff; text-align: right; font-weight: 700;"><?php echo e(\App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN')); ?><?php echo e(number_format($invoice->amount, 2)); ?></td>
            </tr>
        </table>
    </div>

    <div class="button-container">
        <a href="<?php echo e($paymentLink ?? config('app.url') . '/dashboard'); ?>" class="button">View Full Receipt</a>
    </div>

    <p style="font-size: 13px; color: #71717a; margin-top: 40px; text-align: center;">
        Save this email for your records. If you have any billing questions, please contact our support team.
    </p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/emails/invoice.blade.php ENDPATH**/ ?>