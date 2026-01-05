<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #ffffff; color: #1a1a1a; padding: 0; margin: 0;">
    <!-- Header with Logo -->
    <div style="background: #ffffff; border-bottom: 1px solid #f0f0f0; padding: 25px 0; text-align: center;">
        <img src="https://skeeme.ng/images/logo.png" alt="Skeeme Logo" style="height: 50px; margin: 0 auto;">
    </div>

    <!-- Hero Section - Free Flowing -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; text-align: center;">
        <div style="font-size: 50px; margin-bottom: 20px;">🎉</div>
        <h2 style="margin: 0 0 15px 0; font-size: 36px; font-weight: 800; color: #ffffff;">Welcome to Skeeme!</h2>
        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95); line-height: 1.6;">Your education journey starts right here. Let's get you set up and ready to succeed.</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 50px 30px; max-width: 600px; margin: 0 auto; line-height: 1.8;">
        <p style="margin: 0 0 25px 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
            Hi <strong>{{ $user->first_name }},</strong>
        </p>

        <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.8; color: #444;">
            Welcome to the <strong style="color: #667eea;">{{ $schoolName }}</strong> community on Skeeme! Your account is all set up and ready to go. We're thrilled to have you on board.
        </p>

        <!-- Account Details Card - Light & Clean -->
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 35px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Account Information</h3>
            
            <table style="width: 100%; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Name</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $user->first_name }} {{ $user->last_name }}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Email</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $user->email }}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Role</td>
                    <td style="padding: 12px 0; text-align: right; color: #667eea; font-weight: 600;">{{ ucfirst($user->role) }}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">School</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $schoolName }}</td>
                </tr>
            </table>
        </div>

        <!-- Getting Started Section -->
        <div style="margin: 40px 0;">
            <h3 style="margin: 0 0 25px 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">Get Started in Just 4 Steps</h3>
            
            <!-- Steps - Flowing Layout -->
            <div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #667eea;">
                    <div style="font-size: 24px; float: left; margin-right: 15px;">📱</div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Log In to Your Dashboard</h4>
                    <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">Access your personalized learning space with your email and password</p>
                    <div style="clear: both;"></div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #764ba2;">
                    <div style="font-size: 24px; float: left; margin-right: 15px;">👤</div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Complete Your Profile</h4>
                    <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">Add your photo and fill in your academic interests to personalize your experience</p>
                    <div style="clear: both;"></div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #667eea;">
                    <div style="font-size: 24px; float: left; margin-right: 15px;">📚</div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Explore Your Courses</h4>
                    <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">Browse and enroll in the courses offered by your school. Your learning materials are waiting!</p>
                    <div style="clear: both;"></div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #764ba2;">
                    <div style="font-size: 24px; float: left; margin-right: 15px;">🤝</div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Connect & Learn</h4>
                    <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">Engage with classmates, ask questions, and grow together with the Skeeme community</p>
                    <div style="clear: both;"></div>
                </div>
            </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
            <a href="{{ config('app.url') }}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 45px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Launch Your Dashboard
            </a>
        </div>

        <!-- Security Notice -->
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 18px 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #7f1d1d; line-height: 1.6;">
                <strong>🔒 Keep Your Password Safe</strong><br>
                Never share your password with anyone. Skeeme will never ask for it via email.
            </p>
        </div>

        <!-- Divider -->
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">

        <!-- Support Section -->
        <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #1a1a1a;">Questions or Need Help?</p>
            <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
                Reach out to our support team or your school administrator<br>
                <a href="mailto:{{ config('mail.from.address') }}" style="color: #667eea; text-decoration: none; font-weight: 600;">{{ config('mail.from.address') }}</a>
            </p>
        </div>
    </div>

    <!-- Footer - Light & Clean -->
    <div style="background: #f8f9fa; border-top: 1px solid #e0e0e0; padding: 35px 20px; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #667eea;">✓ You're All Set!</p>
        <p style="margin: 0 0 15px 0; font-size: 12px; color: #888;">
            © {{ date('Y') }} Skeeme. All rights reserved. | 
            <a href="{{ config('app.url') }}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
            <a href="{{ config('app.url') }}/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #aaa;">You received this email because you signed up at Skeeme</p>
    </div>
</div>
