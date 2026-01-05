<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lecturer Approval</title>
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
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        .info-row {
            padding: 10px 0;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #10b981; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 10px 0; font-size: 14px; display: flex; align-items: center; }
        .checklist li:before { content: "✓"; color: #10b981; font-weight: 700; margin-right: 10px; font-size: 16px; }
        .button-container { text-align: center; margin: 30px 0; }
        .button {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            <h2>You're Approved! ✓</h2>
            <p>Welcome to {{ $school->name }} on Skeeme</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Congratulations {{ $lecturer->first_name }}!</h3>
                <p>Your account has been approved by {{ $adminName }}. You're now ready to access your dashboard and start using Skeeme.</p>
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">School:</span>
                    <strong>{{ $school->name }}</strong>
                </div>
                <div class="info-row">
                    <span class="info-label">Account Status:</span>
                    <strong style="color: #10b981;">✓ Active</strong>
                </div>
                <div class="info-row">
                    <span class="info-label">Approved By:</span>
                    <strong>{{ $adminName }}</strong>
                </div>
            </div>

            <div class="button-container">
                <a href="{{ $firstLoginUrl }}" class="button">Access Your Dashboard</a>
            </div>

            <div class="card">
                <h3>Getting Started</h3>
                <ul class="checklist">
                    <li>Update your profile information</li>
                    <li>Explore your courses and classes</li>
                    <li>Review the documentation and guides</li>
                </ul>
            </div>

            <div class="card">
                <h3>Need Help?</h3>
                <p>Our support team is ready to assist you. Check out our documentation or contact support if you have any questions.</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2025 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Support Center</a> | <a href="https://skeeme.ng/docs">Documentation</a></p>
        </div>
    </div>
</body>
</html>
