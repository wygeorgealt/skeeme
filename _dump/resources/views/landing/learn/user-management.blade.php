@extends('layouts.landing')

@section('content')
<style>
    :root { --bg-color: #0f0f14; --text-color: #ffffff; --text-muted: #9ca3af; }
    body { background: var(--bg-color); color: var(--text-color); }
    .guide-container { max-width: 900px; padding: 0 2rem; margin: 0 auto; }
    .guide-hero { padding: 4rem 0 2rem; }
    .guide-hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .guide-hero p { color: #d1d5db; font-size: 1.1rem; margin-bottom: 1rem; }
    .guide-content { padding: 2rem 0; }
    .section { margin-bottom: 3rem; }
    .section h2 { font-size: 1.8rem; margin-bottom: 1.5rem; color: #fff; border-bottom: 2px solid rgba(59, 130, 246, 0.3); padding-bottom: 1rem; }
    .section h3 { font-size: 1.3rem; margin-top: 2rem; margin-bottom: 1rem; color: #fff; }
    .section p { color: #d1d5db; line-height: 1.8; margin-bottom: 1rem; }
    .step-box { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .step-box h4 { color: #3b82f6; margin-bottom: 0.5rem; }
    .tip-box { background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 0.75rem 0; padding-left: 2rem; position: relative; color: #d1d5db; }
    .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
    .breadcrumb { color: #9ca3af; margin-bottom: 2rem; font-size: 0.9rem; }
    .breadcrumb a { color: #3b82f6; text-decoration: none; }
</style>

<div class="guide-container">
    <div class="breadcrumb" data-aos="fade-down">
        <a href="{{ url('learn/documentation') }}">Documentation</a> / User Management
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>User Management</h1>
        <p>Manage user accounts, assign roles and permissions, handle access controls, and maintain audit logs. Keep your school secure and organized.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 15 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>User management is critical for security and operational efficiency. Control who can access what, track user activity, and maintain compliance with data protection regulations.</p>
            <ul class="feature-list">
                <li>Create and manage user accounts</li>
                <li>Assign roles with granular permissions</li>
                <li>Manage password policies</li>
                <li>Enable two-factor authentication</li>
                <li>Audit user activity and changes</li>
                <li>Handle access requests and permissions</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>User Roles & Permissions</h2>
            
            <p>Each user in Skeeme has a role that determines what they can access and do. For detailed information about specific roles, see the "Inviting Users" guide.</p>

            <h3>Viewing User Accounts</h3>

            <div class="step-box">
                <h4>👥 User Directory</h4>
                <p><strong>Step 1:</strong> Go to Admin → User Management</p>
                <p><strong>Step 2:</strong> Filter by role or status</p>
                <p><strong>Step 3:</strong> Search by name or email</p>
                <p><strong>Step 4:</strong> Click on user to view details</p>
            </div>

            <h3>Role-Based Access Control (RBAC)</h3>
            <p>Skeeme uses role-based permissions for granular control:</p>

            <ul class="feature-list">
                <li>Each role has default permissions</li>
                <li>Customize permissions for individual users</li>
                <li>Create custom roles for specific needs</li>
                <li>Apply roles at school or department level</li>
            </ul>

            <h3>Permission Categories</h3>
            <p>Permissions are organized by function:</p>

            <ul class="feature-list">
                <li><strong>User Management:</strong> Create/edit/delete users</li>
                <li><strong>Academic:</strong> Create exams, manage grades</li>
                <li><strong>Attendance:</strong> Mark and manage attendance</li>
                <li><strong>Reports:</strong> Generate and export reports</li>
                <li><strong>Settings:</strong> Configure school and system settings</li>
                <li><strong>Analytics:</strong> View performance data</li>
                <li><strong>Billing:</strong> Manage subscriptions and payments</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Managing User Accounts</h2>
            
            <h3>Creating a User Account</h3>

            <div class="step-box">
                <h4>➕ Add User</h4>
                <p><strong>Step 1:</strong> Go to Admin → User Management</p>
                <p><strong>Step 2:</strong> Click "Add User"</p>
                <p><strong>Step 3:</strong> Enter first name, last name, email</p>
                <p><strong>Step 4:</strong> Select role and permissions</p>
                <p><strong>Step 5:</strong> Assign to classes/departments if needed</p>
                <p><strong>Step 6:</strong> Click "Create"</p>
            </div>

            <p>User receives invitation email and sets up their own password.</p>

            <h3>Editing User Accounts</h3>
            <ul class="feature-list">
                <li>Go to user's profile</li>
                <li>Click "Edit"</li>
                <li>Change name, email, phone, etc.</li>
                <li>Update role or permissions</li>
                <li>Click "Save"</li>
            </ul>

            <h3>Account Status</h3>
            <p>Users can have different statuses:</p>

            <ul class="feature-list">
                <li><strong>Active:</strong> User can log in and access Skeeme</li>
                <li><strong>Pending:</strong> Invitation sent, awaiting account setup</li>
                <li><strong>Suspended:</strong> Temporarily locked, can be reactivated</li>
                <li><strong>Inactive:</strong> Permanently deactivated (can be reactivated)</li>
            </ul>

            <h3>Password Management</h3>
            <p>Handle password issues:</p>

            <div class="step-box">
                <h4>🔐 Password Reset</h4>
                <p><strong>Step 1:</strong> Go to user's account</p>
                <p><strong>Step 2:</strong> Click "Reset Password"</p>
                <p><strong>Step 3:</strong> Send reset link to user's email</p>
                <p><strong>Step 4:</strong> User receives email and sets new password</p>
            </div>

            <h3>Password Policies</h3>
            <p>Configure password requirements:</p>

            <ul class="feature-list">
                <li>Minimum length (e.g., 12 characters)</li>
                <li>Complexity requirements (uppercase, numbers, symbols)</li>
                <li>Expiration period (e.g., change every 90 days)</li>
                <li>Password history (can't reuse recent passwords)</li>
                <li>Failed login lockout (after X attempts)</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Security Features</h2>
            
            <h3>Two-Factor Authentication (2FA)</h3>

            <div class="step-box">
                <h4>🔐 Enabling 2FA</h4>
                <p><strong>For Administrators:</strong></p>
                <p><strong>Step 1:</strong> Go to Admin → Security Settings</p>
                <p><strong>Step 2:</strong> Enable "Require 2FA for Admins"</p>
                <p><strong>Step 3:</strong> Choose authentication method (email, SMS, app)</p>
                <p><strong>Step 4:</strong> Save</p>
                <p>All admins must set up 2FA on next login</p>
            </div>

            <h3>2FA Methods</h3>
            <ul class="feature-list">
                <li><strong>Email:</strong> Receive code via email</li>
                <li><strong>SMS:</strong> Receive code via text message</li>
                <li><strong>Authenticator App:</strong> Use Google Authenticator, Microsoft Authenticator, etc.</li>
                <li><strong>Backup Codes:</strong> Save codes if locked out</li>
            </ul>

            <h3>Session Security</h3>
            <p>Configure session and login behavior:</p>

            <ul class="feature-list">
                <li>Session timeout (logout if idle for X minutes)</li>
                <li>Concurrent login limits (only 1 session per user)</li>
                <li>Login attempt rate limiting (prevent brute force)</li>
                <li>IP address whitelisting (only allow access from school IPs)</li>
            </ul>

            <h3>Activity Logging</h3>
            <p>Track all user actions for security:</p>

            <div class="step-box">
                <h4>📝 Audit Logs</h4>
                <p>Skeeme automatically logs:</p>
                <p>• Login and logout times</p>
                <p>• Exams created, modified, deleted</p>
                <p>• Grades changed or adjusted</p>
                <p>• User permissions modified</p>
                <p>• Data exported or deleted</p>
            </div>

            <p>View audit logs to investigate suspicious activity or verify actions.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Managing Access & Permissions</h2>
            
            <h3>Changing User Roles</h3>

            <div class="step-box">
                <h4>🔄 Role Change</h4>
                <p><strong>Step 1:</strong> Go to user's profile</p>
                <p><strong>Step 2:</strong> In "Role" section, click "Change"</p>
                <p><strong>Step 3:</strong> Select new role</p>
                <p><strong>Step 4:</strong> Confirm changes</p>
                <p><strong>Step 5:</strong> User's permissions update immediately</p>
            </div>

            <h3>Custom Permissions</h3>
            <p>Beyond pre-built roles, create custom permission sets:</p>

            <ul class="feature-list">
                <li>Select individual permissions to grant</li>
                <li>Create named permission groups</li>
                <li>Assign to multiple users</li>
                <li>Update all users at once if you change group</li>
            </ul>

            <h3>Departmental Access Control</h3>
            <p>Restrict teachers to their own departments:</p>

            <ul class="feature-list">
                <li>Math teachers see only Math exams and students</li>
                <li>English teachers see only English classes</li>
                <li>Admins can restrict visibility as needed</li>
            </ul>

            <h3>Data Access Restrictions</h3>
            <p>Control what data users can see:</p>

            <ul class="feature-list">
                <li>Teachers see only their classes' data</li>
                <li>Admins can see school-wide data</li>
                <li>Finance staff see only billing/payment data</li>
                <li>HR staff see only user management data</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Follow the principle of least privilege. Give users only the permissions they need to do their job.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Deactivating & Offboarding Users</h2>
            
            <h3>When to Deactivate</h3>
            <p>Deactivate user accounts when:</p>

            <ul class="feature-list">
                <li>Staff member leaves the school</li>
                <li>Student graduates or withdraws</li>
                <li>Temporary access needs to be suspended</li>
                <li>Staff changes roles</li>
            </ul>

            <h3>Deactivation Process</h3>

            <div class="step-box">
                <h4>🚫 Deactivating a User</h4>
                <p><strong>Step 1:</strong> Go to user's profile</p>
                <p><strong>Step 2:</strong> Click "Deactivate Account"</p>
                <p><strong>Step 3:</strong> Select reason (optional)</p>
                <p><strong>Step 4:</strong> Confirm deactivation</p>
                <p>User can no longer log in, but data is preserved</p>
            </div>

            <h3>Data Transition</h3>
            <p>Before deactivating, consider:</p>

            <ul class="feature-list">
                <li>Assign their exams to another teacher</li>
                <li>Transfer any documents or files</li>
                <li>Update class rosters</li>
                <li>Export final records</li>
            </ul>

            <h3>Reactivating Users</h3>
            <p>If a deactivated user needs access again:</p>

            <ul class="feature-list">
                <li>Go to their account</li>
                <li>Click "Reactivate"</li>
                <li>User can log in again</li>
                <li>Their previous data is intact</li>
            </ul>

            <h3>Permanent Deletion</h3>
            <p>Rarely needed, but possible:</p>

            <ul class="feature-list">
                <li>Backup data first</li>
                <li>Contact support for data deletion</li>
                <li>User data is permanently removed</li>
                <li>Cannot be undone</li>
            </ul>

            <p>Most cases should use deactivation rather than deletion, as data is needed for records and compliance.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Auditing & Compliance</h2>
            
            <h3>Viewing Audit Logs</h3>

            <div class="step-box">
                <h4>📋 Audit Log Access</h4>
                <p><strong>Step 1:</strong> Go to Admin → Security → Audit Logs</p>
                <p><strong>Step 2:</strong> Filter by date, user, or action</p>
                <p><strong>Step 3:</strong> View details of each action</p>
                <p><strong>Step 4:</strong> Export logs if needed</p>
            </div>

            <h3>What's Logged</h3>
            <p>Skeeme logs:</p>

            <ul class="feature-list">
                <li>User login/logout with timestamps</li>
                <li>Changes to user accounts or permissions</li>
                <li>Exam creation, modification, deletion</li>
                <li>Grade changes and adjustments</li>
                <li>Data exports and imports</li>
                <li>Failed login attempts</li>
                <li>Settings changes</li>
            </ul>

            <h3>Using Audit Logs for Compliance</h3>
            <ul class="feature-list">
                <li>Verify who accessed sensitive data</li>
                <li>Document changes for record-keeping</li>
                <li>Investigate suspicious activity</li>
                <li>Meet FERPA and privacy requirements</li>
                <li>Create compliance reports</li>
            </ul>

            <h3>Suspicious Activity Detection</h3>
            <p>Look for:</p>

            <ul class="feature-list">
                <li>Multiple failed login attempts</li>
                <li>Unusual access times</li>
                <li>Bulk data exports</li>
                <li>Unauthorized user creation</li>
                <li>Permissions changes outside normal operations</li>
            </ul>

            <p>Report suspicious activity to your IT security team.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Bulk User Management</h2>
            
            <h3>Bulk Deactivation</h3>
            <p>Deactivate multiple users at once:</p>

            <div class="step-box">
                <h4>📦 Bulk Actions</h4>
                <p><strong>Step 1:</strong> Go to User Management</p>
                <p><strong>Step 2:</strong> Select multiple users (checkbox)</p>
                <p><strong>Step 3:</strong> Click "Bulk Actions" → "Deactivate"</p>
                <p><strong>Step 4:</strong> Confirm</p>
                <p>All selected users are deactivated</p>
            </div>

            <h3>Bulk Permission Changes</h3>
            <ul class="feature-list">
                <li>Select multiple users</li>
                <li>Click "Change Permissions"</li>
                <li>Select new role or permissions</li>
                <li>Apply to all selected users</li>
            </ul>

            <h3>Bulk Export</h3>
            <p>Export user list for external use:</p>

            <ul class="feature-list">
                <li>Go to User Management</li>
                <li>Click "Export"</li>
                <li>Choose format (CSV, Excel, etc.)</li>
                <li>Download file</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Best Practices</h2>
            
            <ul class="feature-list">
                <li><strong>Least Privilege:</strong> Give minimal necessary permissions</li>
                <li><strong>Regular Audits:</strong> Review user access and permissions quarterly</li>
                <li><strong>Strong Passwords:</strong> Enforce complex password requirements</li>
                <li><strong>Enable 2FA:</strong> Especially for administrators</li>
                <li><strong>Log Activity:</strong> Review audit logs regularly</li>
                <li><strong>Offboard properly:</strong> Deactivate accounts when staff/students leave</li>
                <li><strong>Document decisions:</strong> Keep notes on who has what access and why</li>
                <li><strong>Separate concerns:</strong> Different admins for different functions</li>
                <li><strong>Monitor access:</strong> Watch for unusual access patterns</li>
                <li><strong>Update roles:</strong> Change permissions when job responsibilities change</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting</h2>
            
            <h3>User Can't Log In</h3>
            <p><strong>Causes:</strong> Account deactivated, password expired, account not verified</p>
            <p><strong>Solution:</strong> Check account status, reset password, resend verification email</p>

            <h3>User Has Wrong Permissions</h3>
            <p><strong>Causes:</strong> Role not updated, custom permissions conflict</p>
            <p><strong>Solution:</strong> Verify role assignment, check for conflicting permissions</p>

            <h3>Forgot Admin Password</h3>
            <p><strong>Solution:</strong> Use "Forgot Password" on login page. If that doesn't work, contact support.</p>

            <h3>2FA Not Working</h3>
            <p><strong>Causes:</strong> Wrong time on device, lost authenticator app, expired code</p>
            <p><strong>Solution:</strong> Use backup codes, regenerate 2FA setup, contact support</p>
        </div>
    </section>
</div>

@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    });
</script>
@endpush
