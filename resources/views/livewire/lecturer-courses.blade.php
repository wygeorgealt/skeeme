<div class="p-6 lg:p-10 space-y-10">
    <!-- Page Header -->
    <div class="dashboard-header flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="header-left">
            <h1 class="dashboard-title text-2xl font-bold text-zinc-900 dark:text-zinc-100">Course Management</h1>
            <p class="dashboard-subtitle text-sm text-zinc-500">Manage your created and assigned courses.</p>
        </div>
        <div class="header-right flex items-center gap-3">
            @livewire('lecturer-course-creator')
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 animate-slideIn">
        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="stat-label">Total Courses</div>
            </div>
            <div class="stat-value">{{ $stats['total_courses'] }}</div>
            <div class="stat-footer">
                <span class="stat-detail">Registry Count</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon stat-icon-success">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-value text-indigo-500">{{ $stats['total_students'] }}</div>
            <div class="stat-footer">
                <span class="stat-detail">Active Enrollment</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon stat-icon-warning">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-label">Completion</div>
            </div>
            <div class="stat-value text-emerald-500">{{ $stats['completion_rate'] }}%</div>
            <div class="stat-footer">
                <span class="stat-detail">Syllabus Progress</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-icon stat-icon-info">
                    <i class="fas fa-sync"></i>
                </div>
                <div class="stat-label">Status</div>
            </div>
            <div class="stat-value">SYNCED</div>
            <div class="stat-footer">
                <span class="stat-detail">Live Propagation</span>
            </div>
        </div>
    </div>

    <!-- Main Workspace Section -->
    <div class="space-y-12">
        <!-- Created Courses Registry -->
        @if($createdCourses->count() > 0)
            <div class="space-y-6 animate-slideUp">
                <div class="flex items-center gap-2 px-1">
                    <i class="fas fa-folder-plus text-indigo-400 text-sm"></i>
                    <flux:heading size="lg" class="uppercase tracking-widest text-[11px] text-zinc-400">Created Courses ({{ $createdCourses->count() }})</flux:heading>
                </div>
                
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Course Name</th>
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Stats</th>
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created</th>
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                @foreach($createdCourses as $course)
                                    <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group">
                                        <td class="p-6">
                                            <div class="flex flex-col gap-1">
                                                <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors leading-none">{{ $course->name }}</span>
                                            </div>
                                        </td>
                                        <td class="p-6 text-center">
                                            @php
                                                $statusStyles = $course->status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                                                    : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
                                            @endphp
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter border {{ $statusStyles }} shadow-sm">
                                                {{ $course->status }}
                                            </span>
                                        </td>
                                        <td class="p-6">
                                            <div class="flex items-center justify-center gap-6">
                                                <div class="flex flex-col items-center">
                                                    <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">{{ $course->enrollments_count ?? 0 }}</span>
                                                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Students</span>
                                                </div>
                                                <div class="flex flex-col items-center">
                                                    <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">{{ $course->topics_count ?? 0 }}</span>
                                                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Modules</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6">
                                            <span class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{{ $course->created_at->format('M d, Y') }}</span>
                                        </td>
                                        <td class="p-6 text-right">
                                            <div class="flex items-center justify-end gap-2 group/actions">
                                                <flux:button href="{{ route('lecturer.exams', ['selectedCourse' => $course->id]) }}" variant="ghost" size="xs" icon="document-magnifying-glass" class="opacity-0 group-hover/actions:opacity-100 transition-all hover:text-indigo-600" title="Exams" />
                                                <flux:button wire:click="shareCourse({{ $course->id }})" variant="ghost" size="xs" icon="share" class="opacity-0 group-hover/actions:opacity-100 transition-all hover:text-indigo-600" title="Share" />
                                                
                                                @if($course->zoom_join_url)
                                                    <flux:button wire:click="endLiveClass({{ $course->id }})" variant="ghost" size="xs" icon="video-camera" class="text-rose-600 opacity-100 transition-all animate-pulse" title="End Live Class" />
                                                @else
                                                    <flux:button wire:click="startLiveClass({{ $course->id }})" variant="ghost" size="xs" icon="video-camera" class="opacity-0 group-hover/actions:opacity-100 transition-all hover:text-indigo-600" title="Start Live Class" />
                                                @endif

                                                <flux:button wire:click="editCourse({{ $course->id }})" variant="ghost" size="xs" icon="pencil-square" class="opacity-0 group-hover/actions:opacity-100 transition-all hover:text-amber-600" title="Edit" />
                                                <flux:button wire:click="deleteCourse({{ $course->id }})" variant="ghost" size="xs" icon="trash" class="opacity-0 group-hover/actions:opacity-100 transition-all hover:text-rose-600" title="Delete" />
                                                <i class="fas fa-ellipsis-v text-zinc-200 group-hover/actions:hidden text-[10px]"></i>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endif

        <!-- Assigned Instructor Registry -->
        @if($assignedCourses->count() > 0)
            <div class="space-y-6 animate-slideUp [animation-delay:150ms]">
                <div class="flex items-center gap-2 px-1">
                    <i class="fas fa-user-check text-emerald-400 text-sm"></i>
                    <flux:heading size="lg" class="uppercase tracking-widest text-[11px] text-zinc-400">Assigned Courses ({{ $assignedCourses->count() }})</flux:heading>
                </div>
                
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Course Name</th>
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Stats</th>
                                    <th class="p-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                @foreach($assignedCourses as $course)
                                    <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group">
                                        <td class="p-6">
                                            <div class="flex flex-col gap-1">
                                                <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors leading-none">{{ $course->name }}</span>
                                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Assigned</span>
                                            </div>
                                        </td>
                                        <td class="p-6">
                                            <div class="flex items-center justify-center gap-10">
                                                <div class="flex flex-col items-center">
                                                    <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">{{ $course->enrollments_count ?? 0 }}</span>
                                                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Students</span>
                                                </div>
                                                <div class="flex flex-col items-center">
                                                    <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">{{ $course->topics_count ?? 0 }}</span>
                                                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Modules</span>
                                                </div>
                                                <div class="flex flex-col items-center">
                                                    <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">{{ $course->exams_count ?? 0 }}</span>
                                                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Assessments</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6 text-right">
                                            <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <div class="flex items-center gap-1">
                                                    <flux:button href="{{ route('lecturer.exams', ['selectedCourse' => $course->id]) }}" variant="ghost" size="xs" icon="document-magnifying-glass" class="hover:text-indigo-600" title="Exams" />
                                                    <flux:button wire:click="shareCourse({{ $course->id }})" variant="ghost" size="xs" icon="share" class="hover:text-indigo-600" title="Share" />
                                                    
                                                    @if($course->zoom_join_url)
                                                        <flux:button wire:click="endLiveClass({{ $course->id }})" variant="ghost" size="xs" icon="video-camera" class="text-rose-600 animate-pulse" title="End Live Class" />
                                                    @else
                                                        <flux:button wire:click="startLiveClass({{ $course->id }})" variant="ghost" size="xs" icon="video-camera" class="hover:text-indigo-600" title="Start Live Class" />
                                                    @endif

                                                    <flux:button href="{{ route('lecturer.attendance', ['course' => $course->id]) }}" variant="ghost" size="xs" icon="check-badge" class="hover:text-amber-600" title="Attendance" />
                                                    <flux:button href="{{ route('lecturer.curriculum', ['course' => $course->id]) }}" variant="ghost" size="xs" icon="academic-cap" class="hover:text-indigo-600" title="Curriculum" />
                                                    <flux:button href="{{ route('lecturer.notes', ['course' => $course->id]) }}" variant="ghost" size="xs" icon="document-text" class="hover:text-blue-600" title="Notes" />
                                                </div>
                                                <div class="h-4 w-[1px] bg-zinc-100 dark:bg-zinc-800"></div>
                                                <flux:button wire:click="unassignCourse({{ $course->id }})" wire:confirm="Revoke access to this course?" variant="ghost" size="xs" icon="user-minus" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30" title="Unassign" />
                                            </div>
                                            <div class="group-hover:hidden flex items-center justify-end gap-1">
                                                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                                <span class="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endif
    </div>

    <!-- Empty Registry Resolution -->
    @if($createdCourses->count() === 0 && $assignedCourses->count() === 0)
        <div class="py-32 text-center space-y-8 animate-fadeIn">
            <div class="flex flex-col items-center gap-6">
                <div class="w-24 h-24 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-inner relative overflow-hidden group">
                    <i class="fas fa-folder-open text-3xl text-zinc-200 dark:text-zinc-700 transition-transform group-hover:scale-110"></i>
                    <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div class="space-y-2">
                    <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Courses Found</h3>
                    <flux:subheading class="max-w-xs mx-auto text-center leading-relaxed">Initialize your first course to begin managing academic structures.</flux:subheading>
                </div>
                <div class="pt-4">
                    @livewire('lecturer-course-creator')
                </div>
            </div>
        </div>
    @endif

    <!-- Modals Section -->
    
    <!-- Link Sharing Layer -->
    <flux:modal wire:model="showShareModal" class="md:w-[450px] p-0 overflow-hidden rounded-3xl">
        @if($sharingCourse)
            <div class="flex flex-col">
                <div class="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <flux:heading size="lg">Share Course Link</flux:heading>
                    <flux:subheading class="uppercase tracking-widest text-[9px] font-bold mt-1 text-indigo-500">{{ $sharingCourse->name }}</flux:subheading>
                </div>

                <div class="p-8 space-y-6">
                    <div x-data="{ 
                        link: '{{ url($sharingCourse->course_link) }}',
                        copied: false,
                        copy() {
                            navigator.clipboard.writeText(this.link);
                            this.copied = true;
                            setTimeout(() => this.copied = false, 2000);
                        }
                    }" class="space-y-4">
                        <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Student Enrollment Link</flux:label>
                        <div class="relative group">
                            <div @click="copy" class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 pr-16 text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all cursor-pointer hover:border-indigo-500 transition-all shadow-inner">
                                {{ url($sharingCourse->course_link) }}
                            </div>
                            <button @click="copy" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-indigo-600 shadow-sm transition-all active:scale-95">
                                <flux:icon.clipboard x-show="!copied" variant="mini" class="w-4 h-4" />
                                <flux:icon.check x-show="copied" variant="mini" class="w-4 h-4 text-emerald-500" />
                            </button>
                        </div>
                        <p x-show="copied" x-transition class="text-[10px] text-emerald-600 font-bold text-center">Link copied to clipboard.</p>
                    </div>
                </div>

                <div class="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <flux:button wire:click="closeShareModal" variant="primary">Close</flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    <!-- Deletion Verification Layer -->
    <flux:modal wire:model="showDeleteModal" class="md:w-96 p-0 overflow-hidden rounded-3xl">
        <div class="p-8 space-y-8 animate-shake">
            <div class="text-center space-y-4">
                <div class="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 mx-auto flex items-center justify-center border border-rose-100 dark:border-rose-800 shadow-sm">
                    <i class="fas fa-trash-can text-2xl"></i>
                </div>
                <div>
                    <flux:heading size="lg" class="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-widest text-sm">Delete Course</flux:heading>
                    <flux:subheading class="text-[11px] leading-relaxed mt-2">This will permanently delete the selected course and all associated data. This action is irreversible.</flux:subheading>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-4">
                <flux:button class="h-12 !rounded-xl" wire:click="$set('showDeleteModal', false)" variant="ghost">Cancel</flux:button>
                <flux:button class="h-12 !rounded-xl" wire:click="confirmDelete" variant="danger">Delete</flux:button>
            </div>
        </div>
    </flux:modal>

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
    <script>
        document.addEventListener('livewire:init', () => {
            Livewire.on('open-url', (event) => {
                window.open(event.url, '_blank');
            });
        });
    </script>
</div>
