@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    One quick<br><em style="font-style: italic;">question</em> for you
</h1>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 24px;">
    Hi {{ $user->first_name }},
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    We'd love to hear your thoughts about your experience with Skeeme. Your feedback helps us create a better platform for everyone.
</p>

<!-- Survey Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px;">{{ $surveyTitle }}</p>
    <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 16px;">{{ $surveyDescription }}</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td class="divider" style="border-top: 1px solid #E5E7EB;"></td></tr>
    </table>
    
    <p style="font-size: 12px; color: #9ca3af; margin: 12px 0 0;">⏱ {{ $estimatedTime }} to complete</p>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ $surveyUrl }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Take the Survey</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Your responses are completely confidential and will only be used to improve our platform.
</p>
@endsection
