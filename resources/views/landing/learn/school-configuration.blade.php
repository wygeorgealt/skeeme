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
    .next-section { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center; }
</style>

<div class="guide-container">
    <div class="breadcrumb" data-aos="fade-down">
        <a href="{{ url('learn/documentation') }}">Documentation</a> / School Configuration
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>School Configuration</h1>
        <p>Configure your school's academic structure, calendar, classes, and settings. Establish the foundation for all school operations in Skeeme.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 14 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>School configuration is the foundation of everything in Skeeme. Getting this right from the start makes all subsequent operations smooth and prevents confusion later.</p>
            <ul class="feature-list">
                <li>Configure academic calendar and terms</li>
                <li>Set up classes, grades, and sections</li>
                <li>Define departments and subject areas</li>
                <li>Configure grading scales</li>
                <li>Set system-wide preferences</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Academic Calendar Setup</h2>
            
            <h3>Creating Academic Years</h3>

            <div class="step-box">
                <h4>📅 Setting Up Academic Year</h4>
                <p><strong>Step 1:</strong> Go to Admin → School Settings → Academic Calendar</p>
                <p><strong>Step 2:</strong> Click "Add Academic Year"</p>
                <p><strong>Step 3:</strong> Set year (e.g., 2024-2025)</p>
                <p><strong>Step 4:</strong> Set start date and end date</p>
                <p><strong>Step 5:</strong> Click "Save"</p>
            </div>

            <h3>Defining Terms/Semesters</h3>
            <p>Break the academic year into terms:</p>

            <ul class="feature-list">
                <li><strong>Semesters:</strong> Two equal halves of the year</li>
                <li><strong>Trimesters:</strong> Three equal periods</li>
                <li><strong>Quarters:</strong> Four equal periods</li>
                <li><strong>Custom Terms:</strong> Define your own structure</li>
            </ul>

            <div class="step-box">
                <h4>📊 Adding Terms</h4>
                <p><strong>Step 1:</strong> Go to Academic Year settings</p>
                <p><strong>Step 2:</strong> Click "Add Term"</p>
                <p><strong>Step 3:</strong> Name the term (e.g., "Term 1", "Fall Semester")</p>
                <p><strong>Step 4:</strong> Set start and end dates</p>
                <p><strong>Step 5:</strong> Repeat for each term</p>
            </div>

            <h3>Holiday & Break Periods</h3>
            <p>Mark non-instructional days:</p>

            <div class="step-box">
                <h4>🏖️ Adding Holidays</h4>
                <p><strong>Step 1:</strong> In Academic Calendar, click "Add Holiday"</p>
                <p><strong>Step 2:</strong> Name (e.g., "Christmas Break")</p>
                <p><strong>Step 3:</strong> Select dates</p>
                <p><strong>Step 4:</strong> Select "Holiday" or "Staff Development"</p>
                <p><strong>Step 5:</strong> Save</p>
            </div>

            <p>Holidays prevent exams from being scheduled during breaks and appear on all calendars.</p>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Set up your entire academic year and holidays at the beginning of the year. This prevents conflicts and makes exam scheduling easier later.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Class & Grade Structure</h2>
            
            <h3>Creating Grade Levels</h3>

            <div class="step-box">
                <h4>🏫 Adding Grade Levels</h4>
                <p><strong>Step 1:</strong> Go to Admin → Academic Setup → Grades</p>
                <p><strong>Step 2:</strong> Click "Add Grade"</p>
                <p><strong>Step 3:</strong> Name (e.g., "Form 1", "Grade 9", "Senior 2")</p>
                <p><strong>Step 4:</strong> Set order/level (for proper sequencing)</p>
                <p><strong>Step 5:</strong> Save</p>
            </div>

            <p>Create grades in order from first to last. This is used for sequencing in reports and student progression.</p>

            <h3>Creating Classes</h3>
            <p>Classes are specific cohorts of students:</p>

            <div class="step-box">
                <h4>📚 Adding Classes</h4>
                <p><strong>Step 1:</strong> Go to Admin → Classes</p>
                <p><strong>Step 2:</strong> Click "Add Class"</p>
                <p><strong>Step 3:</strong> Enter class name (e.g., "Form 3A", "10-English")</p>
                <p><strong>Step 4:</strong> Select grade level</p>
                <p><strong>Step 5:</strong> Select classroom/location (optional)</p>
                <p><strong>Step 6:</strong> Save</p>
            </div>

            <h3>Class Naming Convention</h3>
            <p>Use consistent naming:</p>
            <ul class="feature-list">
                <li><strong>Grade + Letter:</strong> "Form 3A", "Form 3B" (recommended for clarity)</li>
                <li><strong>Level + Stream:</strong> "10-Science", "10-Arts"</li>
                <li><strong>Subject Based:</strong> "Biology A", "Mathematics B"</li>
                <li><strong>Teacher Name:</strong> "Ms. Smith's Class" (less ideal - changes with staff)</li>
            </ul>

            <h3>Creating Sections/Streams</h3>
            <p>If you have multiple sections within a grade:</p>

            <ul class="feature-list">
                <li>Section A, B, C, etc. for different cohorts</li>
                <li>Science stream vs Arts stream</li>
                <li>Advanced vs Standard level</li>
            </ul>

            <p>Create each section as a separate class in Skeeme for proper enrollment management.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Departments & Subjects</h2>
            
            <h3>Setting Up Departments</h3>

            <div class="step-box">
                <h4>🏢 Creating Departments</h4>
                <p><strong>Step 1:</strong> Go to Admin → Departments</p>
                <p><strong>Step 2:</strong> Click "Add Department"</p>
                <p><strong>Step 3:</strong> Name (e.g., "Mathematics", "Sciences", "Languages")</p>
                <p><strong>Step 4:</strong> Assign head of department</p>
                <p><strong>Step 5:</strong> Add description</p>
                <p><strong>Step 6:</strong> Save</p>
            </div>

            <h3>Creating Subjects</h3>
            <p>Define subjects taught in your school:</p>

            <div class="step-box">
                <h4>📖 Adding Subjects</h4>
                <p><strong>Step 1:</strong> Go to Admin → Subjects</p>
                <p><strong>Step 2:</strong> Click "Add Subject"</p>
                <p><strong>Step 3:</strong> Subject name (e.g., "English Language", "Biology")</p>
                <p><strong>Step 4:</strong> Assign to department</p>
                <p><strong>Step 5:</strong> Select grades that take this subject</p>
                <p><strong>Step 6:</strong> Save</p>
            </div>

            <h3>Subject-Grade Mapping</h3>
            <p>Define which grades take which subjects:</p>
            <ul class="feature-list">
                <li>Core subjects (required for all)</li>
                <li>Elective subjects (student choice)</li>
                <li>Grade-specific subjects (only for certain grades)</li>
            </ul>

            <p>This mapping affects exam creation and student enrollment.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Configuring Grading System</h2>
            
            <h3>Setting Grading Scale</h3>

            <div class="step-box">
                <h4>📊 Grading Scale Setup</h4>
                <p><strong>Step 1:</strong> Go to Admin → Grading Settings → Grading Scale</p>
                <p><strong>Step 2:</strong> Choose scale type:</p>
                <p>   • Percentage (0-100%)</p>
                <p>   • Letter grades (A, B, C, D, F)</p>
                <p>   • Numerical (4.0 GPA scale)</p>
                <p>   • Custom scale</p>
                <p><strong>Step 3:</strong> Define grade boundaries</p>
                <p><strong>Step 4:</strong> Save</p>
            </div>

            <h3>Grade Boundaries</h3>
            <p>Define what score corresponds to each grade:</p>

            <table style="width: 100%; color: #d1d5db; border-collapse: collapse; margin: 1rem 0;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 0.75rem;">90-100%</td>
                    <td style="padding: 0.75rem;">A / Excellent</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 0.75rem;">80-89%</td>
                    <td style="padding: 0.75rem;">B / Very Good</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 0.75rem;">70-79%</td>
                    <td style="padding: 0.75rem;">C / Good</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 0.75rem;">60-69%</td>
                    <td style="padding: 0.75rem;">D / Satisfactory</td>
                </tr>
                <tr>
                    <td style="padding: 0.75rem;">Below 60%</td>
                    <td style="padding: 0.75rem;">F / Unsatisfactory</td>
                </tr>
            </table>

            <h3>Weighted Grading</h3>
            <p>Configure how different assessment types contribute to final grade:</p>

            <ul class="feature-list">
                <li>Exams (60%)</li>
                <li>Assignments (20%)</li>
                <li>Participation (10%)</li>
                <li>Projects (10%)</li>
            </ul>

            <p>Teachers can follow these defaults or customize per class.</p>

            <h3>Minimum Passing Grade</h3>
            <p>Define what score counts as passing:</p>
            <ul class="feature-list">
                <li>Typically 50% or D grade</li>
                <li>Can vary by subject (math might be higher)</li>
                <li>Can vary by grade level</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>System-Wide Preferences</h2>
            
            <h3>Timezone & Locale</h3>

            <div class="step-box">
                <h4>🌍 Regional Settings</h4>
                <p><strong>Step 1:</strong> Go to Admin → School Settings → Preferences</p>
                <p><strong>Step 2:</strong> Select timezone (affects time displays)</p>
                <p><strong>Step 3:</strong> Select language/locale</p>
                <p><strong>Step 4:</strong> Set date format (DD/MM/YYYY vs MM/DD/YYYY)</p>
                <p><strong>Step 5:</strong> Save</p>
            </div>

            <p>These settings affect how dates and times appear throughout the system.</p>

            <h3>Email & Communication</h3>
            <ul class="feature-list">
                <li>Email address for system notifications</li>
                <li>Email address for support requests</li>
                <li>SMS gateway (if available)</li>
                <li>Email templates and branding</li>
            </ul>

            <h3>Assessment Preferences</h3>
            <ul class="feature-list">
                <li>Default exam duration</li>
                <li>Random question display (on/off by default)</li>
                <li>Show correct answers to students (when)</li>
                <li>Late submission policy</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Make sure your timezone is set correctly. This affects when exams open/close and when notifications are sent.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Enrollment & Student Management</h2>
            
            <h3>Class Enrollment Setup</h3>
            <p>Configure how students are assigned to classes:</p>

            <ul class="feature-list">
                <li><strong>Manual Assignment:</strong> You add students to classes</li>
                <li><strong>Automatic (SIS):</strong> Sync from student information system</li>
                <li><strong>Student Self-Enroll:</strong> Students choose their classes</li>
            </ul>

            <h3>Enrollment Periods</h3>
            <p>Define when enrollment can happen:</p>

            <div class="step-box">
                <h4>📝 Setting Enrollment Windows</h4>
                <p><strong>Step 1:</strong> Go to Admin → Enrollment Settings</p>
                <p><strong>Step 2:</strong> Set enrollment start date</p>
                <p><strong>Step 3:</strong> Set enrollment end date (no new students after this)</p>
                <p><strong>Step 4:</strong> Set drop deadline (students can remove themselves)</p>
                <p><strong>Step 5:</strong> Save</p>
            </div>

            <h3>Managing Enrollment Changes</h3>
            <ul class="feature-list">
                <li>Add students to classes throughout the year</li>
                <li>Move students between classes</li>
                <li>Remove students from classes</li>
                <li>Track enrollment history</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Best Practices for Configuration</h2>
            
            <ul class="feature-list">
                <li><strong>Plan before you build:</strong> Map out your full structure before creating anything</li>
                <li><strong>Be consistent:</strong> Use same naming conventions throughout</li>
                <li><strong>Start simple:</strong> You can always add complexity later</li>
                <li><strong>Test thoroughly:</strong> Create test classes and enrollments to verify</li>
                <li><strong>Document your decisions:</strong> Keep notes on why you chose certain structures</li>
                <li><strong>Involve stakeholders:</strong> Get teacher and admin input on structure</li>
                <li><strong>Set up once correctly:</strong> It's hard to change later with data in the system</li>
                <li><strong>Keep it updated:</strong> Update structure as your school changes</li>
                <li><strong>Train all admins:</strong> Everyone should understand the structure</li>
            </ul>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Next: User Management & Data Import</h3>
            <p>Learn to manage users and import data. Check out our <a href="{{ url('learn/documentation/user-management') }}">User Management</a> guide.</p>
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
