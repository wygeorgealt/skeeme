<?php

use Livewire\Volt\Component;

new class extends Component {
    //
}; ?>

<section class="w-full">
    @include('partials.settings-heading')

    <x-settings.layout :heading="__('Appearance')" :subheading=" __('Update the appearance settings for your account')">
        <flux:radio.group x-data variant="segmented" x-model="$flux.appearance">
            <flux:radio value="light" icon="sun">{{ __('messages.Light') }}</flux:radio>
            <flux:radio value="dark" icon="moon">{{ __('messages.Dark') }}</flux:radio>
            <flux:radio value="system" icon="computer-desktop">{{ __('messages.System') }}</flux:radio>
        </flux:radio.group>
    </x-settings.layout>
</section>
