@extends('layouts.student_auth')

@section('content')
<h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 16px;">Verify your email</h1>

<p style="font-size: 15px; color: #374151; line-height: 1.5; margin: 0 0 24px;">
    We need to verify your email address 
    <a href="mailto:{{ $email ?? '' }}" style="color: #2563eb; text-decoration: none;">{{ $email ?? '' }}</a> 
    before you can access your account. Enter the code below in your open browser window.
</p>

<!-- OTP Display -->
<div style="font-size: 36px; font-weight: 800; color: #111827; letter-spacing: 6px; margin: 0 0 32px;">
    {{ $code }}
</div>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;">

<p style="font-size: 13px; color: #4b5563; margin: 0 0 16px;">
    This code expires in 10 minutes.
</p>

<p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0;">
    If you didn't sign up for Skeeme, you can safely ignore this email. Someone else might have typed your email address by mistake.
</p>
@endsection
