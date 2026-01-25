

<?php $__env->startSection('content'); ?>
<style>
    :root { 
        --bg-color: #0f0f14; 
        --text-color: #ffffff; 
        --text-muted: #9ca3af; 
        --border-color: rgba(255, 255, 255, 0.1); 
    }
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
    .step-box p { margin-bottom: 0.5rem; }
    .tip-box { background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
    .tip-box strong { color: #22c55e; }
    .warning-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
    .warning-box strong { color: #ef4444; }
    .code-block { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; font-family: 'Courier New', monospace; font-size: 0.9rem; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 0.75rem 0; padding-left: 2rem; position: relative; color: #d1d5db; }
    .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
    .breadcrumb { color: #9ca3af; margin-bottom: 2rem; font-size: 0.9rem; }
    .breadcrumb a { color: #3b82f6; text-decoration: none; }
    .next-section { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center; }
    .next-section a { color: #3b82f6; text-decoration: none; font-weight: 600; }
    .role-card { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border: 1px solid rgba(59, 130, 246, 0.3); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
    .role-card h4 { color: #3b82f6; margin-bottom: 0.5rem; }
    .role-card p { margin-bottom: 0.5rem; }
</style>

<div class="guide-container">
    <div class="breadcrumb" data-aos="fade-down">
        <a href="<?php echo e(url('learn/documentation')); ?>">Documentation</a> / Inviting Users
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Inviting Users Guide</h1>
        <p>Learn how to invite teachers, students, administrators, and parents to your Skeeme school. Set up roles, permissions, and customize access levels for different user types.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 15 minutes</p>
    </section>

    <section class="guide-content">
        <!-- Overview -->
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Your Skeeme platform is only as effective as the people using it. This guide covers how to invite different types of users, assign them appropriate roles and permissions, and help them get started with the platform.</p>
            <p>Skeeme supports multiple user types, each with different capabilities:</p>
            <ul class="feature-list">
                <li>Administrators - manage the school and all features</li>
                <li>Teachers - create exams, manage students, grade work</li>
                <li>Students - take exams, view grades, submit assignments</li>
                <li>Parents - monitor student progress</li>
            </ul>
        </div>

        <!-- User Roles Overview -->
        <div class="section" data-aos="fade-up">
            <h2>Understanding User Roles & Permissions</h2>
            
            <p>Before inviting users, understand the different roles available in Skeeme:</p>

            <div class="role-card">
                <h4>👑 Super Administrator</h4>
                <p>Full access to all features and settings. Can manage users, configure the school, access all data, and manage billing.</p>
                <p><strong>Recommended for:</strong> Head of school, IT director, principal</p>
            </div>

            <div class="role-card">
                <h4>📚 Academic Administrator</h4>
                <p>Can manage exams, grades, student records, academic calendar, and class structures. Limited access to billing and user management.</p>
                <p><strong>Recommended for:</strong> Vice principal, curriculum coordinator, exam officer</p>
            </div>

            <div class="role-card">
                <h4>👥 User Administrator</h4>
                <p>Can invite users, manage roles and permissions, deactivate accounts, and view user activity logs. No access to academic data or billing.</p>
                <p><strong>Recommended for:</strong> HR staff, office administrators</p>
            </div>

            <div class="role-card">
                <h4>💼 Finance Administrator</h4>
                <p>Can manage school billing, subscription plans, invoices, and payment methods. No access to academic or user management features.</p>
                <p><strong>Recommended for:</strong> Finance officer, bursar, accounts manager</p>
            </div>

            <div class="role-card">
                <h4>🎓 Teacher</h4>
                <p>Can create and manage exams, view and grade student submissions, create question banks, and view class analytics. Cannot access admin features.</p>
                <p><strong>Recommended for:</strong> All teaching staff</p>
            </div>

            <div class="role-card">
                <h4>👨‍🎓 Student</h4>
                <p>Can take assigned exams, view their grades, see feedback, and download certificates. Cannot create exams or access other student data.</p>
                <p><strong>Recommended for:</strong> All students</p>
            </div>

            <div class="role-card">
                <h4>👨‍👩‍👧 Parent</h4>
                <p>Can view their child's grades, exam results, attendance, and receive progress reports. Cannot modify any data or access other students' information.</p>
                <p><strong>Recommended for:</strong> Parents/guardians (optional feature)</p>
            </div>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Start with restrictive permissions and expand as needed. Use role-based access control (RBAC) to ensure users only see what they need to see.
            </div>
        </div>

        <!-- Inviting Teachers -->
        <div class="section" data-aos="fade-up">
            <h2>Inviting Teachers</h2>
            
            <p>Teachers are central to your Skeeme implementation. Here's how to invite them:</p>

            <h3>Single Teacher Invitation</h3>

            <div class="step-box">
                <h4>Step-by-Step Process</h4>
                <p><strong>Step 1:</strong> Log in to your admin dashboard</p>
                <p><strong>Step 2:</strong> Navigate to "User Management" → "Teachers"</p>
                <p><strong>Step 3:</strong> Click "Invite Teacher"</p>
                <p><strong>Step 4:</strong> Fill in the teacher's details:</p>
            </div>

            <ul class="feature-list">
                <li>Email address (must be unique)</li>
                <li>First and last name</li>
                <li>Employee ID (optional but recommended)</li>
                <li>Phone number (optional)</li>
                <li>Subject(s) taught</li>
                <li>Classes/grades assigned</li>
            </ul>

            <p>Once submitted, the teacher will receive an invitation email with a personalized link. They have 14 days to accept and set up their account.</p>

            <h3>Bulk Teacher Import</h3>
            <p>For schools with many teachers, bulk import saves significant time. Use a CSV file with the following format:</p>

            <div class="code-block">email,first_name,last_name,employee_id,phone,subject,classes
john.doe@school.edu,John,Doe,T001,+234801234567,"Mathematics","Form 1A;Form 1B;Form 2A"
jane.smith@school.edu,Jane,Smith,T002,+234801234568,"English Language","Form 1A;Form 1B"
paul.johnson@school.edu,Paul,Johnson,T003,+234801234569,"Physics","Form 3A;Form 3B;Form 4A"</div>

            <div class="step-box">
                <h4>📁 Bulk Import Steps</h4>
                <p><strong>Step 1:</strong> Prepare your CSV file with the format shown above</p>
                <p><strong>Step 2:</strong> Go to User Management → Teachers → "Bulk Import"</p>
                <p><strong>Step 3:</strong> Upload your CSV file</p>
                <p><strong>Step 4:</strong> Review the preview and click "Import"</p>
                <p>All teachers will receive invitation emails automatically.</p>
            </div>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Ensure email addresses are unique and valid. Duplicate emails will be skipped during import. Teachers with invalid emails won't receive invitations.
            </div>

            <h3>What Teachers Receive</h3>
            <p>When you invite a teacher, they'll receive an email containing:</p>
            <ul class="feature-list">
                <li>Personalized welcome message</li>
                <li>Link to set up their account</li>
                <li>Instructions for their first login</li>
                <li>Contact information for support</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Send a follow-up message via your regular school communication channels. Some teachers may miss the initial email, especially if it goes to spam.
            </div>

            <h3>Teacher Account Setup</h3>
            <p>When teachers accept their invitation, they'll:</p>
            <ul class="feature-list">
                <li>Verify their email address</li>
                <li>Create a strong password</li>
                <li>Set up two-factor authentication (optional but recommended)</li>
                <li>Configure their profile (profile picture, bio, etc.)</li>
                <li>Accept the terms of service</li>
            </ul>

            <p>After completing setup, teachers can immediately start creating exams and managing their classes.</p>
        </div>

        <!-- Inviting Students -->
        <div class="section" data-aos="fade-up">
            <h2>Inviting Students</h2>
            
            <p>Students typically make up the largest user base. Skeeme supports several ways to add students:</p>

            <h3>Method 1: Invite via Email</h3>
            <p>For individual or small groups of students:</p>

            <div class="step-box">
                <h4>📧 Individual Student Invitation</h4>
                <p><strong>Step 1:</strong> Go to User Management → Students → "Invite Student"</p>
                <p><strong>Step 2:</strong> Enter student email, full name, and class</p>
                <p><strong>Step 3:</strong> Click "Send Invitation"</p>
                <p>Student receives email and sets up account</p>
            </div>

            <h3>Method 2: Bulk Import from Class Lists</h3>
            <p>Import students directly from class enrollment lists:</p>

            <div class="code-block">email,first_name,last_name,matric_number,class,date_of_birth
adekunle.akin@school.edu,Adekunle,Akin,STU001,Form 3A,2007-05-15
bola.oladele@school.edu,Bola,Oladele,STU002,Form 3A,2007-06-20
chioma.nwosu@school.edu,Chioma,Nwosu,STU003,Form 3A,2007-04-10</div>

            <div class="step-box">
                <h4>📋 Student Bulk Import Steps</h4>
                <p><strong>Step 1:</strong> Prepare CSV with student details</p>
                <p><strong>Step 2:</strong> Go to User Management → Students → "Bulk Import"</p>
                <p><strong>Step 3:</strong> Upload CSV file</p>
                <p><strong>Step 4:</strong> Select which classes to assign students</p>
                <p><strong>Step 5:</strong> Review and confirm import</p>
            </div>

            <h3>Method 3: Import from Your Student Information System (SIS)</h3>
            <p>Many schools have existing student information systems. Skeeme can integrate with common platforms:</p>

            <ul class="feature-list">
                <li>PowerSchool</li>
                <li>Veracross</li>
                <li>iSAMS</li>
                <li>Skyward</li>
                <li>Custom integrations via API</li>
            </ul>

            <p>Contact Skeeme support to set up SIS integration for your school. This enables automatic syncing of student data and keeps enrollment up to date.</p>

            <h3>Student Account Creation Options</h3>
            <p>When inviting students, you have two options:</p>

            <div class="role-card">
                <h4>🔗 Option 1: Email Invitation</h4>
                <p>Students receive an email and create their own password. Good for secondary schools where students can manage their own accounts. Students have 14 days to accept.</p>
            </div>

            <div class="role-card">
                <h4>🔐 Option 2: Temporary Credentials</h4>
                <p>Admin sets a temporary password shared with students (verbally, via paper, etc.). Students must change password on first login. Good for primary schools or when emails are unavailable.</p>
            </div>

            <h3>Managing Class Enrollment</h3>
            <p>After importing students, manage their class assignments:</p>

            <ul class="feature-list">
                <li>View all students in a class</li>
                <li>Move students between classes</li>
                <li>Remove students from classes</li>
                <li>Bulk reassign students</li>
                <li>Export enrollment reports</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Keep your class enrollment synced with your SIS. This ensures students can only access their own exams and can't view other classes' materials.
            </div>
        </div>

        <!-- Inviting Parents -->
        <div class="section" data-aos="fade-up">
            <h2>Inviting Parents (Optional)</h2>
            
            <p>Parents can monitor their children's academic progress. This is an optional feature you can enable:</p>

            <h3>Setting Up Parent Access</h3>
            <p>Parents can only access information for their children. Link parents to students:</p>

            <div class="step-box">
                <h4>👨‍👩‍👧 Adding Parent Guardians</h4>
                <p><strong>Step 1:</strong> Go to Students → Select a Student → "Add Guardian"</p>
                <p><strong>Step 2:</strong> Enter parent's email and relationship (Parent, Guardian, etc.)</p>
                <p><strong>Step 3:</strong> Skeeme sends invitation to parent</p>
                <p>Parent accepts and can now view their child's data</p>
            </div>

            <h3>Bulk Parent Assignment</h3>
            <p>For larger implementations, import parent relationships via CSV:</p>

            <div class="code-block">student_email,parent_email,parent_name,relationship
adekunle.akin@school.edu,akinola.mother@gmail.com,Akinola Akin,Mother
adekunle.akin@school.edu,akinola.father@gmail.com,Akinola Akin Senior,Father
bola.oladele@school.edu,oladele.parent@outlook.com,Mrs Oladele,Mother</div>

            <h3>Parent Dashboard Access</h3>
            <p>Parents can access:</p>
            <ul class="feature-list">
                <li>Student exam results and scores</li>
                <li>Subject-wise performance analysis</li>
                <li>Attendance records</li>
                <li>Teacher feedback and comments</li>
                <li>Progress reports and certificates</li>
                <li>Email notifications of major milestones</li>
            </ul>

            <p>Parents cannot see other students' data or any confidential school information.</p>
        </div>

        <!-- Adding Administrators -->
        <div class="section" data-aos="fade-up">
            <h2>Adding Administrators</h2>
            
            <p>Delegate administrative tasks by adding trusted staff members as administrators with appropriate role-based permissions.</p>

            <h3>Adding an Administrator</h3>

            <div class="step-box">
                <h4>🔑 Administrator Invitation Process</h4>
                <p><strong>Step 1:</strong> Go to User Management → Administrators</p>
                <p><strong>Step 2:</strong> Click "Add Administrator"</p>
                <p><strong>Step 3:</strong> Select their administrative role (see roles section above)</p>
                <p><strong>Step 4:</strong> Enter email and name</p>
                <p><strong>Step 5:</strong> Configure specific permissions for their role</p>
                <p><strong>Step 6:</strong> Send invitation</p>
            </div>

            <h3>Permission Customization</h3>
            <p>Each administrative role comes with default permissions, but you can customize them:</p>

            <ul class="feature-list">
                <li>User Management - create, edit, deactivate users</li>
                <li>Academic Management - create/edit exams and classes</li>
                <li>Grading - approve grades, view grade statistics</li>
                <li>Analytics - view and export reports</li>
                <li>Billing - manage subscriptions and payments</li>
                <li>System Settings - configure school-wide preferences</li>
                <li>Audit Logs - view user activity and changes</li>
            </ul>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Only grant Super Admin access to people you absolutely trust. This role has full access to everything, including sensitive student data and billing information. Document who has what access for compliance purposes.
            </div>

            <h3>Managing Administrator Changes</h3>
            <p>When an administrator leaves or changes roles:</p>
            <ul class="feature-list">
                <li>Change their role to "Inactive" or "Deactivated"</li>
                <li>Transfer their exams and data to another administrator</li>
                <li>Review and revoke their access in "Access Logs"</li>
                <li>Keep a record of who had which access and when</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Have at least two Super Admins at your school for continuity. If one is unavailable, the other can manage critical issues.
            </div>
        </div>

        <!-- Managing Invitations -->
        <div class="section" data-aos="fade-up">
            <h2>Managing Invitations & User Onboarding</h2>
            
            <h3>Tracking Pending Invitations</h3>
            <p>Monitor who hasn't yet accepted their invitation:</p>

            <div class="step-box">
                <h4>📊 Invitation Status Dashboard</h4>
                <p>Go to User Management → "Pending Invitations" to see:</p>
                <p>Users who received invitations but haven't activated their accounts, Date invitation was sent, Days remaining before expiry, Option to resend or cancel invitation</p>
            </div>

            <h3>Resending Invitations</h3>
            <p>If a user doesn't receive their invitation or loses the link:</p>
            <ul class="feature-list">
                <li>Go to Pending Invitations</li>
                <li>Find the user and click "Resend Invitation"</li>
                <li>New link is generated and sent to their email</li>
            </ul>

            <h3>Onboarding Best Practices</h3>
            <p>Make user onboarding smooth:</p>
            <ul class="feature-list">
                <li>Send invitations in batches at designated times (e.g., beginning of term)</li>
                <li>Provide clear instructions in the invitation email</li>
                <li>Follow up with non-responsive users within a week</li>
                <li>Offer live onboarding sessions or video tutorials</li>
                <li>Have a dedicated support contact for new users</li>
                <li>Create a "getting started" guide specific to each role</li>
            </ul>

            <h3>First Login Experience</h3>
            <p>When users first log in, they should:</p>
            <ul class="feature-list">
                <li>See a welcome dashboard specific to their role</li>
                <li>Have access to relevant guides and tutorials</li>
                <li>Know who to contact for help</li>
                <li>Understand their responsibilities and capabilities</li>
            </ul>
        </div>

        <!-- Deactivating Users -->
        <div class="section" data-aos="fade-up">
            <h2>Deactivating Users</h2>
            
            <p>When users leave or should no longer have access, deactivate their accounts:</p>

            <h3>How to Deactivate a User</h3>

            <div class="step-box">
                <h4>🚫 Deactivation Steps</h4>
                <p><strong>Step 1:</strong> Go to User Management → Select user</p>
                <p><strong>Step 2:</strong> Click "Actions" → "Deactivate Account"</p>
                <p><strong>Step 3:</strong> Confirm action</p>
                <p>User can no longer log in, but their data is preserved</p>
            </div>

            <h3>What Happens When You Deactivate</h3>
            <ul class="feature-list">
                <li>User loses access to Skeeme immediately</li>
                <li>All their data is preserved for records</li>
                <li>Exams created by them remain active (can be reassigned)</li>
                <li>Grades and submissions are retained</li>
                <li>You can reactivate if needed later</li>
            </ul>

            <h3>Data Considerations</h3>
            <p>Before deactivating, ensure:</p>
            <ul class="feature-list">
                <li>Transfer responsibility for active exams to another teacher</li>
                <li>Download/backup any important documents they created</li>
                <li>Notify students affected by the change</li>
                <li>Document the deactivation date for compliance</li>
            </ul>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Don't delete user accounts permanently unless required by law. Deactivation is safer as you preserve historical data and can audit past actions.
            </div>
        </div>

        <!-- Common Issues -->
        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting Invitation Issues</h2>
            
            <h3>User Not Receiving Invitation Email</h3>
            <p><strong>Causes:</strong> Email in spam, invalid email address, email server blocking</p>
            <p><strong>Solutions:</strong></p>
            <ul class="feature-list">
                <li>Check with user to confirm email address is correct</li>
                <li>Ask user to check spam/junk folders</li>
                <li>Whitelist noreply@skeeme.com in your mail system</li>
                <li>Resend invitation from pending invitations dashboard</li>
                <li>Consider using temporary credentials instead</li>
            </ul>

            <h3>Duplicate Email Addresses</h3>
            <p><strong>Causes:</strong> Multiple users with same email, import errors</p>
            <p><strong>Solutions:</strong></p>
            <ul class="feature-list">
                <li>Email addresses must be unique in Skeeme</li>
                <li>For students, use firstname.lastname@school.edu format</li>
                <li>If someone has multiple roles, they need only one account</li>
                <li>Review and clean up duplicate emails in import file before uploading</li>
            </ul>

            <h3>User Forgot Invitation Link</h3>
            <p><strong>Solution:</strong> Resend invitation from pending invitations dashboard. New link will be generated.</p>

            <h3>Invitation Expired</h3>
            <p><strong>Causes:</strong> Link older than 14 days</p>
            <p><strong>Solutions:</strong></p>
            <ul class="feature-list">
                <li>Resend the invitation</li>
                <li>Deactivate old invitation and create new one</li>
            </ul>

            <h3>CSV Import Failed</h3>
            <p><strong>Common causes:</strong></p>
            <ul class="feature-list">
                <li>Missing required columns (email, name)</li>
                <li>Invalid email formats</li>
                <li>Duplicate emails in the file</li>
                <li>Incorrect file encoding (use UTF-8)</li>
                <li>Wrong CSV format (check documentation)</li>
            </ul>
            <p><strong>Solution:</strong> Review error messages, fix CSV, and retry upload.</p>
        </div>

        <!-- Best Practices -->
        <div class="section" data-aos="fade-up">
            <h2>Best Practices for User Invitation</h2>
            
            <ul class="feature-list">
                <li><strong>Plan invitations strategically:</strong> Invite users at the beginning of terms or semesters, not randomly throughout the year</li>
                <li><strong>Use SIS integration:</strong> Automate enrollment syncing if possible</li>
                <li><strong>Assign minimal permissions:</strong> Follow the principle of least privilege</li>
                <li><strong>Document everything:</strong> Keep records of who was invited, when, and their roles</li>
                <li><strong>Enable 2FA for admins:</strong> Add security layer for high-privilege accounts</li>
                <li><strong>Review access regularly:</strong> Quarterly audit of user access and permissions</li>
                <li><strong>Communicate clearly:</strong> Send welcome emails and onboarding information</li>
                <li><strong>Test with one user first:</strong> Before bulk imports, test with a single user</li>
                <li><strong>Have a support plan:</strong> Help desk contact for new users</li>
                <li><strong>Keep your directory clean:</strong> Deactivate accounts for departed staff/students</li>
            </ul>
        </div>

        <!-- Next Steps -->
        <div class="section" data-aos="fade-up">
            <h2>What's Next?</h2>
            <p>Now that you've invited your users, the next step is to get them creating and taking exams:</p>
            
            <ul class="feature-list">
                <li>Teachers: Read "Creating Your First Exam"</li>
                <li>Students: Complete profile setup and practice taking a sample exam</li>
                <li>Admins: Configure grading scales and exam settings</li>
            </ul>

            <div class="next-section">
                <h3 style="margin-top: 0;">Ready to create your first exam?</h3>
                <p>Head over to the <a href="<?php echo e(url('learn/documentation/creating-first-exam')); ?>">Creating Your First Exam</a> guide to get started.</p>
            </div>
        </div>
    </section>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
    });
</script>
<?php $__env->stopPush(); ?>
<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\learn\inviting-users.blade.php ENDPATH**/ ?>