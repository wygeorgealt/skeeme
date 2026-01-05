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
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">API Access</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px;">
                Powerful, well-documented REST API to integrate Skeeme with your systems and build custom solutions.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">API Features</h2>
        <p style="color: #9ca3af; margin-bottom: 3rem;">Everything you need to build integrations and custom workflows.</p>
        
        <div class="feature-grid">
            <div class="feature-card" data-aos="zoom-in">
                <div class="feature-icon"><i class="fas fa-code"></i></div>
                <h3>RESTful Design</h3>
                <p>Clean, intuitive REST API following modern standards. JSON request/response format for easy integration with any language.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-key"></i></div>
                <h3>OAuth 2.0 Authentication</h3>
                <p>Secure token-based authentication. API keys and bearer tokens for programmatic access with granular permission control.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-book"></i></div>
                <h3>Complete Documentation</h3>
                <p>Comprehensive API docs with examples for every endpoint. OpenAPI/Swagger specifications for code generation.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-database"></i></div>
                <h3>Full Data Access</h3>
                <p>Read and write access to exams, grades, students, analytics, and more. Powerful filtering and pagination.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-webhook"></i></div>
                <h3>Webhooks</h3>
                <p>Real-time event notifications. React to exams submitted, grades assigned, or other important events instantly.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-tachometer-alt"></i></div>
                <h3>Rate Limiting</h3>
                <p>Fair rate limits with burst allowance. Scalable quotas for enterprise customers needing high volumes.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Available Endpoints</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">📚 Exams</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0; font-family: monospace;">
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/exams</li>
                    <li style="margin-bottom: 0.5rem;">POST /api/v1/exams</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/exams/{id}</li>
                    <li style="margin-bottom: 0.5rem;">PUT /api/v1/exams/{id}</li>
                    <li style="margin-bottom: 0.5rem;">DELETE /api/v1/exams/{id}</li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">👤 Students</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0; font-family: monospace;">
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/students</li>
                    <li style="margin-bottom: 0.5rem;">POST /api/v1/students</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/students/{id}</li>
                    <li style="margin-bottom: 0.5rem;">PUT /api/v1/students/{id}</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/students/{id}/grades</li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">📊 Analytics</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0; font-family: monospace;">
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/analytics/{id}</li>
                    <li style="margin-bottom: 0.5rem;">POST /api/v1/analytics/snapshot</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/analytics/trends</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/analytics/questions</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/analytics/export</li>
                </ul>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">🏫 Courses</h4>
                <ul style="color: #d1d5db; font-size: 0.9rem; list-style: none; padding: 0; font-family: monospace;">
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/courses</li>
                    <li style="margin-bottom: 0.5rem;">POST /api/v1/courses</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/courses/{id}</li>
                    <li style="margin-bottom: 0.5rem;">PUT /api/v1/courses/{id}</li>
                    <li style="margin-bottom: 0.5rem;">GET /api/v1/courses/{id}/students</li>
                </ul>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Getting Started</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
            <div data-aos="fade-right">
                <h3 style="color: #fff; margin-bottom: 1.5rem;">1. Get Your API Key</h3>
                <p style="color: #d1d5db; margin-bottom: 1rem;">
                    Create a Skeeme account and generate API keys from your dashboard. Each key has customizable permissions.
                </p>
                
                <h3 style="color: #fff; margin-bottom: 1.5rem; margin-top: 2rem;">2. Read the Documentation</h3>
                <p style="color: #d1d5db; margin-bottom: 1rem;">
                    Access our comprehensive API documentation with examples in multiple languages (Python, JavaScript, PHP, Ruby).
                </p>
                
                <h3 style="color: #fff; margin-bottom: 1.5rem; margin-top: 2rem;">3. Test with Sandbox</h3>
                <p style="color: #d1d5db;">
                    Use our sandbox environment to test integrations without affecting production data. Risk-free development.
                </p>
            </div>
            
            <div data-aos="fade-left">
                <div style="background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); font-family: monospace; font-size: 0.8rem; color: #d1d5db; overflow-x: auto;">
                    <div style="margin-bottom: 1rem;">
                        <span style="color: #10b981;">// Python Example</span>
                    </div>
                    <pre style="margin: 0; color: #06b6d4;">import requests

headers = {
    'Authorization': 'Bearer API_KEY'
}

resp = requests.get(
    'https://api.skeeme.io/v1/exams',
    headers=headers
)

exams = resp.json()</pre>
                </div>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1200px; padding: 0 2rem; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Start Building Today</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Access API docs, code samples, and developer support.</p>
        <a href="{{ url('register') }}" class="btn-primary" style="padding: 0.75rem 2rem; background: #fff; color: #0A0A0B; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; margin-right: 1rem;">
            Create Free Account
        </a>
        <a href="{{ url('contact') }}" class="btn-primary" style="padding: 0.75rem 2rem; background: transparent; color: #fff; border: 1px solid #fff; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
            Contact Developer Support
        </a>
    </div>
</section>

@endsection
