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
        <a href="{{ url('learn/documentation') }}">Documentation</a> / Analytics Dashboard
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Analytics Dashboard</h1>
        <p>Harness the power of data to improve student learning. Explore detailed performance analytics, identify trends, and make data-driven instructional decisions.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 15 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Skeeme's Analytics Dashboard provides comprehensive insights into student performance, question effectiveness, and learning trends. Use this data to optimize your teaching and assessments.</p>
            <ul class="feature-list">
                <li>Track individual and class performance</li>
                <li>Analyze question difficulty and effectiveness</li>
                <li>Identify learning gaps and struggling students</li>
                <li>Compare performance across classes and subjects</li>
                <li>Export reports for stakeholders</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Accessing Analytics</h2>
            
            <h3>Dashboard Navigation</h3>

            <div class="step-box">
                <h4>📊 Opening Analytics</h4>
                <p><strong>Step 1:</strong> Go to "Analytics" in main navigation</p>
                <p><strong>Step 2:</strong> Select time period, class, or subject</p>
                <p><strong>Step 3:</strong> Choose analysis type (overview, detailed, comparison)</p>
                <p><strong>Step 4:</strong> Customize view and filters</p>
            </div>

            <h3>Available Views</h3>
            <ul class="feature-list">
                <li><strong>Overview Dashboard:</strong> High-level performance snapshot</li>
                <li><strong>Student Performance:</strong> Individual student metrics</li>
                <li><strong>Exam Analysis:</strong> Question-by-question breakdown</li>
                <li><strong>Class Comparison:</strong> Performance across multiple classes</li>
                <li><strong>Trend Analysis:</strong> Performance over time</li>
                <li><strong>Question Analytics:</strong> Question difficulty and discrimination</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Student Performance Analytics</h2>
            
            <h3>Individual Student View</h3>
            <p>Drill down into each student's performance:</p>

            <ul class="feature-list">
                <li>All exams taken and scores</li>
                <li>Average performance across exams</li>
                <li>Subject-wise performance breakdown</li>
                <li>Progress over time (trend line)</li>
                <li>Strengths and weaknesses</li>
                <li>Comparison to class average</li>
            </ul>

            <h3>Class Performance Overview</h3>
            <p>See aggregate class metrics:</p>

            <div class="step-box">
                <h4>📈 Class Metrics</h4>
                <p><strong>Average Score:</strong> Mean performance of all students</p>
                <p><strong>Median Score:</strong> Middle value (less affected by outliers)</p>
                <p><strong>Score Distribution:</strong> Histogram showing grade ranges</p>
                <p><strong>Standard Deviation:</strong> How spread out scores are</p>
                <p><strong>Pass Rate:</strong> % of students meeting passing threshold</p>
            </div>

            <h3>Identifying At-Risk Students</h3>
            <p>Proactively support struggling learners:</p>

            <ul class="feature-list">
                <li>Filter for students below passing threshold</li>
                <li>View students with declining performance</li>
                <li>Identify consistent weak areas</li>
                <li>See engagement metrics (attempts, time spent)</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Set up automated alerts for students whose performance drops. This allows early intervention before they fall too far behind.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Exam & Question Analysis</h2>
            
            <h3>Question Performance Metrics</h3>
            <p>Evaluate the effectiveness of each question:</p>

            <ul class="feature-list">
                <li><strong>Difficulty Index:</strong> % of students who answered correctly (0-100%)</li>
                <li><strong>Discrimination Index:</strong> How well it differentiates high/low performers (-1 to +1)</li>
                <li><strong>Item Validity:</strong> Does it correlate with overall exam performance?</li>
                <li><strong>Distractor Analysis:</strong> Which wrong answers are most popular?</li>
            </ul>

            <h3>Interpreting Difficulty Metrics</h3>

            <div class="step-box">
                <h4>📊 Understanding Metrics</h4>
                <p><strong>Difficulty 0-30% (Too Hard):</strong> Most students fail. Consider if question is fair/clear</p>
                <p><strong>Difficulty 30-70% (Ideal):</strong> Appropriate challenge level</p>
                <p><strong>Difficulty 70-100% (Too Easy):</strong> Doesn't differentiate. Provides little info about learning</p>
                <p><strong>Discrimination +0.3+ (Good):</strong> Strong students more likely to answer correctly</p>
                <p><strong>Discrimination Below 0 (Problem):</strong> Weak students doing better than strong students</p>
            </div>

            <h3>Improving Question Quality</h3>
            <p>Use analytics to refine your question bank:</p>

            <ul class="feature-list">
                <li>Flag questions with negative discrimination for review</li>
                <li>Examine misleading distractors</li>
                <li>Edit ambiguous questions</li>
                <li>Remove or replace ineffective questions</li>
                <li>Track improvements over multiple exams</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Trend Analysis</h2>
            
            <h3>Performance Trends Over Time</h3>
            <p>Identify patterns in learning:</p>

            <ul class="feature-list">
                <li>Student improvement/decline trajectory</li>
                <li>Class performance across multiple exams</li>
                <li>Subject-wise trends</li>
                <li>Impact of instructional changes</li>
            </ul>

            <h3>Creating Comparison Charts</h3>

            <div class="step-box">
                <h4>📊 Chart Options</h4>
                <p><strong>Line Chart:</strong> Performance trends over time</p>
                <p><strong>Bar Chart:</strong> Comparison across classes or subjects</p>
                <p><strong>Box Plot:</strong> Distribution and outliers</p>
                <p><strong>Scatter Plot:</strong> Relationships between variables</p>
            </div>

            <h3>Identifying Learning Gaps</h3>
            <p>Spot topics that need reteaching:</p>

            <ul class="feature-list">
                <li>Questions where majority of students struggle</li>
                <li>Specific topics with consistently low performance</li>
                <li>Skills that don't improve despite instruction</li>
                <li>Prerequisites that may need review</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Share trend data with students. Seeing their improvement over time is motivating and reinforces growth mindset.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Comparative Analytics</h2>
            
            <h3>Class Comparison</h3>
            <p>Compare performance across multiple classes:</p>

            <ul class="feature-list">
                <li>Which class performs best overall?</li>
                <li>Are there significant performance gaps between classes?</li>
                <li>Do certain topics show different mastery levels?</li>
                <li>Are assessment methods fair across classes?</li>
            </ul>

            <h3>Subject Comparison</h3>
            <p>Analyze performance across subjects:</p>

            <ul class="feature-list">
                <li>In which subjects does your school excel?</li>
                <li>Where are school-wide improvement opportunities?</li>
                <li>Are standards being applied consistently?</li>
            </ul>

            <h3>Cohort Analysis</h3>
            <p>Track the same group of students over time:</p>

            <ul class="feature-list">
                <li>Are students improving year-over-year?</li>
                <li>Which interventions were most effective?</li>
                <li>How do graduation cohorts compare?</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Custom Dashboards & Reports</h2>
            
            <h3>Creating Custom Views</h3>
            <p>Build personalized analytics dashboards:</p>

            <div class="step-box">
                <h4>🛠️ Customization</h4>
                <p><strong>Step 1:</strong> Click "Create Custom Dashboard"</p>
                <p><strong>Step 2:</strong> Select metrics to include</p>
                <p><strong>Step 3:</strong> Choose layout and visualizations</p>
                <p><strong>Step 4:</strong> Save and share with team</p>
            </div>

            <h3>Exporting Reports</h3>
            <p>Generate reports for stakeholders:</p>

            <ul class="feature-list">
                <li>Export as PDF, Excel, or CSV</li>
                <li>Include custom branding (school logo, colors)</li>
                <li>Add explanatory text and interpretations</li>
                <li>Schedule automated report delivery</li>
            </ul>

            <h3>Reports for Different Audiences</h3>
            <ul class="feature-list">
                <li><strong>Teachers:</strong> Detailed class and student data for instruction</li>
                <li><strong>Parents:</strong> Student progress and suggestions for support</li>
                <li><strong>Administrators:</strong> Aggregate performance, trends, benchmarks</li>
                <li><strong>Students:</strong> Personal performance and growth areas</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Making Data-Driven Decisions</h2>
            
            <h3>Using Analytics for Instruction</h3>
            <ul class="feature-list">
                <li><strong>Identify struggling students:</strong> Provide targeted intervention</li>
                <li><strong>Find learning gaps:</strong> Reteach topics with low performance</li>
                <li><strong>Group instruction:</strong> Form groups based on performance level</li>
                <li><strong>Individualize:</strong> Tailor instruction to student needs</li>
                <li><strong>Differentiate assessments:</strong> Offer challenge questions for advanced students</li>
            </ul>

            <h3>Improving Assessment Quality</h3>
            <ul class="feature-list">
                <li>Remove or revise poorly discriminating questions</li>
                <li>Balance difficulty levels in exams</li>
                <li>Validate that exams measure intended learning</li>
                <li>Ensure fairness across student groups</li>
            </ul>

            <h3>Professional Development</h3>
            <p>Share data with colleagues:</p>
            <ul class="feature-list">
                <li>Identify best practices in high-performing classes</li>
                <li>Discuss strategies for struggling areas</li>
                <li>Learn from peer performance data</li>
                <li>Collaborate on improvement initiatives</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Don't let data overwhelm you. Focus on 2-3 key insights per exam and act on them before analyzing the next exam.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Compliance & Privacy</h2>
            
            <h3>Data Privacy</h3>
            <ul class="feature-list">
                <li>Analytics shown only to authorized educators</li>
                <li>Student data protected by encryption</li>
                <li>Audit logs track who accessed what data</li>
                <li>FERPA, GDPR, and local privacy laws compliance</li>
            </ul>

            <h3>Fair Use of Data</h3>
            <ul class="feature-list">
                <li>Use data to help students, not punish</li>
                <li>Don't share individual student performance publicly</li>
                <li>Consider context (attendance, SES, special needs)</li>
                <li>Look for growth, not just absolute performance</li>
            </ul>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Next: Attendance Tracking</h3>
            <p>Learn to track and analyze student attendance. Check out our <a href="{{ url('learn/documentation/attendance-tracking') }}">Attendance Tracking</a> guide.</p>
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
