@extends('layouts.landing')

@section('title', 'Skeeme for Students | AI Study Assistant')

@section('content')
<div class="relative bg-white min-h-screen pt-32 lg:pt-40 pb-12 overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0">
        <div class="absolute -top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-50/60 blur-[100px]"></div>
        <div class="absolute top-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-50/60 blur-[100px]"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 relative z-10 lg:pl-12">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[70vh]">
            
            <!-- Left Content: Hero Text -->
            <div data-aos="fade-right" data-aos-duration="800">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                    <span class="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    <span class="text-xs font-bold text-indigo-900 tracking-wide uppercase">Launching Soon</span>
                </div>
                
                <h1 class="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                    Ace your exams <br> <span class="text-gradient">with AI.</span>
                </h1>
                
                <p class="text-lg text-slate-500 font-medium leading-relaxed mb-8 max-w-lg">
                    Turn your messy notes into practice quizzes, instantly solve complex questions with your camera, and master any subject with the ultimate study companion.
                </p>

                <!-- Features List -->
                <ul class="space-y-4 mb-10 max-w-md">
                    <li class="flex items-start gap-3">
                        <div class="mt-1 bg-indigo-100 p-1 rounded-full"><flux:icon.camera class="size-4 text-indigo-600"/></div>
                        <div>
                            <strong class="text-slate-900 block">Snap to Solve</strong>
                            <span class="text-slate-500 text-sm">Scan any math or accounting problem for step-by-step AI solutions.</span>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <div class="mt-1 bg-indigo-100 p-1 rounded-full"><flux:icon.document-text class="size-4 text-indigo-600"/></div>
                        <div>
                            <strong class="text-slate-900 block">PDF to Quizzes</strong>
                            <span class="text-slate-500 text-sm">Upload handouts and instantly generate mock exams to test yourself.</span>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <div class="mt-1 bg-indigo-100 p-1 rounded-full"><flux:icon.bolt class="size-4 text-indigo-600"/></div>
                        <div>
                            <strong class="text-slate-900 block">Smart Flashcards</strong>
                            <span class="text-slate-500 text-sm">Spaced repetition to make sure you never forget definitions before finals.</span>
                        </div>
                    </li>
                </ul>
                
                <!-- Store Badges -->
                <div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    <!-- Apple App Store Badge Mock -->
                    <div class="flex items-center justify-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-800 hover:opacity-90 transition-opacity w-fit select-none shadow-lg cursor-pointer">
                        <svg class="size-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.92 13.9c.02 3.12 2.67 4.14 2.7 4.16-.02.05-.42 1.44-1.42 2.89-1.01 1.48-2.07 2.95-3.69 2.98-1.61.03-2.12-.97-3.95-.97-1.84 0-2.4.94-3.92 1.01-1.57.07-2.77-1.55-3.79-3.03-2.1-3.03-3.71-8.56-1.57-12.27 1.06-1.84 2.94-3.01 4.98-3.04 1.57-.03 3.03 1.05 3.99 1.05.95 0 2.68-1.3 4.54-1.11 1.95.2 3.51 1.07 4.49 2.6-.08.05-2.69 1.53-2.7 4.62M14.77 4.09c.87-1.04 1.46-2.5 1.3-3.95-1.28.05-2.82.85-3.72 1.93-.81.95-1.49 2.45-1.3 3.86 1.44.11 2.85-.75 3.72-1.84"/>
                        </svg>
                        <div class="text-left">
                            <div class="text-[10px] leading-tight text-slate-300">Download on the</div>
                            <div class="text-lg font-semibold leading-tight tracking-tight">App Store</div>
                        </div>
                    </div>
                    
                    <!-- Google Play Badge Mock -->
                    <div class="flex items-center justify-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-800 hover:opacity-90 transition-opacity w-fit select-none shadow-lg whitespace-nowrap cursor-pointer">
                        <svg class="size-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 1.5L14.5 12L2.5 22.5V1.5Z" fill="#3BCAE6"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 12L21.5 16L18 19L14.5 12Z" fill="#D5163D"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M22 15.5L14.5 12L18 9L22 15.5Z" fill="#F4B400"/>
                            <path d="M14.5 12L2.5 1.5L12.5 7L14.5 12Z" fill="#25A054"/>
                        </svg>
                        <div class="text-left">
                            <div class="text-[10px] leading-tight text-slate-300">GET IT ON</div>
                            <div class="text-lg font-semibold leading-tight tracking-tight">Google Play</div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right Content: Mobile Phone Mockup -->
            <div class="relative lg:h-[700px] flex justify-center items-center" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                <!-- Decorative rings around phone -->
                <div class="absolute w-[120%] h-[120%] bg-indigo-50 rounded-full blur-3xl opacity-50 z-0"></div>
                
                <!-- Phone Silhouette Frame -->
                <div class="relative z-10 w-[300px] lg:w-[340px] aspect-[9/19] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-indigo-500/20 border-4 border-slate-800 rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                    <!-- Notch -->
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-30"></div>
                    
                    <!-- Screen Container inside Phone -->
                    <div class="w-full h-full bg-slate-50 rounded-[2.25rem] overflow-hidden relative border border-slate-800/50">
                        <img src="{{ asset('images/student_app_mockup.png') }}" class="w-full h-full object-cover" alt="Skeeme App Screenshot" />
                    </div>
                </div>

                <!-- Floating Badge 1 -->
                <div class="absolute -left-6 lg:-left-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 animate-bounce" style="animation-duration: 3s;">
                    <div class="flex items-center gap-3">
                        <div class="bg-green-100 bg-opacity-50 p-2 rounded-full"><flux:icon.check-circle class="size-5 text-green-600"/></div>
                        <div>
                            <div class="text-sm font-bold text-slate-900">A+ Scored</div>
                            <div class="text-xs text-slate-500">Physics Midterm</div>
                        </div>
                    </div>
                </div>

                <!-- Floating Badge 2 -->
                <div class="absolute -right-4 lg:-right-8 bottom-1/3 bg-slate-900 p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 border border-slate-800 z-20 animate-bounce" style="animation-duration: 4s; animation-delay: 1s;">
                    <div class="flex items-center gap-3">
                        <div class="text-indigo-400 font-extrabold text-xl">15</div>
                        <div class="text-xs font-medium text-white max-w-[80px] leading-tight">Day Study Streak</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
@endsection

