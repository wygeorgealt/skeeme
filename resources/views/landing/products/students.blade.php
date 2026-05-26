@extends('layouts.landing')

@section('title', 'Skeeme for Students | AI Study Assistant')

@section('content')
<div class="relative bg-[#FAFAFC] min-h-screen pt-32 pb-12 overflow-hidden font-sans">
    <!-- Background Decor (subtle glow) -->
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <!-- Main Hero Grid -->
        <div class="grid lg:grid-cols-12 gap-12 items-center mb-24">
            
            <!-- Left Column: Content -->
            <div class="lg:col-span-5" data-aos="fade-right" data-aos-duration="800">
                <!-- Pill -->
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-6 shadow-sm">
                    <svg class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
                    AI Study Companion for Students
                </div>
                
                <!-- Headline -->
                <h1 class="text-6xl lg:text-[5rem] font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-6">
                    Study smarter.<br>
                    <span class="text-blue-600">Score higher.</span>
                </h1>
                
                <!-- Subheadline -->
                <p class="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                    Snap questions, solve with AI, generate quizzes, revise with flashcards, and build study streaks.<br>
                    <span class="font-bold text-slate-800">Everything you need to <span class="text-indigo-600">ace your exams</span>.</span>
                </p>
                
                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-4 mb-8">

                    <!-- Google Play -->
                    <a href="https://play.google.com/store/apps/details?id=com.skeeme.app" class="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl transition-colors shadow-lg">
                        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.5 1.5L14.5 12L2.5 22.5V1.5Z" fill="#3BCAE6"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 12L21.5 16L18 19L14.5 12Z" fill="#D5163D"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M22 15.5L14.5 12L18 9L22 15.5Z" fill="#F4B400"/>
                            <path d="M14.5 12L2.5 1.5L12.5 7L14.5 12Z" fill="#25A054"/>
                        </svg>
                        <div class="text-left">
                            <div class="text-[11px] leading-tight text-slate-300">GET IT ON</div>
                            <div class="text-xl font-semibold leading-tight">Google Play</div>
                        </div>
                    </a>
                </div>

                <!-- Try Scan & Solve Link -->
                <a href="{{ route('register') }}" class="inline-flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl shadow-sm transition-colors mb-12 w-full max-w-sm group">
                    <div class="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                        <flux:icon.viewfinder-circle class="w-6 h-6" />
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-slate-900 text-lg">Try Scan & Solve</div>
                        <div class="text-slate-500 text-sm">See how it works in seconds</div>
                    </div>
                    <flux:icon.chevron-right class="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>

                <!-- Stats Box -->
                <div class="bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6">
                    <div class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 text-center lg:text-left">Trusted by thousands of students</div>
                    <div class="grid grid-cols-4 gap-4 text-center lg:text-left divide-x divide-slate-200/60">
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-yellow-500 mb-1">
                                <flux:icon.star class="w-4 h-4 fill-current" />
                                <span class="font-bold text-slate-900 text-xl">4.9</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium">App Rating</div>
                        </div>
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-blue-500 mb-1">
                                <flux:icon.chat-bubble-left-right class="w-4 h-4 fill-current" />
                                <span class="font-bold text-slate-900 text-xl">120K+</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium leading-tight">Questions<br>Solved</div>
                        </div>
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-green-500 mb-1">
                                <flux:icon.document-check class="w-4 h-4 fill-current" />
                                <span class="font-bold text-slate-900 text-xl">35K+</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium leading-tight">Quizzes<br>Generated</div>
                        </div>
                        <div class="px-2">
                            <div class="flex items-center justify-center lg:justify-start gap-1 text-purple-500 mb-1">
                                <flux:icon.academic-cap class="w-4 h-4 fill-current" />
                                <span class="font-bold text-slate-900 text-xl">40+</span>
                            </div>
                            <div class="text-xs text-slate-500 font-medium leading-tight">Schools<br>Worldwide</div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right Column: Hero Image -->
            <div class="lg:col-span-7 relative flex justify-center lg:justify-end" data-aos="fade-left" data-aos-duration="1000">
                <div class="relative w-full max-w-[800px] xl:max-w-[950px] lg:-mr-12 xl:-mr-24">
                    <img src="{{ asset('images/student_app_mockup.png') }}" class="w-full h-auto object-contain scale-[1.05] lg:scale-[1.15] origin-right mix-blend-multiply" alt="Skeeme App Experience" />
                </div>
            </div>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-200/60 pt-12 mb-20" data-aos="fade-up">
            <!-- Feature 1 -->
            <div class="flex items-start gap-4">
                <div class="bg-blue-50 text-blue-600 p-3.5 rounded-2xl shrink-0">
                    <flux:icon.camera class="w-7 h-7" />
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Snap & Solve</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Snap any question and get instant AI-powered step-by-step solutions.</p>
                </div>
            </div>
            <!-- Feature 2 -->
            <div class="flex items-start gap-4">
                <div class="bg-green-50 text-green-600 p-3.5 rounded-2xl shrink-0">
                    <flux:icon.document-text class="w-7 h-7" />
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Quiz Generator</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Turn notes, PDFs, and chapters into smart quizzes in seconds.</p>
                </div>
            </div>
            <!-- Feature 3 -->
            <div class="flex items-start gap-4">
                <div class="bg-yellow-50 text-yellow-600 p-3.5 rounded-2xl shrink-0">
                    <flux:icon.square-3-stack-3d class="w-7 h-7" />
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Smart Flashcards</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Revise efficiently with spaced repetition and smart flashcards.</p>
                </div>
            </div>
            <!-- Feature 4 -->
            <div class="flex items-start gap-4">
                <div class="bg-red-50 text-red-600 p-3.5 rounded-2xl shrink-0">
                    <flux:icon.fire class="w-7 h-7" />
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg mb-1">Study Streaks</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Build consistency, track progress, and stay motivated daily.</p>
                </div>
            </div>
        </div>

        <!-- CTA Banner -->
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8" data-aos="fade-up">
            <div class="flex items-center gap-6">
                <div class="bg-white p-4 rounded-full shadow-sm shrink-0">
                    <div class="bg-yellow-100 p-3 rounded-full text-yellow-500">
                        <flux:icon.trophy class="w-10 h-10" />
                    </div>
                </div>
                <div>
                    <h2 class="text-2xl md:text-3xl font-medium text-slate-900 mb-2">
                        Your best <span class="font-bold text-indigo-700">grades are one smart study away.</span>
                    </h2>
                    <p class="text-slate-600">Join thousands of students who are already studying smarter with Skeeme.</p>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
