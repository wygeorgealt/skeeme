<?php

use App\Models\SocialAccount;
use Illuminate\Support\Facades\Auth;
use Livewire\Volt\Component;
use Masmerise\Toaster\Toaster;

new class extends Component {
    public function getConnectedProviders()
    {
        return Auth::user()->socialAccounts()->pluck('provider')->toArray();
    }

    public function disconnect($provider)
    {
        Auth::user()->socialAccounts()->where('provider', $provider)->delete();
        
        Toaster::success("Disconnected from " . ucfirst($provider));
    }

    public function with()
    {
        return [
            'connectedProviders' => $this->getConnectedProviders(),
        ];
    }
}; ?>

<section class="w-full">
    @include('partials.settings-heading')

    <x-settings.layout :heading="__('Integrations')" :subheading="__('Connect your external accounts for meetings and syncing.')">
        <div class="space-y-6">
            <div class="grid grid-cols-1 gap-6">
                <!-- Google Integration -->
                <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
                                <i class="fab fa-google"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900">Google Workspace</h4>
                                <p class="text-xs text-slate-500">Calendar & Meetings</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 mb-6">Sync your class schedule to Google Calendar and use Google Meet.</p>
                    </div>

                    <div class="flex items-center justify-between">
                        @if(in_array('google', $connectedProviders))
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                <span class="size-1.5 rounded-full bg-emerald-500"></span> Connected
                            </span>
                            <flux:button wire:click="disconnect('google')" variant="ghost" size="sm" class="text-slate-400 hover:text-red-600">Disconnect</flux:button>
                        @else
                            <flux:button href="{{ route('integrations.redirect', 'google') }}" variant="primary" size="sm" class="w-full">Connect</flux:button>
                        @endif
                    </div>
                </div>

                <!-- Microsoft Integration -->
                <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                                <i class="fab fa-microsoft"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900">Microsoft Teams</h4>
                                <p class="text-xs text-slate-500">Meetings & Online Presence</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 mb-6">Generate Teams meeting links directly from your Skeeme classes.</p>
                    </div>

                    <div class="flex items-center justify-between">
                        @if(in_array('microsoft', $connectedProviders))
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                <span class="size-1.5 rounded-full bg-emerald-500"></span> Connected
                            </span>
                            <flux:button wire:click="disconnect('microsoft')" variant="ghost" size="sm" class="text-slate-400 hover:text-red-600">Disconnect</flux:button>
                        @else
                            <flux:button href="{{ route('integrations.redirect', 'microsoft') }}" variant="primary" size="sm" class="w-full">Connect</flux:button>
                        @endif
                    </div>
                </div>

                <!-- Zoom Integration -->
                <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                                <i class="fas fa-video"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900">Zoom</h4>
                                <p class="text-xs text-slate-500">Online Classes</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 mb-6">Connect Zoom to automatically create and manage online meeting rooms.</p>
                    </div>

                    <div class="flex items-center justify-between">
                        @if(in_array('zoom', $connectedProviders))
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                <span class="size-1.5 rounded-full bg-emerald-500"></span> Connected
                            </span>
                            <flux:button wire:click="disconnect('zoom')" variant="ghost" size="sm" class="text-slate-400 hover:text-red-600">Disconnect</flux:button>
                        @else
                            <flux:button href="{{ route('integrations.redirect', 'zoom') }}" variant="primary" size="sm" class="w-full">Connect</flux:button>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </x-settings.layout>
</section>
