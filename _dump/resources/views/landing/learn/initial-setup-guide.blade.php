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

        .guide-container {
            max-width: 900px;
            padding: 0 2rem;
            margin: 0 auto;
        }

        .guide-hero {
            padding: 4rem 0 2rem;
        }

        .guide-hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .guide-hero p {
            color: #d1d5db;
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .guide-content {
            padding: 2rem 0;
        }

        .section {
            margin-bottom: 3rem;
        }

        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            color: #fff;
            border-bottom: 2px solid rgba(59, 130, 246, 0.3);
            padding-bottom: 1rem;
        }

        .section h3 {
            font-size: 1.3rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #fff;
        }

        .section p {
            color: #d1d5db;
            line-height: 1.8;
            margin-bottom: 1rem;
        }

        .step-box {
            background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6));
            border-left: 4px solid #3b82f6;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }

        .step-box h4 {
            color: #3b82f6;
            margin-bottom: 0.5rem;
        }

        .step-box p {
            margin-bottom: 0.5rem;
        }

        .tip-box {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
            border-left: 4px solid #22c55e;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }

        .tip-box strong {
            color: #22c55e;
        }

        .warning-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border-left: 4px solid #ef4444;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }

        .warning-box strong {
            color: #ef4444;
        }

        .code-block {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
        }

        .feature-list {
            list-style: none;
            padding: 0;
        }

        .feature-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            color: #d1d5db;
        }

        .feature-list li:before {
            content: "âœ“";
            position: absolute;
            left: 0;
            color: #22c55e;
            font-weight: bold;
        }

        .breadcrumb {
            color: #9ca3af;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }

        .breadcrumb a {
            color: #3b82f6;
            text-decoration: none;
        }

        .next-section {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            padding: 2rem;
            border-radius: 12px;
            margin-top: 3rem;
            text-align: center;
        }

        .next-section a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
        }
    </style>

    <div class="guide-container">
        <div class="breadcrumb" data-aos="fade-down">
            <a href="{{ url('learn/documentation') }}">Documentation</a> / Initial Setup Guide
        </div>

        <section class="guide-hero" data-aos="fade-up">
            <h1>Initial Setup Guide</h1>
            <p>Get your Skeeme account up and running in minutes. This comprehensive guide walks you through account
                creation, school configuration, and user onboarding.</p>
            <p style="color: #9ca3af; font-size: 0.95rem;">â±ï¸ Estimated reading time: 12 minutes</p>
        </section>

        <section class="guide-content">
            <!-- Overview -->
            <div class="section" data-aos="fade-up">
                <h2>Overview</h2>
                <p>Skeeme is a comprehensive educational management and assessment platform designed to streamline school
                    operations and enhance learning outcomes. Before you can start creating exams, managing students, and
                    leveraging AI-powered features, you need to set up your school environment.</p>
                <p>This guide covers the essential setup steps:</p>
                <ul class="feature-list">
                    <li>Creating your administrator account</li>
                    <li>Configuring your school profile</li>
                    <li>Setting up the academic structure</li>
                    <li>Inviting your first team members</li>
                    <li>Verifying your setup</li>
                </ul>
            </div>

            <!-- Step 1: Creating Your Account -->
            <div class="section" data-aos="fade-up">
                <h2>Step 1: Creating Your Administrator Account</h2>

                <h3>Initial Registration</h3>
                <p>Start by navigating to the Skeeme sign-up page and clicking "Get Started as Administrator."</p>

                <div class="step-box">
                    <h4>ðŸ“‹ Registration Form Fields</h4>
                    <p><strong>Email Address:</strong> Use your school's official email address (e.g., admin@yourschool.edu)
                        for better credibility and recovery options.</p>
                    <p><strong>Full Name:</strong> Enter your complete legal name for verification purposes.</p>
                    <p><strong>Password:</strong> Create a strong password with at least 12 characters including uppercase,
                        lowercase, numbers, and symbols.</p>
                    <p><strong>Role:</strong> Select "School Administrator" to access all administrative features.</p>
                </div>

                <div class="tip-box">
                    <strong>ðŸ’¡ Pro Tip:</strong> Consider using a dedicated administrator email address that can be
                    accessed by multiple team members. This ensures continuity if the original administrator leaves.
                </div>

                <p>After completing the registration form, you'll receive a verification email. Click the verification link
                    within 24 hours to activate your account.</p>

                <h3>Email Verification</h3>
                <p>Check your inbox for a verification email from Skeeme. If you don't see it within 5 minutes, check your
                    spam folder. The verification link is valid for 24 hours.</p>
            </div>

            <!-- Step 2: School Profile Setup -->
            <div class="section" data-aos="fade-up">
                <h2>Step 2: Configure Your School Profile</h2>

                <h3>Basic School Information</h3>
                <p>Once logged in, you'll be guided through the School Profile Setup wizard. This is where you define your
                    school's identity in Skeeme.</p>

                <div class="step-box">
                    <h4>ðŸ“ Essential Information</h4>
                    <p><strong>School Name:</strong> The official name of your school as it should appear throughout the
                        system.</p>
                    <p><strong>School Code:</strong> A unique identifier for your school (typically 4-6 characters). This is
                        used for integrations and API access.</p>
                    <p><strong>Address:</strong> Your school's physical address (used for official documents and
                        communications).</p>
                    <p><strong>Country & Region:</strong> Your school's location (this affects timezone settings and locale
                        options).</p>
                    <p><strong>Phone Number:</strong> Primary contact number for your school.</p>
                </div>

                <h3>Logo & Branding</h3>
                <p>Upload your school logo to customize the Skeeme interface with your school's identity.</p>

                <div class="step-box">
                    <h4>ðŸŽ¨ Logo Requirements</h4>
                    <p><strong>Format:</strong> PNG, JPG, or SVG (SVG recommended for scalability)</p>
                    <p><strong>Size:</strong> Minimum 200x200px, maximum 2MB</p>
                    <p><strong>Aspect Ratio:</strong> Square preferred for best display across all interfaces</p>
                </div>

                <h3>Contact Information</h3>
                <p>Set up your school's primary contact details for support requests and system notifications.</p>

                <ul class="feature-list">
                    <li>Primary Administrator Email</li>
                    <li>Support Email (where users can send inquiries)</li>
                    <li>Phone Number</li>
                    <li>Website URL</li>
                </ul>
            </div>

            <!-- Step 3: Academic Structure -->
            <div class="section" data-aos="fade-up">
                <h2>Step 3: Set Up Your Academic Structure</h2>

                <h3>Academic Calendar</h3>
                <p>Define the academic year structure for your school. This affects scheduling, grade reporting, and exam
                    periods.</p>

                <div class="step-box">
                    <h4>ðŸ“… Calendar Configuration</h4>
                    <p><strong>Academic Year:</strong> Set the start and end dates (e.g., January 2024 - December 2024)</p>
                    <p><strong>Terms/Semesters:</strong> Define how your year is divided (trimesters, semesters, etc.)</p>
                    <p><strong>Holiday Periods:</strong> Mark holidays, breaks, and closure dates</p>
                    <p><strong>Exam Periods:</strong> Define when exams typically occur</p>
                </div>

                <p>You can have multiple academic years configured simultaneously, making it easy to transition between
                    years.</p>

                <h3>Classes & Departments</h3>
                <p>Structure your school into logical divisions for better organization and access control.</p>

                <div class="step-box">
                    <h4>ðŸ« Class Setup</h4>
                    <p><strong>Classes/Grades:</strong> Create classes like "Form 1A," "Senior 2B," or "Grade 9 Advanced"
                    </p>
                    <p><strong>Departments:</strong> Organize by subject (Math, English, Science) or organizational unit
                        (Primary, Secondary)</p>
                    <p><strong>Sections:</strong> Further subdivide classes if needed (e.g., Section A, Section B)</p>
                </div>

                <div class="tip-box">
                    <strong>ðŸ’¡ Pro Tip:</strong> Create your full academic structure before inviting teachers and
                    students. This makes the onboarding process smoother and ensures everyone is organized from day one.
                </div>
            </div>

            <!-- Step 4: Administrator Setup -->
            <div class="section" data-aos="fade-up">
                <h2>Step 4: Set Up Administrator Accounts</h2>

                <h3>Adding Team Administrators</h3>
                <p>For larger schools, you might want additional administrators to help manage the system. Add trusted staff
                    members as administrators.</p>

                <div class="step-box">
                    <h4>ðŸ‘¥ Adding Administrators</h4>
                    <p>Navigate to: Admin Dashboard â†’ User Management â†’ Add Administrator</p>
                    <p>Fill in the administrator's details and select their permission level (see section below for
                        permission types).</p>
                </div>

                <h3>Permission Levels</h3>
                <p>Skeeme offers granular permission controls for administrators:</p>

                <ul class="feature-list">
                    <li><strong>Super Admin:</strong> Full system access, can manage all features and users</li>
                    <li><strong>Academic Admin:</strong> Manage academics, exams, grades, and exam schedules</li>
                    <li><strong>User Admin:</strong> Manage user accounts, roles, and permissions</li>
                    <li><strong>Finance Admin:</strong> Manage billing, subscriptions, and payments</li>
                    <li><strong>Support Admin:</strong> View user reports, handle support tickets, limited editing</li>
                </ul>

                <div class="warning-box">
                    <strong>âš ï¸ Important:</strong> Only grant Super Admin access to trusted, senior staff members. Use
                    specific role-based permissions for others.
                </div>
            </div>

            <!-- Step 5: Inviting Teachers -->
            <div class="section" data-aos="fade-up">
                <h2>Step 5: Invite Your First Teachers</h2>

                <p>Teachers are the backbone of your Skeeme implementation. You can invite them individually or in bulk via
                    CSV.</p>

                <h3>Individual Invitation</h3>
                <div class="step-box">
                    <h4>ðŸ‘¨â€ðŸ« Inviting a Single Teacher</h4>
                    <p><strong>Step 1:</strong> Go to Admin Dashboard â†’ User Management â†’ Invite Teachers</p>
                    <p><strong>Step 2:</strong> Enter the teacher's email, full name, and employee ID</p>
                    <p><strong>Step 3:</strong> Assign the teacher to classes/departments</p>
                    <p><strong>Step 4:</strong> Click "Send Invitation"</p>
                    <p>The teacher will receive an email with a link to set up their account.</p>
                </div>

                <h3>Bulk Upload</h3>
                <p>For schools with many teachers, use bulk import to speed up the process.</p>

                <div class="step-box">
                    <h4>ðŸ“Š CSV Format</h4>
                    <div class="code-block">email,name,employee_id,department,classes
                        john.doe@school.edu,John Doe,T001,Mathematics,"Form 1A, Form 2B"
                        jane.smith@school.edu,Jane Smith,T002,English,"Form 1A, Form 1B"</div>
                </div>

                <p>Upload the CSV file via Admin Dashboard â†’ User Management â†’ Bulk Upload Teachers. The system will
                    validate and send invitations automatically.</p>
            </div>

            <!-- Step 6: Initial Settings -->
            <div class="section" data-aos="fade-up">
                <h2>Step 6: Configure System Settings</h2>

                <h3>Email Notifications</h3>
                <p>Set up email preferences for system notifications, exam announcements, and grade releases.</p>

                <ul class="feature-list">
                    <li>Email notification frequency (real-time, daily digest, weekly summary)</li>
                    <li>Recipient groups (administrators, teachers, students, parents)</li>
                    <li>Email templates customization</li>
                </ul>

                <h3>Security Settings</h3>
                <p>Configure security options to protect your school's data:</p>

                <ul class="feature-list">
                    <li>Password policy (minimum length, complexity requirements)</li>
                    <li>Session timeout duration</li>
                    <li>Two-factor authentication (2FA)</li>
                    <li>IP whitelist/blacklist</li>
                    <li>Data backup frequency</li>
                </ul>

                <div class="tip-box">
                    <strong>ðŸ’¡ Pro Tip:</strong> Enable two-factor authentication for all administrators from day one.
                    This adds an extra layer of security to sensitive operations.
                </div>

                <h3>System Preferences</h3>
                <p>Customize the system behavior to match your school's needs:</p>

                <ul class="feature-list">
                    <li>Timezone and locale settings</li>
                    <li>Date and time formats</li>
                    <li>Grading scale and grade boundaries</li>
                    <li>Default exam settings</li>
                </ul>
            </div>

            <!-- Step 7: Verification -->
            <div class="section" data-aos="fade-up">
                <h2>Step 7: Verify Your Setup</h2>

                <p>Before going live, verify that everything is configured correctly:</p>

                <div class="step-box">
                    <h4>âœ… Verification Checklist</h4>
                    <p>â–¡ School profile is complete and accurate</p>
                    <p>â–¡ Academic calendar is set for the current academic year</p>
                    <p>â–¡ Classes and departments are created</p>
                    <p>â–¡ At least one administrator account is configured</p>
                    <p>â–¡ Teachers have been invited (even just one for testing)</p>
                    <p>â–¡ Email notifications are properly configured</p>
                    <p>â–¡ Security settings are enabled</p>
                    <p>â–¡ You can log in and access the admin dashboard</p>
                </div>

                <h3>Testing Your Setup</h3>
                <p>Create a test account to ensure everything works smoothly. Invite one teacher and check that they receive
                    the invitation email and can set up their account.</p>

                <div class="tip-box">
                    <strong>ðŸ’¡ Pro Tip:</strong> Set aside a "test class" where you can experiment with features before
                    rolling out to the entire school.
                </div>
            </div>

            <!-- Troubleshooting -->
            <div class="section" data-aos="fade-up">
                <h2>Troubleshooting Common Setup Issues</h2>

                <h3>Verification Email Not Received</h3>
                <p><strong>Solution:</strong> Check spam/junk folders. If still not found, request a new verification email
                    from the login page. Ensure you're using the correct email address.</p>

                <h3>Can't Access Admin Dashboard</h3>
                <p><strong>Solution:</strong> Ensure your account has been verified. If verified but still locked out,
                    contact support with your email address and school name.</p>

                <h3>Teachers Not Receiving Invitations</h3>
                <p><strong>Solution:</strong> Verify the teacher's email address is correct. Check the "Sent Invitations"
                    log in User Management. Resend invitation if needed. Ensure your school's email isn't being blocked by
                    the teacher's email provider.</p>

                <h3>Academic Calendar Issues</h3>
                <p><strong>Solution:</strong> Ensure the academic year start date is before the end date. Check that term
                    dates don't overlap. Contact support if you need to modify past academic years.</p>
            </div>

            <!-- Next Steps -->
            <div class="section" data-aos="fade-up">
                <h2>What's Next?</h2>
                <p>Congratulations! Your Skeeme account is now set up. Here are the recommended next steps:</p>

                <ul class="feature-list">
                    <li>Invite all your teachers and students</li>
                    <li>Upload your class enrollment data</li>
                    <li>Create your first exam (see "Creating Your First Exam" guide)</li>
                    <li>Set up exam schedules and announcements</li>
                    <li>Configure your grading system</li>
                </ul>

                <div class="next-section">
                    <h3 style="margin-top: 0;">Ready for the next step?</h3>
                    <p>Head over to the <a href="{{ url('learn/documentation/inviting-users') }}">Inviting Users</a> guide
                        to start building your school community.</p>
                </div>
            </div>

            <!-- Support -->
            <div class="section" data-aos="fade-up">
                <h2>Need Help?</h2>
                <p>If you encounter any issues during setup:</p>

                <ul class="feature-list">
                    <li>Check our <a href="{{ url('learn/documentation') }}" style="color: #3b82f6;">full documentation</a>
                        for detailed articles</li>
                    <li>Email our support team: <strong>noreply@contact.skeeme.com</strong></li>
                    <li>Call our support line during business hours</li>
                    <li>Join our community forum for peer support</li>
                </ul>
            </div>
        </section>
    </div>

@endsection

@push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100,
            });
        });
    </script>
@endpush