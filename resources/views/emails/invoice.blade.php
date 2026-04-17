@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Invoice received</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    Your official receipt and invoice details.
</p>

<!-- Invoice Details Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 24px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Invoice Details</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Invoice Number</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">#{{ $invoice->invoice_number }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Date</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $invoice->invoice_date->format('M d, Y') }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Status</td>
            <td style="padding: 10px 0; text-align: right;">
                <span style="background-color: #DCFCE7; color: #166534; padding: 4px 12px; border-radius: 100px; font-weight: 700; font-size: 11px; text-transform: uppercase;">{{ $invoice->status }}</span>
            </td>
        </tr>
    </table>
</div>

<!-- Order Summary -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Order Summary</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">{{ $invoice->plan_name ?? 'Subscription' }}</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') }}{{ number_format($invoice->amount, 2) }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #1a1a1a; font-weight: 700;">Total</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 800; font-size: 18px;">{{ \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') }}{{ number_format($invoice->amount, 2) }}</td>
        </tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ $paymentLink ?? config('app.url') . '/dashboard' }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">View Full Receipt</a>
</div>

<p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Save this email for your records. For billing questions, simply reply to this email.
</p>
@endsection
