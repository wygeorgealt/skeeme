<div class="exam-blueprint-builder">
    <div class="blueprint-container">
        <!-- Header -->
        <div class="blueprint-header">
            <h2>📋 Exam Blueprint</h2>
            <p>Plan your exam question distribution by topic, difficulty, and type</p>
        </div>

        <!-- Blueprint Overview Card -->
        @if($blueprint)
            <div class="blueprint-overview">
                <div class="overview-item">
                    <span class="label">Blueprint Name:</span>
                    <span class="value">{{ $blueprint->name }}</span>
                </div>
                <div class="overview-item">
                    <span class="label">Target Questions:</span>
                    <span class="value">{{ $blueprint->total_questions }}</span>
                </div>
                <div class="overview-item">
                    <span class="label">Total Marks:</span>
                    <span class="value">{{ number_format($blueprint->total_marks, 2) }}</span>
                </div>
                <button wire:click="$toggle('showComplianceCheck')" class="btn btn-sm btn-info">
                    <i class="fas fa-check-circle"></i> Check Compliance
                </button>
            </div>
        @endif

        <!-- Tabs -->
        <div class="blueprint-tabs">
            <button wire:click="$set('showBlueprintForm', !showBlueprintForm)" class="tab-btn">
                <i class="fas fa-sliders-h"></i> Blueprint Settings
            </button>
            <button wire:click="$set('showRequirementForm', !showRequirementForm)" class="tab-btn" @if(!$blueprint) disabled @endif>
                <i class="fas fa-list-check"></i> Requirements
            </button>
        </div>

        <!-- Blueprint Form -->
        @if($showBlueprintForm)
            <div class="form-section">
                <h3>Configure Exam Blueprint</h3>
                
                <div class="form-group">
                    <label>Blueprint Name *</label>
                    <input type="text" wire:model="blueprintName" class="form-input" placeholder="e.g., Final Exam Q1 Blueprint">
                </div>

                <div class="form-group">
                    <label>Description</label>
                    <textarea wire:model="blueprintDescription" class="form-input" rows="2" placeholder="Optional description..."></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Total Questions *</label>
                        <input type="number" wire:model="totalQuestions" class="form-input" min="1">
                    </div>
                    <div class="form-group">
                        <label>Total Marks *</label>
                        <input type="number" wire:model="totalMarks" class="form-input" step="0.01" min="0">
                    </div>
                </div>

                <!-- Difficulty Distribution -->
                <div class="distribution-section">
                    <h4>Difficulty Distribution (%)</h4>
                    <div class="distribution-grid">
                        @foreach(['easy' => 'Easy', 'medium' => 'Medium', 'hard' => 'Hard'] as $key => $label)
                            <div class="distribution-item">
                                <label>{{ $label }}</label>
                                <input type="number" wire:model="difficulties.{{ $key }}" class="form-input" min="0" max="100" step="5">
                                <span class="distribution-value">{{ $difficulties[$key] }}%</span>
                            </div>
                        @endforeach
                    </div>
                    <div class="distribution-info">
                        Sum: <span class="sum-value">{{ array_sum($difficulties) }}%</span>
                        <span class="sum-indicator @if(array_sum($difficulties) == 100) valid @else invalid @endif">
                            @if(array_sum($difficulties) == 100) ✓ @else ✗ @endif
                        </span>
                    </div>
                </div>

                <!-- Question Type Distribution -->
                @if(count($availableTypes) > 0)
                    <div class="distribution-section">
                        <h4>Question Type Distribution (%)</h4>
                        <div class="distribution-grid">
                            @foreach($availableTypes as $type)
                                <div class="distribution-item">
                                    <label>{{ ucfirst(str_replace('_', ' ', $type)) }}</label>
                                    <input type="number" wire:model="questionTypes.{{ $type }}" class="form-input" min="0" max="100" step="5">
                                    <span class="distribution-value">{{ $questionTypes[$type] ?? 0 }}%</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Topic Distribution -->
                @if(count($availableTopics) > 0)
                    <div class="distribution-section">
                        <h4>Topic Distribution (%)</h4>
                        <div class="distribution-grid">
                            @foreach($availableTopics as $topic)
                                <div class="distribution-item">
                                    <label>{{ $topic }}</label>
                                    <input type="number" wire:model="topics.{{ $topic }}" class="form-input" min="0" max="100" step="5">
                                    <span class="distribution-value">{{ $topics[$topic] ?? 0 }}%</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <div class="form-actions">
                    <button wire:click="saveBlueprintDefaults" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Blueprint
                    </button>
                    <button wire:click="$set('showBlueprintForm', false)" class="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        @endif

        <!-- Requirements Form -->
        @if($showRequirementForm && $blueprint)
            <div class="form-section">
                <h3>Add Blueprint Requirement</h3>
                
                <div class="requirements-list">
                    @forelse($requirements as $req)
                        <div class="requirement-item">
                            <div class="requirement-info">
                                <span class="req-topic">{{ $req['topic'] }}</span>
                                <span class="req-difficulty badge badge-{{ strtolower($req['difficulty']) }}">{{ $req['difficulty'] }}</span>
                                <span class="req-type">{{ ucfirst(str_replace('_', ' ', $req['type'])) }}</span>
                            </div>
                            <div class="requirement-details">
                                <span>{{ $req['count'] }} question(s) × {{ $req['marks'] }} mark(s)</span>
                            </div>
                            <button wire:click="removeRequirement({{ $req['id'] }})" class="btn-remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    @empty
                        <p class="no-requirements">No requirements added yet. Add one to get started!</p>
                    @endforelse
                </div>
            </div>
        @endif

        <!-- Compliance Check -->
        @if($showComplianceCheck && $blueprint)
            <div class="compliance-section">
                <h3>Blueprint Compliance Check</h3>
                
                <div class="compliance-score">
                    <div class="score-circle">
                        <span class="score-number">{{ round($complianceScore) }}%</span>
                    </div>
                    <p>Overall Compliance</p>
                </div>

                <div class="compliance-details">
                    <!-- Total Questions -->
                    @if($complianceDetails['total_questions'])
                        <div class="compliance-item">
                            <h4>Total Questions</h4>
                            <div class="compliance-row">
                                <span>Required:</span>
                                <span>{{ $complianceDetails['total_questions']['required'] }}</span>
                            </div>
                            <div class="compliance-row">
                                <span>Actual:</span>
                                <span class="@if($complianceDetails['total_questions']['met']) success @else error @endif">
                                    {{ $complianceDetails['total_questions']['actual'] }}
                                    @if($complianceDetails['total_questions']['met']) ✓ @else ✗ @endif
                                </span>
                            </div>
                        </div>
                    @endif

                    <!-- Difficulty -->
                    @if($complianceDetails['difficulties'])
                        <div class="compliance-item">
                            <h4>Difficulty Distribution</h4>
                            @foreach($complianceDetails['difficulties'] as $diff => $details)
                                <div class="compliance-row">
                                    <span>{{ ucfirst($diff) }} ({{ $details['percentage'] }}%):</span>
                                    <span class="@if($details['met']) success @else error @endif">
                                        {{ $details['actual'] }}/{{ $details['expected'] }} @if($details['met']) ✓ @else ✗ @endif
                                    </span>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    <!-- Question Types -->
                    @if($complianceDetails['question_types'])
                        <div class="compliance-item">
                            <h4>Question Types</h4>
                            @foreach($complianceDetails['question_types'] as $type => $details)
                                <div class="compliance-row">
                                    <span>{{ ucfirst(str_replace('_', ' ', $type)) }} ({{ $details['percentage'] }}%):</span>
                                    <span class="@if($details['met']) success @else error @endif">
                                        {{ $details['actual'] }}/{{ $details['expected'] }} @if($details['met']) ✓ @else ✗ @endif
                                    </span>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    <!-- Topics -->
                    @if($complianceDetails['topics'])
                        <div class="compliance-item">
                            <h4>Topics</h4>
                            @foreach($complianceDetails['topics'] as $topic => $details)
                                <div class="compliance-row">
                                    <span>{{ $topic }} ({{ $details['percentage'] }}%):</span>
                                    <span class="@if($details['met']) success @else error @endif">
                                        {{ $details['actual'] }}/{{ $details['expected'] }} @if($details['met']) ✓ @else ✗ @endif
                                    </span>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>

                <div class="form-actions">
                    <button wire:click="$set('showComplianceCheck', false)" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        @endif
    </div>

    <style>
        .exam-blueprint-builder {
            padding: 2rem 0;
        }

        .blueprint-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .blueprint-header {
            margin-bottom: 2rem;
        }

        .blueprint-header h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: #18181b;
        }

        .dark .blueprint-header h2 {
            color: #fafafa;
        }

        .blueprint-header p {
            color: #71717a;
        }

        .dark .blueprint-header p {
            color: #a1a1aa;
        }

        .blueprint-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dark .blueprint-overview {
            background: #27272a;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .overview-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .overview-item .label {
            font-weight: 600;
            color: #52525b;
        }

        .dark .overview-item .label {
            color: #d4d4d8;
        }

        .overview-item .value {
            font-weight: 700;
            color: #18181b;
        }

        .dark .overview-item .value {
            color: #fafafa;
        }

        .blueprint-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 2px solid #e5e7eb;
        }

        .dark .blueprint-tabs {
            border-bottom: 2px solid #3f3f46;
        }

        .tab-btn {
            padding: 1rem;
            border: none;
            background: none;
            color: #71717a;
            font-weight: 500;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .dark .tab-btn {
            color: #a1a1aa;
        }

        .tab-btn:hover {
            color: #3b82f6;
        }

        .tab-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .form-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .dark .form-section {
            background: #27272a;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .form-section h3 {
            margin-top: 0;
            color: #18181b;
            font-size: 1.25rem;
        }

        .dark .form-section h3 {
            color: #fafafa;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #18181b;
        }

        .dark .form-group label {
            color: #fafafa;
        }

        .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.95rem;
            transition: all 0.2s ease;
        }

        .dark .form-input {
            background: #3f3f46;
            border-color: #52525b;
            color: #fafafa;
        }

        .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .distribution-section {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f8fafc;
            border-radius: 8px;
        }

        .dark .distribution-section {
            background: #3f3f46;
        }

        .distribution-section h4 {
            margin-top: 0;
            color: #18181b;
            margin-bottom: 1rem;
        }

        .dark .distribution-section h4 {
            color: #fafafa;
        }

        .distribution-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .distribution-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .distribution-item label {
            font-weight: 600;
            font-size: 0.9rem;
            color: #52525b;
        }

        .dark .distribution-item label {
            color: #d4d4d8;
        }

        .distribution-value {
            font-weight: 700;
            color: #3b82f6;
        }

        .distribution-info {
            margin-top: 1rem;
            padding: 0.75rem;
            background: white;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            color: #52525b;
        }

        .dark .distribution-info {
            background: #27272a;
            color: #d4d4d8;
        }

        .sum-indicator {
            display: inline-block;
            margin-left: 0.5rem;
            font-weight: 700;
        }

        .sum-indicator.valid {
            color: #10b981;
        }

        .sum-indicator.invalid {
            color: #ef4444;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: #3b82f6;
            color: white;
        }

        .btn-primary:hover {
            background: #2563eb;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        .btn-info {
            background: #0ea5e9;
            color: white;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }

        .btn-info:hover {
            background: #0284c7;
        }

        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }

        .btn-remove {
            background: #ef4444;
            color: white;
            padding: 0.5rem 0.75rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-remove:hover {
            background: #dc2626;
        }

        .requirements-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .requirement-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 6px;
            margin-bottom: 0.75rem;
        }

        .dark .requirement-item {
            background: #3f3f46;
        }

        .requirement-info {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            flex: 1;
        }

        .req-topic {
            font-weight: 600;
            color: #18181b;
        }

        .dark .req-topic {
            color: #fafafa;
        }

        .requirement-details {
            color: #52525b;
            font-size: 0.9rem;
        }

        .dark .requirement-details {
            color: #d4d4d8;
        }

        .no-requirements {
            text-align: center;
            padding: 2rem;
            color: #71717a;
        }

        .compliance-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dark .compliance-section {
            background: #27272a;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .compliance-score {
            text-align: center;
            margin-bottom: 2rem;
        }

        .score-circle {
            width: 120px;
            height: 120px;
            margin: 0 auto 1rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
        }

        .compliance-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .compliance-item {
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
        }

        .dark .compliance-item {
            background: #3f3f46;
        }

        .compliance-item h4 {
            margin-top: 0;
            color: #18181b;
            margin-bottom: 1rem;
        }

        .dark .compliance-item h4 {
            color: #fafafa;
        }

        .compliance-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            font-size: 0.95rem;
        }

        .compliance-row span:first-child {
            color: #52525b;
        }

        .dark .compliance-row span:first-child {
            color: #d4d4d8;
        }

        .compliance-row span.success {
            color: #10b981;
            font-weight: 600;
        }

        .compliance-row span.error {
            color: #ef4444;
            font-weight: 600;
        }

        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-easy {
            background: #d1fae5;
            color: #065f46;
        }

        .badge-medium {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-hard {
            background: #fee2e2;
            color: #991b1b;
        }

        @media (max-width: 768px) {
            .form-section {
                padding: 1rem;
            }

            .distribution-grid {
                grid-template-columns: 1fr;
            }

            .form-actions {
                flex-direction: column;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</div>
