@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    Welcome to<br><em style="font-style: italic;">Skeeme</em> 🎉
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Your AI study partner is ready.</p>
@endsection

@section('content')
<p style="font-size: 16px; color: #1a1a1a; line-height: 1.7; margin: 0 0 24px; font-weight: 500;">
    Hi {{ explode(' ', $name ?? $user->name ?? 'Student')[0] }},
</p>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    We're so happy to have you with us. Think of Skeeme not just as an app, but as your personal study partner — we're here to support you every step of the way on your academic journey.
</p>

<!-- Feature Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px;">What you can do</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                📸 &nbsp;<strong>Scan</strong> your notes and get AI-powered explanations
            </td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                📝 &nbsp;<strong>Generate</strong> quizzes and flashcards from any material
            </td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                🤖 &nbsp;<strong>Chat</strong> with your AI tutor about any topic
            </td>
        </tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="https://skeeme.com" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Open Skeeme</a>
</div>

<p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    If you ever feel stuck or just want to say hi, simply reply to this email. You're part of the Skeeme family now.
</p>
@endsection
