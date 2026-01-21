<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transform Your School with Skeeme</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f8fafc; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
        
        /* Header */
        .header { background: #ffffff; padding: 30px 24px; text-align: center; border-bottom: 1px solid #e2e8f0; }
        .logo { height: 48px; margin-bottom: 0; }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 60px 32px;
            text-align: center;
            color: white;
        }
        .hero-badge {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            color: white;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            padding: 6px 14px;
            border-radius: 20px;
            margin-bottom: 20px;
        }
        .hero h1 { 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 16px; 
            line-height: 1.2;
            letter-spacing: -0.02em;
        }
        .hero p { 
            font-size: 16px; 
            font-weight: 500; 
            opacity: 0.95; 
            max-width: 480px;
            margin: 0 auto;
            line-height: 1.7;
        }
        
        /* Content */
        .content { padding: 48px 32px; }
        .greeting {
            font-size: 16px;
            color: #334155;
            margin-bottom: 24px;
            line-height: 1.8;
        }
        .greeting strong { color: #1e293b; }
        
        /* Feature Cards */
        .features { margin: 32px 0; }
        .feature-card {
            display: table;
            width: 100%;
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            border-left: 4px solid #667eea;
        }
        .feature-icon {
            display: table-cell;
            width: 48px;
            vertical-align: top;
            padding-right: 16px;
        }
        .feature-icon-circle {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            text-align: center;
            line-height: 40px;
            color: white;
            font-size: 16px;
        }
        .feature-content { display: table-cell; vertical-align: top; }
        .feature-title { 
            font-size: 15px; 
            font-weight: 700; 
            color: #1e293b; 
            margin-bottom: 4px;
        }
        .feature-desc { 
            font-size: 13px; 
            color: #64748b; 
            line-height: 1.6;
        }
        
        /* Stats Row */
        .stats {
            display: table;
            width: 100%;
            background: #f1f5f9;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
        }
        .stat {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            vertical-align: top;
        }
        .stat-value {
            font-size: 28px;
            font-weight: 800;
            color: #667eea;
            letter-spacing: -0.02em;
        }
        .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 4px;
        }
        
        /* CTA Section */
        .cta-section {
            background: #f8fafc;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
        }
        .cta-section h3 {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
        }
        .cta-section p {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 24px;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            display: inline-block;
        }
        .button:hover { opacity: 0.95; }
        .button-secondary {
            background: transparent;
            color: #667eea !important;
            padding: 14px 24px;
            border: 2px solid #667eea;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            display: inline-block;
            margin-left: 12px;
        }
        
        /* Comparison */
        .comparison {
            margin: 32px 0;
        }
        .comparison-header {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            text-align: center;
        }
        .comparison-row {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }
        .comparison-old, .comparison-new {
            display: table-cell;
            width: 50%;
            padding: 12px;
            vertical-align: top;
            font-size: 13px;
        }
        .comparison-old {
            background: #f1f5f9;
            border-radius: 8px 0 0 8px;
            color: #64748b;
            text-decoration: line-through;
        }
        .comparison-new {
            background: #eef2ff;
            border-radius: 0 8px 8px 0;
            color: #4338ca;
            font-weight: 600;
        }
        
        /* Footer */
        .footer {
            background: #1e293b;
            padding: 40px 32px;
            text-align: center;
            color: #94a3b8;
        }
        .footer-logo { height: 32px; margin-bottom: 16px; filter: brightness(0) invert(1); }
        .footer p { font-size: 12px; line-height: 1.8; margin-bottom: 8px; }
        .footer a { color: #a5b4fc; text-decoration: none; }
        .footer-links { margin-top: 20px; }
        .footer-links a { 
            color: #cbd5e1; 
            text-decoration: none; 
            font-size: 12px;
            margin: 0 12px;
        }
        .unsubscribe { 
            margin-top: 24px; 
            padding-top: 24px; 
            border-top: 1px solid #334155;
            font-size: 11px;
            color: #64748b;
        }
        .unsubscribe a { color: #64748b; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="https://skeeme.ng/images/logo.png" alt="Skeeme" class="logo">
        </div>

        <!-- Hero -->
        <div class="hero">
            <div class="hero-badge">🚀 Special Invitation</div>
            <h1>The AI Your School Deserves</h1>
            <p>Save 20+ hours weekly with automated attendance, AI-powered exams, and real-time analytics.</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                <p>Dear <strong><?php echo e($contactName ?? 'Administrator'); ?></strong>,</p>
                <br>
                <p>We're reaching out to <strong><?php echo e($schoolName ?? 'your institution'); ?></strong> because we believe you deserve better tools to manage your school operations.</p>
                <br>
                <p>Skeeme is Nigeria's most advanced education platform, trusted by forward-thinking schools to transform how they handle attendance, exams, and student analytics.</p>
            </div>

            <!-- Features -->
            <div class="features">
                <div class="feature-card">
                    <div class="feature-icon">
                        <div class="feature-icon-circle">📊</div>
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Real-Time Analytics Dashboard</div>
                        <div class="feature-desc">Predictive insights that help you identify struggling students before they fall behind.</div>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <div class="feature-icon-circle">🤖</div>
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">AI-Powered Exam Builder</div>
                        <div class="feature-desc">Auto-generate questions, instant grading, and advanced proctoring to prevent cheating.</div>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <div class="feature-icon-circle">✅</div>
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Automated Attendance</div>
                        <div class="feature-desc">Eliminate manual sign-in sheets with digital, location-verified attendance tracking.</div>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <div class="feature-icon-circle">🔒</div>
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Network-Based Security</div>
                        <div class="feature-desc">Restrict student access to your school's approved WiFi networks only.</div>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">20+</div>
                    <div class="stat-label">Hours Saved Weekly</div>
                </div>
                <div class="stat">
                    <div class="stat-value">5x</div>
                    <div class="stat-label">Faster Grading</div>
                </div>
                <div class="stat">
                    <div class="stat-value">100%</div>
                    <div class="stat-label">Digital Records</div>
                </div>
            </div>

            <!-- Comparison -->
            <div class="comparison">
                <div class="comparison-header">Why Schools Are Switching</div>
                <div class="comparison-row">
                    <div class="comparison-old">Manual spreadsheets</div>
                    <div class="comparison-new">✓ Unified dashboard</div>
                </div>
                <div class="comparison-row">
                    <div class="comparison-old">Paper-based exams</div>
                    <div class="comparison-new">✓ AI-powered exams</div>
                </div>
                <div class="comparison-row">
                    <div class="comparison-old">Delayed reporting</div>
                    <div class="comparison-new">✓ Real-time analytics</div>
                </div>
            </div>

            <!-- CTA -->
            <div class="cta-section">
                <h3>Ready to Transform Your School?</h3>
                <p>Start your free trial today. No credit card required.</p>
                <a href="https://skeeme.ng/register" class="button">Get Started Free</a>
                <a href="https://skeeme.ng/contact" class="button-secondary">Book a Demo</a>
            </div>

            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($customMessage)): ?>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-top: 24px;">
                <p style="font-size: 14px; color: #92400e; margin: 0;"><?php echo e($customMessage); ?></p>
            </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

        <!-- Footer -->
        <div class="footer">
            <img src="https://skeeme.ng/images/logo.png" alt="Skeeme" class="footer-logo">
            <p>Nigeria's Most Advanced School Management Platform</p>
            <p>Powered by AI | Built for African Schools</p>
            
            <div class="footer-links">
                <a href="https://skeeme.ng">Website</a>
                <a href="https://skeeme.ng/pricing">Pricing</a>
                <a href="https://skeeme.ng/contact">Contact</a>
            </div>
            
            <div class="unsubscribe">
                <p>You received this email because we thought Skeeme could help <?php echo e($schoolName ?? 'your institution'); ?>.</p>
                <p>If you'd prefer not to receive these emails, <a href="#">unsubscribe here</a>.</p>
            </div>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\emails\marketing.blade.php ENDPATH**/ ?>