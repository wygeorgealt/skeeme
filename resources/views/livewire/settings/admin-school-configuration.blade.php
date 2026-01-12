<?php

use App\Models\School;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Livewire\Volt\Component;
use Livewire\WithFileUploads;

new class extends Component {
    use WithFileUploads;

    public string $name = '';
    public string $email = '';
    public string $phone = '';
    public string $address = '';
    public string $website = '';
    public string $timezone = 'UTC';
    public string $language = 'en';
    public string $academic_year = '';
    public string $grading_scale = '0-100';
    public $logo = null;
    public ?string $logoPath = null;
    public array $allowed_ips = [];
    public string $new_ip = '';

    protected array $timezones = [];
    protected array $languages = [
        'en' => 'English',
        'es' => 'Spanish',
        'fr' => 'French',
        'de' => 'German',
        'pt' => 'Portuguese',
    ];
    protected array $gradingScales = [
        '0-100' => 'Percentage (0-100)',
        '4.0' => 'GPA (4.0 scale)',
        '5.0' => 'GPA (5.0 scale)',
    ];

    /**
     * Mount the component.
     */
    public function mount(): void
    {
        $user = Auth::user();
        
        // Verify user is admin
        if (!$user->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $school = $user->school;
        
        if (!$school) {
            abort(404, 'School not found');
        }

        $this->name = $school->name ?? '';
        $this->email = $school->email ?? $user->email;
        $this->phone = $school->phone ?? $user->phone_number ?? '';
        $this->address = $school->address ?? '';
        $this->website = $school->website ?? '';
        $this->timezone = $school->timezone ?? 'UTC';
        $this->language = $school->language ?? 'en';
        $this->academic_year = $school->academic_year ?? '';
        $this->grading_scale = $school->grading_scale ?? '0-100';
        $this->logoPath = $school->logo_path;
        $this->allowed_ips = $school->allowed_ips ?? [];
        
        // Initialize timezones
        $this->initializeTimezones();
    }

    /**
     * Initialize available timezones.
     */
    protected function initializeTimezones(): void
    {
        $this->timezones = [
            'UTC' => 'UTC',
            'Africa/Lagos' => 'Africa/Lagos (WAT)',
            'Africa/Cairo' => 'Africa/Cairo (EAT)',
            'Africa/Johannesburg' => 'Africa/Johannesburg (SAST)',
            'Africa/Nairobi' => 'Africa/Nairobi (EAT)',
            'Africa/Accra' => 'Africa/Accra (GMT)',
            'Europe/London' => 'Europe/London (GMT/BST)',
            'Europe/Paris' => 'Europe/Paris (CET/CEST)',
            'Asia/Dubai' => 'Asia/Dubai (GST)',
            'Asia/Singapore' => 'Asia/Singapore (SGT)',
            'America/New_York' => 'America/New_York (EST/EDT)',
            'America/Los_Angeles' => 'America/Los_Angeles (PST/PDT)',
        ];
    }

    /**
     * Update the school configuration.
     */
    public function updateConfiguration(): void
    {
        $user = Auth::user();
        $school = $user->school;

        // Get valid PHP timezones
        $validTimezones = \DateTimeZone::listIdentifiers();

        $validated = $this->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
            'timezone' => ['required', 'string', Rule::in($validTimezones)],
            'language' => ['required', 'string', Rule::in(array_keys($this->languages))],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'grading_scale' => ['required', 'string', Rule::in(array_keys($this->gradingScales))],
            'logo' => ['nullable', 'image', 'max:5120'], // 5MB max
        ]);

        // Handle logo upload
        if ($this->logo) {
            $path = $this->logo->store('logos', 'public');
            $validated['logo_path'] = $path;
        }

        $validated['allowed_ips'] = $this->allowed_ips;

        $school->update($validated);

        // Refresh properties from updated school
        $this->name = $school->name;
        $this->email = $school->email;
        $this->phone = $school->phone;
        $this->address = $school->address;
        $this->website = $school->website;
        $this->timezone = $school->timezone;
        $this->language = $school->language;
        $this->academic_year = $school->academic_year;
        $this->grading_scale = $school->grading_scale;
        $this->logoPath = $school->logo_path;
        $this->allowed_ips = $school->allowed_ips ?? [];
        $this->logo = null;
        $this->dispatch('school-configuration-updated');
        
        // Reload the page after a brief delay
        $this->js('setTimeout(() => window.location.reload(), 500)');
    }

    /**
     * Delete the school logo.
     */
    public function deleteLogo(): void
    {
        $user = Auth::user();
        $school = $user->school;

        if ($school->logo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($school->logo_path);
            $school->update(['logo_path' => null]);
            $this->logoPath = null;
        }
    }

    /**
     * Add a new IP address.
     */
    public function addIp(): void
    {
        $this->validate([
            'new_ip' => ['required', 'ip'],
        ]);

        // Check for duplicates
        if (in_array($this->new_ip, $this->allowed_ips)) {
            $this->addError('new_ip', 'This IP address is already allowed.');
            return;
        }

        // Check subscription limits
        $user = Auth::user();
        $school = $user->school;
        
        // Determine limit based on plan
        $plan = $school->activeSubscription ? $school->activeSubscription->getPlanDetails() : \App\Models\Subscription::PLANS[\App\Models\Subscription::PLAN_FREE];
        $limit = $plan['id_protection_limit'];

        if ($limit !== null && count($this->allowed_ips) >= $limit) {
            $this->addError('new_ip', "Your current plan is limited to {$limit} IP addresses. Upgrade to Pro for unlimited access.");
            return;
        }

        $this->allowed_ips[] = $this->new_ip;
        $this->new_ip = '';
    }

    /**
     * Remove an IP address.
     */
    public function removeIp(int $index): void
    {
        if (isset($this->allowed_ips[$index])) {
            unset($this->allowed_ips[$index]);
            $this->allowed_ips = array_values($this->allowed_ips); // Re-index array
        }
    }

    /**
     * Get available timezones.
     */
    public function getTimezonesProperty(): array
    {
        return $this->timezones;
    }

    /**
     * Get available languages.
     */
    public function getLanguagesProperty(): array
    {
        return $this->languages;
    }

    /**
     * Get available grading scales.
     */
    public function getGradingScalesProperty(): array
    {
        return $this->gradingScales;
    }
}; ?>

