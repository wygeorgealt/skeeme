@extends('layouts.skeeme_email')

@section('content')
@if($announcement->priority === 'urgent')
<div style="text-align: center; margin: 0 0 20px;">
    <span style="background-color: #FEE2E2; color: #991B1B; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Urgent</span>
</div>
@elseif($announcement->priority === 'high')
<div style="text-align: center; margin: 0 0 20px;">
    <span style="background-color: #FFEDD5; color: #9A3412; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">High Priority</span>
</div>
@endif

<h1 style="font-size: 26px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 24px; text-align: center;">{{ $announcement->title }}</h1>

<!-- Meta Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; padding: 16px 20px; margin: 0 0 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
            <td style="color: #6b7280; font-weight: 600;">From</td>
            <td style="text-align: right; color: #1a1a1a; font-weight: 600;">{{ $announcement->sender->first_name }} {{ $announcement->sender->last_name }}</td>
        </tr>
        <tr>
            <td style="color: #6b7280; font-weight: 600; padding-top: 8px;">Date</td>
            <td style="text-align: right; color: #1a1a1a; font-weight: 600; padding-top: 8px;">{{ $announcement->published_at->format('M d, Y') }}</td>
        </tr>
    </table>
</div>

<!-- Content -->
<div style="font-size: 15px; color: #374151; line-height: 1.8;">
    {!! nl2br(e($announcement->content)) !!}
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0;">
    <tr><td class="divider" style="border-top: 1px solid #E5E7EB;"></td></tr>
</table>

<p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 24px 0 0; text-align: center;">
    This announcement was broadcast from your school's learning management system.
</p>
@endsection
