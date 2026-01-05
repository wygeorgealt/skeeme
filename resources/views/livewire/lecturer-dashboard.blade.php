<div class="p-6 lg:p-10 space-y-10">
    <!-- Alert Banner -->
    @if($coursesWithoutRep > 0)
        <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-start gap-4 animate-fadeIn">
            <div class="mt-0.5 text-amber-500">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-bold text-amber-900 dark:text-amber-400">Incomplete Representation</h4>
                <p class="text-xs text-amber-800 dark:text-amber-500/80">{{ $coursesWithoutRep }} course(s) require a primary student representative.</p>
            </div>
            <flux:button href="{{ route('lecturer.course-reps') }}" size="xs" variant="primary">Assign Now</flux:button>
        </div>
    @endif

    <!-- Page Header -->
    <div class="dashboard-header flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="header-left">
            <h1 class="dashboard-title text-2xl font-bold text-zinc-900 dark:text-zinc-100">Lecturer Dashboard</h1>
            <p class="dashboard-subtitle text-sm text-zinc-500">Welcome back, {{ $lecturer->first_name }}. Here's what's happening today.</p>
        </div>
        <div class="header-right flex items-center gap-3">
            <flux:button wire:click="$set('showCalendar', true)" icon="calendar" variant="primary" size="sm">My Calendar</flux:button>
            @if ($school && $school->activeSubscription)
                <div class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm
                    @if ($school->activeSubscription->price == 0) bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700
                    @else bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 @endif">
                    @if ($school->activeSubscription->price == 0) Skeeme Basic @elseif ($school->activeSubscription->isPro()) Skeeme Pro @else {{ $school->activeSubscription->plan_name }} @endif
                </div>
            @endif
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 animate-slideIn">
        <!-- Total Courses -->
        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="stat-label">Total Courses</div>
            </div>
            <div class="stat-value">{{ number_format($stats['total_courses']) }}</div>
            <div class="stat-footer">
                <span class="stat-detail">Active: {{ $stats['total_courses'] - $stats['draft_courses'] }}</span>
            </div>
        </div>

        <!-- Students -->
        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon stat-icon-success">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-value">{{ number_format($stats['total_students']) }}</div>
            <div class="stat-footer">
                <span class="stat-badge stat-badge-success">
                    {{ $stats['active_students_percentage'] }}% Engagement
                </span>
            </div>
        </div>

        <!-- Avg. Class Size -->
        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon stat-icon-warning">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="stat-label">Avg. Class Size</div>
            </div>
            <div class="stat-value">{{ $stats['avg_class_size'] }}</div>
            <div class="stat-footer">
                <span class="stat-detail">Students per course</span>
            </div>
        </div>

        <!-- Course Reps -->
        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon stat-icon-info">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="stat-label">Course Reps</div>
            </div>
            <div class="stat-value">{{ $coursesWithRep }}</div>
            <div class="stat-footer">
                <span class="stat-detail">{{ round(($coursesWithRep / max($stats['total_courses'], 1)) * 100) }}% Coverage</span>
            </div>
        </div>
    </div>

    <!-- Strategic Actions -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-zinc-900 dark:bg-zinc-950 p-6 rounded-[32px] shadow-xl space-y-4 group">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <i class="fas fa-plus-circle text-lg"></i>
            </div>
            <div>
                <flux:heading size="sm" class="text-white">Course Plan</flux:heading>
                <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter mt-1 text-zinc-500">Manage Curriculum</flux:subheading>
            </div>
            <flux:button href="{{ route('lecturer.courses') }}" variant="primary" class="w-full !rounded-xl !h-10">Manage</flux:button>
        </div>

        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[32px] shadow-sm space-y-4 group">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <i class="fas fa-id-badge text-lg"></i>
            </div>
            <div>
                <flux:heading size="sm">Course Reps</flux:heading>
                <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter mt-1">Manage Representatives</flux:subheading>
            </div>
            <flux:button href="{{ route('lecturer.course-reps') }}" variant="ghost" class="w-full !rounded-xl !h-10">Manage</flux:button>
        </div>

        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[32px] shadow-sm space-y-4 group">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <i class="fas fa-signature text-lg"></i>
            </div>
            <div>
                <flux:heading size="sm">Grading</flux:heading>
                <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter mt-1">Grade Submissions</flux:subheading>
            </div>
            <flux:button href="{{ route('lecturer.exams') }}" variant="ghost" class="w-full !rounded-xl !h-10">Manage</flux:button>
        </div>

        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[32px] shadow-sm space-y-4 group">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <i class="fas fa-paperclip text-lg"></i>
            </div>
            <div>
                <flux:heading size="sm">Lecture Notes</flux:heading>
                <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter mt-1">Manage Resources</flux:subheading>
            </div>
            <flux:button href="{{ route('lecturer.notes') }}" variant="ghost" class="w-full !rounded-xl !h-10">Manage</flux:button>
        </div>
    </div>

    <!-- Secondary Grids -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Activity -->
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col animate-slideUp">
            <div class="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <flux:heading size="sm" class="uppercase tracking-widest text-[10px] text-zinc-400">Recent Activity</flux:heading>
                <flux:button variant="ghost" size="xs">View All</flux:button>
            </div>
            <div class="p-8 space-y-6 flex-1">
                @forelse(collect($recent_activities)->take(5) as $activity)
                    <div class="flex items-start gap-4 group cursor-pointer">
                        <div class="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 ring-4 ring-indigo-50 dark:ring-indigo-900/20"></div>
                        <div class="space-y-1">
                            <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                                @if(isset($activity->course_name))
                                    Course "{{ $activity->course_name }}" updated.
                                @else
                                    {{ $this->getActivityLabel($activity) }}
                                @endif
                            </h4>
                            <div class="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                <span>{{ \Carbon\Carbon::parse($activity->created_at)->diffForHumans() }}</span>
                                <span class="text-zinc-200">/</span>
                                <span class="text-indigo-600 dark:text-indigo-400">{{ $this->getActivityLabel($activity) }}</span>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="py-12 text-center text-zinc-300 dark:text-zinc-700">
                        <i class="fas fa-history text-3xl mb-3 opacity-20"></i>
                        <p class="text-[10px] font-bold uppercase tracking-widest">No activities recorded</p>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- My Courses -->
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col animate-slideUp [animation-delay:100ms]">
            <div class="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <flux:heading size="sm" class="uppercase tracking-widest text-[10px] text-zinc-400">My Courses</flux:heading>
                <flux:button href="{{ route('lecturer.courses') }}" variant="ghost" size="xs">View All</flux:button>
            </div>
            <div class="p-6 space-y-3 flex-1">
                @forelse($courses->take(5) as $course)
                    <div class="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all group flex items-center justify-between cursor-pointer shadow-sm">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                <i class="fas fa-folder text-xs"></i>
                            </div>
                            <div class="space-y-0.5">
                                <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ $course->name }}</h4>
                                <div class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{{ $course->code ?? 'N/A' }}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $course->student_count }}</div>
                            <div class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Students</div>
                        </div>
                    </div>
                @empty
                    <div class="py-12 text-center text-zinc-300 dark:text-zinc-700 h-full flex flex-col items-center justify-center">
                        <i class="fas fa-graduation-cap text-3xl mb-3 opacity-20"></i>
                        <p class="text-[10px] font-bold uppercase tracking-widest">No courses found</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Announcements Section -->
    <div class="space-y-6 pt-10">
        <div class="flex items-center gap-2 px-2">
            <i class="fas fa-bullhorn text-indigo-400 text-sm"></i>
            <flux:heading size="sm" class="uppercase tracking-widest text-[10px] text-zinc-400">Announcements</flux:heading>
        </div>
        
        @if(count($announcements) > 0)
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($announcements->take(3) as $announcement)
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-[180px]">
                        <div class="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.07] text-zinc-900 dark:text-white pointer-events-none group-hover:scale-110 transition-transform">
                            <i class="fas fa-quote-right text-6xl"></i>
                        </div>
                        
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-relaxed flex-1">
                            {{ $announcement->title }}
                        </h3>
                        
                        <div class="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 z-10">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                {{ \Carbon\Carbon::parse($announcement->published_at)->format('M d, Y') }}
                            </span>
                            <flux:button wire:click="openAnnouncement({{ $announcement->id }})" size="xs" variant="ghost" icon="sparkles" class="text-indigo-600">View</flux:button>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 p-16 rounded-[40px] text-center text-zinc-300 dark:text-zinc-700">
                <i class="fas fa-cloud text-3xl mb-4 opacity-10"></i>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em]">No announcements at the moment</p>
            </div>
        @endif
    </div>

    <!-- Announcement Reader Modal -->
    <flux:modal wire:model="showViewModal" class="md:w-[600px] p-0 overflow-hidden rounded-3xl">
        @if($selectedAnnouncement)
            <div class="flex flex-col">
                <div class="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{{ $selectedAnnouncement['title'] }}</h2>
                    <div class="flex items-center gap-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-4">
                        <span class="flex items-center gap-1.5"><i class="fas fa-user-tie text-[10px]"></i> {{ $selectedAnnouncement['first_name'] ?? 'System Core' }}</span>
                        <span class="text-zinc-200">/</span>
                        <span class="flex items-center gap-1.5"><i class="fas fa-clock text-[10px]"></i> {{ \Carbon\Carbon::parse($selectedAnnouncement['published_at'])->format('M d, Y H:i') }}</span>
                    </div>
                </div>

                <div class="p-10 text-base text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 min-h-[200px]">
                    {!! nl2br(e($selectedAnnouncement['content'])) !!}
                </div>

                <div class="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
                    <flux:button wire:click="closeViewModal" variant="primary">Dismiss</flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    <!-- Full-Screen Calendar Overlay -->
    <div x-data="{ showCalendar: @entangle('showCalendar') }" 
         x-show="showCalendar" 
         x-cloak
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
         @click.self="showCalendar = false">
        
        <div class="w-full max-w-7xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[95vh]"
             x-transition:enter="transition ease-out duration-300 transform"
             x-transition:enter-start="opacity-0 scale-95"
             x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="transition ease-in duration-200 transform"
             x-transition:leave-start="opacity-100 scale-100"
             x-transition:leave-end="opacity-0 scale-95">
            
            <!-- Calendar Header -->
            <div class="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div>
                    <flux:heading size="lg">My Calendar</flux:heading>
                    <flux:subheading>Manage your schedule and reminders</flux:subheading>
                </div>
                <flux:button wire:click="$set('showCalendar', false)" variant="ghost" icon="x-mark" size="sm">Close</flux:button>
            </div>

            <!-- Calendar Body -->
            <div class="p-8 overflow-y-auto flex-1">
                @livewire('timetable-management')
            </div>
        </div>
    </div>

    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --info-gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            --glass-bg-light: rgba(255, 255, 255, 0.85);
            --glass-bg-dark: rgba(24, 24, 27, 0.8);
            --glass-border-light: rgba(255, 255, 255, 0.2);
            --glass-border-dark: rgba(255, 255, 255, 0.1);
        }

        .stats-grid {
            zoom: 95%;
        }

        .stat-card {
            background: var(--glass-bg-light);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 1.5rem;
            border: 1px solid var(--glass-border-light);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
            border-radius: 20px 20px 0 0;
        }

        .stat-card:nth-child(2)::before { background: var(--success-gradient); }
        .stat-card:nth-child(3)::before { background: var(--warning-gradient); }
        .stat-card:nth-child(4)::before { background: var(--info-gradient); }

        .dark .stat-card {
            background: var(--glass-bg-dark);
            border: 1px solid var(--glass-border-dark);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }

        .stat-card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .stat-icon {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--primary-gradient);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .stat-icon-success { background: var(--success-gradient); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .stat-icon-warning { background: var(--warning-gradient); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2); }
        .stat-icon-info { background: var(--info-gradient); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }

        .stat-label {
            font-size: 0.875rem;
            color: #71717a;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .dark .stat-label { color: #a1a1aa; }

        .stat-value {
            font-size: 2.25rem;
            font-weight: 800;
            color: #18181b;
            line-height: 1;
        }

        .dark .stat-value { color: #fafafa; }

        .stat-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: auto;
        }

        .stat-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.625rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }

        .stat-badge-success { background: #d1fae5; color: #065f46; }
        .dark .stat-badge-success { background: rgba(6, 78, 59, 0.5); color: #34d399; }

        .stat-detail {
            font-size: 0.75rem;
            font-weight: 600;
            color: #a1a1aa;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }

        .dark .stat-detail { color: #71717a; }
    </style>
</div>
