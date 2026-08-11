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
    .article-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .article-header { padding: 3rem 0 2rem; border-bottom: 1px solid var(--border-color); margin-bottom: 2rem; }
    .article-title { font-size: 2.5rem; margin: 1rem 0; color: #fff; }
    .article-meta { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem; }
    .article-tag { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; border-radius: 20px; color: #3b82f6; font-size: 0.75rem; margin-right: 0.5rem; }
    .article-content { line-height: 1.8; color: #d1d5db; font-size: 1.05rem; }
    .article-content h2 { font-size: 1.8rem; margin: 2rem 0 1rem; color: #fff; }
    .article-content h3 { font-size: 1.3rem; margin: 1.5rem 0 0.8rem; color: #e5e7eb; }
    .article-content p { margin-bottom: 1.5rem; }
    .article-content ul, .article-content ol { margin-bottom: 1.5rem; margin-left: 2rem; }
    .article-content li { margin-bottom: 0.8rem; }
    .back-link { color: #3b82f6; text-decoration: none; font-weight: 600; margin-bottom: 2rem; display: inline-block; }
    .back-link:hover { text-decoration: underline; }
    .feature-list { background: rgba(51, 65, 85, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 12px; margin: 2rem 0; }
    .feature-list h3 { margin-top: 0; }
</style>

<div class="article-container">
    <a href="{{ route('learn.blog') }}" class="back-link">← Back to Blog</a>
    
    <div class="article-header">
        <span class="article-tag">Product</span>
        <h1 class="article-title">Announcing: New Analytics Dashboard</h1>
        <div class="article-meta">
            <i class="fas fa-calendar"></i> November 1, 2024 • 4 min read
        </div>
    </div>

    <div class="article-content">
        <p>
            We're thrilled to announce the launch of our completely redesigned analytics dashboard! Built from the ground up based on feedback from thousands of educators, this new dashboard brings real-time insights, powerful customization, and AI-powered recommendations directly to your fingertips.
        </p>

        <h2>What's New</h2>
        <p>
            The new analytics dashboard represents a major leap forward in how educators access and act on student data. Here's what we've built for you:
        </p>

        <div class="feature-list">
            <h3>Real-Time Metrics</h3>
            <p>
                Get instant visibility into what's happening right now. Watch engagement metrics, exam performance, and student progress update in real-time as your students interact with the platform. No more waiting for daily or weekly reports—your data is live.
            </p>
        </div>

        <div class="feature-list">
            <h3>Customizable Reports</h3>
            <p>
                Every educator's needs are different. Build dashboards that match your workflow. Choose which metrics matter most to you, arrange them however you like, and create custom views for different purposes—class overview, individual student tracking, trend analysis, and more.
            </p>
        </div>

        <div class="feature-list">
            <h3>AI-Powered Recommendations</h3>
            <p>
                Our new AI recommendation engine analyzes your data and proactively suggests actions. These aren't just numbers—they're insights paired with clear recommendations like "Ahmed needs help with quadratic equations" or "Your Class 10A is ready to move to more advanced material."
            </p>
        </div>

        <h2>Key Features</h2>
        <p>
            The redesigned dashboard includes several powerful features:
        </p>

        <h3>Class Performance Overview</h3>
        <p>
            At a glance, see how your entire class is performing. View average scores, engagement rates, assignment completion, and progress toward learning objectives. Identify which topics the class is mastering and which ones need more focus.
        </p>

        <h3>Individual Student Tracking</h3>
        <p>
            Click into any student to see their complete learning journey. Review their assessment history, identify knowledge gaps, see their engagement patterns, and get AI-powered insights about how to best support their learning.
        </p>

        <h3>Comparative Analysis</h3>
        <p>
            Compare performance across different sections, time periods, or student cohorts. Understand which groups are thriving and which may need additional support. Benchmark against district or national standards.
        </p>

        <h3>Trend Analysis</h3>
        <p>
            See how metrics are trending over time. Is engagement declining? Are students mastering concepts faster? Which instructional strategies are showing the best results? Identify patterns that inform your teaching decisions.
        </p>

        <h3>Learning Objective Tracking</h3>
        <p>
            Track progress toward specific learning objectives and curriculum standards. See which students have mastered each objective and who needs targeted support. Adjust your instruction based on mastery data.
        </p>

        <h2>Design Built for Educators</h2>
        <p>
            We didn't just create a data dashboard—we created a tool designed specifically for how teachers and administrators work. The interface is clean and intuitive, with no technical jargon required. Anyone can navigate the dashboard and extract meaningful insights within seconds.
        </p>
        <p>
            Key design principles:
        </p>
        <ul>
            <li><strong>Simplicity:</strong> Complex data presented in clear, visual formats</li>
            <li><strong>Context:</strong> Numbers paired with context and meaning</li>
            <li><strong>Actionability:</strong> Focus on insights that lead to concrete actions</li>
            <li><strong>Speed:</strong> Get to the information you need in one or two clicks</li>
            <li><strong>Flexibility:</strong> Customize to match your unique needs</li>
        </ul>

        <h2>Export and Integration</h2>
        <p>
            Generate beautiful, shareable reports with a single click. Export data in multiple formats for use in presentations, emails, or your own analysis. Integrate with your existing systems via our powerful API.
        </p>

        <h2>Availability</h2>
        <p>
            The new analytics dashboard is now available to all Skeeme users. Log in to your account and click "Analytics" in the main menu to access it. For existing custom dashboards, they'll continue to work exactly as before, but we recommend exploring the new dashboard to discover its capabilities.
        </p>

        <h2>Training and Support</h2>
        <p>
            We've created comprehensive guides to help you get the most from the new dashboard. Visit our documentation portal or watch our tutorial videos to learn advanced features. Our support team is also available to help you customize dashboards for your specific needs.
        </p>

        <h2>What's Next</h2>
        <p>
            This is just the beginning. We're already working on additional features based on your feedback, including:
        </p>
        <ul>
            <li>Mobile app for on-the-go access to your dashboards</li>
            <li>Advanced predictive analytics</li>
            <li>Automated intervention recommendations</li>
            <li>Integration with additional third-party tools</li>
        </ul>

        <p>
            We can't wait for you to experience the new analytics dashboard. As always, we'd love to hear your feedback. Reach out to our team with questions, suggestions, or feature requests!
        </p>
    </div>
</div>

@endsection
