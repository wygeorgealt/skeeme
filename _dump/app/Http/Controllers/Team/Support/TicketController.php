<?php

namespace App\Http\Controllers\Team\Support;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with('user', 'assignedTo');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->latest()->paginate(20);

        return view('team.support.tickets.index', [
            'tickets' => $tickets,
            'openCount' => SupportTicket::where('status', 'open')->count(),
            'resolvedCount' => SupportTicket::where('status', 'resolved')->count(),
            'inProgressCount' => SupportTicket::where('status', 'in_progress')->count(),
        ]);
    }

    public function respond(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'response' => 'required|string|min:10',
        ]);

        $ticket->responses()->create([
            'user_id' => auth()->id(),
            'response' => $request->response,
        ]);

        return redirect()->back()->with('success', 'Response sent successfully');
    }

    public function resolve(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $ticket->resolve($request->notes ?? '');

        return redirect()->back()->with('success', 'Ticket resolved successfully');
    }
}
