<div class="flex aspect-square size-8 items-center justify-center rounded-md">
    <img src="/images/login-logo.png" alt="Skeeme Logo" class="size-5" />
</div>
<div class="ms-1 grid flex-1 text-start text-sm">
    <span class="mb-0.5 truncate leading-tight font-semibold">{{ auth()->user()->school->name ?? 'School' }}</span>
</div>
