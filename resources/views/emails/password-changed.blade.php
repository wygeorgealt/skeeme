<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 20px; }
        .hero {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
        }
        .hero h2 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .hero p { font-size: 16px; font-weight: 400; opacity: 0.95; }
        .content { padding: 40px 20px; }
        .card {
            border-left: 4px solid #10b981;
            background: #ecfdf5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
        .card p { font-size: 14px; color: #4a4a4a; line-height: 1.8; }
        .details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 13px;
        }
        .detail-row { padding: 8px 0; display: flex; justify-content: space-between; }
        .warning {
            border-left: 4px solid #ef4444;
            background: #fee;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #7f1d1d;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .footer a { color: #667eea; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://skeeme.ng/images/logo.png" alt="Skeeme Logo" class="logo">
        </div>

        <div class="hero">
            <h2>Password Updated ✓</h2>
            <p>Your password has been successfully changed</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Security Notice</h3>
                <p>Your Skeeme account password was successfully changed. This is a security notification to confirm the change.</p>
            </div>

            <div class="details">
                <div class="detail-row">
                    <strong>Account:</strong>
                    <span>{{ $user->email }}</span>
                </div>
                <div class="detail-row">
                    <strong>Changed At:</strong>
                    <span>{{ now()->format('M d, Y \a\t H:i A') }}</span>
                </div>
            </div>

            <div class="warning">
                <strong>⚠️ Didn't make this change?</strong> If you didn't change your password, please secure your account immediately by <a href="https://skeeme.ng/support" style="color: inherit; text-decoration: underline;">contacting support</a>.
            </div>

            <div class="card">
                <h3>Secure Your Account</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0;">✓ Use a strong, unique password</li>
                    <li style="padding: 8px 0;">✓ Enable two-factor authentication if available</li>
                    <li style="padding: 8px 0;">✓ Don't share your password with anyone</li>
                    <li style="padding: 8px 0;">✓ Log out of other sessions if needed</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2025 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Report Suspicious Activity</a> | <a href="https://skeeme.ng/security">Security</a></p>
        </div>
    </div>
</body>
</html>
