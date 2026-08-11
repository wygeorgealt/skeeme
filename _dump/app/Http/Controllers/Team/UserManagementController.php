<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by flags
        if ($request->filled('flag')) {
            match ($request->flag) {
                'flagged' => $query->where('is_flagged', true),
                'banned' => $query->where('is_banned', true),
                'vip' => $query->where('is_vip', true),
                'beta' => $query->where('is_beta_tester', true),
                default => null,
            };
        }

        $users = $query->paginate(50);

        return view('team.users.index', ['users' => $users]);
    }

    public function show(User $user)
    {
        $user->load('school', 'individualSubscription');
        return view('team.users.show', ['user' => $user]);
    }

    public function ban(User $user, Request $request)
    {
        $request->validate(['reason' => 'required|string']);

        $user->update([
            'is_banned' => true,
            'ban_reason' => $request->reason,
        ]);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.ban',
            'User',
            $user->id,
            ['reason' => $request->reason]
        );

        return redirect()->back()->with('success', 'User banned successfully.');
    }

    public function unban(User $user)
    {
        $user->update(['is_banned' => false, 'ban_reason' => null]);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.unban',
            'User',
            $user->id
        );

        return redirect()->back()->with('success', 'User unbanned successfully.');
    }

    public function flag(User $user, Request $request)
    {
        $request->validate(['reason' => 'required|string']);

        $user->update([
            'is_flagged' => true,
            'flag_reason' => $request->reason,
        ]);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.flag',
            'User',
            $user->id,
            ['reason' => $request->reason]
        );

        return redirect()->back()->with('success', 'User flagged successfully.');
    }

    public function unflag(User $user)
    {
        $user->update(['is_flagged' => false, 'flag_reason' => null]);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.unflag',
            'User',
            $user->id
        );

        return redirect()->back()->with('success', 'User flag removed.');
    }

    public function toggleVip(User $user)
    {
        $isVip = !$user->is_vip;
        $user->update(['is_vip' => $isVip]);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.vip_toggle',
            'User',
            $user->id,
            ['is_vip' => $isVip]
        );

        return redirect()->back()->with('success', 'VIP status updated.');
    }

    public function bulkBan(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'reason' => 'required|string',
        ]);

        User::whereIn('id', $request->user_ids)->update([
            'is_banned' => true,
            'ban_reason' => $request->reason,
        ]);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.bulk_ban',
            'User',
            null,
            ['count' => count($request->user_ids), 'reason' => $request->reason]
        );

        return redirect()->back()->with('success', count($request->user_ids) . ' users banned.');
    }

    public function export(User $user)
    {
        // TODO: Export user data (GDPR compliance)
        return response()->download('user-data-' . $user->id . '.json');
    }

    public function impersonate(User $user)
    {
        session(['impersonating_user_id' => auth()->id()]);
        auth()->loginUsingId($user->id);

        AdminAuditLog::log(
            auth()->user()->teamMember,
            'user.impersonate_start',
            'User',
            $user->id
        );

        return redirect()->route('dashboard')->with('warning', 'You are impersonating ' . $user->name);
    }

    public function exitImpersonate()
    {
        $originalUserId = session('impersonating_user_id');
        
        if ($originalUserId) {
            auth()->loginUsingId($originalUserId);
            session()->forget('impersonating_user_id');
            
            return redirect()->route('team.users.index')->with('success', 'Impersonation ended.');
        }

        return redirect()->back();
    }
}
