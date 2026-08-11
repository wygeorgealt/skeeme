@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    Subscription<br><em style="font-style: italic;">confirmed</em> ✓
</h1>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ $user->first_name ?? 'there' }}, welcome to the premium tier! You now have full access to our advanced AI tools and unlimited study insights.
</p>

<!-- Plan Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Plan</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 700; font-size: 17px; border-bottom: 1px solid #E5E7EB;">{{ $planName ?? 'Skeeme Premium' }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Next Billing Date</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $nextBillingDate ?? 'Next Month' }}</td>
        </tr>
    </table>
</div>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Ready to put your premium credits to use? Start your next intensive study session now.
</p>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ config('app.url') }}/dashboard" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Explore Premium Features</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    You can manage your subscription anytime from your <a href="{{ config('app.url') }}/settings/billing" style="color: #8B5CF6; font-weight: 600;">Account Settings</a>.
</p>
@endsection
