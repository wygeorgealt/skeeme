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

<section class="feature-hero">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <div data-aos="fade-up">
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Security & Compliance</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px;">
                Enterprise-grade security with comprehensive compliance certifications and regular audits to protect your school's data.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">Security Measures</h2>
        <p style="color: #9ca3af; margin-bottom: 3rem;">Multiple layers of protection for your sensitive education data.</p>
        
        <div class="feature-grid">
            <div class="feature-card" data-aos="zoom-in">
                <div class="feature-icon"><i class="fas fa-lock"></i></div>
                <h3>End-to-End Encryption</h3>
                <p>All data encrypted in transit using TLS 1.3 and at rest using AES-256. Industry-standard encryption protocols.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-user-shield"></i></div>
                <h3>Multi-Factor Authentication</h3>
                <p>MFA support for all user types. Prevent unauthorized access with two-factor authentication and biometric options.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-server"></i></div>
                <h3>Secure Infrastructure</h3>
                <p>Cloud infrastructure with DDoS protection, firewall rules, and network isolation. Hosted on enterprise-grade servers.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-history"></i></div>
                <h3>Audit Logging</h3>
                <p>Complete audit trails of all system access and data modifications. Track who accessed what and when for accountability.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-database"></i></div>
                <h3>Automatic Backups</h3>
                <p>Daily automated backups with redundancy across geographic locations. Data recovery available within minutes if needed.</p>
            </div>

            <div class="feature-card" data-aos="zoom-in" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-bug"></i></div>
                <h3>Security Testing</h3>
                <p>Regular penetration testing and vulnerability assessments. Bug bounty program with responsible disclosure process.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Compliance & Certifications</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #10b981;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">🌍 GDPR Compliance</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Full GDPR compliance with data processing agreements. Data residency options and deletion controls for EU users.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">🎓 FERPA Compliance</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Family Educational Rights and Privacy Act compliant. Full student data privacy protections for US schools.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">☁️ ISO 27001 Certified</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">ISO 27001 information security certification. Regular external audits and continuous compliance monitoring.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #06b6d4;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">🔍 SOC 2 Type II</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">SOC 2 Type II compliance. Annual security audits with detailed reports available to enterprise customers.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">🇿🇦 POPIA (South Africa)</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Protection of Personal Information Act compliant. Designed for African education institutions.</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #ef4444;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">📋 HIPAA Compatible</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Designed to work with healthcare-related educational data sharing requirements.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Data Protection</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
            <div data-aos="fade-right">
                <h3 style="color: #fff; margin-bottom: 1.5rem;">User Access Controls</h3>
                <ul style="color: #d1d5db; list-style: none; padding: 0;">
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Role-based access control (RBAC)</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Permission-based data visibility</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Session management and timeout controls</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> API key rotation and management</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Admin activity logging</li>
                </ul>
            </div>

            <div data-aos="fade-left">
                <h3 style="color: #fff; margin-bottom: 1.5rem;">Data Handling</h3>
                <ul style="color: #d1d5db; list-style: none; padding: 0;">
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Automatic data anonymization options</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Secure data deletion with verification</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Data residency options (by region)</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Separation of test and production data</li>
                    <li style="margin-bottom: 1rem;"><i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i> Regular data integrity checks</li>
                </ul>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem;">Reliability & Uptime</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; text-align: center;">
                <h4 style="font-size: 2.5rem; color: #10b981; margin-bottom: 0.5rem;">99.9%</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Uptime SLA with credits for downtime</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; text-align: center;">
                <h4 style="font-size: 2.5rem; color: #3b82f6; margin-bottom: 0.5rem;">&lt;100ms</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Average API response time</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; text-align: center;">
                <h4 style="font-size: 2.5rem; color: #8b5cf6; margin-bottom: 0.5rem;">24/7</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Monitoring and support coverage</p>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; text-align: center;">
                <h4 style="font-size: 2.5rem; color: #06b6d4; margin-bottom: 0.5rem;">5 min</h4>
                <p style="color: #d1d5db; font-size: 0.9rem;">Average incident resolution time</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1200px; padding: 0 2rem; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Trust & Security First</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Your school's data security is our top priority. Full transparency and regular security updates.</p>
        <a href="{{ url('contact') }}" class="btn-primary" style="padding: 0.75rem 2rem; background: #fff; color: #0A0A0B; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; margin-right: 1rem;">
            Request Security Report
        </a>
        <a href="{{ url('register') }}" class="btn-primary" style="padding: 0.75rem 2rem; background: transparent; color: #fff; border: 1px solid #fff; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
            Start Free Trial
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