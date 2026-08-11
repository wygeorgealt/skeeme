@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    Welcome<br><em style="font-style: italic;">aboard</em> 👋
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Get ready to transform education at {{ $schoolName }}</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ $user->first_name }}, your admin account has been created. We're excited to have you on board!
</p>

<!-- Next Steps Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px;">Your next steps</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                ✓ &nbsp;Complete your email verification
            </td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                ✓ &nbsp;Set up your school configuration (calendar, timezone, theme)
            </td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                ✓ &nbsp;Choose your subscription plan
            </td>
        </tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ route('onboarding.admin') }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Complete Your Setup</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Need help? Our support team is here for you. Simply reply to this email.
</p>
@endsection
