<div>
    <div class="manage-class-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">Manage Class: {{ $classDetails['name'] ?? 'Loading...' }}</h1>
                <p class="page-subtitle">{{ $classDetails['description'] ?? '' }}</p>
            </div>
            <div class="header-right">
                <button wire:click="openAddStudentToClassModal" class="btn-add">
                    <i class="fas fa-plus"></i>
                    Add Student
                </button>
                <button wire:click="openAddCourseModal" class="btn-add">
                    <i class="fas fa-plus"></i>
                    Add Course
                </button>
                <button wire:click="openCreateCourseModal" class="btn-add">
                    <i class="fas fa-plus-circle"></i>
                    Create Course
                </button>
            </div>
        </div>

        @if($classDetails)
        <!-- Class Overview -->
        <div class="class-overview">
            <div class="overview-stats">
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <div class="stat-info">
                        <div class="stat-number">{{ $classDetails['students_count'] }}</div>
                        <div class="stat-label">Students</div>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-book"></i>
                    <div class="stat-info">
                        <div class="stat-number">{{ $classDetails['courses_count'] }}</div>
                        <div class="stat-label">Courses</div>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar"></i>
                    <div class="stat-info">
                        <div class="stat-number">{{ $classDetails['created_at'] }}</div>
                        <div class="stat-label">Created</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students Section -->
        <div class="management-section">
            <div class="section-header">
                <h4>Students in Class</h4>
            </div>
            @if($classDetails['students']->count() > 0)
                <div class="students-grid">
                    @foreach($classDetails['students'] as $student)
                        <div class="student-card">
                            <div class="student-avatar">
                                {{ substr($student->first_name, 0, 1) }}{{ substr($student->last_name, 0, 1) }}
                            </div>
                            <div class="student-info">
                                <div class="student-name">{{ $student->first_name }} {{ $student->last_name }}</div>
                                <div class="student-email">{{ $student->email }}</div>
                            </div>
                            <div class="student-actions">
                                <button wire:click="openMoveStudentModal({{ $student->id }})" class="btn-action-small" title="Move to Another Class">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                                <button wire:click="openRemoveStudentModal({{ $student->id }})" class="btn-action-small btn-danger" title="Remove from Class">
                                    <i class="fas fa-user-minus"></i>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="empty-section">
                    <i class="fas fa-users"></i>
                    <p>No students in this class yet.</p>
                </div>
            @endif
        </div>

        <!-- Courses Section -->
        <div class="management-section">
            <div class="section-header">
                <h4>Courses Assigned to Class</h4>
            </div>
            @if($classDetails['courses']->count() > 0)
                <div class="courses-grid">
                    @foreach($classDetails['courses'] as $course)
                        <div class="course-card">
                            <div class="course-info">
                                <div class="course-name">{{ $course->name }}</div>
                                <div class="course-code">{{ $course->code }}</div>
                                <div class="course-description">{{ $course->description }}</div>
                            </div>
                            <div class="course-actions">
                                <button wire:click="openEditCourseModal({{ $course->id }})" class="btn-action-small" title="Edit Course">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button wire:click="unassignCourse({{ $course->id }})" class="btn-action-small btn-danger" title="Unassign Course">
                                    <i class="fas fa-minus"></i>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="empty-section">
                    <i class="fas fa-book"></i>
                    <p>No courses assigned to this class yet.</p>
                    <div class="empty-actions">
                        <button wire:click="openAddCourseModal" class="btn-add-small">
                            <i class="fas fa-plus"></i> Assign Course
                        </button>
                        <button wire:click="openCreateCourseModal" class="btn-add-small">
                            <i class="fas fa-plus-circle"></i> Create Course
                        </button>
                    </div>
                </div>
            @endif
        </div>
        @endif

        <!-- Modals -->
        <!-- Edit Course Modal -->
        <flux:modal wire:model="showEditCourseModal" variant="flyout" class="space-y-6">
            <div>
                <flux:heading size="lg">Edit Course</flux:heading>
                <flux:subheading>Update course information</flux:subheading>
            </div>

            <form wire:submit.prevent="confirmEditCourse" class="space-y-6">
                <flux:input wire:model="editCourseName" label="Course Name" required />
                <flux:textarea wire:model="editCourseDescription" label="Description" rows="3" />
                <flux:select wire:model="editLecturerId" label="Assign Lecturer" placeholder="Select Lecturer (Optional)">
                    @foreach($availableLecturers as $lecturer)
                        <flux:option value="{{ $lecturer->id }}">{{ $lecturer->first_name }} {{ $lecturer->last_name }}</flux:option>
                    @endforeach
                </flux:select>

                <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <flux:spacer />
                    <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Update Course</flux:button>
                </div>
            </form>
        </flux:modal>

        <!-- Add Student to Class Modal -->
        <flux:modal wire:model="showAddStudentToClassModal" variant="flyout" class="space-y-6">
            <div>
                <flux:heading size="lg">Add Student to Class</flux:heading>
                <flux:subheading>Select a student to add to this class</flux:subheading>
            </div>

            <form wire:submit.prevent="confirmAddStudentToClass" class="space-y-6">
                <flux:select wire:model="selectedStudentId" label="Select Student" placeholder="Choose a student..." required>
                    @foreach($availableStudents as $student)
                        <flux:option value="{{ $student->id }}">{{ $student->first_name }} {{ $student->last_name }} ({{ $student->email }})</flux:option>
                    @endforeach
                </flux:select>

                <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <flux:spacer />
                    <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Add Student</flux:button>
                </div>
            </form>
        </flux:modal>

        <!-- Move Student Modal -->
        <flux:modal wire:model="showMoveStudentModal" variant="flyout" class="space-y-6">
            <div>
                <flux:heading size="lg">Move Student to Another Class</flux:heading>
                <flux:subheading>Transfer student to a different class</flux:subheading>
            </div>

            <form wire:submit.prevent="confirmMoveStudent" class="space-y-6">
                @if($selectedStudent)
                    <div class="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <p class="text-sm text-zinc-700 dark:text-zinc-300">
                            Moving <strong>{{ $selectedStudent->first_name }} {{ $selectedStudent->last_name }}</strong> to:
                        </p>
                    </div>

                    <flux:select wire:model="targetClassId" label="Select Class" placeholder="Choose a class..." required>
                        @foreach($availableClasses as $class)
                            <flux:option value="{{ $class->id }}">{{ $class->name }}</flux:option>
                        @endforeach
                    </flux:select>

                    <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p class="text-xs text-amber-800 dark:text-amber-400 font-medium">
                            ⚠️ This will unenroll them from current class courses and enroll in the new class's courses.
                        </p>
                    </div>
                @endif

                <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <flux:spacer />
                    <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Move Student</flux:button>
                </div>
            </form>
        </flux:modal>

        <!-- Remove Student Modal -->
        <flux:modal wire:model="showRemoveStudentModal" class="md:w-96">
            <div class="space-y-6">
                <div>
                    <flux:heading size="lg">Remove Student from Class</flux:heading>
                    <flux:subheading>This action cannot be undone</flux:subheading>
                </div>

                @if($selectedStudent)
                    <div class="space-y-4">
                        <p class="text-sm text-zinc-700 dark:text-zinc-300">
                            Are you sure you want to remove <strong>{{ $selectedStudent->first_name }} {{ $selectedStudent->last_name }}</strong> from this class?
                        </p>
                        <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                            <p class="text-xs text-amber-800 dark:text-amber-400 font-medium">
                                ⚠️ This will also unenroll them from all courses assigned to this class.
                            </p>
                        </div>
                    </div>
                @endif

                <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <flux:spacer />
                    <flux:button wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button wire:click="confirmRemoveStudent" variant="danger" wire:loading.attr="disabled">
                        <span wire:loading.remove>Remove Student</span>
                        <span wire:loading>Removing...</span>
                    </flux:button>
                </div>
            </div>
        </flux:modal>

        <!-- Add/Assign Course to Class Modal -->
        <flux:modal wire:model="showAddCourseModal" variant="flyout" class="space-y-6">
            <div>
                <flux:heading size="lg">Assign Course to Class</flux:heading>
                <flux:subheading>Select an existing course to assign</flux:subheading>
            </div>

            <form wire:submit.prevent="confirmAddCourse" class="space-y-6">
                <p class="text-sm text-zinc-600 dark:text-zinc-400">All students will be auto-enrolled in the selected course.</p>

                <div class="space-y-3 max-h-[400px] overflow-y-auto">
                    @if($availableCourses->count() > 0)
                        @foreach($availableCourses as $course)
                            <label class="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all">
                                <input type="radio" wire:model="selectedCourseId" value="{{ $course->id }}" class="mt-1">
                                <div class="flex-1">
                                    <div class="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{{ $course->name }}</div>
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{{ Str::limit($course->description ?? 'No description', 50) }}</div>
                                </div>
                            </label>
                        @endforeach
                    @else
                        <div class="text-center py-8 text-zinc-500 dark:text-zinc-400">
                            <p class="text-sm italic">No available courses to assign. Create a new one instead.</p>
                        </div>
                    @endif
                </div>

                <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <flux:spacer />
                    <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary" :disabled="$availableCourses->count() === 0">Assign Course</flux:button>
                </div>
            </form>
        </flux:modal>

        <!-- Create Course Modal -->
        <flux:modal wire:model="showCreateCourseModal" variant="flyout" class="space-y-6">
            <div>
                <flux:heading size="lg">Create New Course</flux:heading>
                <flux:subheading>Create and assign a new course to this class</flux:subheading>
            </div>

            <form wire:submit.prevent="confirmCreateCourse" class="space-y-6">
                <flux:input wire:model="courseName" label="Course Name" required />
                <flux:textarea wire:model="courseDescription" label="Description" rows="3" />

                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <p class="text-xs text-indigo-800 dark:text-indigo-400 font-medium">
                        ℹ️ The course will be automatically assigned to this class and all students enrolled.
                    </p>
                </div>

                <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <flux:spacer />
                    <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Create and Assign</flux:button>
                </div>
            </form>
        </flux:modal>
    </div>

    <style>
        .manage-class-page {
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
            gap: 1rem;
        }

        .btn-add, .btn-add-empty {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #10b981;
            color: white;
            border-color: #10b981;
        }
        .btn-add:hover { background: #059669; }

        .class-overview {
            margin-bottom: 2rem;
        }

        .overview-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .stat-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .dark .stat-card { background: #3f3f46; border-color: #52525b; }

        .stat-card i {
            font-size: 1.5rem;
            color: #3b82f6;
            margin-bottom: 0.5rem;
        }

        .stat-info {
            display: flex;
            flex-direction: column;
        }

        .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 0.25rem;
        }
        .dark .stat-number { color: #fafafa; }

        .stat-label {
            color: #71717a;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .dark .stat-label { color: #a1a1aa; }

        .management-section {
            margin-bottom: 2rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }
        .dark .management-section { background: #3f3f46; border-color: #52525b; }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .section-header h4 {
            margin: 0;
            color: #18181b;
            font-size: 1.125rem;
            font-weight: 600;
        }
        .dark .section-header h4 { color: #fafafa; }

        .section-actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-add-small {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid #d4d4d8;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #10b981;
            color: white;
            border-color: #10b981;
        }
        .btn-add-small:hover { background: #059669; }

        .students-grid, .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }

        .student-card, .course-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }
        .student-card:hover, .course-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .dark .student-card, .dark .course-card { background: #52525b; border-color: #71717a; }

        .student-avatar {
            width: 2.5rem;
            height: 2.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .student-info, .course-info {
            flex: 1;
        }

        .student-name, .course-name {
            font-weight: 600;
            color: #18181b;
            margin-bottom: 0.25rem;
        }
        .dark .student-name, .dark .course-name { color: #fafafa; }

        .student-email, .course-code, .course-description {
            font-size: 0.875rem;
            color: #71717a;
        }
        .dark .student-email, .dark .course-code, .dark .course-description { color: #a1a1aa; }

        .student-actions, .course-actions {
            display: flex;
            gap: 0.25rem;
        }

        .btn-action-small {
            padding: 0.375rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            width: 1.75rem;
            height: 1.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #52525b;
            font-size: 0.75rem;
        }
        .dark .btn-action-small { color: #d4d4d8; }

        .btn-action-small:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-danger {
            color: #ef4444;
            background: #fee2e2;
        }
        .dark .btn-danger { background: #7f1d1d; color: #fecaca; }

        .btn-danger:hover {
            background: #ef4444;
            color: white;
        }

        .empty-section {
            text-align: center;
            padding: 2rem;
            color: #71717a;
        }
        .dark .empty-section { color: #a1a1aa; }

        .empty-section i {
            font-size: 2rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-section p {
            margin-bottom: 1rem;
        }

        .empty-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        }

        .course-selection {
            margin-bottom: 1rem;
        }

        .course-selection p {
            margin-bottom: 1rem;
            color: #374151;
        }
        .dark .course-selection p { color: #d1d5db; }

        .available-courses {
            max-height: 300px;
            overflow-y: auto;
        }

        .course-option {
            margin-bottom: 0.5rem;
        }

        .course-radio {
            margin-right: 0.75rem;
        }

        .course-label {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .dark .course-label { border-color: #3f3f46; }

        .course-label:hover {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        .dark .course-label:hover { background: #1e3a8a; }

        .course-radio:checked + .course-label {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        .dark .course-radio:checked + .course-label { background: #1e3a8a; }

        .no-courses {
            color: #71717a;
            font-style: italic;
            text-align: center;
            padding: 2rem;
        }
        .dark .no-courses { color: #a1a1aa; }

        .manage-class-content {
            padding: 1rem 0;
        }

        .class-overview {
            margin-bottom: 2rem;
        }

        .overview-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .stat-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .dark .stat-card { background: #3f3f46; border-color: #52525b; }

        .stat-card i {
            font-size: 1.5rem;
            color: #3b82f6;
            margin-bottom: 0.5rem;
        }

        .stat-info {
            display: flex;
            flex-direction: column;
        }

        .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 0.25rem;
        }
        .dark .stat-number { color: #fafafa; }

        .stat-label {
            color: #71717a;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .dark .stat-label { color: #a1a1aa; }

        .management-section {
            margin-bottom: 2rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }
        .dark .management-section { background: #3f3f46; border-color: #52525b; }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .section-header h4 {
            margin: 0;
            color: #18181b;
            font-size: 1.125rem;
            font-weight: 600;
        }
        .dark .section-header h4 { color: #fafafa; }

        .section-actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-add-small {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid #d4d4d8;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #10b981;
            color: white;
            border-color: #10b981;
        }
        .btn-add-small:hover { background: #059669; }

        .students-grid, .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }

        .student-card, .course-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }
        .student-card:hover, .course-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .dark .student-card, .dark .course-card { background: #52525b; border-color: #71717a; }

        .student-avatar {
            width: 2.5rem;
            height: 2.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .student-info, .course-info {
            flex: 1;
        }

        .student-name, .course-name {
            font-weight: 600;
            color: #18181b;
            margin-bottom: 0.25rem;
        }
        .dark .student-name, .dark .course-name { color: #fafafa; }

        .student-email, .course-code, .course-description {
            font-size: 0.875rem;
            color: #71717a;
        }
        .dark .student-email, .dark .course-code, .dark .course-description { color: #a1a1aa; }

        .student-actions, .course-actions {
            display: flex;
            gap: 0.25rem;
        }

        .btn-action-small {
            padding: 0.375rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            width: 1.75rem;
            height: 1.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #52525b;
            font-size: 0.75rem;
        }
        .dark .btn-action-small { color: #d4d4d8; }

        .btn-action-small:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-danger {
            color: #ef4444;
            background: #fee2e2;
        }
        .dark .btn-danger { background: #7f1d1d; color: #fecaca; }

        .btn-danger:hover {
            background: #ef4444;
            color: white;
        }

        .empty-section {
            text-align: center;
            padding: 2rem;
            color: #71717a;
        }
        .dark .empty-section { color: #a1a1aa; }

        .empty-section i {
            font-size: 2rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-section p {
            margin-bottom: 1rem;
        }

        .empty-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        }

        .modal {
            display: none;
        }

        .modal.show {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1055 !important;
            overflow: hidden;
            outline: 0;
        }

        .modal .modal-dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24cm;
            max-width: 1200px;
            margin: 0;
            z-index: 1056;
        }

        .modal-lg .modal-body {
            max-height: 70vh;
            overflow-y: auto;
        }

        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1050 !important;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .modal-dialog {
            position: relative;
            width: auto;
            margin: 1.75rem auto;
            max-width: 500px;
        }

        .modal-content {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            pointer-events: auto;
            background-color: white;
            background-clip: padding-box;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 0.3rem;
            outline: 0;
        }
        .dark .modal-content { background-color: #27272a; border-color: #3f3f46; }

        .modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
        }
        .dark .modal-header { border-color: #3f3f46; }

        .modal-title {
            margin-bottom: 0;
            line-height: 1.5;
            font-size: 1.25rem;
            font-weight: 500;
            color: #18181b;
        }
        .dark .modal-title { color: #fafafa; }

        .modal-body {
            position: relative;
            flex: 1 1 auto;
            padding: 1rem;
        }

        .modal-footer {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            padding: 0.75rem;
            border-top: 1px solid #dee2e6;
            gap: 0.5rem;
        }
        .dark .modal-footer { border-color: #3f3f46; }

        .form-group {
            margin-bottom: 1rem;
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

        .btn {
            display: inline-block;
            font-weight: 400;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: 0.25rem;
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            cursor: pointer;
        }

        .btn-primary {
            color: #fff;
            background-color: #007bff;
            border-color: #007bff;
        }
        .btn-primary:hover {
            color: #fff;
            background-color: #0056b3;
            border-color: #004085;
        }

        .btn-secondary {
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
        }
        .btn-secondary:hover {
            color: #fff;
            background-color: #545b62;
            border-color: #4e555b;
        }

        .btn-danger {
            color: #fff;
            background-color: #dc3545;
            border-color: #dc3545;
        }
        .btn-danger:hover {
            color: #fff;
            background-color: #c82333;
            border-color: #bd2130;
        }

        .btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }

        .text-danger {
            color: #dc3545;
        }

        .alert {
            position: relative;
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
        }

        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }

        .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }

        .alert-dismissible .close {
            position: absolute;
            right: 1.25rem;
            top: 0.75rem;
            z-index: 2;
            display: block;
            width: 1rem;
            height: 1rem;
            opacity: 0.5;
            background: transparent;
            border: 0;
            cursor: pointer;
        }

        .alert-dismissible .close:hover {
            opacity: 0.75;
        }

        .class-details-content {
            padding: 1rem 0;
        }

        .class-header {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        .dark .class-header { border-color: #3f3f46; }

        .class-avatar-large {
            width: 4rem;
            height: 4rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 1.5rem;
            margin-right: 1rem;
        }

        .class-info h4 {
            margin: 0 0 0.5rem 0;
            color: #18181b;
            font-size: 1.5rem;
        }
        .dark .class-info h4 { color: #fafafa; }

        .class-info p {
            margin: 0 0 1rem 0;
            color: #71717a;
        }
        .dark .class-info p { color: #a1a1aa; }

        .class-meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #52525b;
            font-size: 0.875rem;
        }
        .dark .meta-item { color: #d4d4d8; }

        .class-sections {
            margin-top: 2rem;
        }

        .section {
            margin-bottom: 2rem;
        }

        .section h5 {
            margin: 0 0 1rem 0;
            color: #18181b;
            font-size: 1.125rem;
            font-weight: 600;
        }
        .dark .section h5 { color: #fafafa; }

        .students-list, .courses-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
        }

        .student-item, .course-item {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .dark .student-item, .dark .course-item { background: #3f3f46; border-color: #52525b; }

        .student-avatar {
            width: 2.5rem;
            height: 2.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .student-info, .course-info {
            flex: 1;
        }

        .student-name, .course-name {
            font-weight: 600;
            color: #18181b;
            margin-bottom: 0.25rem;
        }
        .dark .student-name, .dark .course-name { color: #fafafa; }

        .student-email, .course-code, .course-description {
            font-size: 0.875rem;
            color: #71717a;
        }
        .dark .student-email, .dark .course-code, .dark .course-description { color: #a1a1aa; }

        .no-data {
            color: #71717a;
            font-style: italic;
            text-align: center;
            padding: 2rem;
        }
        .dark .no-data { color: #a1a1aa; }

        .course-selection {
            margin-bottom: 1rem;
        }

        .course-selection p {
            margin-bottom: 1rem;
            color: #374151;
        }
        .dark .course-selection p { color: #d1d5db; }

        .available-courses {
            max-height: 300px;
            overflow-y: auto;
        }

        .course-option {
            margin-bottom: 0.5rem;
        }

        .course-radio {
            margin-right: 0.75rem;
        }

        .course-label {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .dark .course-label { border-color: #3f3f46; }

        .course-label:hover {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        .dark .course-label:hover { background: #1e3a8a; }

        .course-radio:checked + .course-label {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        .dark .course-radio:checked + .course-label { background: #1e3a8a; }

        .no-courses {
            color: #71717a;
            font-style: italic;
            text-align: center;
            padding: 2rem;
        }
        
        .dark .no-courses { color: #a1a1aa; }

    </style>
</div>
