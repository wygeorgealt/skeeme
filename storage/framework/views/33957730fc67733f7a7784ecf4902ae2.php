

<?php $__env->startSection('content'); ?>
    <h1>Welcome to Skeeme, <?php echo e($user->first_name ?? $name ?? 'User'); ?>! 🚀</h1>
    <p>We're thrilled to have you on board. Skeeme is designed to transform your academic management into a high-performance experience.</p>
    <p>Your school is now equipped with AI-powered grading, seamless Zoom integrations, and real-time Slack alerts.</p>
    <div class="button-container">
        <a href="<?php echo e(url('/dashboard')); ?>" class="button">Go to Dashboard</a>
    </div>
    <div class="hr"></div>
    <p style="font-size: 14px;">If you have any questions, feel free to reply to this email. Our team is here to help you succeed.</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.email', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\emails\welcome.blade.php ENDPATH**/ ?>