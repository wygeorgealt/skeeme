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
    .resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .resource-card { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
    .resource-card:hover { border-color: rgba(255, 255, 255, 0.2); transform: translateY(-5px); }
    .resource-card h3 { color: #fff; margin-bottom: 1rem; }
    .resource-card p { color: #d1d5db; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }
    .resource-icon { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .category-badge { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; border-radius: 20px; color: #3b82f6; font-size: 0.75rem; margin-bottom: 0.5rem; }
</style>

<section class="resource-hero">
    <div class="container" style="max-width: 1000px; padding: 0 2rem; margin: 0 auto;">
        <div data-aos="fade-up" style="text-align: center;">
            <br><br>
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Documentation & Guides</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                Complete guides, tutorials, and documentation to help you master Skeeme and maximize your school's potential.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1000px; padding: 0 2rem; margin: 0 auto;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Get Started</h2>
        
        <div class="resource-grid">
            <div class="resource-card" data-aos="zoom-in">
                <span class="category-badge">Getting Started</span>
                <div class="resource-icon"><i class="fas fa-rocket"></i></div>
                <h3>Initial Setup Guide</h3>
                <p>Step-by-step walkthrough to set up your Skeeme account, configure your school, and onboard users in minutes.</p>
                <a href="{{ url('learn/documentation/initial-setup-guide') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="100">
                <span class="category-badge">Getting Started</span>
                <div class="resource-icon"><i class="fas fa-graduation-cap"></i></div>
                <h3>Creating Your First Exam</h3>
                <p>Complete walkthrough for creating, configuring, and publishing your first exam on Skeeme in under 10 minutes.</p>
                <a href="{{ url('learn/documentation/creating-first-exam') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1000px; padding: 0 2rem; margin: 0 auto;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Feature Guides</h2>
        
        <div class="resource-grid">
            <div class="resource-card" data-aos="zoom-in">
                <span class="category-badge">Exams</span>
                <div class="resource-icon"><i class="fas fa-file-alt"></i></div>
                <h3>Exam Management Basics</h3>
                <p>Learn how to create question pools, manage questions, set exam settings, and control who can take your exams.</p>
                <a href="{{ url('learn/documentation/exam-management-basics') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="100">
                <span class="category-badge">AI Features</span>
                <div class="resource-icon"><i class="fas fa-brain"></i></div>
                <h3>AI Question Generation</h3>
                <p>Master AI-powered question generation. Create questions from your course notes with custom difficulty and Bloom's levels.</p>
                <a href="{{ url('learn/documentation/ai-question-generation') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="200">
                <span class="category-badge">Grading</span>
                <div class="resource-icon"><i class="fas fa-check-circle"></i></div>
                <h3>AI Auto-Grading Workflow</h3>
                <p>Understand how auto-grading works, confidence scoring, manual review process, and grade approvals.</p>
                <a href="{{ url('learn/documentation/ai-auto-grading') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="300">
                <span class="category-badge">Analytics</span>
                <div class="resource-icon"><i class="fas fa-chart-bar"></i></div>
                <h3>Analytics Dashboard</h3>
                <p>Explore analytics dashboards, track performance trends, analyze questions, and export reports for stakeholders.</p>
                <a href="{{ url('learn/documentation/analytics-dashboard') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="400">
                <span class="category-badge">Attendance</span>
                <div class="resource-icon"><i class="fas fa-calendar-check"></i></div>
                <h3>Attendance Tracking</h3>
                <p>Mark attendance, set up automated alerts, analyze patterns, and generate attendance reports effortlessly.</p>
                <a href="{{ url('learn/documentation/attendance-tracking') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="500">
                <span class="category-badge">Reports</span>
                <div class="resource-icon"><i class="fas fa-file-pdf"></i></div>
                <h3>Generating Reports</h3>
                <p>Create professional reports for different stakeholders, customize report content, and export in multiple formats.</p>
                <a href="{{ url('learn/documentation/generating-reports') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1000px; padding: 0 2rem; margin: 0 auto;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Administrator Resources</h2>
        
        <div class="resource-grid">
            <div class="resource-card" data-aos="zoom-in">
                <span class="category-badge">Administration</span>
                <div class="resource-icon"><i class="fas fa-cogs"></i></div>
                <h3>School Configuration</h3>
                <p>Configure school settings, manage academic calendar, set up classes and enrollment, and customize system behavior.</p>
                <a href="{{ url('learn/documentation/school-configuration') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="100">
                <span class="category-badge">Administration</span>
                <div class="resource-icon"><i class="fas fa-users"></i></div>
                <h3>User Management</h3>
                <p>Manage user accounts, assign roles and permissions, handle user deactivation, and audit user access logs.</p>
                <a href="{{ url('learn/documentation/user-management') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>

            <div class="resource-card" data-aos="zoom-in" data-aos-delay="200">
                <span class="category-badge">Data Management</span>
                <div class="resource-icon"><i class="fas fa-database"></i></div>
                <h3>Data Import & Export</h3>
                <p>Import student data from CSV, export reports and analytics, set up automated backups, and manage data retention.</p>
                <a href="{{ url('learn/documentation/data-import-export') }}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Guide →</a>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 900px; padding: 0 2rem; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Can't Find What You're Looking For?</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Check our FAQ or contact our support team for additional help.</p>
        <a href="{{ url('contact') }}" style="padding: 0.75rem 2rem; background: #fff; color: #0A0A0B; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
            Contact Support
        </a>
    </div>
</section>

@endsection
@push('scripts')
<script>
    // Initialize AOS (Animate On Scroll)
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
    });
</script>
@endpush