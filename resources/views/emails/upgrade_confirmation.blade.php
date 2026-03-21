@extends('layouts.app_email')

@section('hero-label', 'Subscription Upgrade Confirmed')
@section('hero-title', 'You\'re Now an Elite Skeemer! 🚀')

@section('hero-icon')
    <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
    </div>
@endsection

@section('main-content')
<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:19px; font-weight:600; line-height:1.6; text-align:center; margin: 0 0 32px;">
	Hi {{ explode(' ', $name ?? $user->name ?? 'Student')[0] }}, welcome to the top tier! ❤️<br><br>
    Your upgrade to the <strong>{{ $planName ?? 'Elite' }} Plan</strong> is officially confirmed. You've just unlocked the full power of Skeeme AI to dominate your studies.
</p>

<div style="background-color: #0c0914; border-radius: 20px; padding: 40px 32px; margin-bottom: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
    <h3 style="color: #8B5CF6; font-family: 'Orbit', sans-serif; font-size: 16px; font-weight: 800; margin: 0 0 24px; text-transform: uppercase; letter-spacing: 1.5px; text-align: center;">New Powers Unlocked</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding-bottom: 16px;">
                <p style="color: #ffffff; font-family: 'Instrument Sans', sans-serif; font-size: 15px; text-align: left; line-height: 1.6;">
                    ✅ <strong>Infinite Power</strong>: No more credit limits on scans or quizzes.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 16px;">
                <p style="color: #ffffff; font-family: 'Instrument Sans', sans-serif; font-size: 15px; text-align: left; line-height: 1.6;">
                    ✅ <strong>Priority AI</strong>: Faster responses even during peak study hours.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <p style="color: #ffffff; font-family: 'Instrument Sans', sans-serif; font-size: 15px; text-align: left; line-height: 1.6;">
                    ✅ <strong>Exclusive Features</strong>: Early access to new study tools.
                </p>
            </td>
        </tr>
    </table>
</div>

<div style="background-color: rgba(139, 92, 246, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 40px; border: 1px dashed #8B5CF6;">
    <p style="color: #ffffff; font-family: 'Instrument Sans', sans-serif; font-size: 14px; text-align: center; margin: 0;">
        Next Billing Date: <strong>{{ $nextBillingDate ?? 'Next Month' }}</strong>
    </p>
</div>

<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:15px; font-weight:500; line-height:1.5; text-align:center; margin: 0; opacity: 0.7;">
	Your support means the world to us. Go ahead and start exploring your new unlimited potential—you deserve it!
</p>
@endsection
