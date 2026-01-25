

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
        <a href="<?php echo e(url('learn/documentation')); ?>">Documentation</a> / AI Auto-Grading Workflow
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>AI Auto-Grading Workflow</h1>
        <p>Master Skeeme's AI-powered grading system. Understand confidence scoring, manual review processes, and how to ensure fair and accurate grading for all your students.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 16 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Grading is one of the most time-consuming teacher tasks. Skeeme's AI auto-grading handles objective questions instantly and assists with subjective answers, freeing your time for meaningful feedback.</p>
            <ul class="feature-list">
                <li>Automatic grading of objective questions</li>
                <li>AI-assisted grading of essays and short answers</li>
                <li>Confidence scoring to identify borderline cases</li>
                <li>Manual review workflow with grading aids</li>
                <li>Consistent, fair grading across all submissions</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Automatic Grading of Objective Questions</h2>
            
            <h3>How It Works</h3>
            <p>Skeeme instantly grades questions with clear, predetermined answers:</p>
            <ul class="feature-list">
                <li>Multiple Choice (single answer) - Exact match scoring</li>
                <li>True/False - Right or wrong</li>
                <li>Multiple Selection - Partial credit possible</li>
                <li>Matching - Per-item scoring</li>
                <li>Fill in the Blank - Exact or fuzzy matching</li>
            </ul>

            <h3>Automatic Grading Timeline</h3>

            <div class="step-box">
                <h4>⏱️ Grading Process</h4>
                <p><strong>When Student Submits:</strong> Skeeme immediately scores objective questions</p>
                <p><strong>Score Appears:</strong> In teacher dashboard within seconds</p>
                <p><strong>Provisional Grade:</strong> Shows as "Pending Review" if subjective questions exist</p>
                <p><strong>Final Grade:</strong> Calculated when all manual grading is done</p>
            </div>

            <h3>Partial Credit Settings</h3>
            <p>For multiple selection and matching questions, configure how marks are awarded:</p>
            <ul class="feature-list">
                <li>All-or-nothing: Correct only if all answers correct</li>
                <li>Per-item: Points awarded for each correct item</li>
                <li>Partial deduction: Some points for partial correctness</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> For high-stakes exams, review your auto-grading settings before exam starts. A small mistake in answer keys affects all students.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>AI-Assisted Grading for Subjective Answers</h2>
            
            <h3>How AI Grading Works</h3>
            <p>For essay and short-answer questions, AI analyzes responses and suggests grades:</p>

            <div class="step-box">
                <h4>🤖 AI Grading Process</h4>
                <p><strong>Step 1:</strong> AI reads student response</p>
                <p><strong>Step 2:</strong> Compares against model answer and marking rubric</p>
                <p><strong>Step 3:</strong> Identifies key concepts covered</p>
                <p><strong>Step 4:</strong> Assesses response quality and accuracy</p>
                <p><strong>Step 5:</strong> Suggests grade with confidence score</p>
                <p><strong>Step 6:</strong> Teacher reviews and approves/adjusts</p>
            </div>

            <h3>Setting Up AI Grading</h3>
            <p>Configure AI grading for each subjective question:</p>

            <ul class="feature-list">
                <li><strong>Provide Model Answer:</strong> What a perfect answer looks like</li>
                <li><strong>Key Concepts:</strong> Essential points that must be covered</li>
                <li><strong>Marking Rubric:</strong> How to award partial credit</li>
                <li><strong>Quality Expectations:</strong> Writing level, detail required</li>
                <li><strong>Examples:</strong> Good, average, and poor sample answers</li>
            </ul>

            <h3>Confidence Scoring</h3>
            <p>AI assigns a confidence score (0-100%) for each suggested grade:</p>

            <div class="step-box">
                <h4>📊 Understanding Confidence Scores</h4>
                <p><strong>90-100% High Confidence:</strong> Clearly correct or incorrect answer, safe to auto-approve</p>
                <p><strong>70-89% Medium Confidence:</strong> Response is good but may warrant review for nuance</p>
                <p><strong>Below 70% Low Confidence:</strong> Unusual response, definitely needs human review</p>
            </div>

            <h3>Rubric-Based Grading</h3>
            <p>Create detailed rubrics for consistent grading:</p>

            <div class="step-box">
                <h4>✅ Rubric Example</h4>
                <p><strong>Concept Accuracy (5 marks):</strong></p>
                <p>• All main concepts correct (5) • 1 concept missing (3) • Multiple errors (0)</p>
                <p><strong>Organization (3 marks):</strong></p>
                <p>• Well-organized with clear flow (3) • Somewhat organized (2) • Poorly organized (0)</p>
                <p><strong>Evidence (2 marks):</strong></p>
                <p>• Strong supporting evidence (2) • Weak or missing evidence (1) • No evidence (0)</p>
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Manual Review Workflow</h2>
            
            <h3>Accessing Submissions for Review</h3>

            <div class="step-box">
                <h4>📋 Review Dashboard</h4>
                <p><strong>Step 1:</strong> Go to Exam → "Submissions" or "Grading"</p>
                <p><strong>Step 2:</strong> See list of all submissions with status</p>
                <p><strong>Step 3:</strong> Filter by:</p>
                <p>   • Grading status (Pending, Approved, Rejected)</p>
                <p>   • Confidence score range</p>
                <p>   • Student name or class</p>
            </div>

            <h3>Review Workflow for Low-Confidence Submissions</h3>

            <div class="step-box">
                <h4>🔄 Review Process</h4>
                <p><strong>Step 1:</strong> Click on submission with low confidence score</p>
                <p><strong>Step 2:</strong> See student answer alongside model answer</p>
                <p><strong>Step 3:</strong> Review AI's suggested grade and reasoning</p>
                <p><strong>Step 4:</strong> Accept (approve), Adjust (change marks), or Reject (reassess)</p>
                <p><strong>Step 5:</strong> Add teacher feedback (optional)</p>
                <p><strong>Step 6:</strong> Save and move to next submission</p>
            </div>

            <h3>Comparing Answers</h3>
            <p>Side-by-side comparison helps fair grading:</p>
            <ul class="feature-list">
                <li>View student answer on left, model answer on right</li>
                <li>Highlight key differences</li>
                <li>Compare with other student answers for consistency</li>
                <li>Review your notes and rubric while grading</li>
            </ul>

            <h3>Adding Teacher Feedback</h3>
            <p>Include constructive feedback for each answer:</p>

            <ul class="feature-list">
                <li>What the student did well</li>
                <li>Where there are gaps or errors</li>
                <li>How to improve next time</li>
                <li>Resources for further learning</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Write feedback in real-time while reviewing. Combined with the AI's analysis, this gives students comprehensive feedback for learning.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Setting AI Confidence Thresholds</h2>
            
            <h3>Configuring Auto-Approval</h3>
            <p>Let AI automatically approve high-confidence grades:</p>

            <div class="step-box">
                <h4>⚙️ Configuration</h4>
                <p><strong>Auto-Approve Threshold:</strong> Set minimum confidence level (default 85%)</p>
                <p>Grades above this threshold are automatically approved without review</p>
                <p>Great for high-volume grading while maintaining quality</p>
            </div>

            <h3>Recommended Thresholds</h3>
            <ul class="feature-list">
                <li><strong>High Stakes (Final Exams):</strong> 95%+ (more manual review)</li>
                <li><strong>Regular Assessments:</strong> 85% (balance of speed and accuracy)</li>
                <li><strong>Low Stakes (Practice):</strong> 75% (prioritize feedback speed)</li>
            </ul>

            <h3>Monitoring Auto-Approved Grades</h3>
            <p>Even with auto-approval, monitor for issues:</p>
            <ul class="feature-list">
                <li>Random audit of auto-approved submissions</li>
                <li>Review if multiple students get same grade on difficult question</li>
                <li>Check if grade distribution seems unusual</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Grading Quality Assurance</h2>
            
            <h3>Ensuring Consistency</h3>
            <p>Maintain fair, consistent grading across all submissions:</p>

            <ul class="feature-list">
                <li>Use detailed rubrics for all subjective questions</li>
                <li>Grade in one sitting if possible (maintain consistent mood/standards)</li>
                <li>Review first 5-10 submissions before proceeding</li>
                <li>Periodically check your standards aren't drifting</li>
                <li>Compare similar answers to ensure consistency</li>
            </ul>

            <h3>Addressing Borderline Cases</h3>
            <p>When a student is between two grades:</p>

            <ul class="feature-list">
                <li>Review their other answers in the exam</li>
                <li>Consider partial credit options</li>
                <li>Check if they showed understanding even if incomplete</li>
                <li>Document your decision</li>
            </ul>

            <h3>Grade Appeals & Adjustments</h3>
            <p>Handle grade disputes professionally:</p>

            <div class="step-box">
                <h4>👁️ Grade Review Process</h4>
                <p><strong>Step 1:</strong> Student requests grade review</p>
                <p><strong>Step 2:</strong> You review the submission again carefully</p>
                <p><strong>Step 3:</strong> Compare to your rubric and other similar answers</p>
                <p><strong>Step 4:</strong> Adjust if warranted, or explain reasoning to student</p>
                <p><strong>Step 5:</strong> Document the decision</p>
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Grade Analytics & Insights</h2>
            
            <h3>Grading Statistics</h3>
            <p>Review grading patterns and outliers:</p>
            <ul class="feature-list">
                <li>Mean, median, and distribution of grades</li>
                <li>Questions with highest/lowest performance</li>
                <li>Outliers (unusually high or low grades)</li>
                <li>Questions requiring most manual intervention</li>
            </ul>

            <h3>Identifying Problematic Questions</h3>
            <p>Use AI grading data to improve future questions:</p>
            <ul class="feature-list">
                <li>Questions with very low AI confidence might be ambiguous</li>
                <li>Questions where all students struggled might be too hard</li>
                <li>Questions with wide interpretation might need clearer wording</li>
            </ul>

            <h3>Teacher Performance Metrics</h3>
            <p>Understand your grading patterns:</p>
            <ul class="feature-list">
                <li>How often you override AI suggestions</li>
                <li>Your average grading time per submission</li>
                <li>Grade distribution compared to school average</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Best Practices for AI Grading</h2>
            
            <ul class="feature-list">
                <li><strong>Create detailed rubrics:</strong> AI works better with clear criteria</li>
                <li><strong>Provide good model answers:</strong> Examples help AI understand expectations</li>
                <li><strong>Review auto-grading settings:</strong> Verify answer keys before exam</li>
                <li><strong>Set appropriate confidence thresholds:</strong> Match your school's standards</li>
                <li><strong>Always review low-confidence submissions:</strong> Don't trust AI blindly</li>
                <li><strong>Use consistent standards:</strong> Grade methodically, not emotionally</li>
                <li><strong>Add meaningful feedback:</strong> AI suggests grades, but you add learning value</li>
                <li><strong>Document decisions:</strong> Keep records of grade appeals and adjustments</li>
                <li><strong>Analyze results:</strong> Use data to improve future exams and grading</li>
                <li><strong>Train on new questions:</strong> AI improves as you provide examples</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting Common Issues</h2>
            
            <h3>AI Consistently Over/Under-Grading</h3>
            <p><strong>Causes:</strong> Poor model answer, unclear rubric, mismatched difficulty</p>
            <p><strong>Solution:</strong> Refine model answer, clarify rubric, re-train AI with examples</p>

            <h3>Low Confidence on Most Submissions</h3>
            <p><strong>Causes:</strong> Ambiguous question, subjective expectations, poor training data</p>
            <p><strong>Solution:</strong> Review question clarity, provide better examples, adjust rubric</p>

            <h3>Grading Takes Too Long</h3>
            <p><strong>Solution:</strong> Increase auto-approval threshold, batch similar questions, use templates for feedback</p>

            <h3>Student Disagrees with AI Grade</h3>
            <p><strong>Solution:</strong> Review objectively against rubric, not against AI decision. Make fair judgment independently.</p>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Next: Analytics & Performance Insights</h3>
            <p>Learn how to analyze exam results and track student performance. Check out our <a href="<?php echo e(url('learn/documentation/analytics-dashboard')); ?>">Analytics Dashboard</a> guide.</p>
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

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\learn\ai-auto-grading.blade.php ENDPATH**/ ?>