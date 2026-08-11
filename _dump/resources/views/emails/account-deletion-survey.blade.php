@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    We hope to see you<br><em style="font-style: italic;">again someday</em> 💙
</h1>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 24px;">
    Hi {{ $firstName }},
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Your Skeeme account has been permanently deleted. We'll miss having you around, but we completely understand.
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Before you go, we'd love to know what could have made your experience better. Your feedback takes just 2 minutes and will help us improve Skeeme for all students.
</p>

<!-- Feedback Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px;">Quick Exit Feedback</p>
    <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 16px;">Tell us why you're leaving and how we can do better</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td class="divider" style="border-top: 1px solid #E5E7EB;"></td></tr>
    </table>
    
    <p style="font-size: 12px; color: #9ca3af; margin: 12px 0 0;">⏱ 2 minutes to complete</p>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="mailto:{{ $feedbackEmail }}?subject=Skeeme%20Account%20Deletion%20Feedback&body=Hi%20Skeeme%20Team,%0A%0AI%20recently%20deleted%20my%20account.%20Here's%20why%20I%20left:%0A%0A[Please%20tell%20us%20why%20you%20left%20and%20how%20we%20can%20improve]%0A%0AThank%20you!" style="display: inline-block; background-color: #8B5CF6; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Share Your Feedback</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px; text-align: center;">
    Your feedback is completely anonymous and confidential. We read every response and use it to make Skeeme better.
</p>

<div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin: 0 0 32px;">
    <p style="font-size: 13px; color: #78350F; line-height: 1.6; margin: 0;">
        <strong>Changed your mind?</strong> Your account deletion request has been processed, but you can always create a new account and pick up where you left off anytime.
    </p>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Best of luck with your studies. We hope our paths cross again soon! 🌟
</p>
@endsection
