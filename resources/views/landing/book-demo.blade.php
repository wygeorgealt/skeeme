@extends('layouts.landing')

@section('content')
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Personalized Walkthrough</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    See Skeeme in <br> 
                    <span class="text-gradient">action.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Book a live demo with our education specialists to see how Skeeme can transform your institution.
                </p>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <section class="relative z-10 py-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <!-- Book Demo Form -->
                <div data-aos="fade-right">
                    <div class="premium-card p-10">
                        <div class="mb-10">
                            <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Schedule your demo</h2>
                            <p class="text-sm text-slate-500 font-medium">Fill out the form and we'll be in touch to schedule a time that works for you.</p>
                        </div>

                        @if (session('success'))
                            <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-6 mb-8 flex items-center gap-4">
                                <div class="size-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <flux:icon.check variant="micro" />
                                </div>
                                <p class="text-sm font-bold">{{ session('success') }}</p>
                            </div>
                        @endif

                        <form action="{{ route('book-demo.store') }}" method="POST" class="space-y-6">
                            @csrf
                            <flux:input label="Full Name" name="name" placeholder="John Doe" value="{{ old('name') }}" required class="!rounded-xl" />
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <flux:input label="School Name" name="school_name" placeholder="Springfield High" value="{{ old('school_name') }}" required class="!rounded-xl" />
                                <flux:input label="Role" name="role" placeholder="Principal / Administrator" value="{{ old('role') }}" class="!rounded-xl" />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <flux:input label="Email Address" type="email" name="email" placeholder="john@school.edu" value="{{ old('email') }}" required class="!rounded-xl" />
                                <flux:input label="Phone Number" type="tel" name="phone" placeholder="+234..." value="{{ old('phone') }}" class="!rounded-xl" />
                            </div>
                            
                            <flux:textarea label="What are you looking to improve?" name="message" placeholder="e.g. Automated grading, Attendance tracking..." rows="4" class="!rounded-xl" />

                            <flux:button type="submit" variant="primary" class="w-full !rounded-2xl !py-4 font-extrabold shadow-xl shadow-indigo-100">
                                Request Demo <flux:icon.arrow-right variant="micro" class="ml-2" />
                            </flux:button>
                        </form>
                    </div>
                </div>

                <!-- Info Column -->
                <div class="space-y-12" data-aos="fade-left">
                    <div class="space-y-6">
                        <h3 class="text-xl font-extrabold text-slate-900">What to expect?</h3>
                        
                        <div class="flex items-start gap-4">
                            <div class="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                1
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 mb-1">Tailored Walkthrough</div>
                                <div class="text-sm text-slate-500 font-medium">We'll show you features relevant to your specific challenges.</div>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                2
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 mb-1">Pricing Discussion</div>
                                <div class="text-sm text-slate-500 font-medium">Get a clear understanding of costs and plans suitable for your institution size.</div>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                3
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 mb-1">Q&A Session</div>
                                <div class="text-sm text-slate-500 font-medium">Ask any technical or operational questions you have.</div>
                            </div>
                        </div>
                    </div>

                    <div class="premium-card p-8 bg-slate-900 text-white">
                        <h3 class="text-lg font-extrabold mb-4">Trusted by modern schools</h3>
                        <p class="text-slate-400 text-sm font-medium mb-6">
                            Join the institutions that have modernized their operations with Skeeme.
                        </p>
                        <div class="flex flex-wrap gap-4 opacity-50 grayscale">
                            <!-- Placeholders for logos if needed, or just text -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
