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
    .legal-container { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; }
    .legal-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #ffffff; }
    .legal-updated { color: var(--text-muted); margin-bottom: 3rem; font-size: 0.9rem; }
    .legal-section { margin-bottom: 2.5rem; }
    .legal-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #ffffff; margin-top: 2rem; }
    .legal-section p { color: var(--text-muted); line-height: 1.7; margin-bottom: 1rem; }
    .legal-section ul { list-style: none; padding-left: 1.5rem; margin-bottom: 1rem; }
    .legal-section ul li { color: var(--text-muted); margin-bottom: 0.5rem; padding-left: 1.5rem; position: relative; line-height: 1.6; }
    .legal-section ul li:before { content: "•"; position: absolute; left: 0; color: #3b82f6; }
</style>

<div class="legal-container">
    <h1 class="legal-title">Privacy Policy</h1>
    <p class="legal-updated">Last updated: {{ date('F j, Y') }}</p>

    <div class="legal-section">
        <h2>1. Introduction</h2>
        <p>At Skeeme, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational management platform.</p>
    </div>

    <div class="legal-section">
        <h2>2. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:</p>
        <ul>
            <li>Personal information (name, email address, phone number)</li>
            <li>Educational data (student records, grades, attendance)</li>
            <li>Usage data (how you interact with our platform)</li>
            <li>Device and browser information</li>
        </ul>
    </div>

    <div class="legal-section">
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
            <li>Provide and maintain our educational services</li>
            <li>Process registrations and manage user accounts</li>
            <li>Deliver course content and assessments</li>
            <li>Generate reports and analytics for educational institutions</li>
            <li>Communicate with you about our services</li>
            <li>Improve our platform and develop new features</li>
        </ul>
    </div>

    <div class="legal-section">
        <h2>4. Information Sharing and Disclosure</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information:</p>
        <ul>
            <li>With educational institutions you are affiliated with</li>
            <li>With service providers who assist us in operating our platform</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or merger</li>
        </ul>
    </div>

    <div class="legal-section">
        <h2>5. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, access controls, and regular security audits.</p>
    </div>

    <div class="legal-section">
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
            <li>The right to access your personal information</li>
            <li>The right to rectify inaccurate information</li>
            <li>The right to erase your personal information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
        </ul>
    </div>

    <div class="legal-section">
        <h2>7. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences, though disabling cookies may affect platform functionality.</p>
    </div>

    <div class="legal-section">
        <h2>8. Children's Privacy</h2>
        <p>Our services are designed for educational institutions and their users, including minors. We are committed to protecting children's privacy and comply with applicable laws regarding the collection and use of children's personal information.</p>
    </div>

    <div class="legal-section">
        <h2>9. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.</p>
    </div>

    <div class="legal-section">
        <h2>10. Data Retention</h2>
        <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>
    </div>

    <div class="legal-section">
        <h2>11. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.</p>
    </div>

    <div class="legal-section">
        <h2>12. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@skeeme.ng or support@skeeme.ng.</p>
    </div>
</div>
@endsection
