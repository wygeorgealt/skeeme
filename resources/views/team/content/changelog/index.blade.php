@extends('team.layout')

@section('team-content')
<div class="admin-page">
    <div class="page-header">
        <h1>Changelog</h1>
        <p class="page-subtitle">Manage system changelog entries</p>
    </div>
    <div class="content-section">
        <p>Feature under construction - Full functionality coming soon</p>
        <a href="{{ route('team.dashboard') }}" class="btn btn-secondary">Back to Dashboard</a>
    </div>
</div>

<style>
    .admin-page { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }
    .content-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 30px; }
    .content-section p { color: #cbd5e1; margin-bottom: 20px; }
    .btn { padding: 8px 12px; border-radius: 6px; border: 1px solid #334155; cursor: pointer; font-size: 12px; text-decoration: none; display: inline-block; }
    .btn-secondary { background: #475569; color: white; }
</style>
@endsection
