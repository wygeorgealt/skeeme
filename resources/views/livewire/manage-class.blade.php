<div class="p-6 lg:p-10">
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div class="flex items-center gap-3 mb-1">
                <flux:button variant="ghost" size="sm" icon="chevron-left" href="{{ route('classes-management') }}" />
                <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Manage Class: {{ $this->classDetails['name'] ?? 'Loading...' }}</h1>
            </div>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 ml-10">{{ $this->classDetails['description'] ?? 'Manage students, courses, and assignments for this class.' }}</p>
        </div>

        <div class="flex flex-wrap gap-3">
            <flux:button wire:click="openAddStudentToClassModal" variant="primary" icon="user-plus">
                Add Student
            </flux:button>
            <flux:dropdown>
                <flux:button variant="filled" icon="book-open" suffix="chevron-down">Course Options</flux:button>
                <flux:menu>
                    <flux:menu.item wire:click="openAddCourseModal" icon="link">Assign Existing Course</flux:menu.item>
                    <flux:menu.item wire:click="openCreateCourseModal" icon="plus-circle">Create New Course</flux:menu.item>
                </flux:menu>
            </flux:dropdown>
        </div>
    </div>

    @if($classDetails)
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div class="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div>
                <div class="text-xs text-zinc-500 font-bold uppercase tracking-widest">Total Students</div>
                <div class="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{{ $classDetails['students_count'] }}</div>
            </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div class="h-14 w-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">
                <i class="fas fa-layer-group"></i>
            </div>
            <div>
                <div class="text-xs text-zinc-500 font-bold uppercase tracking-widest">Active Courses</div>
                <div class="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{{ $classDetails['courses_count'] }}</div>
            </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div class="h-14 w-14 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-xl">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div>
                <div class="text-xs text-zinc-500 font-bold uppercase tracking-widest">Date Created</div>
                <div class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">{{ $classDetails['created_at'] }}</div>
            </div>
        </div>
    </div>

    <!-- Main Content Tabs/Sections -->
    <div class="space-y-10">
        <!-- Students Section -->
        <section>
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <i class="fas fa-users text-indigo-500"></i>
                    Students in this Class
                </h3>
            </div>

            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                @if($classDetails['students']->count() > 0)
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Student</th>
                                <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                            @foreach($classDetails['students'] as $student)
                                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-4">
                                            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white dark:ring-zinc-800">
                                                {{ substr($student->first_name, 0, 1) }}{{ substr($student->last_name, 0, 1) }}
                                            </div>
                                            <div>
                                                <div class="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{{ $student->first_name }} {{ $student->last_name }}</div>
                                                <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ $student->email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <flux:button wire:click="openMoveStudentModal({{ $student->id }})" variant="ghost" size="sm" icon="arrows-right-left" title="Move to Class" />
                                            <flux:button wire:click="openRemoveStudentModal({{ $student->id }})" variant="ghost" color="danger" size="sm" icon="user-minus" title="Remove" />
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <div class="py-16 text-center">
                        <i class="fas fa-user-slash text-4xl text-zinc-200 dark:text-zinc-800 mb-4"></i>
                        <p class="text-zinc-500 dark:text-zinc-400 font-medium">No students currently assigned to this class.</p>
                        <flux:button wire:click="openAddStudentToClassModal" variant="ghost" class="mt-4" icon="plus">Add First Student</flux:button>
                    </div>
                @endif
            </div>
        </section>

        <!-- Courses Section -->
        <section>
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <i class="fas fa-book text-emerald-500"></i>
                    Assigned Courses
                </h3>
            </div>

            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                @if($classDetails['courses']->count() > 0)
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Course Detail</th>
                                <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                            @foreach($classDetails['courses'] as $course)
                                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-4">
                                            <div class="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <i class="fas fa-file-code text-xs"></i>
                                            </div>
                                            <div>
                                                <div class="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{{ $course->name }}</div>
                                                <div class="text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-tighter">{{ $course->code }}</div>
                                                <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 max-w-sm">{{ $course->description }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <flux:button wire:click="openEditCourseModal({{ $course->id }})" variant="ghost" size="sm" icon="pencil-square" title="Edit Course" />
                                            <flux:button wire:click="unassignCourse({{ $course->id }})" variant="ghost" color="danger" size="sm" icon="minus-circle" title="Unassign" />
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <div class="py-16 text-center">
                        <i class="fas fa-book-dead text-4xl text-zinc-200 dark:text-zinc-800 mb-4"></i>
                        <p class="text-zinc-500 dark:text-zinc-400 font-medium">No courses assigned to this class yet.</p>
                        <div class="flex justify-center gap-3 mt-4">
                            <flux:button wire:click="openAddCourseModal" variant="ghost" icon="link">Assign Course</flux:button>
                            <flux:button wire:click="openCreateCourseModal" variant="ghost" icon="plus-circle">Create New</flux:button>
                        </div>
                    </div>
                @endif
            </div>
        </section>
    </div>
    @endif

    <!-- MODALS -->

    <!-- Edit Course Modal -->
    <flux:modal wire:model="showEditCourseModal" variant="flyout" class="space-y-6 md:w-[400px]">
        <div>
            <flux:heading size="lg">Edit Course</flux:heading>
            <flux:subheading>Modify existing course details and assignments.</flux:subheading>
        </div>

        <form wire:submit.prevent="confirmEditCourse" class="space-y-6">
            <flux:input wire:model="editCourseName" label="Course Name" required />
            <flux:textarea wire:model="editCourseDescription" label="Course Description" rows="4" placeholder="Briefly describe what this course covers..." />
            
            <flux:select wire:model="editLecturerId" label="Assign Lecturer" placeholder="Select a lecturer...">
                @foreach($availableLecturers as $lecturer)
                    <flux:select.option value="{{ (string)$lecturer->id }}">{{ $lecturer->first_name }} {{ $lecturer->last_name }}</flux:select.option>
                @endforeach
            </flux:select>

            <div class="flex gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <flux:spacer />
                <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button type="submit" variant="primary">Update Course</flux:button>
            </div>
        </form>
    </flux:modal>

    <!-- Add Student to Class Modal -->
    <flux:modal wire:model="showAddStudentToClassModal" variant="flyout" class="space-y-6 md:w-[450px]">
        <div class="mb-4">
            <flux:heading size="lg">Add Student</flux:heading>
            <flux:subheading>Assign an existing student to this class.</flux:subheading>
        </div>

        <form wire:submit.prevent="confirmAddStudentToClass" class="space-y-6">
            <flux:select wire:model="selectedStudentId" label="Search Student" placeholder="Choose a student to add..." required>
                @foreach($availableStudents as $student)
                    <flux:select.option value="{{ (string)$student->id }}">{{ $student->first_name }} {{ $student->last_name }} ({{ $student->email }})</flux:select.option>
                @endforeach
            </flux:select>
            
            @if(empty($availableStudents))
                <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center text-xs text-zinc-500">
                    No unassigned students found in your school.
                </div>
            @endif

            <div class="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <flux:spacer />
                <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button type="submit" variant="primary" :disabled="!$selectedStudentId">Assign to Class</flux:button>
            </div>
        </form>
    </flux:modal>

    <!-- Move Student Modal -->
    <flux:modal wire:model="showMoveStudentModal" variant="flyout" class="space-y-6 md:w-[450px]">
        <div>
            <flux:heading size="lg">Transfer Student</flux:heading>
            <flux:subheading>Relocate the student to another class structure.</flux:subheading>
        </div>

        <form wire:submit.prevent="confirmMoveStudent" class="space-y-6">
            @if($selectedStudent)
                <div class="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {{ substr($selectedStudent->first_name, 0, 1) }}{{ substr($selectedStudent->last_name, 0, 1) }}
                    </div>
                    <div>
                        <div class="font-bold text-indigo-900 dark:text-indigo-200 text-sm">{{ $selectedStudent->first_name }} {{ $selectedStudent->last_name }}</div>
                        <div class="text-xs text-indigo-700 dark:text-indigo-400">{{ $selectedStudent->email }}</div>
                    </div>
                </div>

                <flux:select wire:model="targetClassId" label="Target Class" placeholder="Select destination..." required>
                    @foreach($availableClasses as $class)
                        <flux:select.option value="{{ (string)$class->id }}">{{ $class->name }}</flux:select.option>
                    @endforeach
                </flux:select>

                <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    Warning: Moving a student will automaticallly unenroll them from current courses and enroll them in the new class's courses.
                </div>
            @endif

            <div class="flex gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <flux:spacer />
                <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button type="submit" variant="primary">Confirm Transfer</flux:button>
            </div>
        </form>
    </flux:modal>

    <!-- Remove Student Modal -->
    <flux:modal wire:model="showRemoveStudentModal" class="md:w-96">
        <div class="space-y-6">
            <div class="text-center">
                <div class="h-16 w-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                    <i class="fas fa-user-minus"></i>
                </div>
                <flux:heading size="lg">Remove Student?</flux:heading>
                <flux:subheading>This will remove the student from the class and all associated courses.</flux:subheading>
            </div>

            @if($selectedStudent)
                <p class="text-sm text-center text-zinc-700 dark:text-zinc-300 px-4">
                    Are you certain you want to remove <span class="font-black text-zinc-900 dark:text-white">{{ $selectedStudent->first_name }} {{ $selectedStudent->last_name }}</span>? 
                </p>
            @endif

            <div class="flex flex-col gap-2 pt-4">
                <flux:button wire:click="confirmRemoveStudent" variant="danger" class="w-full" wire:loading.attr="disabled">
                    <span wire:loading.remove>Proceed with Removal</span>
                    <span wire:loading>Processing...</span>
                </flux:button>
                <flux:button wire:click="closeModals" variant="ghost" class="w-full">Wait, Keep Student</flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Add/Assign Course to Class Modal -->
    <flux:modal wire:model="showAddCourseModal" variant="flyout" class="space-y-6 md:w-[450px]">
        <div>
            <flux:heading size="lg">Assign Existing Course</flux:heading>
            <flux:subheading>Choose a course to assign to this entire class.</flux:subheading>
        </div>

        <form wire:submit.prevent="confirmAddCourse" class="space-y-6">
            <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                @if($availableCourses->count() > 0)
                    @foreach($availableCourses as $course)
                        <label class="relative block group cursor-pointer">
                            <input type="radio" wire:model="selectedCourseId" value="{{ (string)$course->id }}" class="sr-only peer">
                            <div class="p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 dark:peer-checked:bg-indigo-900/20 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-sm">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex-1">
                                        <div class="font-black text-sm text-zinc-900 dark:text-zinc-100">{{ $course->name }}</div>
                                        <div class="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mt-0.5">{{ $course->code }}</div>
                                    </div>
                                    <div class="h-5 w-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center shrink-0">
                                        <i class="fas fa-check text-white text-[8px] hidden peer-checked:block"></i>
                                    </div>
                                </div>
                                <div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed italic">{{ $course->description ?? 'No course description available.' }}</div>
                            </div>
                        </label>
                    @endforeach
                @else
                    <div class="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <i class="fas fa-search text-zinc-200 dark:text-zinc-800 text-3xl mb-3"></i>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic">No available courses to assign.</p>
                        <flux:button wire:click="openCreateCourseModal" variant="ghost" size="sm" class="mt-4">Create New Instead</flux:button>
                    </div>
                @endif
            </div>

            <div class="flex gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <flux:spacer />
                <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button type="submit" variant="primary" :disabled="!$selectedCourseId">Confirm Assignment</flux:button>
            </div>
        </form>
    </flux:modal>

    <!-- Create Course Modal -->
    <flux:modal wire:model="showCreateCourseModal" variant="flyout" class="space-y-6 md:w-[450px]">
        <div>
            <flux:heading size="lg">Launch New Course</flux:heading>
            <flux:subheading>Design and deploy a fresh course for this class.</flux:subheading>
        </div>

        <form wire:submit.prevent="confirmCreateCourse" class="space-y-6">
            <flux:input wire:model="courseName" label="Course Name" placeholder="e.g. Advanced Mathematics" required />
            <flux:textarea wire:model="courseDescription" label="Syllabus / Description" rows="5" placeholder="Outline the course objectives..." />

            <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex gap-4">
                <div class="text-indigo-600 dark:text-indigo-400 shrink-0 mt-1">
                    <i class="fas fa-magic"></i>
                </div>
                <p class="text-xs text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">
                    Automated Actions: This course will be created, assigned to this class, and all active students will be enrolled instantly.
                </p>
            </div>

            <div class="flex gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <flux:spacer />
                <flux:button type="button" wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button type="submit" variant="primary">Create & Enroll All</flux:button>
            </div>
        </form>
    </flux:modal>
</div>
