<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Skeeme</title>
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
        .card p { font-size: 14px; color: #4a4a4a; }
        .checklist { list-style: none; }
        .checklist li { padding: 12px 0; font-size: 14px; display: flex; align-items: center; }
        .checklist li:before { content: "✓"; color: #667eea; font-weight: 700; margin-right: 10px; font-size: 16px; }
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
            <h2>Welcome aboard! 👋</h2>
            <p>Get ready to transform education at <?php echo e($schoolName); ?></p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Account Created Successfully</h3>
                <p>Hi <?php echo e($user->first_name); ?>, your admin account has been created. We're excited to have you on board!</p>
            </div>

            <div class="card">
                <h3>Your next steps:</h3>
                <ul class="checklist">
                    <li>Complete your email verification</li>
                    <li>Set up your school configuration (calendar, timezone, theme)</li>
                    <li>Choose your subscription plan</li>
                </ul>
            </div>

            <div class="button-container">
                <a href="<?php echo e(route('onboarding.admin')); ?>" class="button">Complete Your Setup</a>
            </div>

            <div class="card">
                <h3>Need help?</h3>
                <p>Our support team is here for you. If you have any questions, don't hesitate to reach out. We're happy to help!</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2026 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Support Center</a> | <a href="https://skeeme.ng/docs">Documentation</a></p>
            <p><?php echo e(config('app.url')); ?></p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\emails\welcome-admin.blade.php ENDPATH**/ ?>