<?php

namespace App\Http\Controllers\Team\Content;

use App\Http\Controllers\Controller;
use App\Models\ContentPage;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContentPage::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $pages = $query->latest()->paginate(20);

        return view('team.content.pages.index', ['pages' => $pages]);
    }

    public function create()
    {
        return view('team.content.pages.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:content_pages,slug|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'meta_description' => 'nullable|string|max:160',
        ]);

        ContentPage::create($validated);

        return redirect()->route('team.content.pages.index')
            ->with('success', 'Page created successfully');
    }

    public function edit(ContentPage $page)
    {
        return view('team.content.pages.edit', ['page' => $page]);
    }

    public function update(Request $request, ContentPage $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:content_pages,slug,' . $page->id . '|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'meta_description' => 'nullable|string|max:160',
        ]);

        $page->update($validated);

        return redirect()->route('team.content.pages.index')
            ->with('success', 'Page updated successfully');
    }

    public function destroy(ContentPage $page)
    {
        $page->delete();

        return redirect()->back()->with('success', 'Page deleted successfully');
    }
}
