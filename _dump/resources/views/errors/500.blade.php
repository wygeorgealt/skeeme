@extends('errors::minimal')

@section('title', __('Server Error'))
@section('code', '500')
@section('message', __('Server Error'))
@section('icon', 'server')

@section('description')
    Whoops, something went wrong on our servers. We are already working to fix it.
@endsection
