<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        @include('partials.head')
        @fluxAppearance
    </head>
    <body class="min-h-screen bg-white dark:bg-zinc-800 antialiased">
        @include('livewire.partials.offline-indicator')
        <flux:sidebar 
            sticky 
            collapsible
            class="border-e border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
        >
            <flux:sidebar.header>
                <a href="{{ route('dashboard') }}" class="flex items-center space-x-2 rtl:space-x-reverse" wire:navigate>
                    <x-app-logo />
                </a>

                <flux:sidebar.collapse class="in-data-flux-sidebar-on-desktop:not-in-data-flux-sidebar-collapsed-desktop:-mr-2" />
            </flux:sidebar.header>

            <flux:sidebar.nav class="pt-6 space-y-12">

                <flux:navlist.group class="grid gap-5">
                    <template #heading>
                        <span class="block lg:block in-data-flux-sidebar-collapsed-desktop:hidden">{{ __('Platform') }}</span>
                    </template>
                    <flux:sidebar.item icon="home" :href="route('dashboard')" :current="request()->routeIs('dashboard')" wire:navigate>{{ __('Dashboard') }}</flux:sidebar.item>
                </flux:navlist.group>
                @if(auth()->user()->hasRole('admin'))
                <flux:navlist.group class="grid gap-5">
                    <flux:sidebar.item icon="squares-2x2" :href="route('classes-management')" :current="request()->routeIs('classes-management')" wire:navigate>{{ __('Classes') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="users" :href="route('students-management')" :current="request()->routeIs('students-management')" wire:navigate>{{ __('Students') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="user-group" :href="route('lecturer-management')" :current="request()->routeIs('lecturer-management')" wire:navigate>{{ __('Lecturers') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="megaphone" :href="route('announcements')" :current="request()->routeIs('announcements')" wire:navigate>{{ __('Announcements') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="calendar" :href="route('academic-calendar')" :current="request()->routeIs('academic-calendar')" wire:navigate>{{ __('Academic Calendar') }}</flux:sidebar.item>
                </flux:navlist.group>
                @elseif(auth()->user()->hasRole('lecturer'))
                <flux:navlist.group class="grid gap-4">
                    <flux:sidebar.item icon="academic-cap" :href="route('lecturer.courses')" wire:navigate>{{ __('My Courses') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="clipboard-document-check" :href="route('lecturer.attendance')" wire:navigate>{{ __('Attendance') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="book-open" :href="route('lecturer.curriculum')" wire:navigate>{{ __('Curriculum') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="document-text" :href="route('lecturer.notes')" wire:navigate>{{ __('Notes/Materials') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="document-magnifying-glass" :href="route('lecturer.exams')" wire:navigate>{{ __('Exams') }}</flux:sidebar.item>
                    @if(auth()->user()->canAccessFeature('messages'))
                    <flux:sidebar.item icon="chat-bubble-left-right" :href="route('lecturer.messages')" wire:navigate>{{ __('messages.Messages') }}</flux:sidebar.item>
                    @endif
                </flux:navlist.group>
                @elseif(auth()->user()->hasRole('student'))
                <flux:navlist.group class="grid gap-4">
                    <flux:sidebar.item icon="clipboard-document-check" :href="route('student.attendance')" wire:navigate>{{ __('My Attendance') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="calendar-days" :href="route('student.curriculum')" wire:navigate>{{ __('Course Plan') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="document-magnifying-glass" :href="route('student.exams')" wire:navigate>{{ __('My Exams') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="document-text" :href="route('student.notes')" wire:navigate>{{ __('Notes/Materials') }}</flux:sidebar.item>
                    <flux:sidebar.item icon="chart-bar" :href="route('student.grades')" wire:navigate>{{ __('My Grades') }}</flux:sidebar.item>
                    @if(auth()->user()->canAccessFeature('messages'))
                    <flux:sidebar.item icon="chat-bubble-left-right" :href="route('student.messages')" wire:navigate>{{ __('messages.Messages') }}</flux:sidebar.item>
                    @endif
                </flux:navlist.group>
                @endif
            </flux:sidebar.nav>

            <flux:sidebar.spacer />

            <!-- Desktop User Menu -->
            <flux:dropdown class="hidden lg:block" position="top" align="start">
                <flux:sidebar.profile
                    :name="auth()->user()->name"
                    avatar="https://ui-avatars.com/api/?name={{ auth()->user()->name }}&background=random"
                />

                <flux:menu class="w-[220px]">
                    <flux:menu.radio.group>
                        <div class="p-0 text-sm font-normal">
                            <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <span class="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white flex items-center justify-center">
                                    {{ auth()->user()->initials() }}
                                </span>

                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    <span class="truncate font-semibold">{{ auth()->user()->name }}</span>
                                    <span class="truncate text-xs">{{ auth()->user()->email }}</span>
                                </div>
                            </div>
                        </div>
                    </flux:menu.radio.group>

                    <flux:menu.separator />

                    <flux:menu.radio.group>
                        @if(auth()->user()->hasRole('admin'))
                            <flux:menu.item :href="route('admin.school-configuration')" icon="cog" wire:navigate>{{ __('messages.Settings') }}</flux:menu.item>
                        @else
                            <flux:menu.item :href="route('profile.edit')" icon="cog" wire:navigate>{{ __('messages.Settings') }}</flux:menu.item>
                        @endif
                    </flux:menu.radio.group>

                    <flux:menu.separator />

                    <form method="POST" action="{{ route('logout') }}" class="w-full">
                        @csrf
                        <flux:menu.item as="button" type="submit" icon="arrow-right-start-on-rectangle" class="w-full" data-test="logout-button">
                            {{ __('messages.Log Out') }}
                        </flux:menu.item>
                    </form>
                </flux:menu>
            </flux:dropdown>
        </flux:sidebar>

        <!-- Mobile User Menu -->
        <flux:header class="lg:hidden">
            <flux:sidebar.toggle class="lg:hidden" icon="bars-2" inset="left" />

            <flux:spacer />

            <flux:dropdown position="top" align="end">
                <flux:profile
                    :initials="auth()->user()->initials()"
                    icon-trailing="chevron-down"
                />

                <flux:menu>
                    <flux:menu.radio.group>
                        <div class="p-0 text-sm font-normal">
                            <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <span class="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white flex items-center justify-center">
                                    {{ auth()->user()->initials() }}
                                </span>

                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    <span class="truncate font-semibold">{{ auth()->user()->name }}</span>
                                    <span class="truncate text-xs">{{ auth()->user()->email }}</span>
                                </div>
                            </div>
                        </div>
                    </flux:menu.radio.group>

                    <flux:menu.separator />

                    <flux:menu.radio.group>
                        @if(auth()->user()->hasRole('admin'))
                            <flux:menu.item :href="route('admin.school-configuration')" icon="cog" wire:navigate>{{ __('messages.Settings') }}</flux:menu.item>
                        @else
                            <flux:menu.item :href="route('profile.edit')" icon="cog" wire:navigate>{{ __('messages.Settings') }}</flux:menu.item>
                        @endif
                    </flux:menu.radio.group>

                    <flux:menu.separator />

                    <form method="POST" action="{{ route('logout') }}" class="w-full">
                        @csrf
                        <flux:menu.item as="button" type="submit" icon="arrow-right-start-on-rectangle" class="w-full" data-test="logout-button">
                            {{ __('messages.Log Out') }}
                        </flux:menu.item>
                    </form>
                </flux:menu>
            </flux:dropdown>
        </flux:header>

        {{ $slot }}

        @fluxScripts

        <!-- Toast Notifications -->
        @livewire('toast-notification')

        <style>
            /* Ultra-Premium Toast Notification Styles */
            .toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 16px;
                pointer-events: none;
            }

            .toast {
                pointer-events: auto;
                min-width: 340px;
                max-width: 440px;
                background: rgba(255, 255, 255, 0.75);
                backdrop-filter: blur(20px) saturate(200%);
                -webkit-backdrop-filter: blur(20px) saturate(200%);
                border: 1px solid rgba(255, 255, 255, 0.4);
                border-radius: 24px;
                padding: 18px 22px;
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.15),
                    0 0 0 1px rgba(0, 0, 0, 0.02);
                display: flex;
                align-items: center;
                gap: 18px;
                transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                animation: toastEntrance 0.6s cubic-bezier(0.19, 1, 0.22, 1);
                overflow: hidden;
                position: relative;
            }

            @keyframes toastEntrance {
                from { transform: translateX(100px) scale(0.9); opacity: 0; }
                to { transform: translateX(0) scale(1); opacity: 1; }
            }

            @keyframes toastExit {
                from { transform: translateX(0) scale(1); opacity: 1; }
                to { transform: translateX(100px) scale(0.9); opacity: 0; }
            }

            .toast.removing {
                animation: toastExit 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            }

            .toast-icon-box {
                width: 44px;
                height: 44px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 1.3rem;
                position: relative;
                color: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            /* Vibrant Brand Gradients */
            .toast.success .toast-icon-box { background: linear-gradient(135deg, #10b981, #059669); }
            .toast.error .toast-icon-box { background: linear-gradient(135deg, #ef4444, #dc2626); }
            .toast.warning .toast-icon-box { background: linear-gradient(135deg, #f59e0b, #d97706); }
            .toast.info .toast-icon-box { background: linear-gradient(135deg, #3b82f6, #2563eb); }

            .toast-body { flex: 1; min-width: 0; }
            
            .toast-header {
                font-size: 15px;
                font-weight: 800;
                color: #111827;
                margin-bottom: 2px;
                letter-spacing: -0.02em;
            }

            .toast-desc {
                font-size: 13px;
                color: #4b5563;
                font-weight: 600;
                line-height: 1.4;
            }

            .toast-close-btn {
                width: 32px;
                height: 32px;
                border-radius: 10px;
                color: #9ca3af;
                transition: all 0.3s;
                background: rgba(0, 0, 0, 0.03);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .toast-close-btn:hover {
                background: rgba(0, 0, 0, 0.08);
                color: #111827;
                transform: rotate(90deg);
            }

            /* Progress Bar for Duration */
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 4px;
                width: 100%;
                background: rgba(0, 0, 0, 0.05);
            }

            .toast-progress-bar {
                height: 100%;
                width: 100%;
                transform-origin: left;
            }

            .toast.success .toast-progress-bar { background: #10b981; }
            .toast.error .toast-progress-bar { background: #ef4444; }
            .toast.warning .toast-progress-bar { background: #f59e0b; }
            .toast.info .toast-progress-bar { background: #3b82f6; }

            /* Dark Mode Overrides */
            .dark .toast {
                background: rgba(24, 24, 27, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45);
            }

            .dark .toast-header { color: #f9fafb; }
            .dark .toast-desc { color: #9ca3af; }
            .dark .toast-close-btn { background: rgba(255, 255, 255, 0.05); }
            .dark .toast-close-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
            .dark .toast-progress { background: rgba(255, 255, 255, 0.05); }
        </style>

        <script>
            // Custom Toast Notification System
            if (typeof window.toastManager === 'undefined') {
                class ToastNotificationManager {
                    constructor() {
                        this.container = null;
                        this.init();
                    }

                    init() {
                        if (!document.getElementById('toast-container')) {
                            this.container = document.createElement('div');
                            this.container.id = 'toast-container';
                            this.container.className = 'toast-container';
                            document.body.appendChild(this.container);
                        } else {
                            this.container = document.getElementById('toast-container');
                        }
                    }

                    getIconClass(type) {
                        const icons = {
                            success: 'fa-solid fa-check',
                            error: 'fa-solid fa-xmark',
                            warning: 'fa-solid fa-exclamation',
                            info: 'fa-solid fa-info'
                        };
                        return icons[type] || icons.info;
                    }

                    show(data) {
                        const type = data.type || 'info';
                        const message = data.message || '';
                        const title = data.title || '';
                        const duration = data.duration || 5000;
                        const action = data.action || null;

                        const toast = document.createElement('div');
                        toast.className = `toast ${type}`;

                        const iconBox = document.createElement('div');
                        iconBox.className = 'toast-icon-box';
                        
                        const icon = document.createElement('i');
                        icon.className = this.getIconClass(type);
                        iconBox.appendChild(icon);

                        const body = document.createElement('div');
                        body.className = 'toast-body';

                        if (title) {
                            const header = document.createElement('div');
                            header.className = 'toast-header';
                            header.textContent = title;
                            body.appendChild(header);
                        }

                        const desc = document.createElement('div');
                        desc.className = 'toast-desc';
                        desc.textContent = message;
                        body.appendChild(desc);

                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'toast-close-btn';
                        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                        closeBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.remove(toast);
                        };

                        const progress = document.createElement('div');
                        progress.className = 'toast-progress';
                        const progressBar = document.createElement('div');
                        progressBar.className = 'toast-progress-bar';
                        progress.appendChild(progressBar);

                        toast.appendChild(iconBox);
                        toast.appendChild(body);
                        toast.appendChild(closeBtn);
                        toast.appendChild(progress);

                        this.container.appendChild(toast);

                        // Progress Bar Animation
                        progressBar.animate([
                            { transform: 'scaleX(1)' },
                            { transform: 'scaleX(0)' }
                        ], {
                            duration: duration,
                            easing: 'linear'
                        });

                        if (duration > 0) {
                            setTimeout(() => this.remove(toast), duration);
                        }

                        if (action) {
                            toast.style.cursor = 'pointer';
                            toast.onclick = () => {
                                if (action.url) {
                                    window.location.href = action.url;
                                }
                                if (data.notification_id) {
                                    Livewire.dispatch('handleToastAction', { notificationId: data.notification_id });
                                }
                            };
                        }
                    }

                    remove(toast) {
                        if (toast.parentElement) {
                            toast.classList.add('removing');
                            setTimeout(() => toast.remove(), 500);
                        }
                    }
                }

                window.toastManager = new ToastNotificationManager();

                document.addEventListener('livewire:init', () => {
                    Livewire.on('showToastr', (data) => window.toastManager.show(data));
                });

                if (typeof Livewire !== 'undefined' && Livewire.on) {
                    Livewire.on('showToastr', (data) => window.toastManager.show(data));
                }
            }
        </script>
    </body>
</html>
