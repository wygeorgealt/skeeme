<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 20px; }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
        }
        .hero h2 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .hero p { font-size: 16px; font-weight: 400; opacity: 0.95; }
        .content { padding: 40px 20px; }
        .card {
            border-left: 4px solid #667eea;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
        .card p { font-size: 14px; color: #4a4a4a; line-height: 1.8; }
        .button-container { text-align: center; margin: 30px 0; }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 40px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
        }
        .button:hover { opacity: 0.95; }
        .warning {
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #78350f;
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
            <h2>Reset Your Password 🔑</h2>
            <p>Create a new secure password for your Skeeme account</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Password Reset Request</h3>
                <p>We received a request to reset the password for your account. Click the button below to create a new password.</p>
            </div>

            <div class="button-container">
                <a href="{{ $resetUrl }}" class="button">Reset Password</a>
            </div>

            <div class="warning">
                <strong>⏱️ This link expires in 1 hour.</strong> If you didn't request this password reset, no action is needed.
            </div>

            <div class="card">
                <h3>Can't click the button?</h3>
                <p>Copy and paste this link in your browser:<br><small>{{ $resetUrl }}</small></p>
            </div>

            <div class="card">
                <h3>Suspicious activity?</h3>
                <p>If you didn't request this password reset, please <a href="https://skeeme.ng/support" style="color: #667eea; text-decoration: none;">contact us immediately</a>. Your account security is our priority.</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2025 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Support Center</a> | <a href="https://skeeme.ng/security">Security</a></p>
        </div>
    </div>
</body>
</html>
