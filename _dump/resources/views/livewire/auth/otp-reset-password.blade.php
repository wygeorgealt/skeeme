<x-layouts.auth title="Reset Password">
    <div class="flex flex-col gap-6">
        <x-auth-header :title="__('Reset your password')" :description="__('Enter the verification code sent to your email')" />

        <!-- Session Status -->
        <x-auth-session-status class="text-center" :status="session('status')" />

        <form method="POST" action="{{ route('password.verify-otp') }}" class="flex flex-col gap-6">
            @csrf

            <!-- Email Address -->
            <flux:input
                name="email"
                :label="__('Email address')"
                type="email"
                required
                autofocus
                autocomplete="email"
                placeholder="email@example.com"
            />

            <!-- OTP Code -->
            <flux:input
                name="otp"
                :label="__('Verification Code')"
                type="text"
                required
                placeholder="000000"
                inputmode="numeric"
                maxlength="6"
            />

            <!-- New Password -->
            <flux:input
                name="password"
                :label="__('New Password')"
                type="password"
                required
                autocomplete="new-password"
                :placeholder="__('New password')"
                viewable
            />

            <!-- Confirm Password -->
            <flux:input
                name="password_confirmation"
                :label="__('Confirm Password')"
                type="password"
                required
                autocomplete="new-password"
                :placeholder="__('Confirm password')"
                viewable
            />

            <div class="flex items-center justify-end">
                <flux:button variant="primary" type="submit" class="w-full">
                    {{ __('Reset Password') }}
                </flux:button>
            </div>
        </form>

        <div class="space-x-1 rtl:space-x-reverse text-center text-sm text-zinc-600 dark:text-zinc-400">
            <span>{{ __('Didn\'t receive the code?') }}</span>
            <flux:link href="{{ route('password.resend-otp') }}" method="POST">{{ __('Resend') }}</flux:link>
        </div>

        <div class="text-center">
            <flux:link :href="route('login')" class="text-sm">
                {{ __('Back to login') }}
            </flux:link>
        </div>
    </div>
</x-layouts.auth>
