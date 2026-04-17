@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Renewal coming up</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    Your subscription renews in <strong style="color: #1a1a1a;">{{ $daysRemaining }} days</strong>.
</p>

<!-- Subscription Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Subscription Details</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Plan</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $planName }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Renewal Amount</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $renewalAmount }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Renewal Date</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $subscription->expires_at->format('M d, Y') }}</td>
        </tr>
    </table>
</div>

<!-- What's included -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px;">What's included</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding: 6px 0; font-size: 14px; color: #374151;">✓ &nbsp;Full course management system</td></tr>
        <tr><td style="padding: 6px 0; font-size: 14px; color: #374151;">✓ &nbsp;Student assessment tools</td></tr>
        <tr><td style="padding: 6px 0; font-size: 14px; color: #374151;">✓ &nbsp;Advanced reporting</td></tr>
        <tr><td style="padding: 6px 0; font-size: 14px; color: #374151;">✓ &nbsp;Priority support</td></tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ route('settings.subscription-billing') }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Manage Subscription</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Questions about your subscription? Simply reply to this email.
</p>
@endsection
