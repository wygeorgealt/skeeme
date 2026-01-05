<div class="student-messages">
    <div class="container-fluid">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">Messages</h1>
                <p class="page-subtitle">Communicate with lecturers and administrators</p>
            </div>
            <div class="header-right">
                <button wire:click="$set('showComposeForm', true)" class="btn-primary">
                    <i class="fas fa-plus"></i>
                    Compose Message
                </button>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
            <button wire:click="$set('activeTab', 'received')" class="tab-button {{ $activeTab == 'received' ? 'active' : '' }}">
                Received Messages
            </button>
            <button wire:click="$set('activeTab', 'sent')" class="tab-button {{ $activeTab == 'sent' ? 'active' : '' }}">
                Sent Messages
            </button>
        </div>

        <!-- Messages Content -->
        @if($activeTab == 'received' && $messages->count() > 0)
            <div class="content-grid">
                @foreach($messages as $message)
                    <div class="content-card message-card {{ !$message->read_at ? 'unread' : '' }}">
                        <div class="content-card-header">
                            <div class="message-header">
                                <h3 class="message-subject">{{ $message->subject }}</h3>
                                @if(!$message->read_at)
                                    <span class="message-badge new">New</span>
                                @endif
                            </div>
                            <div class="message-meta">
                                <p class="message-sender">From: {{ $message->sender->first_name }} {{ $message->sender->last_name }}</p>
                                @if($message->course)
                                    <p class="message-course">Course: {{ $message->course->name }} ({{ $message->course->code }})</p>
                                @endif
                                <p class="message-date">{{ $message->created_at->format('M d, Y H:i') }}</p>
                            </div>
                        </div>
                        <div class="content-card-body">
                            <p class="message-content">{{ Str::limit($message->content, 200) }}</p>
                            @if(!$message->read_at)
                                <div class="message-actions">
                                    <button wire:click="markAsRead({{ $message->id }})" class="btn-action btn-view">Mark as Read</button>
                                </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        @elseif($activeTab == 'sent' && $sentMessages->count() > 0)
            <div class="content-grid">
                @foreach($sentMessages as $message)
                    <div class="content-card message-card sent">
                        <div class="content-card-header">
                            <div class="message-header">
                                <h3 class="message-subject">{{ $message->subject }}</h3>
                                <span class="message-badge sent">Sent</span>
                            </div>
                            <div class="message-meta">
                                <p class="message-receiver">To: {{ $message->receiver->first_name }} {{ $message->receiver->last_name }}</p>
                                @if($message->course)
                                    <p class="message-course">Course: {{ $message->course->name }} ({{ $message->course->code }})</p>
                                @endif
                                <p class="message-date">{{ $message->created_at->format('M d, Y H:i') }}</p>
                            </div>
                        </div>
                        <div class="content-card-body">
                            <p class="message-content">{{ Str::limit($message->content, 200) }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>No messages</h3>
                <p>
                    @if($activeTab == 'received')
                        You haven't received any messages yet.
                    @else
                        You haven't sent any messages yet.
                    @endif
                </p>
            </div>
        @endif
    </div>

    <!-- Compose Message Modal -->
    @if($showComposeForm)
        <div class="modal-overlay" wire:click="$set('showComposeForm', false)">
            <div class="modal-content" wire:click.stop>
                <div class="modal-header">
                    <h3>Compose New Message</h3>
                    <button wire:click="$set('showComposeForm', false)" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form wire:submit="sendMessage">
                        <div class="form-group">
                            <label>Course</label>
                            <select wire:model="newMessage.course_id" class="form-control">
                                <option value="">Select Course (Optional)</option>
                                @foreach($availableCourses as $course)
                                    <option value="{{ $course->id }}">{{ $course->name }}</option>
                                @endforeach

                            </select>
                        </div>
                        <div class="form-group">
                            <label>Recipient</label>
                            <select wire:model="newMessage.receiver_id" class="form-control">
                                <option value="">Select Recipient</option>
                                @foreach($availableRecipients as $recipient)
                                    <option value="{{ $recipient->id }}">{{ $recipient->first_name }} {{ $recipient->last_name }} - {{ $recipient->course_name ?? 'N/A' }}</option>
                                @endforeach
                            </select>
                            @error('newMessage.receiver_id') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group">
                            <label>Subject</label>
                            <input type="text" wire:model="newMessage.subject" class="form-control">
                            @error('newMessage.subject') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group">
                            <label>Message</label>
                            <textarea wire:model="newMessage.content" rows="4" class="form-control"></textarea>
                            @error('newMessage.content') <span class="error-message">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-footer">
                            <button type="button" wire:click="$set('showComposeForm', false)" class="btn-secondary">Cancel</button>
                            <button type="submit" class="btn-primary">Send Message</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif

    <!-- Custom Styles -->
    <style>
        .student-messages {
            padding: 2rem 0;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .page-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #18181b;
            margin: 0;
        }
        .dark .page-title { color: #fafafa; }

        .page-subtitle {
            color: #71717a;
            margin: 0.25rem 0 0 0;
            font-size: 0.9375rem;
        }
        .dark .page-subtitle { color: #a1a1aa; }

        .header-right {
            display: flex;
            align-items: center;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #fff;
            background-color: #007bff;
            border-color: #007bff;
            padding: 0.5rem 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            font-size: 0.875rem;
            line-height: 1.25rem;
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .btn-primary:hover {
            color: #fff;
            background-color: #0056b3;
            border-color: #004085;
        }

        .tab-navigation {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .tab-button {
            padding: 0.75rem 1rem;
            border: none;
            background: none;
            color: #6b7280;
            font-weight: 500;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }
        .tab-button:hover { color: #374151; }
        .tab-button.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .dark .content-card { background: #27272a; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

        .content-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .dark .content-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

        .message-card.unread {
            border-left: 4px solid #3b82f6;
        }

        .message-card.sent {
            background: #f8fafc;
        }
        .dark .message-card.sent { background: #3f3f46; }

        .content-card-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
        }
        .dark .content-card-header { border-bottom: 1px solid #3f3f46; }

        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .message-subject {
            font-size: 1.125rem;
            font-weight: 700;
            color: #18181b;
            margin: 0;
        }
        .dark .message-subject { color: #fafafa; }

        .message-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .message-badge.new {
            background: #dbeafe;
            color: #1e40af;
        }
        .dark .message-badge.new { background: #1e3a8a; color: #60a5fa; }

        .message-badge.sent {
            background: #f3f4f6;
            color: #374151;
        }
        .dark .message-badge.sent { background: #4b5563; color: #d1d5db; }

        .message-meta p {
            margin: 0.25rem 0;
            font-size: 0.875rem;
            color: #71717a;
        }
        .dark .message-meta p { color: #a1a1aa; }

        .content-card-body {
            padding: 1.5rem;
        }

        .message-content {
            color: #374151;
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        .dark .message-content { color: #d1d5db; }

        .message-actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-action {
            padding: 0.375rem 0.75rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .btn-view {
            color: #3b82f6;
            background: #dbeafe;
        }
        .dark .btn-view { background: #1e3a8a; color: #60a5fa; }

        .btn-view:hover {
            background: #3b82f6;
            color: white;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #a1a1aa;
        }
        .dark .empty-state { color: #71717a; }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state h3 {
            margin-bottom: 0.5rem;
            color: #18181b;
        }
        .dark .empty-state h3 { color: #fafafa; }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .dark .modal-content { background: #27272a; }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dark .modal-header { border-bottom: 1px solid #3f3f46; }

        .modal-header h3 {
            margin: 0;
            color: #18181b;
            font-size: 1.125rem;
        }
        .dark .modal-header h3 { color: #fafafa; }

        .btn-close {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
        }
        .btn-close:hover { background: #f3f4f6; }
        .dark .btn-close:hover { background: #3f3f46; }

        .modal-body {
            padding: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        .dark .form-group label { color: #d1d5db; }

        .form-control {
            display: block;
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5;
            color: #495057;
            background-color: white;
            background-clip: padding-box;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .dark .form-control { background-color: #374151; border-color: #4b5563; color: #e5e7eb; }

        .form-control:focus {
            color: #495057;
            background-color: white;
            border-color: #80bdff;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        .dark .form-control:focus { background-color: #374151; border-color: #80bdff; color: #e5e7eb; }

        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }

        .form-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }
        .dark .form-footer { border-top: 1px solid #3f3f46; }

        .btn-secondary {
            color: #6c757d;
            background-color: transparent;
            border: 1px solid #6c757d;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            font-size: 0.875rem;
            line-height: 1.25rem;
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .btn-secondary:hover {
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
        }

        /* Animations */
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .content-card {
            animation: slideUp 0.4s ease forwards;
        }
    </style>
</div>
