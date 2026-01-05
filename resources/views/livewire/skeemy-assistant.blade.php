<div>
    <!-- Floating Button -->
    <button 
        wire:click="togglePanel"
        class="fixed bottom-6 right-6 z-40 group"
        aria-label="Ask Skeemy">
        <div class="relative">
            <!-- Pulsing Ring Animation -->
            <div class="absolute inset-0 bg-indigo-500 rounded-full opacity-75 animate-ping"></div>
            
            <!-- Main Button -->
            <div class="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105">
                <flux:icon.sparkles class="w-5 h-5 text-white" />
            </div>
        </div>
    </button>

    <!-- Slide-out Panel -->
    <div 
        x-data="{ open: @entangle('isOpen') }"
        x-show="open"
        x-cloak
        class="fixed inset-0 z-50 overflow-hidden"
        @click.self="open = false">
        
        <!-- Backdrop -->
        <div 
            x-show="open"
            x-transition:enter="transition-opacity ease-linear duration-300"
            x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100"
            x-transition:leave="transition-opacity ease-linear duration-300"
            x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="open = false"></div>

        <!-- Panel -->
        <div 
            x-show="open"
            x-transition:enter="transform transition ease-in-out duration-500"
            x-transition:enter-start="translate-x-full"
            x-transition:enter-end="translate-x-0"
            x-transition:leave="transform transition ease-in-out duration-500"
            x-transition:leave-start="translate-x-0"
            x-transition:leave-end="translate-x-full"
            class="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <flux:icon.sparkles class="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-white">Skeemy AI</h2>
                        <p class="text-xs text-white/80">Your intelligent assistant</p>
                    </div>
                </div>
                <button wire:click="togglePanel" class="text-white/80 hover:text-white transition-colors">
                    <flux:icon.x-mark class="w-6 h-6" />
                </button>
            </div>

            <!-- Quick Actions -->
            @if(!empty($quickActions))
            <div class="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <p class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</p>
                <div class="flex flex-wrap gap-2">
                    @foreach($quickActions as $action)
                        <button 
                            wire:click="useQuickAction('{{ $action['prompt'] }}')"
                            class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                            {{ $action['label'] }}
                        </button>
                    @endforeach
                </div>
            </div>
            @endif

            <!-- Conversation -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                @forelse($conversation as $message)
                    <div class="flex {{ $message['role'] === 'user' ? 'justify-end' : 'justify-start' }}">
                        <div class="max-w-[80%]">
                            @if($message['role'] === 'system')
                                <div class="text-center">
                                    <p class="text-xs text-zinc-500 dark:text-zinc-400 italic">{{ $message['content'] }}</p>
                                </div>
                            @elseif($message['role'] === 'user')
                                <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                                    <p class="text-sm">{{ $message['content'] }}</p>
                                </div>
                                <p class="text-xs text-zinc-400 mt-1 text-right">{{ $message['timestamp']->format('g:i A') }}</p>
                            @else
                                <div class="flex items-start gap-2">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <flux:icon.sparkles class="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div class="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                            <p class="text-sm text-zinc-900 dark:text-zinc-100">{{ $message['content'] }}</p>
                                        </div>
                                        <p class="text-xs text-zinc-400 mt-1">{{ $message['timestamp']->format('g:i A') }}</p>
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>
                @empty
                    <div class="flex items-center justify-center h-full text-zinc-400">
                        <div class="text-center">
                            <flux:icon.sparkles class="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p class="text-sm">Start a conversation with Skeemy</p>
                        </div>
                    </div>
                @endforelse

                <!-- Processing Indicator -->
                @if($isProcessing)
                    <div class="flex justify-start">
                        <div class="flex items-start gap-2">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                                <flux:icon.sparkles class="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div class="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div class="flex gap-1">
                                    <span class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                                    <span class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                                    <span class="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            </div>

            <!-- Input Area -->
            <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <form wire:submit.prevent="sendMessage" class="flex gap-2">
                    <input 
                        type="text" 
                        wire:model="userMessage"
                        placeholder="Ask Skeemy anything..."
                        class="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                        :disabled="$isProcessing">
                    <button 
                        type="submit"
                        :disabled="$isProcessing || empty(trim($userMessage))"
                        class="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <flux:icon.paper-airplane class="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
