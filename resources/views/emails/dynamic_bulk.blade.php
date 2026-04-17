@extends('layouts.skeeme_email')

@if($template === 'announcement' || $template === 'survey')
@section('hero')
<h1 class="hero-title" style="font-size: 36px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0; line-height: 1.15;">
    {!! $headerText !!}
</h1>
@endsection
@endif

@section('content')

{{-- Standard: header inside content --}}
@if($template === 'standard')
<h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin: 0 0 24px; text-align: left;">{{ $headerText }}</h1>
@endif

{{-- Body content --}}
<div style="font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0;">
    {!! $bodyHtml !!}
</div>

{{-- CTA Button --}}
@if($ctaText && $ctaUrl)
<div style="text-align: center; margin: 32px 0 16px;">
    <a href="{{ $ctaUrl }}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">{{ $ctaText }}</a>
</div>
@endif

@endsection
