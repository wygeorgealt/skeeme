@extends('team.layout')

@section('team-content')
<div class="admin-page">
    <div class="page-header">
        <div class="header-top">
            <div>
                <h1>Media Manager</h1>
                <p class="page-subtitle">Upload and organize media files</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">+ Upload Files</button>
            </div>
        </div>
        <input type="file" id="fileInput" multiple accept="image/*,video/*,application/pdf" style="display: none;" onchange="handleFileUpload(event)" />
    </div>

    <!-- Upload Area -->
    <div class="upload-area" id="uploadArea" ondrop="handleDrop(event)" ondragover="handleDragOver(event)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
        </svg>
        <h3>Drag files here or <button type="button" class="link-btn" onclick="document.getElementById('fileInput').click()">browse</button></h3>
        <p>Supported: Images (PNG, JPG, GIF), Videos (MP4), PDFs</p>
    </div>

    <!-- Filters -->
    <div class="filter-section">
        <div class="filter-row">
            <div class="filter-group">
                <label>Filter by type</label>
                <select name="type" class="filter-select" onchange="filterMedia(this.value)">
                    <option value="">All Files</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Search</label>
                <input type="text" placeholder="Search files..." class="filter-input" onkeyup="searchMedia(this.value)" />
            </div>
        </div>
    </div>

    <!-- Media Gallery -->
    <div class="media-grid" id="mediaGrid">
        @forelse($files as $file)
        <div class="media-item" data-type="{{ $file['type'] }}" data-name="{{ strtolower($file['name']) }}">
            <div class="media-preview">
                @if($file['type'] === 'image')
                    <img src="{{ $file['url'] }}" alt="{{ $file['name'] }}" style="width: 100%; height: 100%; object-fit: cover;">
                @else
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #60a5fa, #3b82f6); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">{{ strtoupper($file['type']) }}</div>
                @endif
                <div class="media-overlay">
                    <a href="{{ $file['url'] }}" class="btn-icon" title="View" target="_blank">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </a>
                    <button class="btn-icon" title="Copy URL" onclick="copyToClipboard('{{ $file['url'] }}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <form action="{{ route('team.content.media.delete') }}" method="POST" style="display:inline;">
                        @csrf
                        <input type="hidden" name="path" value="{{ $file['path'] }}">
                        <button type="submit" class="btn-icon danger" title="Delete" onclick="return confirm('Delete this file?')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
            <div class="media-info">
                <p class="media-name">{{ $file['name'] }}</p>
                <p class="media-meta">{{ number_format($file['size'] / 1024, 1) }} KB • {{ \Carbon\Carbon::createFromTimestamp($file['uploaded_at'])->format('M d') }}</p>
            </div>
        </div>
        @empty
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #94a3b8;">
            No files uploaded yet. <button type="button" class="link-btn" onclick="document.getElementById('fileInput').click()">Upload your first file</button>
        </div>
        @endforelse
    </div>

    <a href="{{ route('team.dashboard') }}" class="btn btn-secondary" style="margin-top: 30px;">Back to Dashboard</a>
</div>

<style>
    .admin-page { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }

    .upload-area { background: #1e293b; border: 2px dashed #334155; border-radius: 10px; padding: 40px; text-align: center; margin-bottom: 20px; cursor: pointer; transition: all 0.3s; }
    .upload-area:hover { border-color: #60a5fa; background: rgba(96, 165, 250, 0.05); }
    .upload-area svg { color: #60a5fa; margin-bottom: 12px; }
    .upload-area h3 { margin: 0 0 8px; font-size: 14px; color: #f1f5f9; }
    .upload-area p { margin: 0; font-size: 11px; color: #94a3b8; }
    .link-btn { background: none; border: none; color: #60a5fa; cursor: pointer; text-decoration: underline; padding: 0; font-size: inherit; }

    .filter-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; }
    .filter-group { flex: 1; min-width: 200px; }
    .filter-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    .filter-select, .filter-input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; color: #f1f5f9; font-size: 12px; }

    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .media-item { background: #1e293b; border: 1px solid #334155; border-radius: 8px; overflow: hidden; transition: all 0.3s; }
    .media-item:hover { border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1); }

    .media-preview { position: relative; width: 100%; padding-bottom: 100%; overflow: hidden; background: #0f172a; }
    .media-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; gap: 8px; }
    .media-item:hover .media-overlay { display: flex; }

    .btn-icon { background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .btn-icon:hover { background: #60a5fa; }
    .btn-icon.danger:hover { background: #ef4444; }

    .media-info { padding: 12px; }
    .media-name { margin: 0 0 4px; font-size: 12px; font-weight: 500; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .media-meta { margin: 0; font-size: 10px; color: #94a3b8; }

    .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; text-decoration: none; display: inline-block; }
    .btn-primary { background: #60a5fa; color: white; }
    .btn-primary:hover { background: #3b82f6; }
    .btn-secondary { background: #475569; color: white; }
    .btn-secondary:hover { background: #64748b; }
</style>

<script>
    function handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').style.borderColor = '#60a5fa';
    }

    function handleDrop(e) {
        e.preventDefault();
        alert('Uploading files...');
    }

    function handleFileUpload(e) {
        alert('Uploading ' + e.target.files.length + ' file(s)...');
    }

    function filterMedia(type) {
        document.querySelectorAll('.media-item').forEach(item => {
            item.style.display = (!type || item.dataset.type === type) ? 'block' : 'none';
        });
    }

    function searchMedia(term) {
        const items = document.querySelectorAll('.media-item');
        items.forEach(item => {
            const name = item.querySelector('.media-name').textContent.toLowerCase();
            item.style.display = name.includes(term.toLowerCase()) ? 'block' : 'none';
        });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        alert('URL copied to clipboard!');
    }

    function handleFileUpload(event) {
        const files = event.target.files;
        const formData = new FormData();
        
        for (let file of files) {
            formData.append('file', file);
            
            fetch('{{ route("team.content.media.upload") }}', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                }
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    alert('File uploaded successfully!');
                    location.reload();
                }
            })
            .catch(e => console.error('Upload failed:', e));
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        document.getElementById('fileInput').files = files;
        handleFileUpload({ target: { files: files } });
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
    }
</script>
@endsection
