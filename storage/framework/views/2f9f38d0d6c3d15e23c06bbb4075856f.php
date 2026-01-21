<div wire:offline class="fixed top-0 left-0 right-0 z-[9999] animate-slideDown">
    <div class="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg backdrop-blur-md bg-amber-500/90">
        <i class="fas fa-wifi-slash animate-pulse"></i>
        <span class="text-xs font-bold uppercase tracking-widest">Connectivity Lost</span>
        <span class="text-[10px] opacity-90 hidden sm:inline">— Actions are being recorded to local backup and will sync once restored.</span>
    </div>
</div>

<style>
    @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
    }
    .animate-slideDown {
        animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\partials\offline-indicator.blade.php ENDPATH**/ ?>