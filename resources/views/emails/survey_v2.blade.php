@extends('layouts.email_master')

@section('content')
<div class="badge">Feedback</div>
<h1>Help us build the ultimate learning assistant.</h1>
<p>
    Hi {{ $user->first_name ?? 'there' }},<br><br>
    At Skeeme, we're obsessed with your success. We want to know how we can make our platform even better for your study sessions.
</p>

<div class="glass-box">
    <h2 style="color: #8B5CF6;">Got 2 minutes?</h2>
    <p style="font-size: 14px; margin-bottom: 20px;">
        Your feedback directly shapes the future of Skeeme. Tap below to share your thoughts on the new AI assistant.
    </p>
    <a href="{{ $surveyUrl ?? '#' }}" class="btn" style="background: #1e293b;">Take the Survey</a>
</div>

<p>Thank you for being a part of our community and for helping us redefine education in Nigeria.</p>

<p style="margin-top: 48px; font-size: 14px; color: #94A3B8;">
    Can't click the button? Copy this link: <br>
    <a href="{{ $surveyUrl ?? '#' }}" style="color: #6366F1; font-size: 12px;">{{ $surveyUrl ?? 'https://skeeme.ng/survey' }}</a>
</p>
@endsection
