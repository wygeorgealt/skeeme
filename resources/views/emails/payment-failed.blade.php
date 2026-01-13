<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 20px; }
        .hero {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
        }
        .hero h2 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .hero p { font-size: 16px; font-weight: 400; opacity: 0.95; }
        .content { padding: 40px 20px; }
        .card {
            border-left: 4px solid #ef4444;
            background: #fee;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #7f1d1d; }
        .card p { font-size: 14px; color: #4a4a4a; line-height: 1.8; }
        .detail-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .detail-row {
            padding: 10px 0;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #667eea; }
        .tips {
            background: #e0e7ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .tips h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #3730a3; }
        .tips ul { list-style: none; padding: 0; }
        .tips li { padding: 6px 0; font-size: 13px; color: #4c1d95; }
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
            <h2>Payment Failed ❌</h2>
            <p>We couldn't process your payment</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>What happened?</h3>
                <p>Your payment attempt was unsuccessful. This could be due to:</p>
                <ul style="list-style: none; padding: 0; margin-top: 10px;">
                    <li style="padding: 4px 0;">• {{ $failureReason }}</li>
                </ul>
            </div>

            <div class="detail-box">
                <div class="detail-row">
                    <span class="detail-label">Plan:</span>
                    <strong>{{ $planName }}</strong>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <strong>{{ $attemptedAmount }}</strong>
                </div>
            </div>

            <div class="tips">
                <h3>💡 Troubleshooting Tips</h3>
                <ul>
                    <li>Check if your card has sufficient funds</li>
                    <li>Verify that your card details are correct</li>
                    <li>Check if your card has international payment enabled</li>
                    <li>Try a different payment method if available</li>
                    <li>Contact your bank if the issue persists</li>
                </ul>
            </div>

            <div class="button-container">
                <a href="{{ $retryUrl }}" class="button">Try Again</a>
            </div>

            <div class="card">
                <h3>Need assistance?</h3>
                <p>If you continue to experience issues, our support team is here to help. Don't hesitate to reach out!</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2026 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Contact Support</a> | <a href="https://skeeme.ng/billing-help">Billing Help</a></p>
        </div>
    </div>
</body>
</html>
