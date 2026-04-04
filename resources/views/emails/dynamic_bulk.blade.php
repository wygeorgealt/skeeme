@extends('layouts.student_auth')

@section('content')
<h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 16px;">{{ $headerText }}</h1>

<div style="font-size: 15px; color: #374151; line-height: 1.5; margin: 0 0 24px;">
    {!! $bodyHtml !!}
</div>

@endsection
