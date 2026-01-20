@extends('layouts.email')

@section('content')
<div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-bottom: 8px;">New Support Inquiry</h1>
    <p style="color: #a1a1aa; font-size: 14px;">A user has submitted a request via the Skeeme contact form.</p>
</div>

<div style="background: linear-gradient(145deg, #1e1e2d, #16161f); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
    <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <p style="margin: 0 0 12px 0; color: #6366f1; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">Sender Details</p>
        <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800;">{{ $data['name'] }}</p>
        <p style="margin: 4px 0 0 0; color: #71717a; font-size: 14px;">{{ $data['email'] }}</p>
    </div>

    <div>
        <p style="margin: 0 0 12px 0; color: #6366f1; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">Subject</p>
        <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; line-height: 1.6;">{{ $data['subject'] }}</p>
    </div>
</div>

<p style="color: #a1a1aa; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; margin-bottom: 16px;">Message Body</p>
<div style="background-color: rgba(0,0,0,0.2); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.03); color: #d4d4d8; line-height: 1.8; font-size: 15px;">
    {!! nl2br(e($data['message'])) !!}
</div>

<div class="button-container" style="margin-top: 40px; text-align: center;">
    <a href="mailto:{{ $data['email'] }}" class="button" style="background: #6366f1; color: #ffffff; padding: 16px 32px; border-radius: 16px; font-weight: 900; text-decoration: none; font-size: 14px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);">Reply to User</a>
</div>
@endsection