<section class="w-full">
    @include('partials.settings-heading')

    <x-settings.layout 
        :heading="__('messages.School Configuration')" 
        :subheading="__('messages.Manage your school settings and basic information')"
    >
        <form wire:submit="updateConfiguration" class="my-6 w-full space-y-6">
            <!-- School Name -->
            <flux:input 
                wire:model="name" 
                :label="__('messages.School Name')" 
                type="text" 
                required 
                autocomplete="organization"
            />

            <!-- School Email -->
            <flux:input 
                wire:model="email" 
                :label="__('messages.Contact Email')" 
                type="email" 
                autocomplete="email"
                disabled
            />

            <!-- Phone Number -->
            <flux:input 
                wire:model="phone" 
                :label="__('messages.Phone Number')" 
                type="tel" 
                placeholder="+1 (555) 000-0000"
            />

            <!-- Address -->
            <flux:textarea 
                wire:model="address" 
                :label="__('messages.Location / Address')" 
                rows="3"
                placeholder="123 School Street, City, Country"
            />

            <!-- Website -->
            <flux:input 
                wire:model="website" 
                :label="__('messages.Website')" 
                type="url" 
                placeholder="https://example.com"
            />

            <!-- School Logo -->
            <div class="space-y-3">
                <flux:label>{{ __('messages.School Logo') }}</flux:label>
                
                <div class="flex items-center gap-6">
                    @if ($logoPath)
                        <div class="flex flex-col items-start gap-3">
                            <div class="relative w-24 h-24 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden bg-stone-100 dark:bg-stone-800">
                                <img src="{{ asset('storage/' . $logoPath) }}" alt="School Logo" class="w-full h-full object-cover">
                            </div>
                            <flux:button 
                                type="button"
                                variant="danger" 
                                size="sm"
                                icon="trash"
                                wire:click="deleteLogo"
                            >
                                {{ __('messages.Remove Logo') }}
                            </flux:button>
                        </div>
                    @else
                        <div class="w-24 h-24 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center bg-stone-50 dark:bg-stone-900">
                            <svg class="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    @endif

                    <div class="flex-1">
                        <flux:label>{{ __('messages.Upload Logo') }}</flux:label>
                        <input 
                            type="file"
                            wire:model="logo"
                            accept="image/*"
                            class="mt-2 block w-full text-sm text-stone-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                dark:file:bg-blue-900 dark:file:text-blue-200"
                        />
                        <flux:text variant="subtle" class="mt-2">{{ __('messages.PNG, JPG, GIF up to 5MB') }}</flux:text>
                        @error('logo')
                            <flux:error>{{ $message }}</flux:error>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Timezone -->
            <flux:select
                wire:model="timezone"
                :label="__('messages.Timezone')"
            >
                @foreach($this->timezones as $key => $value)
                    <option value="{{ $key }}">{{ $value }}</option>
                @endforeach
            </flux:select>

            <!-- Language -->
            <flux:select
                wire:model="language"
                :label="__('messages.Default Language')"
            >
                @foreach($this->languages as $key => $value)
                    <option value="{{ $key }}">{{ $value }}</option>
                @endforeach
            </flux:select>

            <!-- Academic Year -->
            <flux:input 
                wire:model="academic_year" 
                :label="__('messages.Academic Year')" 
                type="text"
                placeholder="2024/2025"
                hint="Format: YYYY/YYYY (e.g., 2024/2025)"
            />

            <!-- Grading Scale -->
            <flux:select
                wire:model="grading_scale"
                :label="__('messages.Grading Scale')"
            >
                @foreach($this->gradingScales as $key => $value)
                    <option value="{{ $key }}">{{ $value }}</option>
                @endforeach
            </flux:select>

            <flux:separator />

            <!-- ID Protection / IP Restrictions -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <flux:heading size="lg">{{ __('messages.ID Protection') }}</flux:heading>
                        <flux:subheading>{{ __('messages.Restrict student access to specific networks (e.g., School WiFi).') }}</flux:subheading>
                    </div>
                    @php
                        $user = Auth::user();
                        $school = $user->school;
                        $plan = $school->activeSubscription ? $school->activeSubscription->getPlanDetails() : \App\Models\Subscription::PLANS[\App\Models\Subscription::PLAN_FREE];
                        $limit = $plan['id_protection_limit'];
                        $isUnlimited = $limit === null;
                        $count = count($allowed_ips);
                    @endphp
                    
                    <flux:badge size="sm" color="{{ $isUnlimited || $count < $limit ? 'gray' : 'red' }}">
                        {{ $isUnlimited ? 'Unlimited' : "$count / $limit IPs" }}
                    </flux:badge>
                </div>

                <!-- Add IP Form -->
                <div class="flex gap-2">
                    <flux:input 
                        wire:model="new_ip" 
                        placeholder="192.168.1.1" 
                        class="flex-1"
                    />
                    <flux:button wire:click="addIp" icon="plus" variant="primary">
                        {{ __('messages.Add IP') }}
                    </flux:button>
                </div>
                @error('new_ip') <flux:error>{{ $message }}</flux:error> @enderror

                <!-- IP List -->
                @if(count($allowed_ips) > 0)
                    <div class="border rounded-lg divide-y dark:border-zinc-700 dark:divide-zinc-700">
                        @foreach($allowed_ips as $index => $ip)
                            <div class="px-4 py-3 flex items-center justify-between">
                                <span class="font-mono text-sm">{{ $ip }}</span>
                                <flux:button icon="trash" variant="danger" size="sm" wire:click="removeIp({{ $index }})" />
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="text-sm text-zinc-500 italic">
                        {{ __('messages.No active IP restrictions. Students can access from anywhere.') }}
                    </div>
                @endif
                
                @if(!$isUnlimited && $count >= $limit)
                    <div class="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <flux:icon.exclamation-triangle variant="mini" class="h-5 w-5 text-yellow-500" />
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Upgrade Plan
                                </h3>
                                <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <p>
                                        To add more IP addresses, please <a href="{{ route('admin.subscription') }}" class="font-bold underline hover:text-yellow-900 dark:hover:text-yellow-100">upgrade to Pro</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            </div>

            <flux:separator />


            <flux:separator />

            <!-- Submit Button -->
            <div class="flex items-center gap-4">
                <div class="flex items-center justify-end">
                    <flux:button 
                        variant="primary" 
                        type="submit" 
                        class="w-full"
                        wire:loading.attr="disabled"
                    >
                        <span wire:loading.remove>{{ __('messages.Save Configuration') }}</span>
                        <span wire:loading>{{ __('messages.Saving...') }}</span>
                    </flux:button>
                </div>

                <x-action-message class="me-3" on="school-configuration-updated">
                    {{ __('messages.Saved.') }}
                </x-action-message>
            </div>
        </form>
    </x-settings.layout>
</section>

