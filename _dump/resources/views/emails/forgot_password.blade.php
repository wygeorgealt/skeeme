@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Reset your password</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    We received a reset request for <span style="color: #1a1a1a; font-weight: 600;">{{ $email ?? '' }}</span>
</p>

<!-- OTP Code -->
<div class="code-box" style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px;">
    <div style="font-size: 40px; font-weight: 800; color: #1a1a1a; letter-spacing: 10px; font-family: 'Inter', monospace;">{{ $code }}</div>
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td class="divider" style="border-top: 1px solid #E5E7EB; padding: 0;"></td></tr>
</table>

<p style="font-size: 13px; color: #6b7280; margin: 24px 0 8px; font-weight: 600;">This code expires in 10 minutes.</p>

<p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0;">
    If you didn't request a password reset for Skeeme, you can safely ignore this email. Someone else might have typed your email address by mistake.
</p>
@endsection
