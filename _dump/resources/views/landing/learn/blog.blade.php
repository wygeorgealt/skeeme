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
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .blog-card { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 12px; transition: all 0.2s ease; display: flex; flex-direction: column; }
    .blog-card:hover { border-color: rgba(255, 255, 255, 0.2); transform: translateY(-5px); }
    .blog-card h3 { color: #fff; margin-bottom: 0.5rem; }
    .blog-card p { color: #d1d5db; font-size: 0.9rem; line-height: 1.6; flex-grow: 1; }
    .blog-meta { color: #9ca3af; font-size: 0.85rem; margin-bottom: 1rem; }
    .blog-tag { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; border-radius: 20px; color: #3b82f6; font-size: 0.75rem; margin-right: 0.5rem; margin-bottom: 13px;}
</style>
<section class="blog-hero">
    <div class="container" style="max-width: 1000px; padding: 0 2rem; margin: 0 auto;">
        <div data-aos="fade-up" style="text-align: center;">
            <br><br><br>
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Blog & Articles</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                Insights, best practices, and updates from the Skeeme team about modern education technology.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1000px; padding: 0 2rem; margin: 0 auto;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Latest Articles</h2>
        
        <div class="blog-grid">
            <div class="blog-card" data-aos="zoom-in">
                <span class="blog-tag">Education</span>
                <h3>AI-Powered Education: The Future is Here</h3>
                <p>Explore how artificial intelligence is transforming education by automating grading, personalizing learning experiences, and providing actionable insights to teachers.</p>
                <div class="blog-meta">
                    <i class="fas fa-calendar"></i> Nov 15, 2024 • 8 min read
                </div>
                <a href="{{ route('learn.blog.ai-powered-education') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Article →</a>
            </div>

            <div class="blog-card" data-aos="zoom-in" data-aos-delay="100">
                <span class="blog-tag">Best Practices</span>
                <h3>5 Ways to Use Analytics to Improve Student Outcomes</h3>
                <p>Learn from education leaders on using data analytics to identify struggling students early, personalize interventions, and track improvement over time.</p>
                <div class="blog-meta">
                    <i class="fas fa-calendar"></i> Nov 8, 2024 • 6 min read
                </div>
                <a href="{{ route('learn.blog.analytics-improve-outcomes') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Article →</a>
            </div>

            <div class="blog-card" data-aos="zoom-in" data-aos-delay="200">
                <span class="blog-tag">Product</span>
                <h3>Announcing: New Analytics Dashboard</h3>
                <p>Introducing our completely redesigned analytics dashboard with real-time metrics, customizable reports, and AI-powered recommendations for educators.</p>
                <div class="blog-meta">
                    <i class="fas fa-calendar"></i> Nov 1, 2024 • 4 min read
                </div>
                <a href="{{ route('learn.blog.new-analytics-dashboard') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Article →</a>
            </div>

            <div class="blog-card" data-aos="zoom-in" data-aos-delay="300">
                <span class="blog-tag">Case Study</span>
                <h3>How Lagos Secondary School Saved 20 Hours/Week with Skeeme</h3>
                <p>Real-world case study of how a large secondary school in Lagos reduced administrative burden by 80% and improved student outcomes in one semester.</p>
                <div class="blog-meta">
                    <i class="fas fa-calendar"></i> Oct 25, 2024 • 10 min read
                </div>
                <a href="{{ route('learn.blog.lagos-secondary-case-study') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Article →</a>
            </div>

            <div class="blog-card" data-aos="zoom-in" data-aos-delay="400">
                <span class="blog-tag">Education</span>
                <h3>The Future of Exam Security: Preventing Cheating with Technology</h3>
                <p>Discover the security measures that make online exams safe and reliable, protecting exam integrity while maintaining student privacy.</p>
                <div class="blog-meta">
                    <i class="fas fa-calendar"></i> Oct 18, 2024 • 7 min read
                </div>
                <a href="{{ route('learn.blog.exam-security-preventing-cheating') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Article →</a>
            </div>

            <div class="blog-card" data-aos="zoom-in" data-aos-delay="500">
                <span class="blog-tag">Tips</span>
                <h3>Creating Effective Online Exams: A Teacher's Guide</h3>
                <p>Practical tips for creating engaging online exams that accurately assess student learning. Learn from experienced educators about question design and timing.</p>
                <div class="blog-meta">
                    <i class="fas fa-calendar"></i> Oct 11, 2024 • 9 min read
                </div>
                <a href="{{ route('learn.blog.creating-effective-online-exams') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Article →</a>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 900px; padding: 0 2rem; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 1.5rem;">Stay Updated</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Subscribe to our newsletter for weekly insights on education technology and product updates.</p>
        <div style="display: flex; gap: 1rem; max-width: 500px; margin: 0 auto;">
            <input type="email" placeholder="Your email address" style="flex: 1; padding: 0.75rem 1rem; background: rgba(51, 65, 85, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 1rem;">
            <button style="padding: 0.75rem 2rem; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Subscribe</button>
        </div>
    </div>
</section>

@endsection

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