<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'helvetica', sans-serif; color: #334155; line-height: 1.6; }
        .header { border-bottom: 2px solid #2EBD85; padding-bottom: 10px; margin-bottom: 20px; }
        .title { color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .stats { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .stat-item { display: inline-block; width: 30%; }
        .stat-label { color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold; }
        .stat-value { color: #0f172a; font-size: 18px; font-weight: bold; }
        .question-block { margin-bottom: 25px; page-break-inside: avoid; }
        .question-header { color: #2EBD85; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }
        .question-text { font-size: 14px; color: #0f172a; margin-bottom: 10px; font-weight: bold; }
        .solution-box { background-color: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 4px solid #cbd5e1; }
        .correct { color: #2EBD85; font-weight: bold; }
        .incorrect { color: #ef4444; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Study Report</div>
        <div class="subtitle">
            @if($type === 'quiz')
                Quiz: {{ $session->topic }}
            @else
                Scan & Solve Results
            @endif
        </div>
    </div>

    <div class="stats">
        @if($type === 'quiz')
            <div class="stat-item">
                <div class="stat-label">Score</div>
                <div class="stat-value">{{ round($session->score_percentage) }}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Correct</div>
                <div class="stat-value">{{ $session->correct_answers }} / {{ $session->total_questions }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Date</div>
                <div class="stat-value">{{ $session->created_at->format('M d, Y') }}</div>
            </div>
        @else
            <div class="stat-item">
                <div class="stat-label">Total Questions</div>
                <div class="stat-value">{{ count($results) }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Exported On</div>
                <div class="stat-value">{{ now()->format('M d, Y') }}</div>
            </div>
        @endif
    </div>

    @if($type === 'quiz')
        @foreach($session->questions as $index => $q)
            <div class="question-block">
                <div class="question-header">Question {{ $index + 1 }} • {{ ucfirst($q->type) }}</div>
                <div class="question-text">{{ $q->question }}</div>
                
                <div class="solution-box">
                    @if($q->type === 'multiple_choice')
                        <div><strong>Your Answer:</strong> <span class="{{ $q->is_correct ? 'correct' : 'incorrect' }}">{{ $q->user_answer }}</span></div>
                        @if(!$q->is_correct)
                            <div><strong>Correct Answer:</strong> <span class="correct">{{ $q->correct_answer }}</span></div>
                        @endif
                    @else
                        <div><strong>Feedback:</strong> {{ $q->feedback ?? 'Theory response graded.' }}</div>
                    @endif
                    
                    @if($q->explanation)
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            <strong>Explanation:</strong> {{ $q->explanation }}
                        </div>
                    @endif
                </div>
            </div>
        @endforeach
    @else
        @foreach($results as $index => $item)
            <div class="question-block">
                <div class="question-header">Scanned Question {{ $index + 1 }}</div>
                <div class="question-text">{{ $item['question'] ?? 'No text detected' }}</div>
                
                @if(!empty($item['steps']))
                    <div style="margin-bottom: 10px; padding-left: 15px;">
                        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Solution Steps</div>
                        @foreach($item['steps'] as $stepIdx => $step)
                            <div style="font-size: 12px; margin-bottom: 5px;">{{ $stepIdx + 1 }}. {{ $step }}</div>
                        @endforeach
                    </div>
                @endif

                <div class="solution-box">
                    <strong>Final Solution:</strong><br>
                    <div style="margin-top: 5px;">{{ $item['solution'] }}</div>
                </div>
            </div>
        @endforeach
    @endif

    <div class="footer">
        Generated by <strong>Skeeme AI</strong> • Study Smarter, Not Harder.<br>
        &copy; {{ date('Y') }} Skeeme App.
    </div>
</body>
</html>
