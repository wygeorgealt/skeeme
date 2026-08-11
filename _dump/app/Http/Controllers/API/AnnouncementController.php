<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Announcement::paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'school_id' => ['nullable', 'integer', 'exists:schools,id'],
        ]);

        $announcement = Announcement::create($validated);

        return response()->json($announcement, Response::HTTP_CREATED);
    }

    public function show(Announcement $announcement)
    {
        return response()->json($announcement);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'school_id' => ['sometimes', 'integer', 'exists:schools,id'],
        ]);

        $announcement->update($validated);

        return response()->json($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
