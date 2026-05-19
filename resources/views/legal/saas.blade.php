@extends('layouts.landing')

@section('content')
    <style>
        :root {
            --bg-color: #0f0f14;
            --text-color: #ffffff;
            --text-muted: #9ca3af;
            --border-color: rgba(255, 255, 255, 0.1);
        }

        body {
            background: var(--bg-color);
            color: var(--text-color);
        }

        .legal-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 9rem 2rem 5rem 2rem;
        }

        .legal-title {
            font-size: 2.75rem;
            font-weight: 800;
            margin-bottom: 1rem;
            color: #ffffff;
            letter-spacing: -0.025em;
        }

        .legal-updated {
            color: var(--text-muted);
            margin-bottom: 4rem;
            font-size: 0.95rem;
            font-weight: 500;
        }

        .legal-section {
            margin-bottom: 3.5rem;
        }

        .legal-section h2 {
            font-size: 1.65rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: #ffffff;
            margin-top: 2.5rem;
            letter-spacing: -0.01em;
        }

        .legal-section p {
            color: var(--text-muted);
            line-height: 1.8;
            margin-bottom: 1.25rem;
            font-size: 1.05rem;
        }

        .legal-section ul {
            list-style: none;
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .legal-section ul li {
            color: var(--text-muted);
            margin-bottom: 0.75rem;
            padding-left: 1.75rem;
            position: relative;
            line-height: 1.8;
            font-size: 1.05rem;
        }

        .legal-section ul li:before {
            content: "\2022";
            position: absolute;
            left: 0;
            color: #3b82f6;
            font-size: 1.2rem;
            top: -0.1rem;
        }
    </style>

    <div class="legal-container">
        <h1 class="legal-title">SaaS Services Agreement</h1>
        <p class="legal-updated">Last updated: {{ date('F j, Y') }}</p>

        <div class="legal-section">
            <h2>1. Service Overview</h2>
            <p>Skeeme provides Software as a Service (SaaS) solutions for educational institutions, including student
                management, course delivery, assessment tools, analytics, and administrative functions delivered through our
                cloud-based platform.</p>
        </div>

        <div class="legal-section">
            <h2>2. Service Availability</h2>
            <p>We strive to maintain 99.9% uptime for our services. However, we do not guarantee uninterrupted access and
                reserve the right to perform maintenance that may temporarily interrupt service availability.</p>
        </div>

        <div class="legal-section">
            <h2>3. Subscription Plans</h2>
            <p>Our services are offered through various subscription plans. Each plan includes different features, user
                limits, and storage capacities. Plan details and pricing are available on our website and may be subject to
                change.</p>
        </div>

        <div class="legal-section">
            <h2>4. Billing and Payment</h2>
            <p>Subscription fees are billed in advance on a monthly or annual basis, depending on your selected plan.
                Payment is processed securely through our payment partners. Late payments may result in service suspension.
            </p>
        </div>

        <div class="legal-section">
            <h2>5. Data Ownership and Privacy</h2>
            <p>You retain ownership of all data uploaded to our platform. We implement industry-standard security measures
                to protect your data. Please refer to our Privacy Policy for detailed information about data handling.</p>
        </div>

        <div class="legal-section">
            <h2>6. Service Level Agreement (SLA)</h2>
            <p>Our SLA guarantees specific performance standards for uptime, support response times, and issue resolution.
                SLA terms vary by subscription plan and are detailed in your service agreement.</p>
        </div>

        <div class="legal-section">
            <h2>7. Support and Maintenance</h2>
            <p>We provide technical support during business hours. Support includes help desk assistance, documentation, and
                software updates. Premium support options are available for higher-tier plans.</p>
        </div>

        <div class="legal-section">
            <h2>8. Data Backup and Recovery</h2>
            <p>We perform regular data backups and maintain disaster recovery procedures. However, you are responsible for
                maintaining your own backups of critical data. We are not liable for data loss due to user error or
                unforeseen circumstances.</p>
        </div>

        <div class="legal-section">
            <h2>9. Termination of Service</h2>
            <p>Either party may terminate the subscription at any time by providing 30 days written notice. Upon
                termination, you may export your data. After the notice period, we will delete your data in accordance with
                our data retention policies.</p>
        </div>

        <div class="legal-section">
            <h2>10. Liability and Indemnification</h2>
            <p>Our total liability shall not exceed the fees paid by you in the preceding 12 months. We are not liable for
                any indirect, incidental, or consequential damages. You agree to indemnify us against any claims arising
                from your use of the service.</p>
        </div>

        <div class="legal-section">
            <h2>11. Security and Compliance</h2>
            <p>We maintain industry-standard security practices and comply with applicable data protection regulations. Your
                institution is responsible for implementing additional security measures and access controls as needed.</p>
        </div>

        <div class="legal-section">
            <h2>12. Changes to Terms</h2>
            <p>We reserve the right to modify these terms with 30 days notice. Continued use of the service after
                modifications constitutes acceptance of the new terms.</p>
        </div>

        <div class="legal-section">
            <h2>13. Contact Us</h2>
            <p>For questions about this SaaS Services Agreement, please contact us at noreply@contact.skeeme.com.</p>
        </div>
    </div>
@endsection