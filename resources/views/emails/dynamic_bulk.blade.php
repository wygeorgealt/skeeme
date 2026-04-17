@extends('layouts.skeeme_email')

@section('content')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 24px; text-align: left;">{{ $headerText }}</h1>

<div style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0;">
    {!! $bodyHtml !!}
</div>
@endsection
