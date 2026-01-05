<div>
    <x-layouts.auth title="Lecturer Onboarding">
        <div class="flex flex-col gap-8">
            {{-- Progress Stepper --}}
            <div class="flex items-center justify-between px-2">
                <div class="flex flex-col items-center gap-2">
                    <div class="size-8 rounded-full flex items-center justify-center text-xs font-black {{ $step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400' }}">1</div>
                    <span class="text-[10px] uppercase font-black tracking-widest {{ $step >= 1 ? 'text-indigo-600' : 'text-slate-400' }}">Profile</span>
                </div>
                <div class="flex-1 h-px bg-slate-100 mx-4 mt-[-20px]"></div>
                <div class="flex flex-col items-center gap-2">
                    <div class="size-8 rounded-full flex items-center justify-center text-xs font-black {{ $step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400' }}">2</div>
                    <span class="text-[10px] uppercase font-black tracking-widest {{ $step >= 2 ? 'text-indigo-600' : 'text-slate-400' }}">School</span>
                </div>
            </div>

            @if ($step === 1)
                {{-- Step 1: Personal Profile --}}
                <div class="flex flex-col gap-6" data-aos="fade-up">
                    <x-auth-header 
                        :title="__('Update your profile')" 
                        :description="__('Please provide your official name used by your institution.')" 
                    />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <flux:input wire:model="firstName" :label="__('First Name')" placeholder="John" required />
                        <flux:input wire:model="lastName" :label="__('Last Name')" placeholder="Doe" required />
                    </div>

                    <flux:input wire:model="phoneNumber" :label="__('Phone Number')" placeholder="08012345678" />

                    <div class="pt-4">
                        <flux:button wire:click="nextStep" variant="primary" class="w-full !rounded-xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                            {{ __('Next: Select School') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @elseif ($step === 2)
                {{-- Step 2: School Selection --}}
                <div class="flex flex-col gap-6" data-aos="fade-up">
                    <x-auth-header 
                        :title="__('Join your school')" 
                        :description="__('Search for your institution to link your account.')" 
                    />

                    <div class="relative">
                        <flux:input 
                            wire:model.live.debounce.300ms="schoolSearch" 
                            icon="magnifying-glass"
                            :label="__('Search School')" 
                            placeholder="Type school name..." 
                            autocomplete="off"
                        />

                        @if(!empty($filteredSchools))
                            <div class="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                                @foreach($filteredSchools as $school)
                                    <button 
                                        wire:click="selectSchool({{ $school['id'] }})"
                                        class="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                                    >
                                        <span class="font-bold text-slate-700 group-hover:text-indigo-600">{{ $school['name'] }}</span>
                                        <flux:icon.plus variant="micro" class="text-slate-300 group-hover:text-indigo-400" />
                                    </button>
                                @endforeach
                            </div>
                        @endif
                    </div>

                    @if($selectedSchoolId)
                        <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 animate-pulse">
                            <flux:icon.check-circle variant="micro" class="text-indigo-600" />
                            <span class="text-sm font-bold text-indigo-700">Selected: {{ $schoolSearch }}</span>
                        </div>
                    @endif

                    <div class="flex items-center gap-4 pt-4">
                        <flux:button wire:click="previousStep" variant="ghost" class="flex-1 !rounded-xl !py-4 font-bold">
                            Back
                        </flux:button>
                        <flux:button wire:click="complete" variant="primary" class="flex-[2] !rounded-xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100" :disabled="!$selectedSchoolId">
                            {{ __('Join Institution') }} <flux:icon.check variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @endif
        </div>
    </x-layouts.auth>
</div>
