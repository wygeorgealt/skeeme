@extends('errors::minimal')

@section('title', __('Unauthorized'))
@section('code', '403')
@section('message', __('Access Denied'))
@section('icon', 'lock-closed')

@section('description')
    Sorry, you are not authorized to access this page. Please contact support if you believe this is an error.
@endsection
