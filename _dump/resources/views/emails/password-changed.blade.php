@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">Security Notice</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    Your password was successfully changed.
</p>

<!-- Details Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 32px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Activity Details</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Account</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $user->email }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Status</td>
            <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Changed Successfully</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280;">Time</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">{{ now()->format('M d, Y \a\t H:i A') }}</td>
        </tr>
    </table>
</div>

<!-- Warning -->
<div class="card" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
    <p style="margin: 0; font-size: 13px; color: #991B1B; line-height: 1.6;">
        <strong>Didn't make this change?</strong><br>
        If you did not authorize this change, please contact our security team immediately to lock your account.
    </p>
</div>

<p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0; text-align: center;">
    Your security is our priority. If you recognise this activity, no further action is required.
</p>
@endsection
