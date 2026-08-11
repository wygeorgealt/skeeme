<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $title ?? 'Skeeme' }}</title>
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!--<![endif]-->
    <style>
        /* Reset */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #FDF8F4; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        a { color: #8B5CF6; text-decoration: none; }
        a:hover { text-decoration: underline; }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body, .wrapper { background-color: #1a1a1a !important; }
            .email-container { background-color: #262626 !important; }
            .text-primary { color: #f5f5f5 !important; }
            .text-secondary { color: #a3a3a3 !important; }
            .text-muted { color: #737373 !important; }
            .divider { border-color: #404040 !important; }
            .card { background-color: #333333 !important; border-color: #404040 !important; }
            .code-box { background-color: #333333 !important; }
        }

        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
            .content-padding { padding: 32px 24px !important; }
            .hero-padding { padding: 40px 24px !important; }
            .footer-padding { padding: 32px 24px !important; }
            .hero-title { font-size: 28px !important; }
        }
    </style>
</head>
<body style="background-color: #FDF8F4; margin: 0; padding: 0;">
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FDF8F4; table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 16px;">

                <!-- Email Container -->
                <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 0;">
                    
                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding: 40px 48px 32px;">
                            <img src="{{ config('app.url') }}/images/logo.png" alt="Skeeme" width="120" style="display: block; filter: brightness(0);">
                        </td>
                    </tr>

                    @hasSection('hero')
                    <!-- Hero Section -->
                    <tr>
                        <td class="hero-padding" align="center" style="padding: 0 48px 32px;">
                            @yield('hero')
                        </td>
                    </tr>
                    @endif

                    <!-- Main Content -->
                    <tr>
                        <td class="content-padding" style="padding: 0 48px 40px;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 48px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="divider" style="border-top: 1px solid #E5E7EB;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Written with Skeeme -->
                    <tr>
                        <td align="center" style="padding: 32px 48px 0;">
                            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                                — Written with <a href="https://skeeme.com" style="color: #1a1a1a; font-weight: 600; text-decoration: none;">Skeeme</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Social Links -->
                    <tr>
                        <td align="center" style="padding: 24px 48px 0;">
                            <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <!-- X (Twitter) -->
                                    <td style="padding: 0 8px;">
                                        <a href="https://x.com/skeeme_ai" style="text-decoration: none; color: #6b7280; font-size: 14px; font-weight: 600;">𝕏</a>
                                    </td>
                                    <!-- Instagram -->
                                    <td style="padding: 0 8px;">
                                        <a href="https://instagram.com/skeeme_ai" style="text-decoration: none; color: #6b7280; font-size: 14px; font-weight: 600;">Instagram</a>
                                    </td>
                                    <!-- TikTok -->
                                    <td style="padding: 0 8px;">
                                        <a href="https://tiktok.com/@skeeme_ai" style="text-decoration: none; color: #6b7280; font-size: 14px; font-weight: 600;">TikTok</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer-padding" align="center" style="padding: 24px 48px 16px;">
                            <p style="font-size: 12px; color: #9ca3af; line-height: 1.8; margin: 0;">
                                &copy; {{ date('Y') }} Skeeme Inc.<br>
                                Abuja, Nigeria
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Links -->
                    <tr>
                        <td align="center" style="padding: 0 48px 16px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding: 0 6px;">
                                        <a href="https://skeeme.com" style="color: #9ca3af; font-size: 11px; text-decoration: none; font-weight: 500;">Website</a>
                                    </td>
                                    <td style="padding: 0 6px; color: #d1d5db;">|</td>
                                    <td style="padding: 0 6px;">
                                        <a href="https://skeeme.com/terms" style="color: #9ca3af; font-size: 11px; text-decoration: none; font-weight: 500;">Terms</a>
                                    </td>
                                    <td style="padding: 0 6px; color: #d1d5db;">|</td>
                                    <td style="padding: 0 6px;">
                                        <a href="#" style="color: #9ca3af; font-size: 11px; text-decoration: none; font-weight: 500;">Unsubscribe</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Bottom Logo -->
                    <tr>
                        <td align="center" style="padding: 16px 48px 40px;">
                            <img src="{{ config('app.url') }}/images/logo.png" alt="Skeeme" width="28" style="display: block; filter: brightness(0); opacity: 0.3;">
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>
