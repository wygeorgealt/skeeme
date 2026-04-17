@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Reset your password</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    Click the button below to create a new secure password for your Skeeme account.
</p>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Reset Password</a>
</div>

<!-- Expiry Notice -->
<div class="card" style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 20px; margin: 0 0 32px;">
    <p style="margin: 0; font-size: 13px; color: #92400E; line-height: 1.6;">
        <strong>Expires in 1 hour</strong> — If you didn't request this reset, no action is needed.
    </p>
</div>

<p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Can't click the button? Copy and paste this link:<br>
    <span style="word-break: break-all; color: #8B5CF6;">{{ $resetUrl }}</span>
</p>
@endsection
