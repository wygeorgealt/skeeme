<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Renewal Reminder</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 20px; }
        .hero {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        .detail-box {
            background: #fff;
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .detail-row {
            padding: 10px 0;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
        }
        .detail-label { font-weight: 600; color: #667eea; }
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
            <h2>Subscription Renewal Coming ⏰</h2>
            <p>Your subscription renews in {{ $daysRemaining }} days</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Hello there!</h3>
                <p>Your {{ $planName }} plan subscription will automatically renew in <strong>{{ $daysRemaining }} days</strong>. Here's a summary of what's included.</p>
            </div>

            <div class="detail-box">
                <div class="detail-row">
                    <span class="detail-label">Plan:</span>
                    <strong>{{ $planName }}</strong>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Renewal Amount:</span>
                    <strong>{{ $renewalAmount }}</strong>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Renewal Date:</span>
                    <strong>{{ $subscription->expires_at->format('M d, Y') }}</strong>
                </div>
            </div>

            <div class="card">
                <h3>What's included:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0;">✓ Full course management system</li>
                    <li style="padding: 8px 0;">✓ Student assessment tools</li>
                    <li style="padding: 8px 0;">✓ Advanced reporting</li>
                    <li style="padding: 8px 0;">✓ Priority support</li>
                </ul>
            </div>

            <div class="button-container">
                <a href="{{ route('settings.subscription-billing') }}" class="button">Manage Subscription</a>
            </div>

            <div class="card">
                <h3>Need help?</h3>
                <p>Questions about your subscription? Our support team is ready to assist. Contact us anytime!</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2026 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Support Center</a> | <a href="https://skeeme.ng/pricing">View Plans</a></p>
        </div>
    </div>
</body>
</html>
