<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
            <flux:heading size="xl" class="italic">Manage Students</flux:heading>
            <flux:subheading>Add, edit, and manage student accounts for your school.</flux:subheading>
        </div>
        <div class="flex items-center gap-3">
            <flux:button wire:click="exportStudents" icon="arrow-down-tray">Export CSV</flux:button>
            <flux:button wire:click="openAddModal" variant="primary" icon="plus">Add Student</flux:button>
        </div>
    </div>

    <!-- Filters and Search -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-5">
            <flux:input 
                wire:model.live="search" 
                icon="magnifying-glass" 
                placeholder="Search students by name or email..." 
                class="w-full"
            />
        </div>
        <div class="lg:col-span-7 flex flex-wrap md:flex-nowrap gap-3">
            <div class="relative w-full">
                <select wire:model.live="statusFilter" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none appearance-none transition-all text-zinc-700 dark:text-zinc-300">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <flux:icon.chevron-down variant="mini" class="text-zinc-400" />
                </div>
            </div>

            <div class="relative w-full">
                <select wire:model.live="classFilter" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none appearance-none transition-all text-zinc-700 dark:text-zinc-300">
                    <option value="all">All Classes</option>
                    <option value="no_class">No Class</option>
                    @foreach($availableClasses as $class)
                        <option value="{{ $class->id }}">{{ $class->name }}</option>
                    @endforeach
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <flux:icon.chevron-down variant="mini" class="text-zinc-400" />
                </div>
            </div>

            <div class="relative w-full">
                <select wire:model.live="sortBy" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none appearance-none transition-all text-zinc-700 dark:text-zinc-300">
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="class">Sort by Class</option>
                    <option value="status">Sort by Status</option>
                    <option value="created_at">Sort by Date</option>
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <flux:icon.chevron-down variant="mini" class="text-zinc-400" />
                </div>
            </div>
        </div>
    </div>

    <!-- Bulk Actions -->
    @if(count($selectedStudents) > 0)
    <div class="mb-6 bg-zinc-900 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-bottom-4">
        <div class="flex items-center gap-4">
            <div class="bg-indigo-500 rounded-lg p-2">
                <flux:icon.users variant="mini" class="w-4 h-4" />
            </div>
            <span class="text-sm font-bold uppercase tracking-widest">{{ count($selectedStudents) }} selected</span>
        </div>
        <div class="flex gap-2">
            <flux:button wire:click="openBulkResetModal" variant="ghost" icon="key" size="sm">Reset Passwords</flux:button>
            <flux:button wire:click="$set('selectedStudents', [])" variant="ghost" size="sm" icon="x-mark">Clear</flux:button>
        </div>
    </div>
    @endif

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Students</div>
            <div class="text-3xl font-bold text-emerald-500">{{ $students->where('status', 'active')->count() }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-amber-500">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Suspended</div>
            <div class="text-3xl font-bold text-amber-500">{{ $students->where('status', 'suspended')->count() }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No Class</div>
            <div class="text-3xl font-bold text-blue-500">{{ $students->whereNull('class_id')->count() }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Population</div>
            <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{{ $students->total() }}</div>
        </div>
    </div>

    <!-- Students Table -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        @if($students->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th class="p-4 w-10">
                                <flux:checkbox wire:model.live="selectAll" />
                            </th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer group" wire:click="sortBy('name')">
                                <div class="flex items-center gap-2">
                                    Student Name
                                    <span class="text-zinc-300 group-hover:text-zinc-500 transition-colors">
                                        @if($sortBy === 'name')
                                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                        @else
                                            <i class="fas fa-sort"></i>
                                        @endif
                                    </span>
                                </div>
                            </th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer group" wire:click="sortBy('email')">
                                <div class="flex items-center gap-2">
                                    Email
                                    <span class="text-zinc-300 group-hover:text-zinc-500 transition-colors">
                                        @if($sortBy === 'email')
                                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                        @else
                                            <i class="fas fa-sort"></i>
                                        @endif
                                    </span>
                                </div>
                            </th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer group" wire:click="sortBy('class')">
                                <div class="flex items-center gap-2">
                                    Class
                                    <span class="text-zinc-300 group-hover:text-zinc-500 transition-colors">
                                        @if($sortBy === 'class')
                                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                        @else
                                            <i class="fas fa-sort"></i>
                                        @endif
                                    </span>
                                </div>
                            </th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer group text-center" wire:click="sortBy('status')">
                                <div class="flex items-center justify-center gap-2">
                                    Status
                                    <span class="text-zinc-300 group-hover:text-zinc-500 transition-colors">
                                        @if($sortBy === 'status')
                                            <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                        @else
                                            <i class="fas fa-sort"></i>
                                        @endif
                                    </span>
                                </div>
                            </th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                        @foreach($students as $student)
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                                <td class="p-4">
                                    <flux:checkbox wire:model.live="selectedStudents" value="{{ $student->id }}" />
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                            {{ substr($student->first_name, 0, 1) }}{{ substr($student->last_name, 0, 1) }}
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $student->first_name }} {{ $student->last_name }}</div>
                                            <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Student Account</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span class="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{{ $student->email }}</span>
                                </td>
                                <td class="p-4">
                                    @if($student->schoolClass)
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 uppercase tracking-tight">
                                            {{ $student->schoolClass->name }}
                                        </span>
                                    @else
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 uppercase tracking-tight italic">
                                            No Class
                                        </span>
                                    @endif
                                </td>
                                <td class="p-4 text-center">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border
                                        @if($student->status === 'active') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 
                                        @else bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 @endif">
                                        {{ $student->status }}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <div class="flex items-center justify-end gap-1">
                                        <flux:button wire:click="resetPassword({{ $student->id }})" variant="ghost" size="xs" icon="key" inset="top bottom" />
                                        <flux:button wire:click="viewStudentDetails({{ $student->id }})" variant="ghost" size="xs" icon="eye" inset="top bottom" />
                                        <flux:button wire:click="openEditModal({{ $student->id }})" variant="ghost" size="xs" icon="pencil-square" inset="top bottom" />
                                        <flux:button wire:click="openDeleteModal({{ $student->id }})" variant="ghost" size="xs" icon="trash" inset="top bottom" />
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="p-4 border-t border-zinc-100 dark:divide-zinc-800">
                {{ $students->links() }}
            </div>
        @else
            <div class="py-24 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 mb-4 border border-zinc-100 dark:border-zinc-700">
                    <i class="fas fa-users text-2xl text-zinc-300"></i>
                </div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Students Found</h3>
                <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">No students match your current criteria. Adjust your filters or add a new student.</p>
                <div class="mt-6">
                    <flux:button wire:click="openAddModal" variant="primary" size="sm" icon="plus">Add Your First Student</flux:button>
                </div>
            </div>
        @endif
    </div>

    <!-- Modals -->
    <!-- Add Student Modal -->
    <flux:modal wire:model="showAddModal" variant="flyout" class="space-y-6">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">Add New Student</flux:heading>
                <flux:subheading>Enter student details to create a new account.</flux:subheading>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <flux:input label="First Name" wire:model="firstName" placeholder="John" required />
                <flux:input label="Last Name" wire:model="lastName" placeholder="Doe" required />
                <flux:input label="Middle Name (Optional)" wire:model="middleName" placeholder="Quincy" />
                
                <div class="space-y-2">
                    <flux:label>Class</flux:label>
                    <div class="relative">
                        <select wire:model="selectedClassId" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none appearance-none transition-all text-zinc-700 dark:text-zinc-300" required>
                            <option value="">Select a class</option>
                            @foreach($availableClasses as $class)
                                <option value="{{ $class->id }}">{{ $class->name }}</option>
                            @endforeach
                        </select>
                        <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <flux:icon.chevron-down variant="mini" class="text-zinc-400" />
                        </div>
                    </div>
                </div>
            </div>

            <flux:textarea label="Address" wire:model="address" placeholder="Residential address" rows="3" />

            <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                <div class="flex gap-3">
                    <flux:icon.information-circle variant="mini" class="text-indigo-500 shrink-0" />
                    <p class="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed uppercase tracking-tight">
                        A unique email will be generated automatically (firstname.lastname@skeeme.com), and the default password will be "password123".
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <flux:button wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button wire:click="confirmAdd" variant="primary">Add Student</flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Edit Student Modal -->
    <flux:modal wire:model="showEditModal" variant="flyout" class="space-y-6">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">Edit Student</flux:heading>
                <flux:subheading>Update student information and status.</flux:subheading>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <flux:input label="First Name" wire:model="editFirstName" required />
                <flux:input label="Last Name" wire:model="editLastName" required />
                <flux:input label="Middle Name" wire:model="editMiddleName" />
                
                <div class="space-y-2">
                    <flux:label>Status</flux:label>
                    <div class="relative">
                        <select wire:model="editStatus" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none appearance-none transition-all text-zinc-700 dark:text-zinc-300" required>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <flux:icon.chevron-down variant="mini" class="text-zinc-400" />
                        </div>
                    </div>
                </div>

                <div class="space-y-2 md:col-span-2">
                    <flux:label>Class</flux:label>
                    <div class="relative">
                        <select wire:model="editClassId" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none appearance-none transition-all text-zinc-700 dark:text-zinc-300" required>
                            <option value="">Select a class</option>
                            @foreach($availableClasses as $class)
                                <option value="{{ $class->id }}">{{ $class->name }}</option>
                            @endforeach
                        </select>
                        <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <flux:icon.chevron-down variant="mini" class="text-zinc-400" />
                        </div>
                    </div>
                </div>
            </div>

            <flux:textarea label="Address" wire:model="editAddress" rows="3" />

            <div class="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <flux:button wire:click="closeModals" variant="ghost">Cancel</flux:button>
                <flux:button wire:click="confirmEdit" variant="primary">Update Changes</flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Delete Confirmation Modal -->
    <flux:modal wire:model="showDeleteModal" class="md:w-[400px]">
        <div class="space-y-6 text-center">
            <div class="mx-auto w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center border border-rose-100 dark:border-rose-800/50">
                <flux:icon.trash variant="mini" class="text-rose-600 dark:text-rose-400" />
            </div>
            
            <div>
                <flux:heading size="lg">Delete Student?</flux:heading>
                <flux:subheading>
                    Are you sure you want to permanently delete 
                    <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ $selectedStudent->first_name ?? '' }} {{ $selectedStudent->last_name ?? '' }}</span>?
                </flux:subheading>
            </div>

            <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <p class="text-[11px] text-zinc-500 italic">This action will permanently remove all enrollments and records.</p>
            </div>

            <div class="flex gap-3">
                <flux:button wire:click="closeModals" class="flex-1" variant="ghost">Keep Student</flux:button>
                <flux:button wire:click="confirmDelete" class="flex-1" variant="danger">Delete Permanently</flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Bulk Reset Modal -->
    <flux:modal wire:model="showBulkResetModal" class="md:w-[400px]">
        <div class="space-y-6 text-center">
            <div class="mx-auto w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-100 dark:border-amber-800/50">
                <flux:icon.key variant="mini" class="text-amber-600 dark:text-amber-400" />
            </div>
            
            <div>
                <flux:heading size="lg">Reset Passwords?</flux:heading>
                <flux:subheading>
                    Apply default password "password123" to 
                    <span class="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{{ count($selectedStudents) }} selected students</span>?
                </flux:subheading>
            </div>

            <div class="flex gap-3 pt-4">
                <flux:button wire:click="closeModals" class="flex-1" variant="ghost">Cancel</flux:button>
                <flux:button wire:click="confirmBulkReset" class="flex-1" variant="primary">Confirm Reset</flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Details Modal -->
    <flux:modal wire:model="showDetailsModal" class="md:w-[600px]">
        @if($studentDetails)
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold italic">
                        {{ substr($studentDetails['full_name'], 0, 1) }}
                    </div>
                    <div>
                        <flux:heading size="xl">{{ $studentDetails['full_name'] }}</flux:heading>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight 
                            @if($studentDetails['status'] === 'active') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 
                            @else bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 @endif border">
                            {{ $studentDetails['status'] }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-x-8 gap-y-6 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div class="space-y-1">
                        <flux:label class="text-[10px] uppercase tracking-widest text-zinc-400">Email Address</flux:label>
                        <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{{ $studentDetails['email'] }}</div>
                    </div>
                    <div class="space-y-1">
                        <flux:label class="text-[10px] uppercase tracking-widest text-zinc-400">Class Assigned</flux:label>
                        <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{{ $studentDetails['class'] }}</div>
                    </div>
                    <div class="space-y-1 col-span-2">
                        <flux:label class="text-[10px] uppercase tracking-widest text-zinc-400">Residential Address</flux:label>
                        <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100 italic">{{ $studentDetails['address'] ?: 'Not Provided' }}</div>
                    </div>
                    <div class="space-y-1">
                        <flux:label class="text-[10px] uppercase tracking-widest text-zinc-400">Join Date</flux:label>
                        <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">{{ $studentDetails['registration_date'] }}</div>
                    </div>
                </div>

                <div class="flex justify-end pt-4">
                    <flux:button wire:click="closeModals" variant="primary">Close Profile</flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    <!-- Flash Messages -->
    <div class="fixed bottom-6 right-6 z-50 space-y-2">
        @if (session()->has('message'))
            <div class="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                <flux:icon.check-circle variant="mini" />
                <span class="text-sm font-bold">{{ session('message') }}</span>
            </div>
        @endif

        @if (session()->has('error'))
            <div class="bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                <flux:icon.exclamation-circle variant="mini" />
                <span class="text-sm font-bold">{{ session('error') }}</span>
            </div>
        @endif
    </div>
</div>


