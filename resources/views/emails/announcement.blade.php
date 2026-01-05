<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Announcement</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-low { background: #e3f2fd; color: #1976d2; }
        .priority-normal { background: #fff3e0; color: #f57c00; }
        .priority-high { background: #ffebee; color: #d32f2f; }
        .priority-urgent { background: #ffebee; color: #d32f2f; }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $announcement->title }}</h1>
        @if($announcement->priority !== 'normal')
            <span class="priority priority-{{ $announcement->priority }}">
                {{ ucfirst($announcement->priority) }} Priority
            </span>
        @endif
    </div>

    <div class="content">
        <p><strong>From:</strong> {{ $announcement->sender->first_name }} {{ $announcement->sender->last_name }}</p>
        <p><strong>Date:</strong> {{ $announcement->published_at->format('M d, Y \a\t g:i A') }}</p>

        @if($announcement->target_type !== 'all_students')
            <p><strong>Target:</strong>
                @switch($announcement->target_type)
                    @case('all_lecturers')
                        All Lecturers
                        @break
                    @case('specific_course')
                        Students in {{ $announcement->course->name ?? 'Unknown Course' }}
                        @break
                    @case('specific_class')
                        Students in {{ $announcement->school->name ?? 'Unknown Class' }}
                        @break
                @endswitch
            </p>
        @endif

        <div style="margin-top: 20px;">
            {!! nl2br(e($announcement->content)) !!}
        </div>
    </div>

    <div class="footer">
        <p>This announcement was sent from your school's learning management system.</p>
        <p>If you have any questions, please contact your administrator.</p>
    </div>
</body>
</html>
