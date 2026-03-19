<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; margin: 20px 0; }
        .footer { font-size: 13px; color: #64748b; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify your email</h2>
        <p>Your Skeeme verification code is:</p>
        <div class="code">{{ $code }}</div>
        <p>This code expires in 10 minutes. Please do not share it with anyone.</p>
        <p>Welcome to Skeeme!</p>
    </div>
</body>
</html>
