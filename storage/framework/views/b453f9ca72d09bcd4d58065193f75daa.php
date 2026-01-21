

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
        <a href="<?php echo e(url('learn/documentation')); ?>">Documentation</a> / AI Question Generation
    </div>

    <section class="guide-hero" data-aos="fade-up">
        <h1>AI Question Generation</h1>
        <p>Learn how to use Skeeme's AI-powered question generation to create high-quality questions from your course materials in minutes, with custom difficulty levels and Bloom's taxonomy alignment.</p>
        <p style="color: #9ca3af; font-size: 0.95rem;">⏱️ Estimated reading time: 14 minutes</p>
    </section>

    <section class="guide-content">
        <div class="section" data-aos="fade-up">
            <h2>Overview</h2>
            <p>Creating exam questions is time-consuming. Skeeme's AI question generation tool analyzes your course materials and automatically generates diverse, well-structured questions with answer keys, explanations, and configurable difficulty levels.</p>
            <ul class="feature-list">
                <li>Generate questions from lecture notes, textbooks, or PDFs</li>
                <li>Choose multiple question types automatically</li>
                <li>Control difficulty and cognitive level</li>
                <li>Review and edit before using</li>
                <li>Build your question bank faster</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Preparing Your Content</h2>
            
            <h3>Supported Formats</h3>
            <p>Upload your course material in any of these formats:</p>
            <ul class="feature-list">
                <li>PDF documents</li>
                <li>Microsoft Word (.docx)</li>
                <li>Plain text (.txt)</li>
                <li>Markdown (.md)</li>
                <li>Google Docs (via link)</li>
                <li>Copy-paste text directly</li>
            </ul>

            <h3>Content Guidelines</h3>
            <p>For best results:</p>
            <ul class="feature-list">
                <li>Use clear, well-structured material</li>
                <li>Include key concepts and definitions</li>
                <li>Organize by topics or chapters</li>
                <li>For best results, 2-10 pages per batch</li>
                <li>Remove irrelevant material (images, ads, page numbers)</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Start with high-quality content. The AI generates questions based on what you provide. Better source material = better questions.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Using the AI Question Generator</h2>
            
            <h3>Accessing the Tool</h3>

            <div class="step-box">
                <h4>🤖 Getting Started</h4>
                <p><strong>Step 1:</strong> Go to "Question Bank" → "Generate Questions with AI"</p>
                <p><strong>Step 2:</strong> Upload or paste your course material</p>
                <p><strong>Step 3:</strong> Configure generation settings (see below)</p>
                <p><strong>Step 4:</strong> Click "Generate Questions"</p>
                <p><strong>Step 5:</strong> Review and edit generated questions</p>
            </div>

            <h3>Configuration Options</h3>

            <div class="step-box">
                <h4>⚙️ Generation Settings</h4>
                <p><strong>Number of Questions:</strong> How many questions to generate (5-50)</p>
                <p><strong>Question Types:</strong> Select which types to generate</p>
                <p><strong>Difficulty Level:</strong> Easy, Medium, Hard, or Mix</p>
                <p><strong>Bloom's Level:</strong> Remember, Understand, Apply, Analyze, Evaluate, Create</p>
                <p><strong>Topic Focus:</strong> Specific topics to emphasize</p>
                <p><strong>Include Explanations:</strong> Generate detailed answers</p>
            </div>

            <h3>Question Type Selection</h3>
            <p>Choose which types of questions to generate:</p>
            <ul class="feature-list">
                <li>Multiple Choice (single answer)</li>
                <li>Multiple Selection</li>
                <li>Short Answer</li>
                <li>True/False</li>
                <li>Matching</li>
                <li>Fill in the Blank</li>
            </ul>

            <p>The AI will distribute questions evenly across selected types.</p>

            <h3>Difficulty Customization</h3>
            <p>Control question difficulty:</p>

            <div class="step-box">
                <h4>📊 Difficulty Levels</h4>
                <p><strong>Easy:</strong> Direct recall from material, straightforward concepts</p>
                <p><strong>Medium:</strong> Apply concepts, make connections, interpret</p>
                <p><strong>Hard:</strong> Synthesize information, analyze deeply, evaluate</p>
                <p><strong>Mix:</strong> Balanced blend of all levels (recommended)</p>
            </div>

            <h3>Bloom's Taxonomy Levels</h3>
            <p>Align questions to learning objectives:</p>

            <ul class="feature-list">
                <li><strong>Remember:</strong> Recall facts and basic concepts</li>
                <li><strong>Understand:</strong> Explain ideas or concepts</li>
                <li><strong>Apply:</strong> Use information in new situations</li>
                <li><strong>Analyze:</strong> Draw connections among ideas</li>
                <li><strong>Evaluate:</strong> Justify a choice or decision</li>
                <li><strong>Create:</strong> Produce new or original work</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> For comprehensive assessment, include questions at multiple Bloom's levels. A well-balanced exam has approximately: 50% Understand, 30% Apply, 20% Analyze/Evaluate.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Reviewing Generated Questions</h2>
            
            <h3>Quality Review Process</h3>

            <div class="step-box">
                <h4>✅ Review Checklist</h4>
                <p>□ Question is clear and grammatically correct</p>
                <p>□ Answer key is accurate</p>
                <p>□ Distractors (for MCQ) are plausible</p>
                <p>□ Question aligns with learning objectives</p>
                <p>□ Difficulty is appropriate</p>
                <p>□ No obvious answers or trick questions</p>
                <p>□ Explanation is helpful and clear</p>
            </div>

            <h3>Editing Questions</h3>
            <p>You can edit any generated question:</p>

            <div class="step-box">
                <h4>✏️ Editing Process</h4>
                <p><strong>Step 1:</strong> Click on a question to expand it</p>
                <p><strong>Step 2:</strong> Click "Edit" to modify</p>
                <p><strong>Step 3:</strong> Update question text, answers, or settings</p>
                <p><strong>Step 4:</strong> Save changes</p>
            </div>

            <h3>Accepting or Rejecting Questions</h3>
            <ul class="feature-list">
                <li>Accept: Question is good, add to bank</li>
                <li>Edit: Modify then accept</li>
                <li>Reject: Delete this question</li>
                <li>Regenerate: Ask AI to create a different version</li>
            </ul>

            <h3>Batch Actions</h3>
            <p>Manage multiple questions efficiently:</p>
            <ul class="feature-list">
                <li>Select multiple questions</li>
                <li>Accept all or reject all</li>
                <li>Change difficulty for selected questions</li>
                <li>Add tags to a batch</li>
                <li>Adjust marks for a group</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Advanced Features</h2>
            
            <h3>Regenerate with Different Settings</h3>
            <p>Don't like the generated questions? Try again with different settings:</p>
            <ul class="feature-list">
                <li>Change difficulty level</li>
                <li>Select different question types</li>
                <li>Focus on different topics</li>
                <li>Adjust number of questions</li>
            </ul>

            <h3>AI-Powered Answer Validation</h3>
            <p>The AI validates answers for accuracy:</p>
            <ul class="feature-list">
                <li>Checks answers against source material</li>
                <li>Flags ambiguous or potentially incorrect answers</li>
                <li>Suggests improvements where needed</li>
                <li>You approve final answer key</li>
            </ul>

            <h3>Explanation Generation</h3>
            <p>Detailed explanations help students learn:</p>
            <ul class="feature-list">
                <li>Why the correct answer is right</li>
                <li>Why other options are incorrect</li>
                <li>References to source material</li>
                <li>Related concepts to explore</li>
            </ul>

            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Always review AI-generated explanations before using them. Sometimes they need refinement to match your teaching approach and examples.
            </div>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Best Practices</h2>
            
            <ul class="feature-list">
                <li><strong>Review every question:</strong> AI is a tool, not a replacement. Always verify quality</li>
                <li><strong>Start small:</strong> Generate 10-20 questions first to understand the output quality</li>
                <li><strong>Edit as needed:</strong> Customize questions to match your specific teaching</li>
                <li><strong>Use diverse source material:</strong> Mix textbooks, notes, real-world examples</li>
                <li><strong>Set clear parameters:</strong> Specify difficulty and cognitive levels upfront</li>
                <li><strong>Build incrementally:</strong> Add to your question bank over time</li>
                <li><strong>Keep source material organized:</strong> Easy to regenerate if needed</li>
                <li><strong>Document your preferences:</strong> Note which AI settings work best for your subjects</li>
                <li><strong>Validate accuracy:</strong> Especially important for math, science, technical subjects</li>
                <li><strong>Track effectiveness:</strong> See which AI-generated questions work well in exams</li>
            </ul>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Troubleshooting</h2>
            
            <h3>Generated Questions are Too Easy/Hard</h3>
            <p><strong>Solution:</strong> Adjust difficulty setting and regenerate. Provide more context in source material.</p>

            <h3>Poor Quality Answers</h3>
            <p><strong>Solution:</strong> Check source material quality. Reject and regenerate. Manually correct answer keys.</p>

            <h3>Distractors Don't Make Sense</h3>
            <p><strong>Solution:</strong> Edit the question. Provide clearer topic descriptions. Use higher-quality source material.</p>

            <h3>Same Questions Generated Multiple Times</h3>
            <p><strong>Solution:</strong> Reject duplicates. Vary your source material. Use different topic focuses.</p>
        </div>

        <div class="section" data-aos="fade-up">
            <h2>Combining AI Generation with Manual Creation</h2>
            
            <p>Best results come from combining AI-generated and manually-created questions:</p>
            <ul class="feature-list">
                <li><strong>Use AI for:</strong> Standard recall/comprehension questions, building question volume quickly</li>
                <li><strong>Write manually for:</strong> Questions specific to your examples, higher-order thinking, real-world scenarios</li>
                <li><strong>Mix in exams:</strong> Combine both for balanced, comprehensive assessment</li>
            </ul>

            <div class="next-section">
                <h3 style="margin-top: 0;">Next: AI-Powered Grading</h3>
                <p>Learn how to use AI to automatically grade essays and short answers. Check out our <a href="<?php echo e(url('learn/documentation/ai-auto-grading')); ?>">AI Auto-Grading Workflow</a> guide.</p>
            </div>
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

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\learn\ai-question-generation.blade.php ENDPATH**/ ?>