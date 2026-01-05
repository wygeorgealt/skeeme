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
        <a href="{{ url('learn/documentation') }}">Documentation</a> / Generating Reports
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Generating Reports</h1>
        <p>Create professional, customized reports for different stakeholders. Learn to generate exams results, performance analytics, attendance, and transcripts with ease.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 14 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Skeeme's reporting system allows you to generate comprehensive reports tailored to different audiences. Whether sharing with parents, informing administration, or creating official records, you have full customization control.</p>
            <ul class="feature-list">
                <li>Generate reports for exams, grades, attendance, and more</li>
                <li>Customize content based on audience</li>
                <li>Export in multiple formats (PDF, Excel, Word)</li>
                <li>Schedule automated report delivery</li>
                <li>Include school branding and custom elements</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Report Types Available</h2>
            
            <h3>1. Individual Student Reports</h3>
            <ul class="feature-list">
                <li><strong>Exam Report:</strong> Results from a specific exam</li>
                <li><strong>Grade Report:</strong> All grades for a period</li>
                <li><strong>Transcript:</strong> Complete academic record</li>
                <li><strong>Progress Report:</strong> Performance over time with trends</li>
                <li><strong>Standards Report:</strong> Mastery of specific learning standards</li>
            </ul>

            <h3>2. Class Reports</h3>
            <ul class="feature-list">
                <li><strong>Class Performance Summary:</strong> Overall class results</li>
                <li><strong>Detailed Exam Analysis:</strong> Question-by-question breakdown</li>
                <li><strong>Attendance Summary:</strong> Class attendance statistics</li>
                <li><strong>Gradebook Export:</strong> All grades for gradebook</li>
            </ul>

            <h3>3. School-Wide Reports</h3>
            <ul class="feature-list">
                <li><strong>Performance Dashboard:</strong> School performance overview</li>
                <li><strong>Grade Distribution:</strong> How grades distributed across school</li>
                <li><strong>Attendance Analysis:</strong> School-wide attendance trends</li>
                <li><strong>Subject Comparison:</strong> Performance by subject</li>
                <li><strong>Cohort Analysis:</strong> Grade-level performance</li>
            </ul>

            <h3>4. Administrative Reports</h3>
            <ul class="feature-list">
                <li><strong>Data Export:</strong> Raw data for external analysis</li>
                <li><strong>Audit Report:</strong> System activity and changes</li>
                <li><strong>User Activity:</strong> Who did what and when</li>
                <li><strong>Compliance Report:</strong> Meet regulatory requirements</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Generating Individual Student Reports</h2>
            
            <h3>Student Progress Report</h3>

            <div class="step-box">
                <h4>📊 Creating a Progress Report</h4>
                <p><strong>Step 1:</strong> Go to "Reports" → "Student Reports"</p>
                <p><strong>Step 2:</strong> Select student name</p>
                <p><strong>Step 3:</strong> Choose time period (term, semester, year)</p>
                <p><strong>Step 4:</strong> Select report type "Progress Report"</p>
                <p><strong>Step 5:</strong> Customize content sections</p>
                <p><strong>Step 6:</strong> Preview and export</p>
            </div>

            <h3>Customizing Report Content</h3>
            <p>Choose what to include in reports:</p>

            <ul class="feature-list">
                <li>Exam scores and grades</li>
                <li>Attendance data</li>
                <li>Behavior/conduct notes</li>
                <li>Teacher comments</li>
                <li>Learning goals and progress</li>
                <li>Strengths and areas for improvement</li>
                <li>Recommendations</li>
                <li>Certificates and achievements</li>
            </ul>

            <h3>Adding Personal Notes</h3>
            <p>Include individualized teacher comments:</p>

            <div class="step-box">
                <h4>💬 Adding Comments</h4>
                <p>Before generating report, you can add:</p>
                <p>• Overall assessment comments</p>
                <p>• Specific feedback on strengths</p>
                <p>• Areas needing improvement</p>
                <p>• Encouragement or commendations</p>
                <p>• Next steps/goals for student</p>
            </div>

            <h3>Report Templates</h3>
            <p>Use pre-designed templates for consistency:</p>
            <ul class="feature-list">
                <li>Standard progress report</li>
                <li>Parent-friendly report</li>
                <li>Academic only report</li>
                <li>Detailed analytical report</li>
                <li>Create custom template</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Class & Exam Reports</h2>
            
            <h3>Exam Results Report</h3>

            <div class="step-box">
                <h4>📈 Exam Report Creation</h4>
                <p><strong>Step 1:</strong> Go to "Reports" → "Exam Reports"</p>
                <p><strong>Step 2:</strong> Select the exam</p>
                <p><strong>Step 3:</strong> Choose report detail level</p>
                <p><strong>Step 4:</strong> Configure options (see below)</p>
                <p><strong>Step 5:</strong> Generate and distribute</p>
            </div>

            <h3>Exam Report Options</h3>
            <ul class="feature-list">
                <li><strong>Included Statistics:</strong> Mean, median, distribution</li>
                <li><strong>Item Analysis:</strong> Difficulty and discrimination indices</li>
                <li><strong>Individual Results:</strong> Student scores (detailed or summary)</li>
                <li><strong>Visual Charts:</strong> Graphs and histograms</li>
                <li><strong>Comments:</strong> Your analysis and interpretations</li>
            </ul>

            <h3>Class Comparison Report</h3>
            <p>Compare performance across multiple classes:</p>

            <ul class="feature-list">
                <li>Average score by class</li>
                <li>Pass rates and performance tiers</li>
                <li>Item performance by class</li>
                <li>Identify class disparities</li>
            </ul>

            <p>Useful for discussing results at department meetings or with administration.</p>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Include a brief analysis section in exam reports. Explain why results are good/concerning and what you plan to do about it.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Exporting Reports</h2>
            
            <h3>Export Formats</h3>

            <div class="step-box">
                <h4>📁 Available Formats</h4>
                <p><strong>PDF:</strong> Professional, printable, secure, easy to share</p>
                <p><strong>Excel:</strong> Data analysis, further processing, grade book import</p>
                <p><strong>Word:</strong> Editable, add personal touches</p>
                <p><strong>CSV:</strong> Import to other systems</p>
                <p><strong>Email:</strong> Send directly to recipients</p>
            </div>

            <h3>Bulk Export</h3>
            <p>Export multiple reports at once:</p>

            <div class="step-box">
                <h4>📦 Bulk Export Process</h4>
                <p><strong>Step 1:</strong> Select report type</p>
                <p><strong>Step 2:</strong> Choose "Bulk Export"</p>
                <p><strong>Step 3:</strong> Select all students/classes to include</p>
                <p><strong>Step 4:</strong> Choose format and template</p>
                <p><strong>Step 5:</strong> Generate (creates separate file for each)</p>
                <p><strong>Step 6:</strong> Download as ZIP file</p>
            </div>

            <h3>Distribution Options</h3>
            <ul class="feature-list">
                <li>Email reports directly to parents</li>
                <li>Upload to student/parent portal</li>
                <li>Print and hand out (keep digital copy)</li>
                <li>Post online (password protected)</li>
                <li>SMS notification with link</li>
            </ul>

            <h3>Maintaining Privacy</h3>
            <p>When distributing reports:</p>
            <ul class="feature-list">
                <li>Each student/parent gets only their own data</li>
                <li>Use secure email or password-protected portals</li>
                <li>Don't share list of all students' grades publicly</li>
                <li>Confirm identity before releasing sensitive data</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Scheduled & Automated Reports</h2>
            
            <h3>Setting Up Automated Reports</h3>

            <div class="step-box">
                <h4>⏰ Automation Setup</h4>
                <p><strong>Step 1:</strong> Go to "Reports" → "Scheduled Reports"</p>
                <p><strong>Step 2:</strong> Click "Create Scheduled Report"</p>
                <p><strong>Step 3:</strong> Select report type and content</p>
                <p><strong>Step 4:</strong> Set schedule (weekly, monthly, after each exam, etc.)</p>
                <p><strong>Step 5:</strong> Choose distribution method and recipients</p>
                <p><strong>Step 6:</strong> Save</p>
            </div>

            <h3>Report Schedules</h3>
            <p>Common report schedules:</p>

            <ul class="feature-list">
                <li><strong>Weekly Class Reports:</strong> To students and parents</li>
                <li><strong>Bi-weekly Progress Reports:</strong> To parents</li>
                <li><strong>Monthly Exam Summary:</strong> To administrators</li>
                <li><strong>End of Term Reports:</strong> Automatic after exams conclude</li>
                <li><strong>Semester Report Cards:</strong> Official grades</li>
                <li><strong>Annual Transcripts:</strong> End of school year</li>
            </ul>

            <h3>Automated Email Distribution</h3>
            <p>Reports can be automatically emailed:</p>
            <ul class="feature-list">
                <li>To individual parents (their child's report only)</li>
                <li>To teachers (their class report)</li>
                <li>To administrators (school reports)</li>
                <li>With personalized greeting messages</li>
                <li>At optimal times (avoid early morning/late night)</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Schedule progress reports to be sent home regularly (not just at end of term). Early feedback allows parents to support learning better.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Customizing Reports with School Branding</h2>
            
            <h3>Adding School Logo & Colors</h3>
            <p>Make reports reflect your school identity:</p>

            <ul class="feature-list">
                <li>Add school logo at top of report</li>
                <li>Use school colors in headers/charts</li>
                <li>Include school name and details</li>
                <li>Add custom footer with contact info</li>
            </ul>

            <h3>Custom Headers & Footers</h3>
            <p>Personalize report appearance:</p>

            <div class="step-box">
                <h4>🎨 Customization Options</h4>
                <p><strong>Header:</strong> School name, logo, report title, date</p>
                <p><strong>Body:</strong> Content sections and layout</p>
                <p><strong>Footer:</strong> Contact info, privacy notice, signature line</p>
                <p><strong>Colors:</strong> Use school branding colors</p>
                <p><strong>Fonts:</strong> Professional, readable fonts</p>
            </div>

            <h3>Custom Fields</h3>
            <p>Add school-specific information:</p>

            <ul class="feature-list">
                <li>School motto or mission statement</li>
                <li>Principal's name and signature line</li>
                <li>Class name and teacher info</li>
                <li>Academic period or term</li>
                <li>Custom grading scale explanation</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Data-Heavy Reports (Excel)</h2>
            
            <h3>Exporting to Excel</h3>
            <p>For analysis and further processing:</p>

            <div class="step-box">
                <h4>📊 Excel Export</h4>
                <p><strong>Step 1:</strong> Go to report type you want to export</p>
                <p><strong>Step 2:</strong> Click "Export to Excel"</p>
                <p><strong>Step 3:</strong> Choose data to include</p>
                <p><strong>Step 4:</strong> Download file</p>
                <p><strong>Step 5:</strong> Open in Excel for further analysis</p>
            </div>

            <h3>Included Data in Excel Exports</h3>
            <ul class="feature-list">
                <li>Student names and IDs</li>
                <li>Individual exam scores and questions</li>
                <li>Grades and weighted scores</li>
                <li>Attendance data</li>
                <li>Calculated statistics</li>
                <li>Trend information</li>
            </ul>

            <h3>Using Excel for Further Analysis</h3>
            <p>Once in Excel, you can:</p>
            <ul class="feature-list">
                <li>Create additional charts and graphs</li>
                <li>Filter and sort data</li>
                <li>Calculate custom statistics</li>
                <li>Import to grading platforms</li>
                <li>Cross-reference with other data</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Report Best Practices</h2>
            
            <ul class="feature-list">
                <li><strong>Be timely:</strong> Share results within a week of exam completion</li>
                <li><strong>Be clear:</strong> Use language parents understand, explain grading scale</li>
                <li><strong>Be honest:</strong> Don't hide problems, address them constructively</li>
                <li><strong>Be specific:</strong> Include examples and evidence, not just judgments</li>
                <li><strong>Be actionable:</strong> Include suggestions for next steps and support</li>
                <li><strong>Be consistent:</strong> Use same format and standards across all reports</li>
                <li><strong>Be secure:</strong> Protect student data when distributing</li>
                <li><strong>Be professional:</strong> Check for errors before sending</li>
                <li><strong>Keep records:</strong> Archive reports for documentation</li>
                <li><strong>Invite feedback:</strong> Let parents/students respond to reports</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting Report Issues</h2>
            
            <h3>Report Won't Generate</h3>
            <p><strong>Causes:</strong> Missing data, corrupted files, permission issues</p>
            <p><strong>Solution:</strong> Check data completeness, try smaller date range, contact support</p>

            <h3>Data Looks Incorrect</h3>
            <p><strong>Solution:</strong> Verify grades/scores are correct in system. Check filters applied. Re-run report.</p>

            <h3>Formatting Issues in PDF</h3>
            <p><strong>Solution:</strong> Try exporting to Excel first, then to PDF. Adjust template margins.</p>

            <h3>Email Distribution Failed</h3>
            <p><strong>Solution:</strong> Verify email addresses are correct. Check spam folder. Resend manually.</p>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Next: School Configuration</h3>
            <p>Learn to configure your school settings and academic structure. Check out our <a href="{{ url('learn/documentation/school-configuration') }}">School Configuration</a> guide.</p>
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
