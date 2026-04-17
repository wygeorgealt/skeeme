@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    Welcome to the future<br>of <em style="font-style: italic;">learning</em>
</h1>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 24px;">
    Hi {{ $user->first_name ?? 'there' }},
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    We're thrilled to have you join Skeeme! You've just taken a massive step towards supercharging your academic journey with the most advanced AI study assistant.
</p>

<!-- Feature Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px;">Your AI advantage is here</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0;">
        From generating personalised quizzes to solving complex assignments, Skeeme is designed to help you study smarter, not harder. Use your credits to unlock deep insights and master any topic.
    </p>
</div>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Ready to see what you can achieve? Jump right into your dashboard.
</p>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ config('app.url') }}/dashboard" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Explore Dashboard</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Need help getting started? Check out our <a href="{{ config('app.url') }}/guide" style="color: #8B5CF6; font-weight: 600;">Getting Started Guide</a> or simply reply to this email.
</p>
@endsection
