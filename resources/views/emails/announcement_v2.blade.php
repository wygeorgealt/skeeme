@extends('layouts.email_master')

@section('content')
<div class="badge">Product Update</div>
<h1>Fresh out of the lab. New features are here.</h1>
<p>
    Hi {{ $user->first_name ?? 'there' }},<br><br>
    We've been busy building the tools you need to stay ahead. Here's what's new on Skeeme this week.
</p>

<div style="margin: 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
        <tr>
            <td width="56" valign="top">
                <div style="width: 40px; height: 40px; background-color: #F5F3FF; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">✨</div>
            </td>
            <td valign="top" style="padding-left: 16px;">
                <h3 style="font-size: 16px; font-weight: 800; color: #1E293B; margin-bottom: 4px;">Premium Flashcard UI</h3>
                <p style="font-size: 14px; color: #64748B; margin-bottom: 0;">Experience a totally redesigned study interface with glass effects and smooth 3D flips.</p>
            </td>
        </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
        <tr>
            <td width="56" valign="top">
                <div style="width: 40px; height: 40px; background-color: #ECFDF5; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">📈</div>
            </td>
            <td valign="top" style="padding-left: 16px;">
                <h3 style="font-size: 16px; font-weight: 800; color: #1E293B; margin-bottom: 4px;">Enhanced Weekly Analytics</h3>
                <p style="font-size: 14px; color: #64748B; margin-bottom: 0;">Track your study momentum with high-fidelity charts and automated session logs.</p>
            </td>
        </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td width="56" valign="top">
                <div style="width: 40px; height: 40px; background-color: #EFF6FF; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">🛡️</div>
            </td>
            <td valign="top" style="padding-left: 16px;">
                <h3 style="font-size: 16px; font-weight: 800; color: #1E293B; margin-bottom: 4px;">Smart API Resilience</h3>
                <p style="font-size: 14px; color: #64748B; margin-bottom: 0;">We've improved our network handling to ensure your study sessions are never interrupted.</p>
            </td>
        </tr>
    </table>
</div>

<p>There's even more to discover! Open the app now and experience the upgrades.</p>

<div style="margin-top: 40px;">
    <a href="{{ config('app.url') }}" class="btn">Update App Now</a>
</div>
@endsection
