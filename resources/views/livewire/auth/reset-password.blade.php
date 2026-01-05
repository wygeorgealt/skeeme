<x-layouts.auth>
    <div class="flex flex-col gap-4">
        <x-auth-header :title="__('messages.Reset password')" :description="__('Please enter your new password below')" />

        <!-- Session Status -->
        <x-auth-session-status class="text-center" :status="session('status')" />

        <form method="POST" action="{{ route('password.update') }}" class="flex flex-col gap-4">
            @csrf
            <!-- Token -->
            <input type="hidden" name="token" value="{{ request()->route('token') }}">

            <!-- Email Address -->
            <flux:input
                name="email"
                value="{{ request('email') }}"
                :label="__('Email')"
                type="email"
                required
                autocomplete="email"
            />

            <!-- Password -->
            <flux:input
                name="password"
                :label="__('messages.Password')"
                type="password"
                required
                autocomplete="new-password"
                :placeholder="__('messages.Password')"
                viewable
            />

            <!-- Confirm Password -->
            <flux:input
                name="password_confirmation"
                :label="__('messages.Confirm password')"
                type="password"
                required
                autocomplete="new-password"
                :placeholder="__('messages.Confirm password')"
                viewable
            />

            <div class="flex items-center justify-end">
                <flux:button type="submit" variant="primary" class="w-full" data-test="reset-password-button">
                    {{ __('messages.Reset password') }}
                </flux:button>
            </div>
        </form>
    </div>
</x-layouts.auth>
