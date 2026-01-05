<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketResponse;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'assignedTo']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tickets = $query->latest('created_at')->paginate(50);
        $openCount = SupportTicket::where('status', 'open')->count();
        $criticalCount = SupportTicket::where('priority', 'critical')->where('status', '!=', 'closed')->count();

        return view('team.support.index', compact('tickets', 'openCount', 'criticalCount'));
    }

    public function show(SupportTicket $ticket)
    {
        $ticket->load(['user', 'assignedTo', 'responses.teamMember']);
        return view('team.support.show', compact('ticket'));
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'response' => 'required|string|min:10',
            'is_internal' => 'boolean',
        ]);

        TicketResponse::create([
            'ticket_id' => $ticket->id,
            'team_member_id' => $request->user()->teamMember->id,
            'response' => $request->response,
            'is_internal' => $request->boolean('is_internal'),
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'ticket.reply',
            'SupportTicket',
            $ticket->id,
            ['is_internal' => $request->boolean('is_internal')]
        );

        return redirect()->route('team.support.show', $ticket)->with('success', 'Reply added');
    }

    public function resolve(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'resolution_notes' => 'required|string|min:10',
        ]);

        $ticket->resolve($request->resolution_notes);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'ticket.resolved',
            'SupportTicket',
            $ticket->id,
            ['status' => 'resolved']
        );

        return redirect()->route('team.support.show', $ticket)->with('success', 'Ticket resolved');
    }

    public function assign(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'assigned_to' => 'required|exists:team_members,id',
        ]);

        $ticket->assignTo($request->assigned_to);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'ticket.assigned',
            'SupportTicket',
            $ticket->id,
            ['assigned_to' => $request->assigned_to]
        );

        return redirect()->route('team.support.show', $ticket)->with('success', 'Ticket assigned');
    }

    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,waiting_user,resolved,closed',
        ]);

        $oldStatus = $ticket->status;
        $ticket->update(['status' => $request->status]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'ticket.status_changed',
            'SupportTicket',
            $ticket->id,
            ['from' => $oldStatus, 'to' => $request->status]
        );

        return redirect()->route('team.support.show', $ticket)->with('success', 'Status updated');
    }
}
