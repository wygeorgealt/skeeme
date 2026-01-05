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
    .warning-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 0.75rem 0; padding-left: 2rem; position: relative; color: #d1d5db; }
    .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
    .breadcrumb { color: #9ca3af; margin-bottom: 2rem; font-size: 0.9rem; }
    .breadcrumb a { color: #3b82f6; text-decoration: none; }
    .next-section { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center; }
</style>

<div class="guide-container">
    <div class="breadcrumb" data-aos="fade-down">
        <a href="{{ url('learn/documentation') }}">Documentation</a> / Data Import & Export
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Data Import & Export</h1>
        <p>Efficiently import student and enrollment data into Skeeme. Export reports and analytics for external analysis and integration with other systems.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 16 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Skeeme provides powerful import and export capabilities to move data in and out of the system. Whether you're importing student rosters, syncing with your SIS, or exporting data for analysis, these tools streamline your workflow.</p>
            <ul class="feature-list">
                <li>Import student data from CSV files</li>
                <li>Sync with Student Information Systems (SIS)</li>
                <li>Export grades, results, and analytics</li>
                <li>Backup data regularly</li>
                <li>Integrate with external systems via API</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Importing Student Data</h2>
            
            <h3>CSV File Format for Student Import</h3>

            <div class="step-box">
                <h4>📋 Required Columns</h4>
                <p><strong>Required:</strong> first_name, last_name, email, class</p>
                <p><strong>Optional:</strong> student_id, date_of_birth, phone, address, parent_email, emergency_contact</p>
            </div>

            <h3>Sample CSV Format</h3>
            <p style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; overflow-x: auto;">
first_name,last_name,email,student_id,class,date_of_birth,parent_email<br>
Adekunle,Akin,adekunle@school.edu,STU001,Form 3A,2007-05-15,adekunle.parent@email.com<br>
Bola,Oladele,bola@school.edu,STU002,Form 3A,2007-06-20,bola.parent@email.com<br>
Chioma,Nwosu,chioma@school.edu,STU003,Form 3A,2007-04-10,chioma.parent@email.com
            </p>

            <h3>Preparing Your CSV File</h3>

            <ul class="feature-list">
                <li>Use UTF-8 encoding (not Windows-1252)</li>
                <li>Include header row with column names</li>
                <li>One student per row</li>
                <li>Email addresses must be unique</li>
                <li>Class names must match existing classes in Skeeme</li>
                <li>Remove any special characters from data</li>
            </ul>

            <h3>Step-by-Step Import Process</h3>

            <div class="step-box">
                <h4>📤 Importing Students</h4>
                <p><strong>Step 1:</strong> Go to Admin → User Management → Students → "Bulk Import"</p>
                <p><strong>Step 2:</strong> Click "Choose File" and select your CSV</p>
                <p><strong>Step 3:</strong> Skeeme shows preview of data</p>
                <p><strong>Step 4:</strong> Match columns if necessary (map email to email, etc.)</p>
                <p><strong>Step 5:</strong> Review any errors</p>
                <p><strong>Step 6:</strong> Click "Import"</p>
            </div>

            <h3>Import Validation</h3>
            <p>Before importing, Skeeme checks:</p>
            <ul class="feature-list">
                <li>All required fields are present</li>
                <li>Email addresses are unique</li>
                <li>Class names exist</li>
                <li>Date formats are valid</li>
                <li>No duplicate rows</li>
            </ul>

            <p>Any errors are listed before import. You can fix the CSV and retry, or skip problem rows.</p>

            <h3>After Import</h3>
            <p>Once imported, students:</p>
            <ul class="feature-list">
                <li>Are added to their assigned classes</li>
                <li>Receive welcome emails (if email invitations enabled)</li>
                <li>Can log in with their email address</li>
                <li>Appear on class rosters</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Test import with a small sample first (10 students) to catch any format issues before importing your full roster.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>SIS Integration & Sync</h2>
            
            <h3>What is SIS Integration?</h3>
            <p>SIS (Student Information System) integration automatically syncs student enrollment data between your school's SIS and Skeeme. This ensures:</p>
            <ul class="feature-list">
                <li>Student data is always current</li>
                <li>New enrollments automatically appear</li>
                <li>Transfers and withdrawals update automatically</li>
                <li>No manual data entry needed</li>
            </ul>

            <h3>Supported SIS Platforms</h3>
            <p>Skeeme integrates with:</p>
            <ul class="feature-list">
                <li>PowerSchool</li>
                <li>Veracross</li>
                <li>iSAMS</li>
                <li>Skyward</li>
                <li>Infinite Campus</li>
                <li>Custom integrations via API</li>
            </ul>

            <h3>Setting Up SIS Integration</h3>

            <div class="step-box">
                <h4>🔗 Integration Setup</h4>
                <p><strong>Step 1:</strong> Go to Admin → Integrations → SIS</p>
                <p><strong>Step 2:</strong> Select your SIS platform</p>
                <p><strong>Step 3:</strong> Enter API credentials (from your SIS provider)</p>
                <p><strong>Step 4:</strong> Configure sync settings (daily, weekly, etc.)</p>
                <p><strong>Step 5:</strong> Test connection</p>
                <p><strong>Step 6:</strong> Enable automatic sync</p>
            </p>
            </div>

            <h3>What Gets Synced</h3>
            <ul class="feature-list">
                <li>Student names and contact info</li>
                <li>Student ID and demographic data</li>
                <li>Class enrollment</li>
                <li>Grade level</li>
                <li>Parent/guardian information</li>
            </ul>

            <h3>Sync Frequency</h3>
            <p>Configure how often data syncs:</p>
            <ul class="feature-list">
                <li>Real-time (immediate changes)</li>
                <li>Daily (nightly sync at set time)</li>
                <li>Weekly (once per week)</li>
                <li>Manual (on-demand sync)</li>
            </ul>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Before enabling SIS sync, ensure field mapping is correct. Incorrect mapping can overwrite Skeeme data with wrong information.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Exporting Data from Skeeme</h2>
            
            <h3>What Can Be Exported</h3>
            <ul class="feature-list">
                <li>Student lists and rosters</li>
                <li>Exam results and grades</li>
                <li>Attendance data</li>
                <li>Performance analytics</li>
                <li>Class enrollments</li>
                <li>User accounts and permissions</li>
                <li>Question banks</li>
            </ul>

            <h3>Export Formats</h3>

            <div class="step-box">
                <h4>📊 Available Formats</h4>
                <p><strong>CSV:</strong> For Excel, databases, or integration with other systems</p>
                <p><strong>Excel:</strong> Ready-to-use spreadsheets</p>
                <p><strong>PDF:</strong> Formatted reports for distribution</p>
                <p><strong>JSON:</strong> For API integration and custom applications</p>
                <p><strong>XML:</strong> For some legacy system integrations</p>
            </div>

            <h3>Exporting Student Data</h3>

            <div class="step-box">
                <h4>👥 Export Steps</h4>
                <p><strong>Step 1:</strong> Go to Admin → User Management → Students</p>
                <p><strong>Step 2:</strong> Filter students if needed (by class, grade, etc.)</p>
                <p><strong>Step 3:</strong> Click "Export"</p>
                <p><strong>Step 4:</strong> Choose format and fields to include</p>
                <p><strong>Step 5:</strong> Click "Download"</p>
            </div>

            <h3>Exporting Grades & Results</h3>
            <ul class="feature-list">
                <li>Go to Reports section</li>
                <li>Select the report type</li>
                <li>Choose export format</li>
                <li>Click "Export"</li>
            </ul>

            <h3>Batch Exports</h3>
            <p>Export multiple reports at once:</p>
            <ul class="feature-list">
                <li>Set start and end dates</li>
                <li>Select multiple classes or subjects</li>
                <li>All reports download as ZIP file</li>
                <li>Useful at end of term or year</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Export data regularly for backup purposes. If something goes wrong, you have recent backups to restore from.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Data Backup & Management</h2>
            
            <h3>Automatic Backups</h3>
            <p>Skeeme automatically backs up your data:</p>
            <ul class="feature-list">
                <li>Daily backups of all data</li>
                <li>30-day backup history</li>
                <li>Automatic disaster recovery</li>
                <li>Stored in secure, redundant locations</li>
            </ul>

            <h3>Requesting Manual Backups</h3>
            <p>You can request additional backups:</p>

            <div class="step-box">
                <h4>💾 Backup Request</h4>
                <p><strong>Step 1:</strong> Go to Admin → Data Management → Backups</p>
                <p><strong>Step 2:</strong> Click "Request Backup"</p>
                <p><strong>Step 3:</strong> Backup is created within minutes</p>
                <p><strong>Step 4:</strong> Download the file</p>
            </div>

            <h3>Data Retention Policies</h3>
            <p>Configure how long data is kept:</p>
            <ul class="feature-list">
                <li>Student data: Typically 3-5 years after graduation</li>
                <li>Exam data: 3-7 years for audit purposes</li>
                <li>Attendance: 1 year minimum (check local laws)</li>
                <li>Comply with FERPA and local data protection laws</li>
            </ul>

            <h3>Deleting Data</h3>
            <p>If you need to delete old data:</p>

            <ul class="feature-list">
                <li>Backup first (always!)</li>
                <li>Export for archive</li>
                <li>Contact support for bulk deletions</li>
                <li>Document why data is being deleted</li>
                <li>Ensure compliance with regulations</li>
            </ul>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Always backup before deleting any data. Deletions are permanent and cannot be undone.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>API Integration for Custom Applications</h2>
            
            <h3>What is the Skeeme API?</h3>
            <p>The API (Application Programming Interface) allows developers to build custom integrations with Skeeme:</p>
            <ul class="feature-list">
                <li>Read student data programmatically</li>
                <li>Create exams and questions via code</li>
                <li>Access grades and results</li>
                <li>Build custom dashboards</li>
                <li>Integrate with other school systems</li>
            </ul>

            <h3>Getting API Access</h3>

            <div class="step-box">
                <h4>🔐 API Setup</h4>
                <p><strong>Step 1:</strong> Go to Admin → Integrations → API</p>
                <p><strong>Step 2:</strong> Click "Generate API Key"</p>
                <p><strong>Step 3:</strong> Save the key securely (shown only once!)</p>
                <p><strong>Step 4:</strong> Share with your developer</p>
                <p><strong>Step 5:</strong> Developer builds integration</p>
            </div>

            <h3>API Documentation</h3>
            <p>Complete API documentation is available at:</p>
            <p style="color: #3b82f6;">https://api.skeeme.com/docs</p>

            <p>Includes endpoints for:</p>
            <ul class="feature-list">
                <li>Students and enrollment</li>
                <li>Exams and questions</li>
                <li>Grades and results</li>
                <li>Attendance</li>
                <li>Reports and analytics</li>
            </ul>

            <h3>Security & Permissions</h3>
            <ul class="feature-list">
                <li>API keys are sensitive - don't share publicly</li>
                <li>Restrict API access to trusted applications only</li>
                <li>Audit API access logs regularly</li>
                <li>Regenerate keys if compromised</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting Import/Export Issues</h2>
            
            <h3>CSV Import Fails</h3>
            <p><strong>Causes:</strong> Wrong format, encoding issue, duplicate emails, invalid class names</p>
            <p><strong>Solutions:</strong> Check column headers, ensure UTF-8 encoding, verify emails are unique, confirm class names exist</p>

            <h3>Data Looks Wrong After Import</h3>
            <p><strong>Causes:</strong> Incorrect column mapping, formatting issues</p>
            <p><strong>Solutions:</strong> Verify the preview before importing, check CSV for special characters</p>

            <h3>Export File is Empty</h3>
            <p><strong>Causes:</strong> No data matches filters, permissions issue</p>
            <p><strong>Solutions:</strong> Check date range and filters, verify you have permission to export</p>

            <h3>SIS Sync Not Working</h3>
            <p><strong>Causes:</strong> Wrong credentials, network issue, invalid API key</p>
            <p><strong>Solutions:</strong> Verify credentials with SIS provider, test connection, check firewall/proxy settings</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Best Practices</h2>
            
            <ul class="feature-list">
                <li><strong>Backup regularly:</strong> Export data weekly or monthly</li>
                <li><strong>Test imports:</strong> Always test with sample data first</li>
                <li><strong>Use SIS sync:</strong> Automate data flow from your existing system</li>
                <li><strong>Validate exports:</strong> Check exported data matches what you expect</li>
                <li><strong>Secure API keys:</strong> Treat like passwords, don't share publicly</li>
                <li><strong>Document integrations:</strong> Keep notes on what systems are connected</li>
                <li><strong>Audit access:</strong> Review who's exporting/importing data</li>
                <li><strong>Comply with privacy:</strong> Protect student data when exporting</li>
                <li><strong>Archive old data:</strong> Export before deleting for records</li>
                <li><strong>Train staff:</strong> Ensure admins understand import/export processes</li>
            </ul>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Need More Help?</h3>
            <p>Check out our full documentation or contact support at support@skeeme.com for assistance with data import/export.</p>
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
