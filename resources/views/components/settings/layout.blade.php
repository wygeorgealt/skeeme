<div class="flex items-start max-md:flex-col">
    <div class="me-10 w-full pb-4 md:w-[220px]">
        <flux:navlist>
            <!-- Admin-Specific Settings -->
            @if (auth()->user()->hasRole('admin'))
                <flux:navlist.item :href="route('admin.school-configuration')" wire:navigate>{{ __('messages.School Configuration') }}</flux:navlist.item>
                <flux:navlist.item :href="route('settings.subscription-billing')" wire:navigate>{{ __('messages.Subscription & Billing') }}</flux:navlist.item>
            @endif
            <!-- Common Settings (All Roles) -->
            @unless (auth()->user()->hasRole('admin'))
                <flux:navlist.item :href="route('profile.edit')" wire:navigate>{{ __('messages.Profile') }}</flux:navlist.item>
            @endunless
            <flux:navlist.item :href="route('user-password.edit')" wire:navigate>{{ __('messages.Password') }}</flux:navlist.item>
            @if (Laravel\Fortify\Features::canManageTwoFactorAuthentication())
                <flux:navlist.item :href="route('two-factor.show')" wire:navigate>{{ __('messages.Two-Factor Auth') }}</flux:navlist.item>
            @endif
            <flux:navlist.item :href="route('appearance.edit')" wire:navigate>{{ __('messages.Appearance') }}</flux:navlist.item>
            <flux:navlist.item :href="route('settings.integrations')" wire:navigate>{{ __('Integrations') }}</flux:navlist.item>
        </flux:navlist>
    </div>

    <flux:separator class="md:hidden" />

    <div class="flex-1 self-stretch max-md:pt-6">
        <flux:heading>{{ $heading ?? '' }}</flux:heading>
        <flux:subheading>{{ $subheading ?? '' }}</flux:subheading>

        <div class="mt-5 w-full max-w-lg">
            {{ $slot }}
        </div>
    </div>
</div>
