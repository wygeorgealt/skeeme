<div class="student-dashboard">
    <div class="container-fluid">

        <!-- Alert Banner: Course Rep Role -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($stats['rep_courses']) > 0): ?>
        <div class="alert-banner">
            <div class="alert-banner-content">
                <div class="alert-badge">
                    <i class="fas fa-crown"></i>
                    <span>Course Rep: <?php echo e(implode(', ', $stats['rep_courses'])); ?></span>
                </div>
            </div>
            <div class="alert-banner-actions">
                <a href="#" class="btn-banner-action">View Responsibilities</a>
                <button class="btn-banner-dismiss" onclick="this.closest('.alert-banner').style.display='none'">Dismiss</button>
            </div>
        </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <!-- Page Header -->
        <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Student Dashboard</h1>
                <p class="text-zinc-600 dark:text-zinc-400">Welcome back, <?php echo e($student->first_name); ?>. Keep up the great work!</p>
            </div>
            <div class="flex items-center gap-3">
                <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['variant' => 'ghost']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'ghost']); ?>
                    <i class="fas fa-chart-line"></i>
                    Progress
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <!-- Enrolled Courses -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="stat-label">Enrolled Courses</div>
                </div>
                <div class="stat-value"><?php echo e(number_format($stats['total_courses'])); ?></div>
                <div class="stat-footer">
                    <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <i class="fas fa-check-circle text-[10px]"></i>
                        <?php echo e($stats['total_courses']); ?> Active
                    </span>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">This semester</span>
                </div>
            </div>

            <!-- Overall Progress -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon stat-icon-success">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-label">Overall Progress</div>
                </div>
                <div class="stat-value"><?php echo e($stats['overall_progress']); ?>%</div>
                <div class="stat-footer">
                    <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <i class="fas fa-arrow-up text-[10px]"></i>
                        On Track
                    </span>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Across all courses</span>
                </div>
            </div>

            <!-- GPA -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon stat-icon-info">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="stat-label">Current GPA</div>
                </div>
                <div class="stat-value"><?php echo e(number_format($stats['gpa'] ?? 0, 2)); ?></div>
                <div class="stat-footer">
                    <span class="flex items-center gap-1.5 text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        <i class="fas fa-calculator text-[10px]"></i>
                        Weighted
                    </span>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Academic Performance</span>
                </div>
            </div>

            <!-- Course Rep -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon stat-icon-warning">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-label">Course Rep</div>
                </div>
                <div class="stat-value"><?php echo e(count($stats['rep_courses'])); ?></div>
                <div class="stat-footer">
                    <span class="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <i class="fas fa-crown text-[10px]"></i>
                        Leadership
                    </span>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Courses represented</span>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <!-- My Courses -->
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h2 class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">My Courses</h2>
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['variant' => 'ghost','size' => 'sm','icon' => 'eye','class' => 'text-[10px] uppercase tracking-wider font-bold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'ghost','size' => 'sm','icon' => 'eye','class' => 'text-[10px] uppercase tracking-wider font-bold']); ?>View Curriculum <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                </div>
                <div class="p-6 flex-1">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($courses) > 0): ?>
                        <div class="space-y-4">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $courses; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $course): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors border border-zinc-100 dark:border-zinc-800/50">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-indigo-500">
                                            <i class="fas fa-book"></i>
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($course->name); ?></h4>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-end gap-2">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($course->zoom_join_url): ?>
                                            <a href="<?php echo e($course->zoom_join_url); ?>" target="_blank" class="flex items-center gap-2 px-3 py-1 bg-rose-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest animate-pulse hover:bg-rose-600 transition-colors">
                                                <i class="fas fa-video"></i>
                                                Join Live
                                            </a>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($course->zoom_recording_url): ?>
                                            <a href="<?php echo e($course->zoom_recording_url); ?>" target="_blank" class="flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                                                <i class="fas fa-play-circle"></i>
                                                Watch Rewind
                                            </a>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        <div class="flex items-center gap-2">
                                            <div class="text-[10px] font-bold text-zinc-900 dark:text-zinc-100"><?php echo e(round(($course->completed_topics / max(1, $course->total_topics)) * 100)); ?>%</div>
                                            <div class="w-24 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div class="h-full bg-emerald-500 rounded-full" style="width: <?php echo e(($course->completed_topics / max(1, $course->total_topics)) * 100); ?>%"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <i class="fas fa-book-open text-4xl opacity-20 mb-4"></i>
                            <p class="text-sm font-medium">No courses enrolled yet</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h2 class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Recent Activity</h2>
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['variant' => 'ghost','size' => 'sm','class' => 'text-[10px] uppercase tracking-wider font-bold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => 'ghost','size' => 'sm','class' => 'text-[10px] uppercase tracking-wider font-bold']); ?>History <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                </div>
                <div class="p-6 flex-1">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($recent_activities) > 0): ?>
                        <div class="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $recent_activities; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $activity): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="relative flex items-center justify-between gap-4">
                                    <div class="flex items-center gap-4">
                                        <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
                                            <div class="h-2 w-2 rounded-full bg-indigo-500"></div>
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Enrolled in "<?php echo e($activity->course_name); ?>"</h4>
                                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter"><?php echo e(\Carbon\Carbon::parse($activity->created_at)->diffForHumans()); ?></p>
                                        </div>
                                    </div>
                                    <span class="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <i class="fas fa-history text-4xl opacity-20 mb-4"></i>
                            <p class="text-sm font-medium">No recent activities</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Announcements -->
        <div class="mb-12">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Latest Announcements</h2>
                <div class="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 mx-6"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $announcements->take(3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $announcement): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                                <i class="fas fa-bullhorn rotate-[ -15deg ]"></i>
                            </div>
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><?php echo e(\Carbon\Carbon::parse($announcement->created_at)->format('M d, Y')); ?></span>
                        </div>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1"><?php echo e($announcement->title); ?></h3>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2 leading-relaxed">
                            <?php echo e(Str::limit($announcement->content, 100)); ?>

                        </p>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-bold">
                                    <?php echo e(strtoupper(substr($announcement->first_name, 0, 1))); ?>

                                </div>
                                <span class="text-[10px] font-bold text-zinc-600 dark:text-zinc-400"><?php echo e($announcement->first_name); ?> <?php echo e($announcement->last_name); ?></span>
                            </div>
                            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'viewAnnouncement('.e($announcement->id).')','variant' => 'ghost','size' => 'sm','class' => 'text-[10px] uppercase tracking-widest font-bold']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'viewAnnouncement('.e($announcement->id).')','variant' => 'ghost','size' => 'sm','class' => 'text-[10px] uppercase tracking-widest font-bold']); ?>Read <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <div class="col-span-full bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-12 text-center">
                        <i class="fas fa-envelope-open text-4xl text-zinc-300 dark:text-zinc-600 mb-4"></i>
                        <p class="text-sm text-zinc-500 dark:text-zinc-400 font-medium">No announcements for you yet.</p>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>

        <!-- View Modal -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showViewModal && $viewAnnouncement): ?>
            <div class="modal-overlay" wire:click="closeViewModal">
                <div class="modal-content" wire:click.stop>
                    <div class="modal-header">
                        <h3>Announcement Details</h3>
                        <button wire:click="closeViewModal" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 1rem;">
                            <h4 style="margin: 0 0 0.5rem 0; color: #111827;"><?php echo e($viewAnnouncement['title']); ?></h4>
                            <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem;">
                            <span>By: <?php echo e($viewAnnouncement['first_name'] ?? 'Unknown'); ?> <?php echo e($viewAnnouncement['last_name'] ?? ''); ?></span>
                                <span>Date: <?php echo e(\Carbon\Carbon::parse($viewAnnouncement['published_at'])->format('M d, Y H:i')); ?></span>
                            </div>
                        </div>
                        <div style="line-height: 1.6; color: #374151; white-space: pre-wrap;">
                            <?php echo e($viewAnnouncement['content']); ?>

                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>

    <!-- Custom Styles -->
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --glass-bg-light: rgba(255, 255, 255, 0.85);
            --glass-bg-dark: rgba(24, 24, 27, 0.8);
            --glass-border-light: rgba(255, 255, 255, 0.2);
            --glass-border-dark: rgba(255, 255, 255, 0.05);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
            zoom: 90%;
        }

        .stat-card {
            background: var(--glass-bg-light);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 1.5rem;
            border: 1px solid var(--glass-border-light);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .dark .stat-card {
            background: var(--glass-bg-dark);
            border: 1px solid var(--glass-border-dark);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: var(--primary-gradient);
            opacity: 0.8;
        }

        .stat-card:nth-child(2)::before { background: var(--success-gradient); }
        .stat-card:nth-child(3)::before { background: var(--info-gradient); }
        .stat-card:nth-child(4)::before { background: var(--warning-gradient); }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .stat-card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
        }

        .stat-icon {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--primary-gradient);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.125rem;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .stat-icon-success { background: var(--success-gradient); box-shadow: 0 4px 12px rgba(79, 172, 254, 0.25); }
        .stat-icon-info { background: var(--info-gradient); box-shadow: 0 4px 12px rgba(79, 172, 254, 0.25); }
        .stat-icon-warning { background: var(--warning-gradient); box-shadow: 0 4px 12px rgba(240, 147, 251, 0.25); }

        .stat-label {
            font-size: 0.75rem;
            color: #71717a;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .dark .stat-label { color: #a1a1aa; }

        .stat-value {
            font-size: 2.25rem;
            font-weight: 800;
            color: #18181b;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }

        .dark .stat-value { color: #fafafa; }

        .stat-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Modal Overlay Glass */
        .modal-overlay {
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            background: rgba(0, 0, 0, 0.4);
        }

        .modal-content {
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .dark .modal-content {
            background: #18181b;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .stat-card {
            animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
    </style>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\student-dashboard.blade.php ENDPATH**/ ?>