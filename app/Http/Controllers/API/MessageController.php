<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = Message::query();

        if ($request->has('sender_id')) {
            $query->where('sender_id', $request->integer('sender_id'));
        }

        if ($request->has('recipient_id')) {
            $query->where('recipient_id', $request->integer('recipient_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sender_id' => ['required', 'integer', 'exists:users,id'],
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
        ]);

        $message = Message::create($validated);

        return response()->json($message, Response::HTTP_CREATED);
    }

    public function show(Message $message)
    {
        return response()->json($message);
    }

    public function update(Request $request, Message $message)
    {
        $validated = $request->validate([
            'body' => ['sometimes', 'string'],
        ]);

        $message->update($validated);

        return response()->json($message);
    }

    public function destroy(Message $message)
    {
        $message->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
