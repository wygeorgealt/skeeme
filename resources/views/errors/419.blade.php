@extends('errors::minimal')

@section('title', __('Page Expired'))
@section('code', '419')
@section('message', __('Page Expired'))
@section('icon', 'clock')

@section('description')
    Your session has expired due to inactivity. Please refresh the page and try again.
@endsection
