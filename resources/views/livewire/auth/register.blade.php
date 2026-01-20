<x-layouts.auth title="Register">
    <div class="flex flex-col gap-8">
        <div class="text-center space-y-2">
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">Create <span class="text-gradient">Account</span></h1>
            <p class="text-sm text-slate-500 font-medium font-sans">Join thousands of educators and students today.</p>
        </div>
 
        <!-- Session Status -->
        <x-auth-session-status class="text-center" :status="session('status')" />
  
        <form method="POST" action="{{ route('register.store') }}" class="flex flex-col gap-5">
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
                class="!rounded-2xl"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Password -->
                <flux:input
                    name="password"
                    :label="__('Password')"
                    type="password"
                    required
                    autocomplete="new-password"
                    :placeholder="__('Create Password')"
                    viewable
                    class="!rounded-2xl"
                />

                <!-- Confirm Password -->
                <flux:input
                    name="password_confirmation"
                    :label="__('Confirm')"
                    type="password"
                    required
                    autocomplete="new-password"
                    :placeholder="__('Repeat')"
                    viewable
                    class="!rounded-2xl"
                />
            </div>

            <div class="pt-2">
                <flux:button type="submit" variant="primary" class="w-full !rounded-2xl !py-4 font-black shadow-xl shadow-indigo-100 text-base tracking-tight" data-test="register-user-button">
                    {{ __('Get Started Free') }}
                </flux:button>
            </div>

            <div class="relative flex items-center py-2">
                <div class="flex-grow border-t border-slate-100"></div>
                <span class="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ __('Or register with') }}</span>
                <div class="flex-grow border-t border-slate-100"></div>
            </div>
  
            <flux:button href="{{ route('integrations.redirect', 'google') }}" variant="ghost" class="w-full !rounded-2xl !py-4 font-black border border-slate-200 hover:bg-slate-50 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div class="flex items-center justify-center gap-3 relative z-10">
                    <svg class="size-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M47.532 24.5528C47.532 22.8428 47.3912 21.4928 47.11 20.2328H24.322V28.4228H37.525C37.153 30.7328 35.5991 33.6828 32.7483 35.6628L32.7058 35.9407L39.4216 41.0963L39.887 41.1428C44.167 37.2428 46.68 31.4228 46.68 24.5528" fill="#4285F4"/>
                        <path d="M24.322 47.8828C30.8242 47.8828 36.3112 45.7628 40.232 41.9228L32.7483 35.6628C30.7642 37.0328 28.092 37.9728 24.322 37.9728C17.9622 37.9728 12.5512 33.8228 10.611 28.1628L10.3444 28.1856L3.35515 33.5414L3.26404 33.7928C7.2312 41.6828 15.2282 47.1628 24.322 47.1628" fill="#34A853"/>
                        <path d="M10.611 28.1628C10.134 26.7228 9.87116 25.1928 9.87116 23.6428C9.87116 22.0928 10.134 20.5628 10.591 19.1228L10.5786 18.8285L3.52839 13.4158L3.26404 13.5428C1.6912 16.7128 0.79116 20.2828 0.79116 24.0628C0.79116 27.8428 1.6912 31.4128 3.26404 34.5828L10.611 28.1628Z" fill="#FBBC05"/>
                        <path d="M24.322 9.38281C28.8512 9.38281 31.912 11.3128 33.652 12.9128L39.9812 6.84281C36.1412 3.27281 30.8242 1.11281 24.322 1.11281C15.2282 1.11281 7.2312 6.55281 3.26404 14.4428L10.591 19.8328C12.5512 14.1728 17.9622 10.0228 24.322 10.0228" fill="#EB4335"/>
                    </svg>
                    <span>{{ __('Register with Google') }}</span>
                </div>
            </flux:button>
        </form>

        <div class="text-center pt-2">
            <p class="text-xs font-bold text-slate-400">
                {{ __('Already have an account?') }} 
                <flux:link :href="route('login')" class="no-underline font-black text-indigo-600 hover:text-indigo-700 ml-1 uppercase tracking-widest text-[10px]">{{ __('Log in') }}</flux:link>
            </p>
        </div>
    </div>
</x-layouts.auth>
