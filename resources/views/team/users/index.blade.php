@extends('team.layout')

@section('team-content')
<div class="admin-page">
    <!-- Header -->
    <div class="page-header">
        <div>
            <h1><i class="fas fa-users-cog"></i> User Management</h1>
            <p class="page-subtitle">View, manage, and control all user accounts</p>
        </div>
    </div>

    <!-- Search & Filters -->
    <div class="filters-section">
        <form method="GET" action="{{ route('team.users.index') }}" class="filter-form">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" name="search" placeholder="Search by name or email..." value="{{ request('search') }}">
            </div>

            <select name="status" class="filter-select">
                <option value="">All Statuses</option>
                <option value="active" @selected(request('status') === 'active')>Active</option>
                <option value="inactive" @selected(request('status') === 'inactive')>Inactive</option>
                <option value="suspended" @selected(request('status') === 'suspended')>Suspended</option>
            </select>

            <select name="role" class="filter-select">
                <option value="">All Roles</option>
                <option value="admin" @selected(request('role') === 'admin')>Admin</option>
                <option value="lecturer" @selected(request('role') === 'lecturer')>Lecturer</option>
                <option value="student" @selected(request('role') === 'student')>Student</option>
            </select>

            <select name="flag" class="filter-select">
                <option value="">All Users</option>
                <option value="vip" @selected(request('flag') === 'vip')>VIP</option>
                <option value="flagged" @selected(request('flag') === 'flagged')>Flagged</option>
                <option value="banned" @selected(request('flag') === 'banned')>Banned</option>
                <option value="beta" @selected(request('flag') === 'beta')>Beta Tester</option>
            </select>

            <button type="submit" class="btn btn-primary">Filter</button>
            <a href="{{ route('team.users.index') }}" class="btn btn-secondary">Clear</a>
        </form>
    </div>

    <!-- Users Table -->
    <div class="table-section">
        <div class="table-header">
            <h2>Users ({{ $users->total() }})</h2>
        </div>

        <div class="table-wrapper">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Flags</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($users as $user)
                        <tr>
                            <td>
                                <div class="user-info">
                                    <div class="user-avatar">{{ strtoupper(substr($user->name, 0, 1)) }}</div>
                                    <div>
                                        <strong>{{ $user->name }}</strong>
                                        <div class="text-muted">{{ $user->school?->name ?? 'No School' }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{{ $user->email }}</td>
                            <td><span class="badge badge-info">{{ ucfirst($user->role) }}</span></td>
                            <td>
                                <span class="badge @if($user->status === 'active') badge-success @else badge-danger @endif">
                                    {{ ucfirst($user->status) }}
                                </span>
                            </td>
                            <td>
                                <div class="flags">
                                    @if($user->is_vip)
                                        <span class="flag-badge vip" title="VIP User"><i class="fas fa-crown"></i></span>
                                    @endif
                                    @if($user->is_flagged)
                                        <span class="flag-badge flagged" title="Flagged"><i class="fas fa-flag"></i></span>
                                    @endif
                                    @if($user->is_banned)
                                        <span class="flag-badge banned" title="Banned"><i class="fas fa-ban"></i></span>
                                    @endif
                                    @if($user->is_beta_tester)
                                        <span class="flag-badge beta" title="Beta Tester"><i class="fas fa-flask"></i></span>
                                    @endif
                                </div>
                            </td>
                            <td>{{ $user->created_at->format('M d, Y') }}</td>
                            <td>
                                <div class="action-buttons">
                                    <a href="{{ route('team.users.show', $user) }}" class="btn btn-xs btn-primary" title="View Details">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <button class="btn btn-xs btn-warning reset-password-btn" data-user-id="{{ $user->id }}" title="Reset Password">
                                        <i class="fas fa-key"></i>
                                    </button>
                                    @if(!$user->is_banned)
                                        <form method="POST" action="{{ route('team.users.ban', $user) }}" style="display:inline;" onsubmit="return confirm('Ban this user?');">
                                            @csrf
                                            <button type="submit" class="btn btn-xs btn-danger" title="Ban User">
                                                <i class="fas fa-ban"></i>
                                            </button>
                                        </form>
                                    @else
                                        <form method="POST" action="{{ route('team.users.unban', $user) }}" style="display:inline;">
                                            @csrf
                                            <button type="submit" class="btn btn-xs btn-success" title="Unban User">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center empty-state">
                                <i class="fas fa-users-slash"></i> No users found
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper">
            {{ $users->links() }}
        </div>
    </div>
</div>

<!-- Reset Password Modal -->
<div id="resetPasswordModal" class="modal hidden">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Reset User Password</h2>
            <button class="modal-close" type="button" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form id="resetPasswordForm" method="POST" onsubmit="handleResetPassword(event)">
            @csrf
            <div style="padding: 20px;">
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" name="password" class="form-control" required minlength="8">
                    <small style="color: #94a3b8;">Minimum 8 characters</small>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="password_confirmation" class="form-control" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Reset Password</button>
            </div>
        </form>
    </div>
</div>

<style>
    .admin-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
    }

    .page-header {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #334155;
    }

    .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .page-header h1 i {
        color: #60a5fa;
    }

    .page-subtitle {
        margin: 8px 0 0;
        color: #cbd5e1;
        font-size: 14px;
    }

    /* Filters Section */
    .filters-section {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .filter-form {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
    }

    .search-box {
        flex: 1;
        min-width: 250px;
        position: relative;
        display: flex;
        align-items: center;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 0 12px;
    }

    .search-box i {
        color: #60a5fa;
        margin-right: 8px;
    }

    .search-box input {
        flex: 1;
        background: none;
        border: none;
        color: #f1f5f9;
        padding: 10px 0;
        outline: none;
        font-size: 13px;
    }

    .search-box input::placeholder {
        color: #94a3b8;
    }

    .filter-select {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid #334155;
        color: #f1f5f9;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 13px;
        min-width: 140px;
        cursor: pointer;
    }

    .filter-select option {
        background: #1e293b;
        color: #f1f5f9;
    }

    /* Table Section */
    .table-section {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .table-header {
        padding: 20px;
        border-bottom: 1px solid #334155;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
    }

    .table-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #f1f5f9;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    .users-table {
        width: 100%;
        border-collapse: collapse;
    }

    .users-table thead {
        background: rgba(59, 130, 246, 0.1);
    }

    .users-table th {
        padding: 15px 20px;
        text-align: left;
        font-weight: 600;
        color: #60a5fa;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .users-table td {
        padding: 15px 20px;
        border-bottom: 1px solid #334155;
        color: #cbd5e1;
    }

    .users-table tbody tr:hover {
        background: rgba(59, 130, 246, 0.05);
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        flex-shrink: 0;
        font-size: 14px;
    }

    .text-muted {
        font-size: 12px;
        color: #94a3b8;
        margin-top: 3px;
    }

    .flags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .flag-badge {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .flag-badge.vip {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
    }

    .flag-badge.flagged {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
    }

    .flag-badge.banned {
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
    }

    .flag-badge.beta {
        background: rgba(34, 197, 94, 0.2);
        color: #86efac;
    }

    .action-buttons {
        display: flex;
        gap: 6px;
    }

    .btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #334155;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }

    .btn-xs {
        padding: 6px 8px;
        font-size: 11px;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }

    .btn-primary:hover {
        background: #2563eb;
        border-color: #2563eb;
    }

    .btn-secondary {
        background: #475569;
        color: white;
        border-color: #475569;
    }

    .btn-secondary:hover {
        background: #334155;
        border-color: #334155;
    }

    .btn-warning {
        background: rgba(234, 179, 8, 0.2);
        color: #facc15;
        border-color: #facc15;
    }

    .btn-warning:hover {
        background: rgba(234, 179, 8, 0.3);
    }

    .btn-danger {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border-color: #fca5a5;
    }

    .btn-danger:hover {
        background: rgba(239, 68, 68, 0.3);
    }

    .btn-success {
        background: rgba(34, 197, 94, 0.2);
        color: #86efac;
        border-color: #86efac;
    }

    .btn-success:hover {
        background: rgba(34, 197, 94, 0.3);
    }

    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
    }

    .badge-info {
        background: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
    }

    .badge-success {
        background: rgba(34, 197, 94, 0.2);
        color: #86efac;
    }

    .badge-danger {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
    }

    .empty-state {
        padding: 40px 20px;
        color: #94a3b8;
        font-size: 16px;
    }

    .empty-state i {
        font-size: 32px;
        display: block;
        margin-bottom: 10px;
    }

    .pagination-wrapper {
        padding: 20px;
        border-top: 1px solid #334155;
        display: flex;
        justify-content: center;
    }

    /* Modal */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }

    .modal.hidden {
        display: none !important;
    }

    .modal.show {
        display: flex;
    }

    .modal-content {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #334155;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #f1f5f9;
    }

    .modal-close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        transition: color 0.2s;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-close:hover {
        color: #f1f5f9;
    }

    .form-group {
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        color: #cbd5e1;
        font-size: 13px;
        font-weight: 500;
    }

    .form-group small {
        display: block;
        margin-top: 4px;
    }

    .form-control {
        width: 100%;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid #334155;
        color: #f1f5f9;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 13px;
        box-sizing: border-box;
    }

    .form-control:focus {
        outline: none;
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.15);
    }

    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 20px;
        border-top: 1px solid #334155;
        background: rgba(59, 130, 246, 0.05);
    }

    .hidden {
        display: none !important;
    }

    @media (max-width: 768px) {
        .filter-form {
            flex-direction: column;
        }

        .search-box,
        .filter-select,
        .btn {
            width: 100%;
        }

        .users-table {
            font-size: 12px;
        }

        .users-table th,
        .users-table td {
            padding: 10px 12px;
        }

        .action-buttons {
            flex-wrap: wrap;
        }
    }
</style>

<script>
    function openResetPassword(userId) {
        const form = document.getElementById('resetPasswordForm');
        form.action = `/work/users/${userId}/reset-password`;
        form.reset();
        document.getElementById('resetPasswordModal').classList.remove('hidden');
        document.getElementById('resetPasswordModal').classList.add('show');
    }

    function closeModal() {
        document.getElementById('resetPasswordModal').classList.add('hidden');
        document.getElementById('resetPasswordModal').classList.remove('show');
    }

    function handleResetPassword(event) {
        event.preventDefault();
        if (confirm('Reset password for this user?')) {
            event.target.submit();
        }
    }

    document.querySelectorAll('.reset-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openResetPassword(btn.dataset.userId);
        });
    });

    document.getElementById('resetPasswordModal').addEventListener('click', (e) => {
        if (e.target.id === 'resetPasswordModal') closeModal();
    });
</script>
@endsection
