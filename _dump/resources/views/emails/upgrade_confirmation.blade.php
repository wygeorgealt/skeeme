@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    You're now<br><em style="font-style: italic;">Elite</em> 🚀
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Your upgrade is officially confirmed.</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ explode(' ', $name ?? $user->name ?? 'Student')[0] }}, welcome to the top tier! Your upgrade to the <strong style="color: #1a1a1a;">{{ $planName ?? 'Elite' }} Plan</strong> unlocks the full power of Skeeme AI.
</p>

<!-- Powers Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 24px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px;">New Powers Unlocked</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding: 8px 0; font-size: 14px; color: #374151;">✅ &nbsp;<strong>Infinite Power</strong> — No more credit limits on scans or quizzes</td></tr>
        <tr><td style="padding: 8px 0; font-size: 14px; color: #374151;">✅ &nbsp;<strong>Priority AI</strong> — Faster responses even during peak study hours</td></tr>
        <tr><td style="padding: 8px 0; font-size: 14px; color: #374151;">✅ &nbsp;<strong>Exclusive Features</strong> — Early access to new study tools</td></tr>
    </table>
</div>

<!-- Next Billing -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 16px 20px; margin: 0 0 32px; text-align: center;">
    <p style="font-size: 13px; color: #6b7280; margin: 0;">
        Next Billing Date: <strong style="color: #1a1a1a;">{{ $nextBillingDate ?? 'Next Month' }}</strong>
    </p>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Your support means the world to us. Go explore your new unlimited potential — you deserve it!
</p>
@endsection
