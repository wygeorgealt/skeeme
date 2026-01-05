<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #ffffff; color: #1a1a1a; padding: 0; margin: 0;">
    <!-- Header with Logo -->
    <div style="background: #ffffff; border-bottom: 1px solid #f0f0f0; padding: 25px 0; text-align: center;">
        <img src="https://skeeme.test/images/logo.png" alt="Skeeme Logo" style="height: 50px; margin: 0 auto;">
    </div>

    <!-- Hero Section - Free Flowing -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; text-align: center;">
        <div style="font-size: 50px; margin-bottom: 20px;">💳</div>
        <h2 style="margin: 0 0 15px 0; font-size: 36px; font-weight: 800; color: #ffffff;">Invoice Received</h2>
        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95); line-height: 1.6;">Thank you for your payment. Here's your receipt.</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 50px 30px; max-width: 600px; margin: 0 auto; line-height: 1.8;">
        <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.8; color: #444;">
            Your payment has been processed successfully. Please find your invoice details below.
        </p>

        <!-- Invoice Details Card -->
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Invoice Details</h3>
            
            <table style="width: 100%; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Invoice Number</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;">#{{ $invoice->invoice_number }}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Invoice Date</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $invoice->invoice_date->format('M d, Y') }}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Due Date</td>
                    <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $invoice->due_date->format('M d, Y') }}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #666; font-weight: 600;">Status</td>
                    <td style="padding: 12px 0; text-align: right;">
                        @if($invoice->status === 'paid')
                            <span style="background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px;">✓ Paid</span>
                        @elseif($invoice->status === 'pending')
                            <span style="background-color: #fef08a; color: #854d0e; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px;">Pending</span>
                        @else
                            <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px;">{{ ucfirst($invoice->status) }}</span>
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <!-- Order Summary -->
        <div style="margin: 35px 0;">
            <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">Order Summary</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa; border-bottom: 2px solid #667eea;">
                    <td style="padding: 12px; color: #1a1a1a; font-weight: 600; text-align: left;">Description</td>
                    <td style="padding: 12px; color: #1a1a1a; font-weight: 600; text-align: center; width: 15%;">Qty</td>
                    <td style="padding: 12px; color: #1a1a1a; font-weight: 600; text-align: right; width: 25%;">Amount</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px 0; color: #1a1a1a; text-align: left;">{{ $invoice->plan_name ?? 'Course/Subscription' }}</td>
                    <td style="padding: 12px 0; color: #1a1a1a; text-align: center; font-weight: 600;">1</td>
                    <td style="padding: 12px 0; color: #1a1a1a; text-align: right; font-weight: 600;">{{ \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') }}{{ number_format($invoice->amount, 2) }}</td>
                </tr>
            </table>
        </div>

        <!-- Total Section -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
            <table style="width: 100%; font-size: 14px;">
                <tr>
                    <td style="padding: 8px 0; color: #666; text-align: right; font-weight: 600;">Subtotal</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-align: right; width: 30%;">{{ \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') }}{{ number_format($invoice->amount, 2) }}</td>
                </tr>
                <tr style="border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 8px 0; color: #666; text-align: right; font-weight: 600;">Tax</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-align: right;">{{ \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') }}0.00</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #667eea; font-weight: 700; text-align: right; font-size: 15px;">TOTAL</td>
                    <td style="padding: 12px 0; color: #667eea; font-weight: 700; text-align: right; font-size: 18px;">{{ \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') }}{{ number_format($invoice->amount, 2) }}</td>
                </tr>
            </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="{{ $paymentLink ?? config('app.url') . '/dashboard' }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 45px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                View Full Receipt
            </a>
        </div>

        <!-- Important Notice -->
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 18px 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #7f1d1d; line-height: 1.6;">
                <strong>📧 Keep This Email</strong><br>
                This is your official receipt. Please save this email for your records.
            </p>
        </div>

        <!-- Divider -->
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">

        <!-- Support Section -->
        <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #1a1a1a;">Questions About Your Invoice?</p>
            <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
                Our support team is here to help<br>
                <a href="mailto:{{ config('mail.from.address') }}" style="color: #667eea; text-decoration: none; font-weight: 600;">{{ config('mail.from.address') }}</a>
            </p>
        </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; border-top: 1px solid #e0e0e0; padding: 35px 20px; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #667eea;">✓ Payment Confirmed</p>
        <p style="margin: 0 0 15px 0; font-size: 12px; color: #888;">
            © {{ date('Y') }} Skeeme. All rights reserved. | 
            <a href="{{ config('app.url') }}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
            <a href="{{ config('app.url') }}/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
    </div>
</div>
