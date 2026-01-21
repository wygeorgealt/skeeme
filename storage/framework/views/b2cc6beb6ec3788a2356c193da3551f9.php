

<?php $__env->startSection('content'); ?>
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
    .next-section { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center; }
</style>

<div class="guide-container">
    <div class="breadcrumb" data-aos="fade-down">
        <a href="<?php echo e(url('learn/documentation')); ?>">Documentation</a> / Attendance Tracking
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Attendance Tracking</h1>
        <p>Streamline attendance management with Skeeme. Mark attendance, set up automated alerts, analyze patterns, and generate reports effortlessly.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 14 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Attendance is a key indicator of student engagement and success. Skeeme's attendance tracking system helps you monitor, analyze, and improve student attendance.</p>
            <ul class="feature-list">
                <li>Mark attendance for entire class in seconds</li>
                <li>Set up automated late/absent alerts</li>
                <li>Analyze attendance patterns and trends</li>
                <li>Generate attendance reports for parents/admins</li>
                <li>Export attendance data for records</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Marking Attendance</h2>
            
            <h3>Daily Attendance Entry</h3>

            <div class="step-box">
                <h4>✅ Marking Attendance</h4>
                <p><strong>Step 1:</strong> Open your class schedule or "Attendance" section</p>
                <p><strong>Step 2:</strong> Select the date and period</p>
                <p><strong>Step 3:</strong> Class roster appears with attendance options</p>
                <p><strong>Step 4:</strong> Mark each student as: Present, Absent, Late, or Excused</p>
                <p><strong>Step 5:</strong> Add notes if needed (e.g., "Medical appointment")</p>
                <p><strong>Step 6:</strong> Click "Save Attendance"</p>
            </div>

            <h3>Quick Entry Methods</h3>
            <ul class="feature-list">
                <li><strong>Click to Mark:</strong> Click student name to toggle present/absent</li>
                <li><strong>Bulk Actions:</strong> Mark all present, then click absents</li>
                <li><strong>Mobile App:</strong> Mark attendance from phone in classroom</li>
                <li><strong>Biometric Scanner:</strong> (Optional) Scan student IDs for instant marking</li>
            </ul>

            <h3>Attendance Categories</h3>
            <ul class="feature-list">
                <li><strong>Present (P):</strong> Student was in class</li>
                <li><strong>Absent (A):</strong> Student was not in class</li>
                <li><strong>Late (L):</strong> Student arrived after class started</li>
                <li><strong>Excused (E):</strong> Absence was authorized (doctor, approved event, etc.)</li>
                <li><strong>Half Day (H):</strong> Left early with authorization</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Mark attendance first thing in class, before getting into lessons. Make it a quick routine to ensure accuracy and completeness.
            </div>

            <h3>Adding Attendance Notes</h3>
            <p>Document context for absences:</p>
            <ul class="feature-list">
                <li>Medical appointment</li>
                <li>School-sponsored event</li>
                <li>Personal/family emergency</li>
                <li>Work release program</li>
                <li>Other (specify)</li>
            </ul>

            <p>Notes appear on attendance reports and help when contacting parents.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Managing Attendance Issues</h2>
            
            <h3>Excusing Absences</h3>
            <p>Process legitimate absences:</p>

            <div class="step-box">
                <h4>📋 Excusal Process</h4>
                <p><strong>Step 1:</strong> Receive note from parent (digital or paper)</p>
                <p><strong>Step 2:</strong> Go to student's attendance record</p>
                <p><strong>Step 3:</strong> Click "Mark as Excused" on the absence</p>
                <p><strong>Step 4:</strong> Upload or attach the parent note</p>
                <p><strong>Step 5:</strong> Add expiration date if applicable</p>
                <p><strong>Step 6:</strong> Save</p>
            </div>

            <h3>Bulk Excusal (Event-Based)</h3>
            <p>When entire class attends school event:</p>
            <ul class="feature-list">
                <li>Go to "Attendance" → "Bulk Excuse"</li>
                <li>Select date range or specific date</li>
                <li>Select students to excuse</li>
                <li>Enter reason (field trip, assembly, etc.)</li>
                <li>Apply to all selected classes</li>
            </ul>

            <h3>Chronic Absence Alerts</h3>
            <p>Automatic alerts for attendance concerns:</p>

            <div class="step-box">
                <h4>⚠️ Alert Triggers</h4>
                <p><strong>3 absences in 30 days:</strong> Warning level</p>
                <p><strong>5 absences in 30 days:</strong> Concern level - notify parent/guardian</p>
                <p><strong>10+ absences in semester:</strong> Admin/counselor notification</p>
                <p>Customize thresholds based on your school's policy</p>
            </div>

            <p>Alerts are sent via email to students, parents, and relevant staff members.</p>

            <h3>Managing Tardy Patterns</h3>
            <p>Track and address chronic lateness:</p>
            <ul class="feature-list">
                <li>Flag students with 5+ lates per month</li>
                <li>Identify if lates concentrate on certain days</li>
                <li>Schedule conference with student and parents</li>
                <li>Document interventions and outcomes</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Attendance Analysis</h2>
            
            <h3>Individual Student Attendance</h3>
            <p>Review each student's attendance record:</p>

            <ul class="feature-list">
                <li>Total absences (excused and unexcused)</li>
                <li>Attendance rate (% of classes attended)</li>
                <li>Trend (improving, stable, declining)</li>
                <li>Patterns (specific days, times, subjects)</li>
                <li>Impact on grades (correlate with academic performance)</li>
            </ul>

            <h3>Class-Level Statistics</h3>
            <p>Aggregate attendance for your class:</p>

            <ul class="feature-list">
                <li>Average attendance rate</li>
                <li>Most absent students</li>
                <li>Days with highest absence rates</li>
                <li>Trends throughout the year</li>
            </ul>

            <h3>School-Wide Analysis</h3>
            <p>For administrators, view across the school:</p>

            <ul class="feature-list">
                <li>Grade-level comparison</li>
                <li>Class comparison (which has best attendance?)</li>
                <li>Time-of-day patterns</li>
                <li>Identify school-wide issues</li>
            </ul>

            <h3>Identifying Root Causes</h3>
            <p>Look beyond the numbers:</p>
            <ul class="feature-list">
                <li>Do absences spike on Mondays/Fridays? (Possible disengagement)</li>
                <li>Do certain students skip particular subjects? (Learning difficulty?)</li>
                <li>Absence clusters during specific time periods? (External factor?)</li>
                <li>Absences increasing over time? (Intervention needed)</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Meet with chronically absent students and their families. Often there are underlying issues (transportation, home situation, learning difficulty) that can be addressed with support.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Generating Reports</h2>
            
            <h3>Attendance Reports for Different Audiences</h3>

            <div class="step-box">
                <h4>📊 Report Types</h4>
                <p><strong>For Students:</strong> Personal attendance record and status</p>
                <p><strong>For Parents:</strong> Child's attendance with school policy context</p>
                <p><strong>For Teachers:</strong> Class attendance overview</p>
                <p><strong>For Administrators:</strong> School-wide trends and analytics</p>
            </div>

            <h3>Creating Attendance Reports</h3>
            <ul class="feature-list">
                <li>Go to "Reports" → "Attendance"</li>
                <li>Select date range and class/student</li>
                <li>Choose report type (summary, detailed, trend)</li>
                <li>Customize fields to include</li>
                <li>Export as PDF, Excel, or email</li>
            </ul>

            <h3>Exporting Data</h3>
            <p>Export attendance data for external use:</p>

            <ul class="feature-list">
                <li>Excel files for further analysis</li>
                <li>CSV for integration with other systems</li>
                <li>PDF reports for official records</li>
                <li>Scheduled exports (email reports daily/weekly/monthly)</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Parent Communication</h2>
            
            <h3>Automated Attendance Notifications</h3>
            <p>Keep parents informed:</p>

            <div class="step-box">
                <h4>📧 Communication Options</h4>
                <p><strong>Daily Absence Alert:</strong> Email same day when student is absent</p>
                <p><strong>Weekly Summary:</strong> Digest of week's attendance</p>
                <p><strong>Chronic Absence Warning:</strong> When thresholds are exceeded</p>
                <p><strong>Positive Milestone:</strong> Celebrate perfect attendance</p>
            </div>

            <h3>Parent Portal Access</h3>
            <p>Parents can view their child's attendance via portal:</p>
            <ul class="feature-list">
                <li>Recent attendance record</li>
                <li>Attendance rate</li>
                <li>Alerts and concerns</li>
                <li>School attendance policy</li>
            </ul>

            <h3>Two-Way Communication</h3>
            <p>Parents can submit absence notes digitally:</p>
            <ul class="feature-list">
                <li>Upload doctor's notes</li>
                <li>Submit absence explanations</li>
                <li>Request early dismissal approval</li>
                <li>View historical records</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Attendance Policy & Compliance</h2>
            
            <h3>Setting Attendance Policies</h3>
            <p>Configure school-wide attendance rules:</p>

            <ul class="feature-list">
                <li>Acceptable absence thresholds</li>
                <li>Tardy policies and consequences</li>
                <li>Excusal procedures</li>
                <li>Make-up work policies</li>
                <li>Grade penalties for absences</li>
            </ul>

            <h3>Legal Compliance</h3>
            <p>Meet regulatory requirements:</p>

            <ul class="feature-list">
                <li>State-mandated attendance reporting</li>
                <li>Compulsory school attendance documentation</li>
                <li>Special education attendance tracking (IEP compliance)</li>
                <li>Audit trail for all attendance changes</li>
            </ul>

            <h3>Correcting Errors</h3>
            <p>If attendance is marked incorrectly:</p>

            <div class="step-box">
                <h4>🔧 Correction Process</h4>
                <p><strong>Step 1:</strong> Go to the attendance record</p>
                <p><strong>Step 2:</strong> Click "Edit" on the date in question</p>
                <p><strong>Step 3:</strong> Correct the status</p>
                <p><strong>Step 4:</strong> Add note explaining correction</p>
                <p><strong>Step 5:</strong> Save (creates audit log of change)</p>
            </div>

            <p>All changes are logged for audit and compliance purposes.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Best Practices</h2>
            
            <ul class="feature-list">
                <li><strong>Mark daily:</strong> Don't accumulate attendance to mark later</li>
                <li><strong>Be consistent:</strong> Use same standards across all classes</li>
                <li><strong>Communicate early:</strong> Don't wait until chronic absence to contact home</li>
                <li><strong>Investigate patterns:</strong> Look for root causes, not just absences</li>
                <li><strong>Document everything:</strong> Keep notes and records of conversations</li>
                <li><strong>Celebrate attendance:</strong> Recognize and reward good attendance</li>
                <li><strong>Use data:</strong> Let attendance data guide interventions</li>
                <li><strong>Support access:</strong> Help families overcome barriers to attendance</li>
                <li><strong>Partner with counselors:</strong> Refer chronic issues to support staff</li>
                <li><strong>Monitor trends:</strong> Review reports regularly, not just at end of year</li>
            </ul>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Next: Generating Reports</h3>
            <p>Learn to create comprehensive reports for all stakeholders. Check out our <a href="<?php echo e(url('learn/documentation/generating-reports')); ?>">Generating Reports</a> guide.</p>
        </div>
    </section>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    });
</script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\learn\attendance-tracking.blade.php ENDPATH**/ ?>