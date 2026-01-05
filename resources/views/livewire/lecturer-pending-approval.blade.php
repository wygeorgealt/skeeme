<x-layouts.auth title="Pending Approval">
    <div class="flex flex-col items-center text-center gap-6" data-aos="zoom-in">
        {{-- Animated Success Icon --}}
        <div class="relative">
            <div class="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
            <div class="size-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-4xl shadow-2xl shadow-indigo-200 relative z-10">
                <i class="fas fa-clock"></i>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Application Sent!</h2>
            <p class="text-slate-500 font-medium">Your request to join <span class="text-indigo-600 font-bold decoration-wavy underline decoration-indigo-200 underline-offset-4">{{ $lecturer->school->name ?? 'your institution' }}</span> is being reviewed.</p>
        </div>

        <div class="w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div class="flex items-center gap-3">
                <div class="size-2 rounded-full bg-indigo-500 animate-ping"></div>
                <span class="text-xs font-black uppercase tracking-widest text-slate-500">What happens next?</span>
            </div>
            
            <ul class="flex flex-col gap-3 text-left">
                <li class="flex gap-3 text-sm text-slate-600">
                    <flux:icon.check-circle variant="micro" class="text-green-500 shrink-0 mt-0.5" />
                    <span>Your school administrator will receive your request.</span>
                </li>
                <li class="flex gap-3 text-sm text-slate-600">
                    <flux:icon.check-circle variant="micro" class="text-green-500 shrink-0 mt-0.5" />
                    <span>Once approved, you'll receive an email notification.</span>
                </li>
                <li class="flex gap-3 text-sm text-slate-600">
                    <flux:icon.check-circle variant="micro" class="text-green-500 shrink-0 mt-0.5" />
                    <span>You'll then have full access to your lecture dashboard.</span>
                </li>
            </ul>
        </div>

        <div class="flex flex-col gap-4 w-full pt-4">
            <flux:button href="{{ route('home') }}" variant="ghost" class="w-full !rounded-xl !py-4 font-bold border border-slate-200">
                Back to Homepage
            </flux:button>
            <flux:link href="mailto:support@skeeme.com" class="text-xs text-slate-400 font-bold uppercase tracking-widest no-underline hover:text-indigo-600 transition-colors">
                Contact Support
            </flux:link>
        </div>
    </div>
</x-layouts.auth>
