

<?php $__env->startSection('content'); ?>
<style>
    :root { --bg-color: #0f0f14; --text-color: #ffffff; --text-muted: #9ca3af; --border-color: rgba(255, 255, 255, 0.1); }
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
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 0.75rem 0; padding-left: 2rem; position: relative; color: #d1d5db; }
    .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
    .breadcrumb { color: #9ca3af; margin-bottom: 2rem; font-size: 0.9rem; }
    .breadcrumb a { color: #3b82f6; text-decoration: none; }
    .next-section { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center; }
    .next-section a { color: #3b82f6; text-decoration: none; font-weight: 600; }
</style>

<div class="guide-container">
    <div class="breadcrumb" data-aos="fade-down">
        <a href="<?php echo e(url('learn/documentation')); ?>">Documentation</a> / Exam Management Basics
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Exam Management Basics</h1>
        <p>Master the essentials of exam management in Skeeme. Learn how to manage question banks, configure advanced exam settings, and optimize your assessment workflow.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 18 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Beyond creating a single exam, Skeeme provides comprehensive exam management tools to build sustainable assessment practices in your school. This guide covers organizing questions, managing exam versions, implementing best practices, and optimizing the student experience.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Managing Question Banks</h2>
            
            <h3>What is a Question Bank?</h3>
            <p>A question bank is a repository of questions you create and organize for reuse. Instead of creating the same question multiple times, save it once and use it across many exams.</p>

            <h3>Creating a Question Bank</h3>
            <div class="step-box">
                <h4>📚 Setting Up Your Bank</h4>
                <p><strong>Step 1:</strong> Go to "Question Bank" in the main menu</p>
                <p><strong>Step 2:</strong> Click "Create New Bank"</p>
                <p><strong>Step 3:</strong> Name it (e.g., "Biology 2024", "Mathematics - Algebra")</p>
                <p><strong>Step 4:</strong> Add description and set category</p>
                <p><strong>Step 5:</strong> Start adding questions</p>
            </div>

            <h3>Organizing Questions</h3>
            <p>Questions can be organized by:</p>
            <ul class="feature-list">
                <li>Subject and topic</li>
                <li>Difficulty level (Easy, Medium, Hard)</li>
                <li>Learning outcome or objective</li>
                <li>Bloom's Taxonomy level</li>
                <li>Question type</li>
                <li>Custom tags</li>
            </ul>

            <h3>Tagging & Categorization</h3>
            <p>Use tags to organize questions for easy searching:</p>
            <ul class="feature-list">
                <li>Topic tags: "Photosynthesis", "Mitosis", "Ecosystems"</li>
                <li>Skill tags: "Analysis", "Application", "Evaluation"</li>
                <li>Difficulty tags: "Recall", "Understand", "Apply"</li>
                <li>Source tags: "Textbook Ch3", "Prior Year", "New"</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Be consistent with your tagging convention. Establish naming rules at the department level so all teachers use the same tags.
            </div>

            <h3>Building Your Bank Over Time</h3>
            <p>Start small and grow your question bank gradually:</p>
            <ul class="feature-list">
                <li>Add questions as you create new exams</li>
                <li>Digitize old paper exams</li>
                <li>Import questions from colleagues</li>
                <li>Review and improve questions each year</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Advanced Question Settings</h2>
            
            <h3>Question Difficulty & Bloom's Taxonomy</h3>
            <p>Tag questions with cognitive level for better exam design:</p>
            
            <div class="step-box">
                <h4>🎓 Bloom's Levels</h4>
                <p><strong>Remember (Easy):</strong> Recall facts, define terms</p>
                <p><strong>Understand:</strong> Summarize, explain, interpret</p>
                <p><strong>Apply:</strong> Use information in new situations</p>
                <p><strong>Analyze:</strong> Break down, examine relationships</p>
                <p><strong>Evaluate:</strong> Make judgments, justify decisions</p>
                <p><strong>Create (Hard):</strong> Produce new work, synthesize ideas</p>
            </div>

            <p>Mix difficulty levels in your exams for balanced assessment. Typically: 50% understand, 30% apply, 20% analyze/evaluate.</p>

            <h3>Partial Marking</h3>
            <p>For questions with multiple correct answers, configure partial marking:</p>
            <ul class="feature-list">
                <li>Set marks for each correct component</li>
                <li>Award partial marks for partially correct answers</li>
                <li>Use step-marking for working in math/science questions</li>
            </ul>

            <h3>Question Comments & Metadata</h3>
            <p>Add notes to questions for future reference:</p>
            <ul class="feature-list">
                <li>Internal comments (not visible to students)</li>
                <li>Suggested follow-up questions</li>
                <li>Learning outcomes being assessed</li>
                <li>Curriculum alignment</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Managing Exam Versions & Copies</h2>
            
            <h3>Creating Exam Variants</h3>
            <p>Create different versions of the same exam to prevent cheating or adapt for different classes:</p>

            <div class="step-box">
                <h4>🔄 Exam Versions</h4>
                <p><strong>Step 1:</strong> Go to your exam</p>
                <p><strong>Step 2:</strong> Click "Create Variant"</p>
                <p><strong>Step 3:</strong> Select questions (use randomization)</p>
                <p><strong>Step 4:</strong> Adjust settings as needed</p>
                <p><strong>Step 5:</strong> Assign to different classes/times</p>
            </div>

            <h3>Duplicate & Edit</h3>
            <p>Reuse an exam from a previous year:</p>
            <ul class="feature-list">
                <li>Click "Duplicate Exam" on the exam details page</li>
                <li>Make changes to the copy</li>
                <li>Keep original for reference</li>
            </ul>

            <h3>Exam Versioning & History</h3>
            <p>Track changes to exams:</p>
            <ul class="feature-list">
                <li>View version history of all edits</li>
                <li>Revert to previous versions if needed</li>
                <li>Compare versions to see what changed</li>
                <li>Document changes with comments</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Create a new version for each exam administration. This preserves the original for record-keeping and auditing purposes.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Exam Administration & Proctoring</h2>
            
            <h3>Synchronous vs Asynchronous Exams</h3>

            <div class="step-box">
                <h4>🔄 Exam Types</h4>
                <p><strong>Synchronous (Proctored):</strong> All students take at same time, live supervision</p>
                <p><strong>Asynchronous:</strong> Students take within a window at their convenience</p>
            </div>

            <h3>Exam Room Settings</h3>
            <p>For synchronous exams, configure the exam room:</p>
            <ul class="feature-list">
                <li>Video/audio recording (where applicable)</li>
                <li>Identity verification</li>
                <li>Browser lockdown (prevent alt-tab, new windows)</li>
                <li>IP address restrictions</li>
            </ul>

            <h3>Proctoring Options</h3>
            <p>Skeeme integrates with proctoring services:</p>
            <ul class="feature-list">
                <li>Live proctoring with trained monitors</li>
                <li>AI-based proctoring (automatic monitoring)</li>
                <li>Manual proctoring (paper-based exams)</li>
            </ul>

            <h3>Monitoring Active Exams</h3>
            <p>While students take the exam:</p>
            <ul class="feature-list">
                <li>View real-time list of who's taking the exam</li>
                <li>See submission progress</li>
                <li>Identify students who haven't started</li>
                <li>Send messages to students</li>
                <li>Flag suspicious behavior</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Managing Submission & Extensions</h2>
            
            <h3>Submission Settings</h3>

            <div class="step-box">
                <h4>📤 Submission Options</h4>
                <p><strong>Auto-submit:</strong> Automatically submit when time expires</p>
                <p><strong>Manual Submit:</strong> Student must click submit button</p>
                <p><strong>Grace Period:</strong> Allow submission up to X minutes after deadline</p>
                <p><strong>Late Policy:</strong> Penalty for late submissions (e.g., -10% per day)</p>
            </div>

            <h3>Granting Extensions</h3>
            <p>Handle students who need extra time:</p>

            <div class="step-box">
                <h4>⏳ Extension Process</h4>
                <p><strong>Step 1:</strong> Go to exam → "Submissions" tab</p>
                <p><strong>Step 2:</strong> Find the student and click "Grant Extension"</p>
                <p><strong>Step 3:</strong> Set new deadline</p>
                <p><strong>Step 4:</strong> Student receives notification</p>
                <p><strong>Step 5:</strong> Student can continue/restart exam</p>
            </div>

            <h3>Accessibility Accommodations</h3>
            <p>Support students with disabilities:</p>
            <ul class="feature-list">
                <li>Extended time (e.g., 25% extra time)</li>
                <li>Separate quiet room</li>
                <li>Text-to-speech for reading</li>
                <li>Reader services</li>
                <li>Large print versions</li>
                <li>Scribe assistance</li>
            </ul>

            <p>Document accommodations and track usage for compliance.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Configuring Access Control</h2>
            
            <h3>Who Can Take This Exam?</h3>
            <p>Control access with multiple methods:</p>

            <div class="step-box">
                <h4>🔐 Access Controls</h4>
                <p><strong>By Class:</strong> Only students in specific class(es)</p>
                <p><strong>By Name/ID:</strong> Only listed students</p>
                <p><strong>By Role:</strong> Only teachers, only admins, etc.</p>
                <p><strong>By Location:</strong> Only from school IP addresses</p>
                <p><strong>By Password:</strong> Requires password to enter exam</p>
            </div>

            <h3>Enrollment Management</h3>
            <p>Manage who can access each exam:</p>
            <ul class="feature-list">
                <li>Add/remove individual students</li>
                <li>Bulk enroll/unenroll from classes</li>
                <li>View enrollment status</li>
                <li>Track who accepted/declined exam</li>
            </ul>

            <h3>Student Release/Revoke</h3>
            <p>After publishing, you can:</p>
            <ul class="feature-list">
                <li>Revoke access for specific students</li>
                <li>Add new students to an active exam</li>
                <li>Extend exam deadline for individuals or groups</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Exam Analytics & Review</h2>
            
            <h3>Item Analysis</h3>
            <p>Analyze each question's performance:</p>
            <ul class="feature-list">
                <li>Difficulty index (% of students who answered correctly)</li>
                <li>Discrimination index (how well the question differentiates high/low performers)</li>
                <li>Option analysis (which distractors are popular)</li>
                <li>Identify problematic questions</li>
            </ul>

            <h3>Exam Statistics</h3>
            <p>View aggregate exam performance:</p>
            <ul class="feature-list">
                <li>Mean, median, standard deviation of scores</li>
                <li>Score distribution (histogram)</li>
                <li>Pass rate and reliability (Cronbach's alpha)</li>
                <li>Class vs school comparison</li>
            </ul>

            <h3>Question Improvement</h3>
            <p>Use data to improve future exams:</p>
            <ul class="feature-list">
                <li>Questions with low discrimination should be revised</li>
                <li>Misleading distractors should be changed</li>
                <li>Very easy/hard questions may need adjustment</li>
                <li>Track improvements over time</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Exam Security Best Practices</h2>
            
            <ul class="feature-list">
                <li><strong>Randomize questions and options:</strong> Prevents copying from neighbors</li>
                <li><strong>Tight time windows:</strong> Limits time for external help</li>
                <li><strong>Browser lockdown:</strong> Prevents research during exam</li>
                <li><strong>Use different versions:</strong> Reduces cheating opportunities</li>
                <li><strong>Proctor effectively:</strong> Clear exam room of unauthorized materials</li>
                <li><strong>Monitor submissions:</strong> Flag unusual patterns</li>
                <li><strong>Secure password:</strong> If password-protected, don't share until exam</li>
                <li><strong>Control access:</strong> Only eligible students can access</li>
                <li><strong>Backup system:</strong> Have paper backup for technical failures</li>
                <li><strong>Audit logs:</strong> Keep records of all access and submissions</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Common Exam Management Tasks</h2>
            
            <h3>Editing an Active Exam</h3>
            <p>If you need to change an exam while students are taking it:</p>
            <ul class="feature-list">
                <li>Avoid changing questions (confuses students who've started)</li>
                <li>OK to adjust grading marks after all submissions are in</li>
                <li>Can extend deadline for all students</li>
            </ul>

            <h3>Canceling & Rescheduling</h3>
            <p>If you need to cancel an exam:</p>

            <div class="step-box">
                <h4>❌ Cancellation Steps</h4>
                <p><strong>Step 1:</strong> Send announcement to students immediately</p>
                <p><strong>Step 2:</strong> Go to exam and click "Pause" to prevent new submissions</p>
                <p><strong>Step 3:</strong> If needed, close exam completely</p>
                <p><strong>Step 4:</strong> Communicate new schedule</p>
                <p><strong>Step 5:</strong> Reschedule as new exam or update existing</p>
            </div>

            <h3>Archiving Old Exams</h3>
            <p>Keep your exam list clean:</p>
            <ul class="feature-list">
                <li>Archive completed exams from previous years</li>
                <li>Archived exams still searchable and accessible</li>
                <li>Keep for record-keeping and audit purposes</li>
            </ul>
        </div>

        <div class="next-section">
            <h3 style="margin-top: 0;">Ready to automate exam creation?</h3>
            <p>Check out our <a href="<?php echo e(url('learn/documentation/ai-question-generation')); ?>">AI Question Generation</a> guide to create questions faster with AI assistance.</p>
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

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\learn\exam-management-basics.blade.php ENDPATH**/ ?>