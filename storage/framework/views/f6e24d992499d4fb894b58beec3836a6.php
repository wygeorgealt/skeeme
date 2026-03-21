<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($title ?? 'Skeeme AI'); ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* Reset */
        * { margin:0; padding:0; box-sizing:border-box; }
        body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; background-color:#FAFAFA; font-family:'Inter', Helvetica, Arial, sans-serif; }
        img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
        table { border-collapse:collapse !important; mso-table-lspace:0pt; mso-table-rspace:0pt; }
        
        /* Layout */
        .wrapper { width:100%; table-layout:fixed; background-color:#FAFAFA; }
        .container { max-width:680px; margin:0 auto; background-color:#FFFFFF; overflow:hidden; border-radius: 0 24px 24px 0; }
        
        /* Autoflow Signature Sidebar */
        .sidebar { width:60px; background: linear-gradient(180deg, #8B5CF6 0%, #6366F1 100%); vertical-align:top; }
        .main-content { padding: 40px 48px; vertical-align:top; }
        
        /* Typography */
        h1 { font-size:36px; font-weight:800; line-height:1.2; color:#1e293b; margin-bottom:20px; letter-spacing:-0.03em; }
        h2 { font-size:24px; font-weight:800; line-height:1.3; color:#1e293b; margin-bottom:16px; letter-spacing:-0.02em; }
        p { font-size:16px; font-weight:500; line-height:1.7; color:#475569; margin-bottom:24px; }
        
        /* Components */
        .btn { display:inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color:#FFFFFF !important; text-decoration:none; font-weight:800; font-size:14px; padding:16px 32px; border-radius:12px; text-transform:uppercase; letter-spacing:0.02em; }
        .btn:hover { opacity:0.9; }
        
        .badge { display:inline-block; background-color:rgba(139, 92, 246, 0.1); color:#8B5CF6; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.15em; padding:6px 14px; border-radius:100px; margin-bottom:16px; }
        
        .glass-box { background-color:#F8FAFC; border:1px solid rgba(139, 92, 246, 0.1); border-radius:20px; padding:24px; margin:32px 0; }
        
        /* Footer */
        .footer { padding:40px 0; border-top:1px solid #F1F5F9; }
        .social-link { color:#94A3B8; text-decoration:none; font-size:12px; margin:0 12px; font-weight:600; }
        .legal-text { font-size:11px; color:#94A3B8; line-height:1.8; margin-top:24px; }

        @media screen and (max-width: 600px) {
            .sidebar { width:12px !important; }
            .main-content { padding: 32px 24px !important; }
            h1 { font-size:28px !important; }
        }
    </style>
</head>
<body>
    <center>
        <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    <table class="container" width="680" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0;">
                        <tr>
                            <!-- Signature Accent Sidebar -->
                            <td class="sidebar" width="60">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr><td height="800">&nbsp;</td></tr>
                                </table>
                            </td>
                            
                            <!-- Main Body -->
                            <td class="main-content" align="left">
                                <!-- Logo Header -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 60px;">
                                    <tr>
                                        <td align="left">
                                            <img src="<?php echo e(asset('images/logo.png')); ?>" width="40" alt="Skeeme Logo">
                                        </td>
                                    </tr>
                                </table>

                                <?php echo $__env->yieldContent('content'); ?>

                                <!-- Common Footer -->
                                <table class="footer" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 60px;">
                                    <tr>
                                        <td align="left">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td><a href="https://skeeme.ng" class="social-link">Skeeme.ng</a></td>
                                                    <td><a href="https://twitter.com/skeeme_ai" class="social-link">Twitter</a></td>
                                                    <td><a href="https://instagram.com/skeeme_ai" class="social-link">Instagram</a></td>
                                                </tr>
                                            </table>
                                            <p class="legal-text">
                                                © <?php echo e(date('Y')); ?> Skeeme AI. All rights reserved.<br>
                                                You received this email because you're a registered user of Skeeme.<br>
                                                Lagos, Nigeria.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/layouts/email_master.blade.php ENDPATH**/ ?>