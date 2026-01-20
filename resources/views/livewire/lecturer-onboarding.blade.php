<div>
    <x-layouts.auth title="Lecturer Onboarding">
        <div class="flex flex-col gap-8">
            {{-- Progress Stepper --}}
            <div class="flex items-center justify-between px-2 pt-2">
                <div class="flex flex-col items-center gap-2">
                    <div class="size-9 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300 {{ $step >= 1 ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 border border-indigo-200' : 'bg-slate-100 text-slate-400' }}">1</div>
                    <span class="text-[9px] uppercase font-black tracking-widest {{ $step >= 1 ? 'text-indigo-600' : 'text-slate-400' }}">Profile</span>
                </div>
                <div class="flex-1 h-[2px] bg-slate-100 mx-4 mt-[-22px] {{ $step >= 2 ? 'bg-indigo-600/20' : '' }}"></div>
                <div class="flex flex-col items-center gap-2">
                    <div class="size-9 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300 {{ $step >= 2 ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 border border-indigo-200' : 'bg-slate-100 text-slate-400' }}">2</div>
                    <span class="text-[9px] uppercase font-black tracking-widest {{ $step >= 2 ? 'text-indigo-600' : 'text-slate-400' }}">School</span>
                </div>
            </div>

            @if ($step === 1)
                {{-- Step 1: Personal Profile --}}
                <div class="flex flex-col gap-6" data-aos="fade-up">
                    <div class="text-center space-y-2">
                        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Step 2: <span class="text-gradient">Your Profile</span></h1>
                        <p class="text-sm text-slate-500 font-medium">Please provide your official name used by your institution.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <flux:input wire:model="firstName" :label="__('First Name')" placeholder="John" required class="!rounded-2xl" />
                        <flux:input wire:model="lastName" :label="__('Last Name')" placeholder="Doe" required class="!rounded-2xl" />
                    </div>

                    <flux:input wire:model="phoneNumber" :label="__('Phone Number')" placeholder="08012345678" class="!rounded-2xl" />

                    <div class="pt-4">
                        <flux:button wire:click="nextStep" variant="primary" class="w-full !rounded-2xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                            {{ __('Next: Select School') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @elseif ($step === 2)
                {{-- Step 2: School Selection --}}
                <div class="flex flex-col gap-6" data-aos="fade-up">
                    <div class="text-center space-y-2">
                        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Step 3: <span class="text-gradient">Join School</span></h1>
                        <p class="text-sm text-slate-500 font-medium">Search for your institution to link your account.</p>
                    </div>

                    <div class="relative">
                        <flux:input 
                            wire:model.live.debounce.300ms="schoolSearch" 
                            icon="magnifying-glass"
                            :label="__('Search School')" 
                            placeholder="Type school name..." 
                            autocomplete="off"
                            class="!rounded-2xl !bg-slate-50/50"
                        />

                        @if(!empty($filteredSchools))
                            <div class="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden p-2">
                                @foreach($filteredSchools as $school)
                                    <button 
                                        wire:click="selectSchool({{ $school['id'] }})"
                                        class="w-full text-left px-5 py-4 hover:bg-slate-50 rounded-2xl transition-all border-b border-slate-50 last:border-0 flex items-center justify-between group"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div class="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <flux:icon.building-library variant="micro" />
                                            </div>
                                            <span class="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{{ $school['name'] }}</span>
                                        </div>
                                        <flux:icon.plus-circle variant="micro" class="text-slate-200 group-hover:text-indigo-400 group-hover:scale-125 transition-all" />
                                    </button>
                                @endforeach
                            </div>
                        @endif
                    </div>

                    @if($selectedSchoolId)
                        <div class="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 transition-all animate-in fade-in slide-in-from-bottom-2">
                            <div class="size-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <flux:icon.check-circle variant="solid" class="size-5" />
                            </div>
                            <div>
                                <p class="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Institution Found</p>
                                <p class="text-sm font-bold text-emerald-900 leading-tight">{{ $schoolSearch }}</p>
                            </div>
                        </div>
                    @endif

                    <div class="flex items-center gap-4 pt-4">
                        <flux:button wire:click="previousStep" variant="ghost" class="flex-1 !rounded-2xl !py-4 font-bold h-14">
                            Back
                        </flux:button>
                        <flux:button wire:click="complete" variant="primary" class="flex-[2] !rounded-2xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100 h-14" :disabled="!$selectedSchoolId">
                            {{ __('Join Institution') }} <flux:icon.check variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @endif
        </div>
    </x-layouts.auth>
</div>
