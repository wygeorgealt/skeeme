

<?php $__env->startSection('content'); ?>
<style>
    :root { 
        --bg-color: #0f0f14; 
        --text-color: #ffffff; 
        --text-muted: #9ca3af; 
        --border-color: rgba(255, 255, 255, 0.1); 
    }
    body { background: var(--bg-color); color: var(--text-color); }
    .feature-hero { padding: 5rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); }
    .community-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .community-card { background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.6)); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
    .community-card:hover { border-color: rgba(255, 255, 255, 0.2); transform: translateY(-5px); }
    .community-card h3 { color: #fff; margin-bottom: 1rem; }
    .community-card p { color: #d1d5db; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }
    .community-icon { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
</style>

<?php $__env->startPush('scripts'); ?>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
    });
</script>
<?php $__env->stopPush(); ?>

<section class="community-hero">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <div data-aos="fade-up" style="text-align: center;">
            <h1 style="font-size: 2.5rem; color: #fff; margin-bottom: 1rem;">Community</h1>
            <p style="color: #d1d5db; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                Connect with other educators, share experiences, ask questions, and grow together as a global education community.
            </p>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Ways to Connect</h2>
        
        <div class="community-grid">
            <a href="#" style="text-decoration: none;">
                <div class="community-card" data-aos="zoom-in">
                    <div class="community-icon"><i class="fas fa-comments"></i></div>
                    <h3>Discussion Forum</h3>
                    <p>Join our active discussion forum where educators ask questions, share best practices, and help each other solve challenges using Skeeme.</p>
                    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Visit Forum →</a>
                </div>
            </a>

            <a href="#" style="text-decoration: none;">
                <div class="community-card" data-aos="zoom-in" data-aos-delay="100">
                    <div class="community-icon"><i class="fas fa-slack"></i></div>
                    <h3>Slack Community</h3>
                    <p>Real-time chat with other Skeeme users. Get quick answers, share ideas, and network with educators from around the world.</p>
                    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Join Slack →</a>
                </div>
            </a>

            <a href="#" style="text-decoration: none;">
                <div class="community-card" data-aos="zoom-in" data-aos-delay="200">
                    <div class="community-icon"><i class="fas fa-facebook"></i></div>
                    <h3>Facebook Group</h3>
                    <p>Connect with the Skeeme community on Facebook. Share wins, ask questions, and celebrate student success stories together.</p>
                    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Join Group →</a>
                </div>
            </a>

            <a href="#" style="text-decoration: none;">
                <div class="community-card" data-aos="zoom-in" data-aos-delay="300">
                    <div class="community-icon"><i class="fas fa-video"></i></div>
                    <h3>Webinars & Workshops</h3>
                    <p>Attend monthly webinars featuring product experts, education thought leaders, and Skeeme users sharing their stories.</p>
                    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">See Schedule →</a>
                </div>
            </a>

            <a href="#" style="text-decoration: none;">
                <div class="community-card" data-aos="zoom-in" data-aos-delay="400">
                    <div class="community-icon"><i class="fas fa-users"></i></div>
                    <h3>User Groups</h3>
                    <p>Join local user groups in your region. Meet other educators using Skeeme, attend training sessions, and network.</p>
                    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Find Group →</a>
                </div>
            </a>

            <a href="#" style="text-decoration: none;">
                <div class="community-card" data-aos="zoom-in" data-aos-delay="500">
                    <div class="community-icon"><i class="fas fa-bell"></i></div>
                    <h3>Product Feedback</h3>
                    <p>Help shape the future of Skeeme. Submit feature requests, vote on ideas, and see your suggestions come to life.</p>
                    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Share Feedback →</a>
                </div>
            </a>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Featured Discussions</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; margin-right: 1rem;">MK</div>
                    <div>
                        <p style="color: #fff; font-weight: 600; margin: 0;">Mrs. Kanu</p>
                        <p style="color: #9ca3af; font-size: 0.85rem; margin: 0;">Lagos, Nigeria</p>
                    </div>
                </div>
                <h4 style="color: #fff; margin-bottom: 0.5rem;">Best Practices for AI Question Generation</h4>
                <p style="color: #d1d5db; font-size: 0.9rem; margin-bottom: 1rem;">What are your tips for getting the best results from the AI question generator? How do you validate the generated questions?</p>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem; font-weight: 600;">View Discussion (23 replies) →</a>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; margin-right: 1rem;">AO</div>
                    <div>
                        <p style="color: #fff; font-weight: 600; margin: 0;">Ayodele O.</p>
                        <p style="color: #9ca3af; font-size: 0.85rem; margin: 0;">Ibadan, Nigeria</p>
                    </div>
                </div>
                <h4 style="color: #fff; margin-bottom: 0.5rem;">My Students Love the Analytics Dashboard!</h4>
                <p style="color: #d1d5db; font-size: 0.9rem; margin-bottom: 1rem;">We implemented the analytics dashboard this term. Students are able to see exactly where they stand and what they need to improve. Game changer!</p>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem; font-weight: 600;">View Discussion (45 replies) →</a>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border-left: 4px solid #06b6d4;">
                <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #06b6d4, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; margin-right: 1rem;">CJ</div>
                    <div>
                        <p style="color: #fff; font-weight: 600; margin: 0;">Collins J.</p>
                        <p style="color: #9ca3af; font-size: 0.85rem; margin: 0;">Accra, Ghana</p>
                    </div>
                </div>
                <h4 style="color: #fff; margin-bottom: 0.5rem;">Integration with Our SIS - Help Needed</h4>
                <p style="color: #d1d5db; font-size: 0.9rem; margin-bottom: 1rem;">Has anyone successfully integrated Skeeme with Zend SIS? Looking for guidance on the API and data sync process.</p>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem; font-weight: 600;">View Discussion (12 replies) →</a>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container" style="max-width: 1400px; padding: 0 2rem;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 3rem; text-align: center;">Educator Spotlight</h2>
        <p style="color: #9ca3af; text-align: center; margin-bottom: 3rem;">Meet innovative educators making a difference with Skeeme.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2rem;">👩‍🏫</div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem;">Dr. Amara Owusu</h4>
                    <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">Ashesi University, Ghana</p>
                </div>
                <p style="color: #d1d5db; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
                    "Skeeme's AI grading has freed up hours every week that I now spend on personalized student feedback. My exam scores improved by 15% this year."
                </p>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Full Story →</a>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6, #06b6d4); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2rem;">👨‍🏫</div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem;">Mr. Kofi Mensah</h4>
                    <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">Osei Tutu Senior High School, Ghana</p>
                </div>
                <p style="color: #d1d5db; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
                    "Using Skeeme's analytics, I identified my struggling students within the first week. Early interventions led to a 40% improvement in performance."
                </p>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Full Story →</a>
            </div>

            <div style="background: rgba(51, 65, 85, 0.3); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #10b981); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2rem;">👩‍🎓</div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem;">Ms. Zainab Hassan</h4>
                    <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">Ahmadu Bello University, Nigeria</p>
                </div>
                <p style="color: #d1d5db; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
                    "The AI question generation saved me 10 hours creating exam questions this semester. Quality is excellent and questions align perfectly with my curriculum."
                </p>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read Full Story →</a>
            </div>
        </div>
    </div>
</section>

<section style="padding: 4rem 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));">
    <div class="container" style="max-width: 1200px; padding: 0 2rem; text-align: center;">
        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 2rem;">Join Our Community</h2>
        <p style="color: #d1d5db; margin-bottom: 2rem; font-size: 1.1rem;">Become part of a global community of educators transforming education with Skeeme.</p>
        <a href="<?php echo e(url('register')); ?>" class="btn-primary" style="padding: 0.75rem 2rem; background: #fff; color: #0A0A0B; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
            Join Community
        </a>
    </div>
</section>

<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.landing', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\landing\learn\community.blade.php ENDPATH**/ ?>