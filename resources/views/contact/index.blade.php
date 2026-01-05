@extends('layouts.landing')

@section('content')
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Contact Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Connect with us</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Let's talk about <br> 
                    <span class="text-gradient">your school.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Have questions about Skeeme? Our team is ready to help you transform your school's management.
                </p>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <section class="relative z-10 py-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <!-- Contact Form -->
                <div data-aos="fade-right">
                    <div class="premium-card p-10">
                        <div class="mb-10">
                            <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Send us a message</h2>
                            <p class="text-sm text-slate-500 font-medium">We usually respond within 2-4 business hours.</p>
                        </div>

                        @if (session('success'))
                            <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-6 mb-8 flex items-center gap-4">
                                <div class="size-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <flux:icon.check variant="micro" />
                                </div>
                                <p class="text-sm font-bold">{{ session('success') }}</p>
                            </div>
                        @endif

                        <form action="{{ route('contact.store') }}" method="POST" class="space-y-6">
                            @csrf
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <flux:input label="Full Name" name="name" placeholder="John Doe" value="{{ old('name') }}" required class="!rounded-xl" />
                                <flux:input label="Email Address" type="email" name="email" placeholder="john@school.edu" value="{{ old('email') }}" required class="!rounded-xl" />
                            </div>

                            <flux:input label="Subject" name="subject" placeholder="General Inquiry" value="{{ old('subject') }}" required class="!rounded-xl" />
                            
                            <flux:textarea label="Your Message" name="message" placeholder="How can we help?" rows="6" required class="!rounded-xl" />

                            <flux:button type="submit" variant="primary" class="w-full !rounded-2xl !py-4 font-extrabold shadow-xl shadow-indigo-100">
                                Send Message <flux:icon.paper-airplane variant="micro" class="ml-2" />
                            </flux:button>
                        </form>
                    </div>
                </div>

                <!-- Contact Info -->
                <div class="space-y-8" data-aos="fade-left">
                    <div class="group cursor-pointer">
                        <div class="premium-card p-8 flex items-start gap-6 group-hover:border-indigo-500/20 group-hover:bg-indigo-50/10 transition-all">
                            <div class="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-extrabold text-slate-900 mb-1">Email Support</h3>
                                <p class="text-sm text-slate-500 font-medium mb-4">For general inquiries and support requests.</p>
                                <a href="mailto:support@skeeme.com" class="text-sm font-black text-indigo-600 uppercase tracking-widest no-underline">support@skeeme.com</a>
                            </div>
                        </div>
                    </div>

                    <div class="group cursor-pointer">
                        <div class="premium-card p-8 flex items-start gap-6 group-hover:border-blue-500/20 group-hover:bg-blue-50/10 transition-all">
                            <div class="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-extrabold text-slate-900 mb-1">Phone Sales</h3>
                                <p class="text-sm text-slate-500 font-medium mb-4">Mon-Fri from 8am to 5pm (GMT+1).</p>
                                <a href="tel:+2347031278247" class="text-sm font-black text-blue-600 uppercase tracking-widest no-underline">+(234) 703 1278 247</a>
                            </div>
                        </div>
                    </div>

                    <div class="group cursor-pointer">
                        <div class="premium-card p-8 flex items-start gap-6 group-hover:border-emerald-500/20 group-hover:bg-emerald-50/10 transition-all">
                            <div class="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
                                <i class="fas fa-location-dot"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-extrabold text-slate-900 mb-1">Office</h3>
                                <p class="text-sm text-slate-500 font-medium mb-4">Lagos, Nigeria</p>
                                <span class="text-sm font-black text-emerald-600 uppercase tracking-widest">Visit us anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Map or Image -->
    <section class="pb-32 px-6">
        <div class="max-w-7xl mx-auto h-96 premium-card relative overflow-hidden flex items-center justify-center bg-slate-900">
             <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
             <div class="relative z-10 text-center">
                 <h4 class="text-4xl font-extrabold text-white tracking-tight mb-4 italic">"Transforming Education, <br>One School at a Time."</h4>
             </div>
        </div>
    </section>
</div>
@endsection
