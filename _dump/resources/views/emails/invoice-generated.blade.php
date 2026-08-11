@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 8px; text-align: center;">New invoice generated</h1>
<p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 32px; line-height: 1.6;">
    A new invoice for your subscription is ready for review.
</p>

<!-- Invoice Card -->
<div class="card" style="background-color: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 28px; margin: 0 0 24px;">
    <p style="font-size: 11px; font-weight: 800; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 20px;">Invoice Details</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Invoice #</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $invoiceNumber }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">Due Date</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $dueDate }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #E5E7EB;">{{ $invoice->plan_name ?? 'Subscription Plan' }}</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #E5E7EB;">{{ $amount }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 0; color: #1a1a1a; font-weight: 700;">Total Due</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 800; font-size: 18px;">{{ $amount }}</td>
        </tr>
    </table>
</div>

<!-- CTA -->
<div style="text-align: center; margin: 0 0 32px;">
    <a href="{{ route('invoices.view', ['invoice' => $invoice->id]) }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">View Invoice</a>
</div>

<!-- Notice -->
<div class="card" style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 20px; margin: 0;">
    <p style="margin: 0; font-size: 13px; color: #92400E; line-height: 1.6;">
        Please arrange payment by the due date to avoid any service interruptions. You can pay directly from your dashboard.
    </p>
</div>
@endsection
