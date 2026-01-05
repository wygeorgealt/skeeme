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
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Documentation</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px;">
                Comprehensive guides, tutorials, and resources to help you get the most out of Skeeme.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">Documentation Hub</h2>
        <p style="color: #9ca3af; margin-bottom: 3rem;">Everything you need to know about using and integrating Skeeme.</p>
        
        <div class="feature-grid">
            <div class="feature-card" data-aos="zoom-in">
                <div class="feature-icon"><i class="fas fa-book"></i></div>
                <h3>User Guides</h3>
                <p>Step-by-step guides for students, teachers, and administrators. Learn how to use every feature effectively.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-graduation-cap"></i></div>
                <h3>Getting Started</h3>
                <p>Quick start guides to set up your school, create your first exam, and onboard users to the platform.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-code"></i></div>
                <h3>API Reference</h3>
                <p>Complete API documentation with endpoint descriptions, parameters, responses, and code examples.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-tools"></i></div>
                <h3>Integration Guides</h3>
                <p>Step-by-step instructions for integrating with popular SIS systems, learning management systems, and tools.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-question-circle"></i></div>
                <h3>FAQ & Troubleshooting</h3>
                <p>Answers to common questions and solutions for typical issues. Self-service support 24/7.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-video"></i></div>
                <h3>Video Tutorials</h3>
                <p>Visual walkthroughs of key features. Learn by watching experienced users demonstrate workflows.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Common Topics</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">📋 Setup & Administration</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Initial Setup Wizard</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">User Roles & Permissions</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">School Configuration</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Bulk User Import</a></li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">🎯 Exam Management</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Creating Exams</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Question Banks</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">AI Question Generation</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Exam Settings & Security</a></li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">📊 Grading & Analytics</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Auto Grading with AI</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Grade Review & Approval</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Analytics Dashboard</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Exporting Reports</a></li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">👥 Student Management</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Enrollment & Classes</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Attendance Tracking</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Grade Management</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Progress Reports</a></li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">🔧 Developer Resources</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">API Authentication</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Webhook Setup</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">SDKs & Libraries</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Error Handling</a></li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">🔐 Security & Compliance</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Data Security</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Privacy & GDPR</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Access Controls</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="#" style="color: #d1d5db; text-decoration: none;">Audit Logging</a></li>
                </ul>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
            <div data-aos="fade-right">
                <h2 style="font-size: 2rem; color: #fff; margin-bottom: 1.5rem;">Knowledge Base</h2>
                <p style="color: #d1d5db; margin-bottom: 1.5rem; line-height: 1.8;">
                    Search our extensive knowledge base with hundreds of articles covering every aspect of Skeeme. From basic setup to advanced configurations.
                </p>
                <ul style="list-style: none; color: #d1d5db;">
                    <li style="margin-bottom: 1rem;"><i class="fas fa-search" style="color: #10b981; margin-right: 0.5rem;"></i> Full-text search across all articles</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-tags" style="color: #10b981; margin-right: 0.5rem;"></i> Organized by topic and user role</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-star" style="color: #10b981; margin-right: 0.5rem;"></i> Frequently updated with new content</li>
                </ul>
            </div>
            <div data-aos="fade-left">
                <div style="background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #fff; margin-bottom: 1.5rem;">📞 Getting Help</h4>
                    <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0;">
                        <li style="margin-bottom: 1rem;">
                            <strong style="color: #fff;">Email Support:</strong><br>
                            <a href="mailto:support@skeeme.io" style="color: #3b82f6; text-decoration: none;">support@skeeme.io</a>
                        </li>
                        <li style="margin-bottom: 1rem;">
                            <strong style="color: #fff;">Live Chat:</strong><br>
                            Available in-app during business hours
                        </li>
                        <li>
                            <strong style="color: #fff;">Community Forum:</strong><br>
                            Connect with other users and experts
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1200px; padding: 0 2rem; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Get the Help You Need</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Access documentation, FAQs, and support resources anytime.</p>
        <a href="{{ url('contact') }}" class="btn-primary" style="padding: 0.75rem 2rem; background: #fff; color: #0A0A0B; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
            Contact Support
        </a>
    </div>
</section>

@endsection
