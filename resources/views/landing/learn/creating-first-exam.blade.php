@extends('layouts.landing')

@section('content')
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
        <a href="{{ url('learn/documentation') }}">Documentation</a> / Creating Your First Exam
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>Creating Your First Exam</h1>
        <p>Step-by-step guide to creating, configuring, and publishing your first exam on Skeeme. Go from blank canvas to live exam in under 15 minutes.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 15 minutes</p>
    </section>

    <section class="guide-content">
        <!-- Overview -->
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Creating an exam in Skeeme is intuitive and flexible. Whether you're creating a quick formative assessment or a high-stakes summative exam, Skeeme provides all the tools you need.</p>
            <p>In this guide, you'll learn to:</p>
            <ul class="feature-list">
                <li>Create a new exam from scratch</li>
                <li>Add questions using multiple question types</li>
                <li>Configure exam settings and restrictions</li>
                <li>Set up grading and marking schemes</li>
                <li>Assign the exam to students</li>
                <li>Monitor student responses in real-time</li>
                <li>Release results and feedback</li>
            </ul>
        </div>

        <!-- Before You Start -->
        <div class="section" data-aos="fade-up">
            <h2>Before You Start: Plan Your Exam</h2>
            
            <h3>Exam Planning Checklist</h3>
            <p>Good exams start with good planning. Before creating in Skeeme, prepare:</p>

            <div class="step-box">
                <h4>📋 Planning Questions</h4>
                <p>□ What is the exam purpose? (formative assessment, quiz, final exam?)</p>
                <p>□ Which students/classes will take it?</p>
                <p>□ What content will be covered?</p>
                <p>□ How many questions will you include?</p>
                <p>□ What question types will you use?</p>
                <p>□ How will each question be weighted?</p>
                <p>□ What's the total duration?</p>
                <p>□ When should students take it?</p>
                <p>□ Will it be timed or untimed?</p>
                <p>□ How will you grade it?</p>
            </div>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Start with a simple 10-question quiz to familiarize yourself with Skeeme's features. You can always create more complex exams later.
            </div>
        </div>

        <!-- Step 1: Create Exam -->
        <div class="section" data-aos="fade-up">
            <h2>Step 1: Create a New Exam</h2>
            
            <h3>Starting the Exam Creation Wizard</h3>

            <div class="step-box">
                <h4>🚀 Getting Started</h4>
                <p><strong>Step 1:</strong> Log in to your Skeeme dashboard</p>
                <p><strong>Step 2:</strong> Click "Exams" in the main navigation</p>
                <p><strong>Step 3:</strong> Click "Create New Exam"</p>
                <p><strong>Step 4:</strong> You'll see the Exam Creation Wizard</p>
            </div>

            <h3>Basic Exam Information</h3>
            <p>Fill in the following details:</p>

            <ul class="feature-list">
                <li><strong>Exam Title:</strong> e.g., "Biology Midterm 2024" (this is shown to students)</li>
                <li><strong>Subject:</strong> Select the subject area</li>
                <li><strong>Class/Grade:</strong> Which class(es) will take this exam?</li>
                <li><strong>Description:</strong> (Optional) Brief description of what the exam covers</li>
                <li><strong>Instructions:</strong> (Optional) Special instructions for students</li>
                <li><strong>Exam Code:</strong> (Auto-generated) Unique identifier for the exam</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Use clear, descriptive exam titles. Avoid vague titles like "Test 1" or "Quiz". Instead, use "Biology Midterm 2024 - Cell Structure" to help students identify the exam quickly.
            </div>
        </div>

        <!-- Step 2: Configure Settings -->
        <div class="section" data-aos="fade-up">
            <h2>Step 2: Configure Exam Settings</h2>
            
            <h3>Timing & Duration</h3>

            <div class="step-box">
                <h4>⏱️ Time Settings</h4>
                <p><strong>Duration:</strong> How long students have to complete the exam (e.g., 1 hour, 2.5 hours)</p>
                <p><strong>Time Display:</strong> Should students see the countdown timer?</p>
                <p><strong>Late Submission:</strong> Allow submissions after time expires? By how many minutes?</p>
            </div>

            <h3>Exam Availability</h3>
            <p>Control when students can access the exam:</p>

            <ul class="feature-list">
                <li><strong>Start Date/Time:</strong> When students can first access the exam</li>
                <li><strong>End Date/Time:</strong> When the exam closes (no more submissions)</li>
                <li><strong>Show Results After:</strong> Can be immediate or on a set date</li>
                <li><strong>Password Protected:</strong> (Optional) Add a password for security</li>
            </ul>

            <h3>Question Display</h3>
            <p>Choose how questions appear to students:</p>

            <ul class="feature-list">
                <li><strong>One Question Per Page:</strong> Students scroll through questions one at a time</li>
                <li>All Questions on One Page:</strong> Students see the entire exam at once (for shorter exams)</li>
                <li><strong>Question Navigation:</strong> Can students jump between questions or only forward?</li>
                <li><strong>Show Question Review:</strong> Can students review and change their answers?</li>
            </ul>

            <h3>Question Settings</h3>

            <div class="step-box">
                <h4>🎯 Question Options</h4>
                <p><strong>Randomize Questions:</strong> Shuffle question order for each student (good for preventing cheating)</p>
                <p><strong>Randomize Answer Options:</strong> Shuffle multiple choice options</p>
                <p><strong>Show Question Numbers:</strong> Display question numbers to students?</p>
                <p><strong>Show Question Marks:</strong> Display how many marks each question is worth?</p>
            </div>

            <h3>Grading Settings</h3>

            <ul class="feature-list">
                <li><strong>Grading Scheme:</strong> Points, percentage, letter grade?</li>
                <li><strong>Total Marks:</strong> Auto-calculated based on questions</li>
                <li><strong>Pass Marks:</strong> What score is considered passing?</li>
                <li><strong>Show Answers After:</strong> When can students see correct answers?</li>
            </ul>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Think carefully about your timing settings. A 30-minute exam that allows 1 hour per student or with long availability windows may lead to students sharing answers.
            </div>
        </div>

        <!-- Step 3: Add Questions -->
        <div class="section" data-aos="fade-up">
            <h2>Step 3: Add Questions to Your Exam</h2>
            
            <p>Skeeme supports multiple question types. You can mix and match them in a single exam.</p>

            <h3>Question Types</h3>

            <div class="step-box">
                <h4>1️⃣ Multiple Choice (Single Answer)</h4>
                <p>Students select ONE correct answer from options</p>
                <p><strong>Best for:</strong> Factual knowledge, quick assessment</p>
                <p><strong>Marking:</strong> Full marks if correct, zero if incorrect</p>
            </div>

            <div class="step-box">
                <h4>2️⃣ Multiple Selection (Multiple Answers)</h4>
                <p>Students select ALL correct answers from a list</p>
                <p><strong>Best for:</strong> Questions where multiple answers apply</p>
                <p><strong>Marking:</strong> Partial marks possible based on configuration</p>
            </div>

            <div class="step-box">
                <h4>3️⃣ Short Answer (Text Input)</h4>
                <p>Students type short text responses (one or two words, numbers)</p>
                <p><strong>Best for:</strong> Vocabulary, quick definitions, simple calculations</p>
                <p><strong>Marking:</strong> Manual or AI-assisted grading</p>
            </div>

            <div class="step-box">
                <h4>4️⃣ Long Answer (Essay)</h4>
                <p>Students write longer text responses (paragraphs)</p>
                <p><strong>Best for:</strong> Essays, explanations, detailed responses</p>
                <p><strong>Marking:</strong> Manual grading only (AI can assist)</p>
            </div>

            <div class="step-box">
                <h4>5️⃣ True/False</h4>
                <p>Simple true or false statements</p>
                <p><strong>Best for:</strong> Quick checks, concept verification</p>
                <p><strong>Marking:</strong> Full marks if correct</p>
            </div>

            <div class="step-box">
                <h4>6️⃣ Matching</h4>
                <p>Students match items in one column to another</p>
                <p><strong>Best for:</strong> Definitions, pairs of related concepts</p>
                <p><strong>Marking:</strong> Partial marks per correct match</p>
            </div>

            <div class="step-box">
                <h4>7️⃣ Ordering/Sequencing</h4>
                <p>Students arrange items in correct sequence</p>
                <p><strong>Best for:</strong> Steps in a process, chronological order</p>
                <p><strong>Marking:</strong> Partial marks for partially correct order</p>
            </div>

            <div class="step-box">
                <h4>8️⃣ Fill in the Blank</h4>
                <p>Complete sentences with missing words</p>
                <p><strong>Best for:</strong> Vocabulary, key concepts</p>
                <p><strong>Marking:</strong> Manual or AI-assisted</p>
            </div>

            <h3>Adding Your First Question</h3>

            <div class="step-box">
                <h4>➕ Adding a Question</h4>
                <p><strong>Step 1:</strong> Click "Add Question" button</p>
                <p><strong>Step 2:</strong> Select question type</p>
                <p><strong>Step 3:</strong> Enter the question text</p>
                <p><strong>Step 4:</strong> Add answer options (for MCQ) or correct answer</p>
                <p><strong>Step 5:</strong> Set marks/points for the question</p>
                <p><strong>Step 6:</strong> (Optional) Add explanation/feedback</p>
                <p><strong>Step 7:</strong> Click "Save Question"</p>
            </div>

            <h3>Question Text Formatting</h3>
            <p>Skeeme supports rich text formatting:</p>

            <ul class="feature-list">
                <li>Bold, italic, underline text</li>
                <li>Numbered and bulleted lists</li>
                <li>Subscripts and superscripts (for math/science)</li>
                <li>Math formulas (LaTeX notation)</li>
                <li>Embedded images</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Use images for visual questions (diagrams, charts, photos). This engages different learning styles and is more realistic to real exams.
            </div>

            <h3>Adding Feedback & Explanations</h3>
            <p>For each question, you can add:</p>

            <ul class="feature-list">
                <li><strong>Correct Answer Feedback:</strong> "Well done! You understood the concept."</li>
                <li><strong>Incorrect Answer Feedback:</strong> "Not quite. Remember that..."</li>
                <li><strong>General Explanation:</strong> Learn more about this topic by...</li>
            </ul>

            <p>Feedback helps students learn from the exam, whether they get it right or wrong.</p>

            <h3>Using Question Banks</h3>
            <p>If you've created questions before:</p>

            <ul class="feature-list">
                <li>Browse your question bank for existing questions</li>
                <li>Drag and drop questions into the exam</li>
                <li>Reuse questions across multiple exams (saves time)</li>
                <li>Import questions from other teachers or resources</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Build a question bank over time. As you create more exams, you'll have a library of questions you can reuse and remix for new assessments.
            </div>
        </div>

        <!-- Step 4: Review & Preview -->
        <div class="section" data-aos="fade-up">
            <h2>Step 4: Review & Preview Your Exam</h2>
            
            <h3>Exam Overview</h3>

            <div class="step-box">
                <h4>📊 Review Checklist</h4>
                <p>Before publishing, review:</p>
                <p>□ All questions are clear and complete</p>
                <p>□ Answer keys are correct</p>
                <p>□ Total marks are what you intended</p>
                <p>□ Time duration is appropriate</p>
                <p>□ Instructions are clear</p>
                <p>□ No typos or formatting issues</p>
                <p>□ Feedback is helpful</p>
            </div>

            <h3>Student Preview</h3>
            <p>See the exam from a student's perspective:</p>

            <div class="step-box">
                <h4>👁️ Preview Exam</h4>
                <p><strong>Step 1:</strong> Click "Preview Exam" button</p>
                <p><strong>Step 2:</strong> Browse through as a student would</p>
                <p><strong>Step 3:</strong> Check timing, navigation, display</p>
                <p><strong>Step 4:</strong> Verify answer options and formatting</p>
                <p><strong>Step 5:</strong> Return and make any needed edits</p>
            </div>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Always preview on multiple devices. Check how it looks on phones, tablets, and computers. Some students may use different devices.
            </div>
        </div>

        <!-- Step 5: Assign to Classes -->
        <div class="section" data-aos="fade-up">
            <h2>Step 5: Assign the Exam to Students</h2>
            
            <h3>Assigning to Classes</h3>

            <div class="step-box">
                <h4>👥 Assigning to Students</h4>
                <p><strong>Step 1:</strong> Click "Assign Exam" or "Publish Exam"</p>
                <p><strong>Step 2:</strong> Select the class(es) to assign to</p>
                <p><strong>Step 3:</strong> Choose assignment type:</p>
                <p>   • Assigned to all students</p>
                <p>   • Assigned to specific students</p>
                <p>   • Optional (students can choose to take)</p>
                <p><strong>Step 4:</strong> Set availability dates/times</p>
                <p><strong>Step 5:</strong> Review and confirm</p>
            </div>

            <h3>Exam Visibility</h3>
            <p>Control how students see your exam:</p>

            <ul class="feature-list">
                <li><strong>Published:</strong> Students can see and access the exam</li>
                <li><strong>Draft:</strong> Only you can see it; students cannot access</li>
                <li><strong>Scheduled:</strong> Will be published at a specific date/time</li>
                <li><strong>Closed:</strong> No more submissions allowed, but students can review</li>
                <li><strong>Hidden:</strong> Students cannot see it at all</li>
            </ul>

            <h3>Access Control</h3>
            <p>Set restrictions on who can access:</p>

            <ul class="feature-list">
                <li>Specific classes or grades</li>
                <li>By student name or ID</li>
                <li>By password protection</li>
                <li>By IP address (classroom-only access)</li>
            </ul>
        </div>

        <!-- Step 6: Publish & Share -->
        <div class="section" data-aos="fade-up">
            <h2>Step 6: Publish & Share Your Exam</h2>
            
            <h3>Publishing the Exam</h3>

            <div class="step-box">
                <h4>📢 Publish Steps</h4>
                <p><strong>Step 1:</strong> Click "Publish Exam" button</p>
                <p><strong>Step 2:</strong> Choose publication date/time</p>
                <p><strong>Step 3:</strong> Skeeme sends notification emails to assigned students</p>
                <p><strong>Step 4:</strong> Exam appears in student dashboards</p>
                <p><strong>Step 5:</strong> Students can start taking the exam</p>
            </div>

            <h3>Announcement & Communication</h3>
            <p>Beyond the automated notification, consider:</p>

            <ul class="feature-list">
                <li>Announcing in class before the exam date</li>
                <li>Sending a reminder email the day before</li>
                <li>Posting in your class online forum/chat</li>
                <li>Printing exam notices for physical posting</li>
            </ul>

            <h3>Sharing with Other Teachers</h3>
            <p>If another teacher wants to use your exam:</p>

            <ul class="feature-list">
                <li>You can share the exam template</li>
                <li>They get a copy they can edit</li>
                <li>Credit line shows original creator</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Build a shared exam library with other teachers. This saves time and ensures consistency in assessment across your department.
            </div>
        </div>

        <!-- Step 7: Monitor & Review -->
        <div class="section" data-aos="fade-up">
            <h2>Step 7: Monitor Students & Review Responses</h2>
            
            <h3>Real-Time Monitoring</h3>
            <p>As students take the exam, you can monitor progress:</p>

            <div class="step-box">
                <h4>👁️ Monitoring Dashboard</h4>
                <p>Go to the exam and click "View Responses"</p>
                <p>You'll see: Student names, submission status, start/end time, progress, submission status</p>
            </div>

            <h3>Viewing Individual Responses</h3>

            <div class="step-box">
                <h4>📋 Review Submissions</h4>
                <p><strong>Step 1:</strong> Click on a student's submission</p>
                <p><strong>Step 2:</strong> See their answers question by question</p>
                <p><strong>Step 3:</strong> For essay questions, read their response</p>
                <p><strong>Step 4:</strong> Add marks and feedback</p>
                <p><strong>Step 5:</strong> Save and move to next student</p>
            </div>

            <h3>Automatic Grading</h3>
            <p>Skeeme automatically grades objective questions:</p>

            <ul class="feature-list">
                <li>Multiple choice questions</li>
                <li>True/false questions</li>
                <li>Matching questions</li>
                <li>Short answer (if exact match configured)</li>
            </ul>

            <h3>Manual Grading</h3>
            <p>Essay and subjective questions need manual grading:</p>

            <ul class="feature-list">
                <li>Award marks based on rubric</li>
                <li>Add detailed feedback</li>
                <li>Compare student responses side-by-side</li>
                <li>Maintain grading consistency</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Create a detailed rubric and share it with students. This helps them understand what you're looking for and makes grading faster and more consistent.
            </div>
        </div>

        <!-- Step 8: Release Results -->
        <div class="section" data-aos="fade-up">
            <h2>Step 8: Release Results & Provide Feedback</h2>
            
            <h3>Releasing Student Results</h3>

            <div class="step-box">
                <h4>🏆 Result Release</h4>
                <p><strong>Step 1:</strong> Finish grading all submissions</p>
                <p><strong>Step 2:</strong> Go to Exam → "Results" tab</p>
                <p><strong>Step 3:</strong> Click "Release Grades"</p>
                <p><strong>Step 4:</strong> Choose visibility options:</p>
                <p>   • Release all grades at once or individually</p>
                <p>   • Show correct answers to students</p>
                <p>   • Show detailed feedback</p>
                <p><strong>Step 5:</strong> Students receive notification and can view results</p>
            </div>

            <h3>Student Result View</h3>
            <p>When you release results, students can see:</p>

            <ul class="feature-list">
                <li>Their overall score and grade</li>
                <li>Performance by question (which they got right/wrong)</li>
                <li>Correct answers (if you enabled this)</li>
                <li>Detailed feedback and explanations</li>
                <li>Comparison to class average (optional)</li>
            </ul>

            <h3>Providing Meaningful Feedback</h3>
            <p>Good feedback helps students learn. Include:</p>

            <ul class="feature-list">
                <li><strong>What they did well:</strong> "Great job identifying the main cause..."</li>
                <li><strong>What needs improvement:</strong> "The calculations look good, but..."</li>
                <li><strong>Specific resources:</strong> "Review chapter 4, pages 45-47 for more on this topic"</li>
                <li><strong>Next steps:</strong> "Next time, try organizing your thoughts in an outline first"</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Give feedback within 48 hours while the exam is fresh in students' minds. This increases the impact of your feedback and shows you take their learning seriously.
            </div>
        </div>

        <!-- Best Practices -->
        <div class="section" data-aos="fade-up">
            <h2>Best Practices for Exam Creation</h2>
            
            <ul class="feature-list">
                <li><strong>Mix question types:</strong> Use varied question types to keep students engaged and assess different skills</li>
                <li><strong>Clear instructions:</strong> Write questions that are unambiguous. Avoid trick questions unless intentional</li>
                <li><strong>Appropriate difficulty:</strong> Ensure questions match learning objectives and student ability level</li>
                <li><strong>Proper weighting:</strong> Weight questions by importance and time required</li>
                <li><strong>Pilot first:</strong> Test with a small group before rolling out to all students</li>
                <li><strong>Time realistically:</strong> Take the exam yourself to verify timing</li>
                <li><strong>Prevent cheating:</strong> Use randomization, shuffle options, set tight time windows</li>
                <li><strong>Fair access:</strong> Ensure students with disabilities have accommodations</li>
                <li><strong>Build progressively:</strong> Start with easier questions, increase difficulty</li>
                <li><strong>Review and improve:</strong> Analyze results to improve future exams</li>
            </ul>
        </div>

        <!-- Troubleshooting -->
        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting Common Issues</h2>
            
            <h3>Students Can't Access the Exam</h3>
            <p><strong>Causes:</strong> Exam not published, wrong availability dates, student not assigned</p>
            <p><strong>Solutions:</strong> Check exam status, verify dates, confirm student assignment</p>

            <h3>Exam Won't Save</h3>
            <p><strong>Causes:</strong> Missing required fields, browser issue, connection timeout</p>
            <p><strong>Solutions:</strong> Ensure all fields are filled, refresh page, try different browser</p>

            <h3>Time Display Issues</h3>
            <p><strong>Causes:</strong> Timezone mismatch, server time difference</p>
            <p><strong>Solutions:</strong> Check your timezone settings in admin panel</p>

            <h3>Grading Discrepancies</h3>
            <p><strong>Causes:</strong> Wrong answer key, incorrect marks assigned</p>
            <p><strong>Solutions:</strong> Review answer keys, manually adjust marks if needed</p>
        </div>

        <!-- Next Steps -->
        <div class="section" data-aos="fade-up">
            <h2>What's Next?</h2>
            <p>Congratulations on creating your first exam! Now explore these advanced features:</p>
            
            <ul class="feature-list">
                <li><a href="{{ url('learn/documentation/exam-management-basics') }}" style="color: #3b82f6;">Exam Management Basics</a> - Learn more advanced exam features</li>
                <li><a href="{{ url('learn/documentation/ai-question-generation') }}" style="color: #3b82f6;">AI Question Generation</a> - Use AI to create questions faster</li>
                <li><a href="{{ url('learn/documentation/ai-auto-grading') }}" style="color: #3b82f6;">AI Auto-Grading</a> - Let AI help with essay grading</li>
                <li><a href="{{ url('learn/documentation/analytics-dashboard') }}" style="color: #3b82f6;">Analytics Dashboard</a> - Analyze exam results</li>
            </ul>

            <div class="next-section">
                <h3 style="margin-top: 0;">Want to dive deeper?</h3>
                <p>Learn more about advanced exam features in our <a href="{{ url('learn/documentation/exam-management-basics') }}">Exam Management Basics</a> guide.</p>
            </div>
        </div>
    </section>
</div>

@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
    });
</script>
@endpush
