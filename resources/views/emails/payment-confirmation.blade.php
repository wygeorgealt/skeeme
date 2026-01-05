<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmed</title>
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
        .invoice-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { padding: 10px; text-align: left; font-size: 13px; }
        th { background: #e5e7eb; font-weight: 600; }
        tr:nth-child(odd) { background: #fff; }
        tr:nth-child(even) { background: #fafafa; }
        .total-row { background: #667eea !important; color: white; font-weight: 600; }
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
            <h2>Payment Confirmed ✓</h2>
            <p>Your payment was successful</p>
        </div>

        <div class="content">
            <div class="card">
                <h3>Thank you for your payment!</h3>
                <p>Your payment has been processed successfully. Your subscription is now active and ready to use.</p>
            </div>

            <div class="invoice-box">
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 15px;">Invoice Details</h3>
                <table>
                    <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Amount</th>
                    </tr>
                    <tr>
                        <td>{{ $invoiceNumber }}</td>
                        <td>{{ $paymentDate }}</td>
                        <td><strong>{{ $amount }}</strong></td>
                    </tr>
                </table>

                <h3 style="font-size: 14px; font-weight: 600; margin: 20px 0 15px 0;">Items</h3>
                <table>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                    <tr>
                        <td>{{ $invoice->plan_name ?? 'Subscription Plan' }}</td>
                        <td>1</td>
                        <td>{{ $amount }}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="2" style="text-align: right;">Total:</td>
                        <td>{{ $amount }}</td>
                    </tr>
                </table>
            </div>

            <div class="button-container">
                <a href="{{ route('invoices.view', ['invoice' => $invoice->id]) }}" class="button">View Full Invoice</a>
            </div>

            <div class="card">
                <h3>What's next?</h3>
                <p>Your subscription is now active. You can start using all premium features immediately. Visit your dashboard to get started!</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2025 Skeeme. All rights reserved.</p>
            <p><a href="https://skeeme.ng/support">Support Center</a> | <a href="https://skeeme.ng/invoices">View Invoices</a></p>
        </div>
    </div>
</body>
</html>
