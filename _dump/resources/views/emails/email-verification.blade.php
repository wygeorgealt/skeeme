@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Verify your email</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    One quick step to unlock your account.
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ $user->first_name }}, please verify your email address to complete your Skeeme account setup.
</p>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ $verificationUrl }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Verify Email Address</a>
</div>

<!-- Expiry Notice -->
<div class="card" style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
    <p style="margin: 0; font-size: 13px; color: #92400E; line-height: 1.6;">
        <strong>This link expires in 24 hours.</strong> If you didn't request this verification, you can safely ignore this email.
    </p>
</div>

<p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Can't click the button? Copy and paste this link:<br>
    <span style="word-break: break-all; color: #8B5CF6;">{{ $verificationUrl }}</span>
</p>
@endsection
