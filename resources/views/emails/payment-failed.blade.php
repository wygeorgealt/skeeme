@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Payment failed</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    We couldn't process your payment.
</p>

<!-- Reason Card -->
<div class="card" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
    <p style="margin: 0; font-size: 13px; color: #991B1B; line-height: 1.6;">
        <strong>What happened?</strong><br>
        {{ $failureReason }}
    </p>
</div>

<!-- Details Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Plan</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $planName }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Amount</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $attemptedAmount }}</td>
        </tr>
    </table>
</div>

<!-- Tips Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px;">Troubleshooting</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding: 6px 0; font-size: 13px; color: #374151;">• Check if your card has sufficient funds</td></tr>
        <tr><td style="padding: 6px 0; font-size: 13px; color: #374151;">• Verify that your card details are correct</td></tr>
        <tr><td style="padding: 6px 0; font-size: 13px; color: #374151;">• Check if international payments are enabled</td></tr>
        <tr><td style="padding: 6px 0; font-size: 13px; color: #374151;">• Try a different payment method</td></tr>
        <tr><td style="padding: 6px 0; font-size: 13px; color: #374151;">• Contact your bank if the issue persists</td></tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ $retryUrl }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Try Again</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Need assistance? Simply reply to this email and we'll help you out.
</p>
@endsection
