<x-layouts.auth title="Select Your Role">
    <div class="flex flex-col gap-8">
        <div class="text-center space-y-2">
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">Step 1: <span class="text-gradient">Who are you?</span></h1>
            <p class="text-sm text-slate-500 font-medium">Choose your account type to continue.</p>
        </div>

        <form action="{{ route('role-selection.store') }}" method="POST" class="flex flex-col gap-4">
            @csrf
            
            <!-- School Admin -->
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="admin" class="peer sr-only" required>
                <div class="p-5 border-2 rounded-3xl transition-all duration-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/30 border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 size-24 bg-indigo-500/5 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-indigo-100">
                            <flux:icon.building-library variant="solid" class="size-7" />
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-slate-900 tracking-tight">School Admin</h3>
                            <p class="text-[11px] text-slate-500 mt-1 font-bold leading-tight">I want to manage my entire school, teachers, and students.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-indigo-600">
                            <div class="size-3 rounded-full bg-indigo-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            <!-- Lecturer -->
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="lecturer" class="peer sr-only">
                <div class="p-5 border-2 rounded-3xl transition-all duration-300 peer-checked:border-blue-600 peer-checked:bg-blue-50/30 border-slate-100 hover:border-blue-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 size-24 bg-blue-500/5 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm border border-blue-100">
                            <flux:icon.academic-cap variant="solid" class="size-7" />
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-slate-900 tracking-tight">Lecturer</h3>
                            <p class="text-[11px] text-slate-500 mt-1 font-bold leading-tight">I want to create exams and grade my classes.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-blue-600">
                            <div class="size-3 rounded-full bg-blue-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            <!-- Student -->
            <label class="relative group cursor-pointer block">
                <input type="radio" name="role" value="student" class="peer sr-only">
                <div class="p-5 border-2 rounded-3xl transition-all duration-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-50/30 border-slate-100 hover:border-emerald-200 hover:bg-slate-50 shadow-sm group-hover:shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 size-24 bg-emerald-500/5 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                    <div class="flex items-center gap-5 relative z-10">
                        <div class="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-emerald-100">
                            <flux:icon.sparkles variant="solid" class="size-7" />
                        </div>
                        <div class="flex-1 text-left">
                            <h3 class="font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                                Independent Student 
                                <span class="bg-emerald-100 text-[10px] text-emerald-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">New</span>
                            </h3>
                            <p class="text-[11px] text-slate-500 mt-1 font-bold leading-tight">Use AI tools to generate quizzes and study smarter.</p>
                        </div>
                        <div class="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:border-emerald-600">
                            <div class="size-3 rounded-full bg-emerald-600 scale-0 transition-transform peer-checked:scale-100"></div>
                        </div>
                    </div>
                </div>
            </label>

            @error('role')
                <p class="text-xs text-red-500 font-bold px-2 animate-bounce">{{ $message }}</p>
            @enderror

            <div class="pt-4">
                <flux:button type="submit" variant="primary" class="w-full !rounded-2xl !py-4 font-black text-base tracking-tight shadow-xl shadow-indigo-100">
                    {{ __('Continue to Set Up') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
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
        input:checked[value="admin"] + div { border-color: #4f46e5 !important; background-color: rgb(79 70 229 / 0.05) !important; }
        input:checked[value="lecturer"] + div { border-color: #2563eb !important; background-color: rgb(37 99 235 / 0.05) !important; }
        input:checked[value="student"] + div { border-color: #059669 !important; background-color: rgb(5 150 105 / 0.05) !important; }
        
        input:checked + div div:last-child { border-color: currentColor !important; }
        input:checked + div div:last-child div { transform: scale(1) !important; }
    </style>
</x-layouts.auth>
