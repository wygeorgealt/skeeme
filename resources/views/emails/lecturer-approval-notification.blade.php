@extends('layouts.skeeme_email')

@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.15;">
    You're<br><em style="font-style: italic;">approved</em> ✓
</h1>
<p style="font-size: 15px; color: #6b7280; margin: 0; line-height: 1.6;">Welcome to the {{ $school->name }} network on Skeeme.</p>
@endsection

@section('content')
<p style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 32px;">
    Congratulations <strong style="color: #1a1a1a;">{{ $lecturer->first_name }}</strong>! Your account has been approved by {{ $adminName }}.
</p>

<!-- Status Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Account Status</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">School</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $school->name }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Access</td>
            <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Active</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Approved By</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ $adminName }}</td>
        </tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ $firstLoginUrl }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">Access Your Dashboard</a>
</div>

<!-- Next Steps -->
<p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0;">
    <strong style="color: #1a1a1a;">Next steps:</strong><br>
    • Update your profile information<br>
    • Explore your courses and assigned classes<br>
    • Review our documentation for AI features
</p>
@endsection
