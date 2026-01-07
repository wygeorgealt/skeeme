<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skeeme</title>
    @include('partials.google-tag')
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-stone-900 text-white">
    {{ $slot }}
    @livewireScripts
    <script>
        console.log('Livewire loaded. Checking wire elements...');
        document.querySelectorAll('[wire\\:click]').forEach((el, i) => {
            console.log('Found wire:click element', i, el);
        });
    </script>
</body>
</html>
