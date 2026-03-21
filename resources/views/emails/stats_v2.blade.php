@extends('layouts.email_master')

@section('content')
<div class="badge">Growth Report</div>
<h1>Numbers don't lie. Your growth this week.</h1>
<p>
    Hi {{ $user->first_name ?? 'there' }},<br><br>
    You've been putting in the work! Here's a snapshot of your study activity on Skeeme over the past 7 days.
</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
    <tr>
        <td width="33.33%" align="center" style="padding: 20px; background-color: #F8FAFC; border-radius: 16px 0 0 16px;">
            <div style="font-size: 24px; font-weight: 800; color: #8B5CF6;">{{ $sessionsCount ?? 0 }}</div>
            <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Sessions</div>
        </td>
        <td width="33.33%" align="center" style="padding: 20px; background-color: #F1F5F9; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
            <div style="font-size: 24px; font-weight: 800; color: #6366F1;">{{ $creditsSpent ?? 0 }}</div>
            <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Credits Spent</div>
        </td>
        <td width="33.33%" align="center" style="padding: 20px; background-color: #F8FAFC; border-radius: 0 16px 16px 0;">
            <div style="font-size: 24px; font-weight: 800; color: #F59E0B;">{{ $streakCount ?? 0 }} 🔥</div>
            <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Day Streak</div>
        </td>
    </tr>
</table>

<div class="glass-box">
    <h2 style="color: #6366F1;">Keep the momentum going.</h2>
    <p style="font-size: 14px; margin-bottom: 0;">
        Consistent study habits are the shortcut to mastery. You've been most active on <strong>{{ $topActivity ?? 'Quiz assignments' }}</strong>. Keep pushing!
    </p>
</div>

<div style="margin-top: 40px; text-align: left;">
    <a href="{{ config('app.url') }}/dashboard" class="btn">View Full Analytics</a>
</div>
@endsection
