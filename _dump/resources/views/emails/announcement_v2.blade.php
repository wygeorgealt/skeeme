@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    Fresh out of<br>the <em style="font-style: italic;">lab</em> ✨
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">New features are here.</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Hi {{ $user->first_name ?? 'there' }}, we've been busy building the tools you need. Here's what's new on Skeeme this week.
</p>

<!-- Feature 1 -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <td width="48" valign="top">
            <div style="width: 40px; height: 40px; background-color: #F5F3FF; border-radius: 12px; text-align: center; line-height: 40px; font-size: 18px;">✨</div>
        </td>
        <td valign="top" style="padding-left: 16px;">
            <p style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px;">Premium Flashcard UI</p>
            <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6;">Experience a totally redesigned study interface with glass effects and smooth 3D flips.</p>
        </td>
    </tr>
</table>

<!-- Feature 2 -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <td width="48" valign="top">
            <div style="width: 40px; height: 40px; background-color: #ECFDF5; border-radius: 12px; text-align: center; line-height: 40px; font-size: 18px;">📈</div>
        </td>
        <td valign="top" style="padding-left: 16px;">
            <p style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px;">Enhanced Weekly Analytics</p>
            <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6;">Track your study momentum with high-fidelity charts and automated session logs.</p>
        </td>
    </tr>
</table>

<!-- Feature 3 -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
    <tr>
        <td width="48" valign="top">
            <div style="width: 40px; height: 40px; background-color: #EFF6FF; border-radius: 12px; text-align: center; line-height: 40px; font-size: 18px;">🛡️</div>
        </td>
        <td valign="top" style="padding-left: 16px;">
            <p style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px;">Smart API Resilience</p>
            <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6;">Improved network handling so your study sessions are never interrupted.</p>
        </td>
    </tr>
</table>

<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    There's even more to discover! Open the app now and experience the upgrades.
</p>

<!-- CTA -->
<div style="text-align: center;">
    <a href="{{ config('app.url') }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Update App Now</a>
</div>
@endsection
