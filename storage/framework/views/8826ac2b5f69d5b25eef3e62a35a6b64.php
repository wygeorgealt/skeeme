<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #ffffff; color: #1a1a1a; padding: 0; margin: 0;">
    <!-- Header with Logo -->
    <div style="background: #ffffff; border-bottom: 1px solid #f0f0f0; padding: 25px 0; text-align: center;">
        <img src="https://skeeme.ng/images/logo.png" alt="Skeeme Logo" style="height: 50px; margin: 0 auto;">
    </div>

    <!-- Hero Section - Free Flowing -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; text-align: center;">
        <div style="font-size: 50px; margin-bottom: 20px;">✨</div>
        <h2 style="margin: 0 0 15px 0; font-size: 36px; font-weight: 800; color: #ffffff;">Welcome to Premium!</h2>
        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95); line-height: 1.6;">Your upgrade is complete. Enjoy unlimited access.</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 50px 30px; max-width: 600px; margin: 0 auto; line-height: 1.8;">
        <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.8; color: #444;">
            Hello,
        </p>

        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #444;">
            Congratulations! 🎉 Your subscription has been successfully upgraded to <strong><?php echo e($planName); ?></strong>. You now have access to all premium features.
        </p>

        <!-- Upgrade Confirmation Card -->
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Subscription Details</h3>
            
            <table style="width: 100%; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Plan</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;"><?php echo e($planName); ?></td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Billing Cycle</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;"><?php echo e(ucfirst($billingPeriod)); ?></td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Amount</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;"><?php echo e($subscription->getFormattedPrice('NGN')); ?></td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Valid Until</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;"><?php echo e($subscription->expiry_date->format('M d, Y')); ?></td>
                </tr>
            </table>
        </div>

        <!-- Premium Features -->
        <div style="margin: 30px 0;">
            <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Your New Premium Features</h3>
            
            <ul style="margin: 0; padding: 0; list-style: none;">
                <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #444;">✓ Unlimited course access</li>
                <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #444;">✓ Personalized learning paths</li>
                <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #444;">✓ Priority support</li>
                <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #444;">✓ Certificates of completion</li>
                <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #444;">✓ Exclusive community access</li>
                <li style="padding: 12px 0; font-size: 14px; color: #444;">✓ Ad-free learning experience</li>
            </ul>
        </div>

        <!-- Billing Notice -->
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 18px 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">
                <strong>💳 Automatic Renewal</strong><br>
                Your subscription will automatically renew on <?php echo e($subscription->expiry_date->format('M d, Y')); ?>. You can manage or cancel your subscription anytime in your account settings.
            </p>
        </div>

        <!-- CTA Buttons -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="<?php echo e(config('app.url') . '/dashboard'); ?>" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 45px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 0 8px;">
                Go to Dashboard
            </a>
        </div>

        <!-- Quick Links -->
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Quick Links</h3>
            <p style="margin: 8px 0; font-size: 14px;">
                <a href="<?php echo e(config('app.url') . '/courses'); ?>" style="color: #667eea; text-decoration: none; font-weight: 600;">📚 Browse Courses</a>
            </p>
            <p style="margin: 8px 0; font-size: 14px;">
                <a href="<?php echo e(config('app.url') . '/account/settings'); ?>" style="color: #667eea; text-decoration: none; font-weight: 600;">⚙️ Account Settings</a>
            </p>
            <p style="margin: 8px 0; font-size: 14px;">
                <a href="<?php echo e(config('app.url') . '/help'); ?>" style="color: #667eea; text-decoration: none; font-weight: 600;">❓ Help & Support</a>
            </p>
        </div>

        <!-- Divider -->
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">

        <!-- Support Section -->
        <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #1a1a1a;">Need Help?</p>
            <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
                Our support team is ready to assist<br>
                <a href="mailto:<?php echo e(config('mail.from.address')); ?>" style="color: #667eea; text-decoration: none; font-weight: 600;"><?php echo e(config('mail.from.address')); ?></a>
            </p>
        </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; border-top: 1px solid #e0e0e0; padding: 35px 20px; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #667eea;">✓ Premium Activated</p>
        <p style="margin: 0 0 15px 0; font-size: 12px; color: #888;">
            © <?php echo e(date('Y')); ?> Skeeme. All rights reserved. | 
            <a href="<?php echo e(config('app.url')); ?>/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
            <a href="<?php echo e(config('app.url')); ?>/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
    </div>
</div>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\emails\upgrade-confirmation.blade.php ENDPATH**/ ?>