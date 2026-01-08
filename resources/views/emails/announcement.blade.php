@extends('layouts.email')

@section('content')
    <div style="text-align: center; margin-bottom: 24px;">
        @if($announcement->priority === 'urgent')
            <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Urgent Priority</span>
        @elseif($announcement->priority === 'high')
            <span style="background-color: #ffedd5; color: #9a3412; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">High Priority</span>
        @endif
    </div>

    <h1>{{ $announcement->title }}</h1>

    <div style="background: #27272a; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #3f3f46;">
        <table style="width: 100%; font-size: 13px; color: #a1a1aa;">
            <tr>
                <td><strong>From:</strong></td>
                <td style="text-align: right; color: #ffffff;">{{ $announcement->sender->first_name }} {{ $announcement->sender->last_name }}</td>
            </tr>
            <tr>
                <td><strong>Date:</strong></td>
                <td style="text-align: right; color: #ffffff;">{{ $announcement->published_at->format('M d, Y') }}</td>
            </tr>
        </table>
    </div>

    <div style="font-size: 16px; color: #fafafa; line-height: 1.8;">
        {!! nl2br(e($announcement->content)) !!}
    </div>

    <div class="hr"></div>

    <p style="text-align: center; font-size: 13px; color: #71717a;">
        This announcement was broadcast from your school's secure learning management system.
    </p>
@endsection
