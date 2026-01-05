<x-layouts.auth title="Select Your Role">
    <div class="flex flex-col gap-8">
        <x-auth-header 
            :title="__('Welcome to Skeeme')" 
            :description="__('Choose how you will be using the platform to get started')" 
        />

        <form action="{{ route('role-selection.store') }}" method="POST" class="flex flex-col gap-4">
            @csrf
            
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="admin" class="peer sr-only" required>
                <div class="p-6 border-2 rounded-2xl transition-all duration-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md">
                    <div class="flex items-center gap-4">
                        <div class="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                            <i class="fas fa-university text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-slate-900 tracking-tight">School Admin</h3>
                            <p class="text-xs text-slate-500 mt-1 font-medium">Manage school, teachers, and subscriptions.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-indigo-600">
                            <div class="size-3 rounded-full bg-indigo-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="lecturer" class="peer sr-only">
                <div class="p-6 border-2 rounded-2xl transition-all duration-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md">
                    <div class="flex items-center gap-4">
                        <div class="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
                            <i class="fas fa-chalkboard-teacher text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-slate-900 tracking-tight">Lecturer</h3>
                            <p class="text-xs text-slate-500 mt-1 font-medium">Create exams, grade students, and manage courses.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-indigo-600">
                            <div class="size-3 rounded-full bg-indigo-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            @error('role')
                <p class="text-xs text-red-500 font-bold px-2 animate-bounce">{{ $message }}</p>
            @enderror

            <div class="pt-4">
                <flux:button type="submit" variant="primary" class="w-full !rounded-xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                    {{ __('Continue to Dashboard') }}
                </flux:button>
            </div>
        </form>

        <div class="text-center pt-2">
            <flux:link :href="route('home')" class="text-[10px] text-slate-400 hover:text-indigo-600 uppercase font-black tracking-[0.2em] no-underline transition-all duration-300 group">
                <i class="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i> Back to Home
            </flux:link>
        </div>
    </div>

    <style>
        /* Custom radio logic */
        input:checked + div {
            border-color: #4f46e5 !important;
            background-color: rgb(79 70 229 / 0.05) !important;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05) !important;
        }
        input:checked + div div:last-child {
            border-color: #4f46e5 !important;
        }
        input:checked + div div:last-child div {
            transform: scale(1) !important;
        }
    </style>
</x-layouts.auth>
