@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    You're now on<br><em style="font-style: italic;">Premium</em> ✨
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Your upgrade is complete. Enjoy unlimited access.</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Congratulations! Your subscription has been successfully upgraded to <strong style="color: #1a1a1a;">{{ $planName }}</strong>. You now have access to all premium features.
</p>

<!-- Subscription Details Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Subscription Details</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Plan</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $planName }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Billing Cycle</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ ucfirst($billingPeriod) }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Amount</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $subscription->getFormattedPrice('NGN') }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Valid Until</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $subscription->expiry_date->format('M d, Y') }}</td>
        </tr>
    </table>
</div>

<!-- Renewal Notice -->
<div class="card" style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 20px; margin: 0 0 32px;">
    <p style="margin: 0; font-size: 13px; color: #92400E; line-height: 1.6;">
        <strong>Automatic Renewal</strong> — Your subscription will renew on {{ $subscription->expiry_date->format('M d, Y') }}. You can manage or cancel anytime in your account settings.
    </p>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 16px;">
    <a href="{{ config('app.url') . '/dashboard' }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Go to Dashboard</a>
</div>
@endsection
