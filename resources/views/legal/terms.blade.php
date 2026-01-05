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
    <h1 class="legal-title">Terms of Service</h1>
    <p class="legal-updated">Last updated: {{ date('F j, Y') }}</p>

    <div class="legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Skeeme ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
    </div>

    <div class="legal-section">
        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily use the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
        <ul>
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose or for any public display;</li>
            <li>attempt to decompile or reverse engineer any software contained on the Service;</li>
            <li>remove any copyright or other proprietary notations from the materials.</li>
        </ul>
    </div>

    <div class="legal-section">
        <h2>3. Service Description</h2>
        <p>Skeeme provides an educational management platform that includes student management, course delivery, assessment tools, and analytics for educational institutions.</p>
    </div>

    <div class="legal-section">
        <h2>4. User Accounts</h2>
        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
    </div>

    <div class="legal-section">
        <h2>5. Acceptable Use</h2>
        <p>You agree not to use the Service:</p>
        <ul>
            <li>For any unlawful purpose or to solicit others to perform unlawful acts;</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances;</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate;</li>
            <li>To submit false or misleading information;</li>
            <li>To upload or transmit viruses or any other type of malicious code;</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape;</li>
            <li>For any obscene or immoral purpose.</li>
        </ul>
    </div>

    <div class="legal-section">
        <h2>6. Limitation of Liability</h2>
        <p>In no event shall Skeeme or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Skeeme's website.</p>
    </div>

    <div class="legal-section">
        <h2>7. Accuracy of Materials</h2>
        <p>The materials appearing on Skeeme's website could include technical, typographical, or photographic errors. Skeeme does not warrant that any of the materials on its website are accurate, complete, or current.</p>
    </div>

    <div class="legal-section">
        <h2>8. Modifications</h2>
        <p>Skeeme may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
    </div>

    <div class="legal-section">
        <h2>9. Governing Law</h2>
        <p>These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
    </div>

    <div class="legal-section">
        <h2>10. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us at support@skeeme.ng.</p>
    </div>
</div>
@endsection
