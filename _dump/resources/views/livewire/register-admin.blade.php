<x-layouts.auth title="Admin Registration">
    <div class="flex flex-col gap-6">
        <x-auth-header 
            :title="__('Admin Registration')" 
            :description="__('Create your school admin account')" 
        />

        <form wire:submit.prevent="register" class="flex flex-col gap-6">
            <flux:input
                wire:model="school_name"
                :label="__('School Name')"
                type="text"
                placeholder="Your School"
                required
            />

            <div class="grid grid-cols-2 gap-4">
                <flux:input
                    wire:model="first_name"
                    :label="__('First Name')"
                    type="text"
                    placeholder="John"
                    required
                />
                <flux:input
                    wire:model="last_name"
                    :label="__('Last Name')"
                    type="text"
                    placeholder="Doe"
                    required
                />
            </div>

            <flux:input
                wire:model="name"
                :label="__('Full Name')"
                type="text"
                placeholder="John Doe"
                required
            />

            <flux:input
                wire:model="email"
                :label="__('Email address')"
                type="email"
                required
                autocomplete="email"
                placeholder="admin@school.com"
            />

            <flux:input
                wire:model="password"
                :label="__('Password')"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                viewable
            />

            <flux:input
                wire:model="password_confirmation"
                :label="__('Confirm password')"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                viewable
            />

            <flux:button type="submit" variant="primary" class="w-full">
                {{ __('Create Account & Continue') }}
            </flux:button>
        </form>

        <div class="space-x-1 text-center text-sm text-slate-500">
            <span>{{ __('Already have an account?') }}</span>
            <flux:link :href="route('login')" wire:navigate class="font-semibold">{{ __('Sign in') }}</flux:link>
        </div>
    </div>
</x-layouts.auth>
