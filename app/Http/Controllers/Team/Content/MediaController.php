<?php

namespace App\Http\Controllers\Team\Content;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', null);
        $search = $request->get('search', '');

        // Get files from public disk
        $files = collect(Storage::disk('public')->files('media'))
            ->map(function ($path) {
                return [
                    'path' => $path,
                    'name' => basename($path),
                    'url' => Storage::url($path),
                    'size' => Storage::size($path),
                    'mimeType' => Storage::mimeType($path),
                    'type' => $this->getFileType(Storage::mimeType($path)),
                    'uploaded_at' => Storage::lastModified($path),
                ];
            });

        // Filter by type
        if ($type) {
            $files = $files->filter(fn ($file) => $file['type'] === $type);
        }

        // Search
        if ($search) {
            $files = $files->filter(fn ($file) => str_contains(strtolower($file['name']), strtolower($search)));
        }

        return view('team.content.media.index', [
            'files' => $files->values(),
            'type' => $type,
            'search' => $search,
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        return redirect()->back()
            ->with('success', 'File uploaded successfully')
            ->with('file_path', Storage::url($path));
    }

    public function delete(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return redirect()->back()->with('success', 'File deleted successfully');
        }

        return redirect()->back()->with('error', 'File not found');
    }

    private function getFileType($mimeType)
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }
        return 'document';
    }
}
