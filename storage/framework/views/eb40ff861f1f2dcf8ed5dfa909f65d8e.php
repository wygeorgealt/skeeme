<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Survey Request</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 20px; }
        .hero {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
        }
        .hero h2 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .hero p { font-size: 16px; font-weight: 400; opacity: 0.95; }
        .content { padding: 40px 20px; }
        .card {
            border-left: 4px solid #3b82f6;
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
        .card p { font-size: 14px; color: #4a4a4a; line-height: 1.8; }
        .survey-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        .survey-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
        .survey-desc { font-size: 14px; color: #4a4a4a; margin-bottom: 15px; }
        .survey-meta {
            font-size: 12px;
            color: #666;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
        }
        .button-container { text-align: center; margin: 30px 0; }
        .button {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
            <h2>Your Feedback Matters 📊</h2>
            <p>Help us improve Skeeme with your feedback</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Hello <?php echo e($user->first_name); ?>,</h3>
                <p>We'd love to hear your thoughts about your experience with Skeeme. Your feedback helps us create a better platform for everyone.</p>
            </div>

            <div class="survey-box">
                <div class="survey-title"><?php echo e($surveyTitle); ?></div>
                <div class="survey-desc"><?php echo e($surveyDescription); ?></div>
                <div class="survey-meta">⏱️ <?php echo e($estimatedTime); ?> to complete</div>
            </div>

            <div class="button-container">
                <a href="<?php echo e($surveyUrl); ?>" target="_blank" class="button">Take the Survey</a>
            </div>

            <div class="card">
                <h3>Why your opinion matters</h3>
                <p>Your responses will directly influence how we develop and improve Skeeme. Every piece of feedback is valuable and helps us serve you better.</p>
            </div>

            <div class="card">
                <h3>Privacy</h3>
                <p>Your responses are completely confidential and will only be used to improve our platform. We never share your personal data.</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2026 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Support Center</a> | <a href="https://skeeme.ng/privacy">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\emails\survey-request.blade.php ENDPATH**/ ?>