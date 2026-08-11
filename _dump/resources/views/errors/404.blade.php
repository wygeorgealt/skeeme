@extends('errors::minimal')

@section('title', __('Not Found'))
@section('code', '404')
@section('message', __('Page Not Found'))
@section('icon', 'magnifying-glass')

@section('description')
    Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
@endsection
