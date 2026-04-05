@extends('layouts.student_auth')

@section('content')
<h1 style="font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.02em; margin: 0 0 16px;">{{ $headerText }}</h1>

<div style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
    {!! $bodyHtml !!}
</div>
@endsection
