<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skeeme Auth</title>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 40px; text-align: left;">
                            
                            <!-- Logo -->
                            <div style="margin-bottom: 24px;">
                                <img src="{{ asset('images/logo.png') }}" alt="Skeeme Logo" style="width: 48px; height: 48px; object-fit: contain; border-radius: 12px; border: 1px solid #f3f4f6; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
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
