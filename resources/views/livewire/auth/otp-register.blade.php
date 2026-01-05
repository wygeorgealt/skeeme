<x-layouts.auth title="Verify Email">
    <div class="flex flex-col gap-6">
        <x-auth-header :title="__('Verify your email')" :description="__('Enter the verification code sent to your email')" />

        <!-- Session Status -->
        <x-auth-session-status class="text-center" :status="session('status')" />

        <form method="POST" action="{{ route('register.verify-otp') }}" class="flex flex-col gap-6">
            @csrf

            <!-- OTP Code -->
            <flux:input
                name="otp"
                :label="__('Verification Code')"
                type="text"
                required
                autofocus
                placeholder="000000"
                inputmode="numeric"
                maxlength="6"
            />

            <div class="flex items-center justify-end">
                <flux:button variant="primary" type="submit" class="w-full">
                    {{ __('Verify Email') }}
                </flux:button>
            </div>
        </form>

        <div class="space-x-1 rtl:space-x-reverse text-center text-sm text-zinc-600 dark:text-zinc-400">
            <span>{{ __('Didn\'t receive the code?') }}</span>
            <flux:link href="{{ route('register.resend-otp') }}" method="POST">{{ __('Resend') }}</flux:link>
        </div>

        <div class="text-center">
            <flux:link :href="route('register')" class="text-sm">
                {{ __('Back to registration') }}
            </flux:link>
        </div>
    </div>
</x-layouts.auth>
