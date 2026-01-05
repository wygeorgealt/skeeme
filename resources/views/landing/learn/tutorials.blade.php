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
    .tutorial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .tutorial-card { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 12px; transition: all 0.2s ease; }
    .tutorial-card:hover { border-color: rgba(255, 255, 255, 0.2); }
    .tutorial-icon { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
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

<section class="tutorial-hero">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <div data-aos="fade-up" style="text-align: center;">
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Video Tutorials</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                Learn Skeeme through our comprehensive video tutorials covering everything from basic setup to advanced features.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Coming Soon</h2>
        
        <div style="background: rgba(51, 65, 85, 0.3); padding: 4rem 2rem; border-radius: 12px; border: 2px dashed rgba(255, 255, 255, 0.1); text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1.5rem;">🎬</div>
            <h3 style="color: #fff; margin-bottom: 1rem;">Tutorial Library Coming Soon</h3>
            <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">
                We're working on creating comprehensive video tutorials for all Skeeme features. Stay tuned!
            </p>
            <p style="color: #9ca3af; margin-bottom: 2rem;">
                In the meantime, check out our <a href="{{ url('/learn/documentation') }}" style="color: #3b82f6; text-decoration: none;">documentation</a> and <a href="{{ url('/learn/blog') }}" style="color: #3b82f6; text-decoration: none;">blog</a> for helpful guides.
            </p>
            <a href="{{ url('contact') }}" style="padding: 0.75rem 2rem; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
                Request Tutorial Topics
            </a>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">What You'll Learn</h2>
        
        <div class="tutorial-grid">
            <div class="tutorial-card" data-aos="zoom-in">
                <div class="tutorial-icon"><i class="fas fa-play-circle"></i></div>
                <h3 style="color: #fff;">Getting Started</h3>
                <p style="color: #d1d5db; font-size: 0.9rem;">Step-by-step setup and first exam creation</p>
            </div>

            <div class="tutorial-card" data-aos="zoom-in" data-aos-delay="100">
                <div class="tutorial-icon"><i class="fas fa-graduation-cap"></i></div>
                <h3 style="color: #fff;">Exam Creation</h3>
                <p style="color: #d1d5db; font-size: 0.9rem;">Master exam design and question management</p>
            </div>

            <div class="tutorial-card" data-aos="zoom-in" data-aos-delay="200">
                <div class="tutorial-icon"><i class="fas fa-brain"></i></div>
                <h3 style="color: #fff;">AI Features</h3>
                <p style="color: #d1d5db; font-size: 0.9rem;">Using AI question generation and auto-grading</p>
            </div>

            <div class="tutorial-card" data-aos="zoom-in" data-aos-delay="300">
                <div class="tutorial-icon"><i class="fas fa-chart-bar"></i></div>
                <h3 style="color: #fff;">Analytics</h3>
                <p style="color: #d1d5db; font-size: 0.9rem;">Analyzing data and understanding insights</p>
            </div>

            <div class="tutorial-card" data-aos="zoom-in" data-aos-delay="400">
                <div class="tutorial-icon"><i class="fas fa-users"></i></div>
                <h3 style="color: #fff;">Student Management</h3>
                <p style="color: #d1d5db; font-size: 0.9rem;">Managing classes and student progress</p>
            </div>

            <div class="tutorial-card" data-aos="zoom-in" data-aos-delay="500">
                <div class="tutorial-icon"><i class="fas fa-cogs"></i></div>
                <h3 style="color: #fff;">Administration</h3>
                <p style="color: #d1d5db; font-size: 0.9rem;">Advanced settings and customization</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1200px; padding: 0 2rem; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Additional Resources</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">While you wait for our video tutorials, explore these helpful resources:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
            <a href="{{ url('/learn/blog') }}" style="text-decoration: none;">
                <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.2s ease;">
                    <h4 style="color: #fff; margin-bottom: 0.5rem;">📝 Blog</h4>
                    <p style="color: #9ca3af; font-size: 0.9rem;">Articles and best practices from experts</p>
                </div>
            </a>

            <a href="{{ url('/learn/community') }}" style="text-decoration: none;">
                <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.2s ease;">
                    <h4 style="color: #fff; margin-bottom: 0.5rem;">👥 Community</h4>
                    <p style="color: #9ca3af; font-size: 0.9rem;">Connect with other educators and experts</p>
                </div>
            </a>
        </div>
    </div>
</section>

@endsection
