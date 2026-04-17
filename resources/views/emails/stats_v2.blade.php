@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    Your weekly<br><em style="font-style: italic;">growth</em> report
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Numbers don't lie.</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ $user->first_name ?? 'there' }}, you've been putting in the work! Here's a snapshot of your study activity over the past 7 days.
</p>

<!-- Stats Row -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px;">
    <tr>
        <td style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; text-align: center; width: 33%;">
            <div style="font-size: 24px; font-weight: 800; color: #8B5CF6;">{{ $sessionsCount ?? 0 }}</div>
            <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Sessions</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; text-align: center; width: 33%;">
            <div style="font-size: 24px; font-weight: 800; color: #8B5CF6;">{{ $creditsSpent ?? 0 }}</div>
            <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Credits Spent</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; text-align: center; width: 33%;">
            <div style="font-size: 24px; font-weight: 800; color: #F59E0B;">{{ $streakCount ?? 0 }} 🔥</div>
            <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Day Streak</div>
        </td>
    </tr>
</table>

<!-- Insight Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Keep the momentum going</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0;">
        Consistent study habits are the shortcut to mastery. You've been most active on <strong style="color: #1a1a1a;">{{ $topActivity ?? 'Quiz assignments' }}</strong>. Keep pushing!
    </p>
</div>

<!-- CTA -->
<div style="text-align: center;">
    <a href="{{ config('app.url') }}/dashboard" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">View Full Analytics</a>
</div>
@endsection
