@extends('layouts.email_master')

@section('content')
<div class="badge">Billing</div>
<h1>You're all set. Subscription confirmed.</h1>
<p>
    Hi {{ $user->first_name ?? 'there' }},<br><br>
    Welcome to the premium tier! Your subscription to Skeeme has been successfully confirmed. You now have full access to our advanced AI tools and unlimited study insights.
</p>

<div class="glass-box" style="padding: 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding-bottom: 12px; border-bottom: 1px solid #E2E8F0;">
                <span style="font-size: 12px; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Plan Type</span><br>
                <span style="font-size: 18px; font-weight: 800; color: #1E293B;">{{ $planName ?? 'Skeeme Premium' }}</span>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 12px;">
                <span style="font-size: 12px; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Next Billing Date</span><br>
                <span style="font-size: 14px; font-weight: 600; color: #475569;">{{ $nextBillingDate ?? 'Next Month' }}</span>
            </td>
        </tr>
    </table>
</div>

<p>Ready to put your premium credits to use? Start your next intensive study session now.</p>

<div style="margin-top: 40px;">
    <a href="{{ config('app.url') }}/dashboard" class="btn">Explore Premium Features</a>
</div>

<p style="margin-top: 48px; font-size: 14px; color: #94A3B8;">
    You can manage your subscription and download invoices anytime from your <a href="{{ config('app.url') }}/settings/billing" style="color: #6366F1; text-decoration: none;">Account Settings</a>.
</p>
@endsection
