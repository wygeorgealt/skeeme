<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #09090b; padding-bottom: 40px; }
        .main { background-color: #18181b; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #fafafa; border-radius: 24px; overflow: hidden; margin-top: 40px; border: 1px solid #27272a; }
        .header { padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%); }
        .content { padding: 40px; }
        h1 { font-size: 28px; font-weight: 800; color: #ffffff; margin-bottom: 20px; text-align: center; }
        p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
        .button-container { text-align: center; margin-top: 40px; }
        .button { display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #09090b; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; }
        .footer { padding: 40px; text-align: center; font-size: 14px; color: #71717a; }
        .hr { border: none; border-top: 1px solid #27272a; margin: 40px 0; }
        .highlight { color: #6366f1; font-weight: 700; }
        .code { background-color: #27272a; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 24px; text-align: center; letter-spacing: 4px; color: #ffffff; margin: 24px 0; }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <img src="<?php echo e(url('/img/logo-white.svg')); ?>" alt="Skeeme" width="120">
                </td>
            </tr>
            <tr>
                <td class="content">
                    <?php echo $__env->yieldContent('content'); ?>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    &copy; <?php echo e(date('Y')); ?> Skeeme Inc. <br>
                    Keep your school high-performance. <br>
                    <a href="#" style="color: #6366f1; text-decoration: none;">Unsubscribe</a>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\layouts\email.blade.php ENDPATH**/ ?>