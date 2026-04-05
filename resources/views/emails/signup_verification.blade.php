@extends('layouts.student_auth')

@section('content')
<h1 style="font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.02em; margin: 0 0 16px;">Verify your email</h1>

<p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
    We need to verify your email address 
    <span style="color: #2563eb; font-weight: 600;">{{ $email ?? '' }}</span> 
    before you can access your account. Enter the code below in your open browser window.
</p>

<!-- OTP Display -->
<div style="font-size: 42px; font-weight: 800; color: #111827; letter-spacing: 8px; margin: 0 0 40px; font-family: 'Outfit', sans-serif;">
    {{ $code }}
</div>

<hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 24px;">

<p style="font-size: 14px; color: #4b5563; margin: 0 0 12px; font-weight: 500;">
    This code expires in 10 minutes.
</p>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0;">
    If you didn't sign up for Skeeme, you can safely ignore this email. Someone else might have typed your email address by mistake.
</p>
@endsection
