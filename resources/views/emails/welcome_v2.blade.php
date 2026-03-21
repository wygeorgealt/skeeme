@extends('layouts.email_master')

@section('content')
<div class="badge">Onboarding</div>
<h1>Welcome to the future of learning.</h1>
<p>
    Hi {{ $user->first_name ?? 'there' }},<br><br>
    We're thrilled to have you join Skeeme! You've just taken a massive step towards supercharging your academic journey with the most advanced AI study assistant in Nigeria.
</p>

<div class="glass-box">
    <h2 style="color: #8B5CF6;">Your AI advantage is here.</h2>
    <p style="font-size: 14px; margin-bottom: 0;">
        From generating personalized quizzes to solving complex scan assignments, Skeeme is designed to help you study smarter, not harder. Use your credits to unlock deep insights and master any topic.
    </p>
</div>

<p>Ready to see what you can achieve? Jump right into your dashboard and explore our premium features.</p>

<div style="margin-top: 40px;">
    <a href="{{ config('app.url') }}/dashboard" class="btn">Explore Dashboard</a>
</div>

<p style="margin-top: 48px; font-size: 14px; color: #94A3B8;">
    Need help getting started? Check out our <a href="{{ config('app.url') }}/guide" style="color: #6366F1; text-decoration: none;">Getting Started Guide</a> or reply to this email!
</p>
@endsection
