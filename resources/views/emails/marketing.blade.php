@extends('layouts.skeeme_email')

@section('hero')
<p style="display: inline-block; background-color: rgba(139, 92, 246, 0.1); color: #8B5CF6; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 100px; margin: 0 0 16px;">🚀 Special Invitation</p>
<h1 class="hero-title" style="font-size: 32px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 12px; line-height: 1.15;">
    The AI your school<br><em style="font-style: italic;">deserves</em>
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Save 20+ hours weekly with automated attendance, AI-powered exams, and real-time analytics.</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 16px;">
    Dear <strong style="color: #1a1a1a;">{{ $contactName ?? 'Administrator' }}</strong>,
</p>
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 16px;">
    We're reaching out to <strong style="color: #1a1a1a;">{{ $schoolName ?? 'your institution' }}</strong> because we believe you deserve better tools to manage your school operations.
</p>
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Skeeme is Nigeria's most advanced education platform, trusted by forward-thinking schools.
</p>

<!-- Features -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 24px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px;">Platform Features</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #374151; line-height: 1.6; border-bottom: 1px solid #E5E7EB;">
                📊 &nbsp;<strong>Real-Time Analytics</strong> — Predictive insights to identify struggling students early
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #374151; line-height: 1.6; border-bottom: 1px solid #E5E7EB;">
                🤖 &nbsp;<strong>AI Exam Builder</strong> — Auto-generate questions, instant grading, and proctoring
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #374151; line-height: 1.6; border-bottom: 1px solid #E5E7EB;">
                ✅ &nbsp;<strong>Automated Attendance</strong> — Digital, location-verified tracking
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                🔒 &nbsp;<strong>Network Security</strong> — Restrict access to approved WiFi networks
            </td>
        </tr>
    </table>
</div>

<!-- Stats -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
    <tr>
        <td style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; text-align: center; width: 33%;">
            <div style="font-size: 28px; font-weight: 800; color: #8B5CF6; letter-spacing: -0.02em;">20+</div>
            <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Hours Saved</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; text-align: center; width: 33%;">
            <div style="font-size: 28px; font-weight: 800; color: #8B5CF6; letter-spacing: -0.02em;">5x</div>
            <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Faster Grading</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; text-align: center; width: 33%;">
            <div style="font-size: 28px; font-weight: 800; color: #8B5CF6; letter-spacing: -0.02em;">100%</div>
            <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Digital Records</div>
        </td>
    </tr>
</table>

<!-- CTA -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 32px; margin: 0 0 24px; text-align: center;">
    <h3 style="font-size: 20px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px;">Ready to transform your school?</h3>
    <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Start your free trial today. No credit card required.</p>
    <a href="https://skeeme.com/register" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; margin-right: 8px;">Get Started Free</a>
    <a href="https://skeeme.com/contact" style="display: inline-block; background-color: transparent; color: #1a1a1a; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; border: 2px solid #E5E7EB;">Book a Demo</a>
</div>

@if(!empty($customMessage))
<div class="card" style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 20px; margin: 0;">
    <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.6;">{{ $customMessage }}</p>
</div>
@endif
@endsection
