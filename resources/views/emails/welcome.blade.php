@extends('layouts.app_email')

@section('hero-label', 'Welcome to the Future')
@section('hero-title', 'Welcome to Skeeme!')
@section('hero-subtitle', 'Your AI journey starts now')

@section('hero-icon')
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0c0914" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H18"></path>
    <path d="M12 3L12 15"></path>
    <path d="M12 15L9 12"></path>
    <path d="M12 15L15 12"></path>
</svg>
@endsection

@section('main-content')
<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:19px; font-weight:600; line-height:1.6; text-align:center; margin: 0 0 32px;">
	Hi {{ explode(' ', $name ?? $user->name ?? 'Student')[0] }}, welcome to the family! ❤️<br><br>
    We're so incredibly happy to have you with us. Think of Skeeme not just as an app, but as your personal study partner—we're here to support you every step of the way on your academic journey.
</p>

<div style="background-color: #0c0914; border-radius: 20px; padding: 40px 32px; margin-bottom: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
    <h3 style="color: #8B5CF6; font-family: 'Orbit', sans-serif; font-size: 16px; font-weight: 800; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1.5px; text-align: center;">We've Got Your Back</h3>
    <p style="color: #ffffff; font-family: 'Instrument Sans', sans-serif; opacity: 0.8; font-size: 15px; text-align: center; line-height: 1.8;">
        Whether you're prepping for a big exam or just trying to master a tough topic, our AI is ready to help you shine. We believe in you, and we can't wait to see what you'll achieve.
    </p>
</div>

<p style="color:#2c3239; font-family:'Instrument Sans', sans-serif; font-size:15px; font-weight:500; line-height:1.5; text-align:center; margin: 0; opacity: 0.7;">
	If you ever feel stuck or just want to say hi, simply reply to this email. You're part of the Skeeme family now!
</p>
@endsection
