<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class ErrorTrackingController extends Controller
{
    public function index(Request $request)
    {
        $query = ErrorLog::with(['user', 'school']);

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('error_message', 'like', "%{$search}%")
                  ->orWhere('error_class', 'like', "%{$search}%");
            });
        }

        if ($request->filled('resolved')) {
            $query->where('is_resolved', $request->resolved == 'yes');
        }

        $errors = $query->latest('created_at')->paginate(50);
        $criticalCount = ErrorLog::where('severity', 'critical')->where('is_resolved', false)->count();
        $unresolvedCount = ErrorLog::where('is_resolved', false)->count();

        return view('team.errors.index', compact('errors', 'criticalCount', 'unresolvedCount'));
    }

    public function show(ErrorLog $error)
    {
        return view('team.errors.show', compact('error'));
    }

    public function resolve(Request $request, ErrorLog $error)
    {
        $error->update([
            'is_resolved' => true,
            'resolution_notes' => $request->resolution_notes,
            'resolved_at' => now(),
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'error.resolved',
            'ErrorLog',
            $error->id,
            ['status' => 'resolved']
        );

        return redirect()->route('team.errors.show', $error)->with('success', 'Error marked as resolved');
    }

    public function assign(Request $request, ErrorLog $error)
    {
        $request->validate([
            'assigned_to' => 'required|exists:team_members,id',
        ]);

        $error->update(['assigned_to' => $request->assigned_to]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'error.assigned',
            'ErrorLog',
            $error->id,
            ['assigned_to' => $request->assigned_to]
        );

        return redirect()->route('team.errors.show', $error)->with('success', 'Error assigned');
    }

    public function exportData()
    {
        $errors = ErrorLog::all();
        return response()->download(
            storage_path('exports/errors.csv'),
            'errors-' . now()->format('Y-m-d') . '.csv'
        );
    }
}
