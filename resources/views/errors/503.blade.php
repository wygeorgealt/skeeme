@extends('errors::minimal')

@section('title', __('Service Unavailable'))
@section('code', '503')
@section('message', __('Maintenance Mode'))
@section('icon', 'wrench-screwdriver')

@section('description')
    We are currently performing scheduled maintenance. We'll be back shortly.
@endsection
