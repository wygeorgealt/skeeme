@props([
    'title',
    'description',
])

<div class="flex w-full flex-col text-center">
    <flux:heading size="xl" class="text-slate-900">{{ $title }}</flux:heading>
    <flux:subheading class="text-slate-600">{{ $description }}</flux:subheading>
</div>
