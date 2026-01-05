@extends('layouts.landing')

@section('content')
<style>
    :root { 
        --bg-color: #0f0f14; 
        --text-color: #ffffff; 
        --text-muted: #9ca3af; 
        --border-color: rgba(255, 255, 255, 0.1); 
    }
    body { background: var(--bg-color); color: var(--text-color); }
    .feature-hero { padding: 5rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .feature-card { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 12px; }
    .feature-card:hover { border-color: rgba(255, 255, 255, 0.2); }
    .feature-card h3 { color: #fff; margin-bottom: 1rem; }
    .feature-card p { color: #d1d5db; font-size: 0.9rem; line-height: 1.6; }
    .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
</style>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
    });
</script>
@endpush

<section class="feature-hero">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <div data-aos="fade-up">
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Platform Overview</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px;">
                A complete, modern platform designed to simplify school management with intuitive tools for every user.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">What Makes Skeeme Different</h2>
        <p style="color: #9ca3af; margin-bottom: 3rem;">Built from the ground up for modern education.</p>
        
        <div class="feature-grid">
            <div class="feature-card" data-aos="zoom-in">
                <div class="feature-icon"><i class="fas fa-brain"></i></div>
                <h3>AI-Powered</h3>
                <p>Powered by advanced AI from DeepSeek and OpenAI. Automate grading, generate questions, and get intelligent insights.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-mobile-alt"></i></div>
                <h3>Mobile First</h3>
                <p>Fully responsive design works seamlessly across all devices. Take exams and manage your school on the go.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-bolt"></i></div>
                <h3>Lightning Fast</h3>
                <p>Optimized performance with minimal loading times. Quick responses keep your team productive and engaged.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-users-cog"></i></div>
                <h3>Scalable</h3>
                <p>Grows with your school. From 10 students to 10,000, Skeeme handles it all without compromising performance.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-lock"></i></div>
                <h3>Enterprise Security</h3>
                <p>Bank-level encryption, regular security audits, and compliance with education data standards. Your data is safe.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-headset"></i></div>
                <h3>24/7 Support</h3>
                <p>Dedicated support team ready to help. Live chat, email, and comprehensive documentation available round the clock.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Core Modules</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">📚 Exam Management</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Create, distribute, and grade exams with AI assistance. Support for multiple question types and adaptive testing.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">📊 Analytics & Reporting</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Comprehensive analytics with AI insights. Performance trends, question analysis, and learning progress tracking.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #06b6d4;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">👥 Attendance System</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">One-click attendance marking with pattern detection. Automated notifications and comprehensive reporting.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">👨‍🎓 Student Management</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Complete student profiles, enrollment management, and progress tracking in one centralized system.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #10b981;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">🎓 Course Delivery</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Organize courses, track curriculum progress, and manage learning materials all in one place.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #ef4444;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">💬 Communication</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Send messages, notifications, and alerts to students, parents, and staff. Keep everyone connected.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
            <div data-aos="fade-right">
                <h2 style="font-size: 2rem; color: #fff; margin-bottom: 1.5rem;">Trusted by Schools Worldwide</h2>
                <p style="color: #d1d5db; margin-bottom: 1.5rem; line-height: 1.8;">
                    Skeeme is used by schools across Africa and beyond to improve student outcomes, save teacher time, and make data-driven decisions.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem;">
                    <div style="background: rgba(51, 65, 85, 0.3); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <h3 style="font-size: 2rem; color: #3b82f6; margin-bottom: 0.5rem;">500+</h3>
                        <p style="color: #d1d5db; font-size: 0.9rem;">Schools using Skeeme</p>
                    </div>
                    <div style="background: rgba(51, 65, 85, 0.3); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <h3 style="font-size: 2rem; color: #8b5cf6; margin-bottom: 0.5rem;">50K+</h3>
                        <p style="color: #d1d5db; font-size: 0.9rem;">Students benefiting daily</p>
                    </div>
                </div>
            </div>
            <div data-aos="fade-left">
                <div style="background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #fff; margin-bottom: 1.5rem;">Platform Statistics</h4>
                    <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                        <li style="margin-bottom: 1rem;">✓ 99.9% uptime guarantee</li>
                        <li style="margin-bottom: 1rem;">✓ Millisecond response times</li>
                        <li style="margin-bottom: 1rem;">✓ 256-bit SSL encryption</li>
                        <li style="margin-bottom: 1rem;">✓ Daily automated backups</li>
                        <li style="margin-bottom: 1rem;">✓ GDPR & FERPA compliant</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1200px; padding: 0 2rem; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Ready to Modernize Your School?</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Join hundreds of schools transforming education with Skeeme.</p>
        <a href="{{ url('register') }}" class="btn-primary" style="padding: 0.75rem 2rem; background: #fff; color: #0A0A0B; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
            Start Your Free Trial
        </a>
    </div>
</section>

@endsection
