@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    One quick<br><em style="font-style: italic;">question</em> for you
</h1>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ $user->first_name ?? 'there' }}, at Skeeme, we're obsessed with your success. We want to know how we can make our platform even better for your study sessions.
</p>

<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px; text-align: center;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Got 2 minutes?</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0 0 24px;">
        Your feedback directly shapes the future of Skeeme. Tap below to share your thoughts.
    </p>
    <a href="{{ $surveyUrl ?? '#' }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Take the Survey</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Thank you for being part of our community.
</p>
@endsection
