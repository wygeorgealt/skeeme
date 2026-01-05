<div {{ $attributes->merge(['class' => 'p-4 border-l-4 bg-yellow-50 border-yellow-400']) }}>
    <strong>{{ $heading ?? '' }}</strong>
    <div>{{ $slot }}</div>
</div>