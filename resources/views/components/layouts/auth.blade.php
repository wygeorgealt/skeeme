@props(['title'])

<x-layouts.auth.simple :title="$title ?? 'Login'">
    {{ $slot }}
</x-layouts.auth.simple>
