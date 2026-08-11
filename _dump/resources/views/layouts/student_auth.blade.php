<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skeeme Auth</title>
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!--<![endif]-->
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 48px; text-align: left;">
                            
                            <!-- Logo -->
                            <div style="margin-bottom: 32px;">
                                <img src="{{ config('app.url') }}/images/skeemeword.png" alt="Skeeme Logo" style="height: 32px; width: auto; display: block; filter: grayscale(100%);">
                            </div>

                            @yield('content')
                            
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
