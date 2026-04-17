@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 24px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.02em; margin: 0 0 8px; text-align: center;">New Support Inquiry</h1>
<p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 32px;">A user submitted a request via the Skeeme contact form.</p>

<!-- Sender Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px;">Sender Details</p>
    <p style="margin: 0; color: #1a1a1a; font-size: 17px; font-weight: 700;">{{ $data['name'] }}</p>
    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">{{ $data['email'] }}</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
        <tr><td class="divider" style="border-top: 1px solid #E5E7EB;"></td></tr>
    </table>

    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 20px 0 8px;">Subject</p>
    <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600; line-height: 1.6;">{{ $data['subject'] }}</p>
</div>

<!-- Message Body -->
<p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px;">Message</p>
<div style="background-color: #F9FAFB; padding: 24px; border-radius: 12px; border: 1px solid #F3F4F6; color: #374151; line-height: 1.8; font-size: 14px; margin: 0 0 32px;">
    {!! nl2br(e($data['message'])) !!}
</div>

<!-- CTA -->
<div style="text-align: center;">
    <a href="mailto:{{ $data['email'] }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Reply to User</a>
</div>
@endsection
