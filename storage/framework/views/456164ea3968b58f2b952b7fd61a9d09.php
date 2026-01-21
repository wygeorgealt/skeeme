<div class="admin-dashboard">
    <div class="container-fluid">
        <!-- Alert Banner -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($subscription_expired || ($days_left && $days_left <= 7) || $student_limit_reached): ?>
        <div class="alert-banner">
            <div class="alert-banner-content">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($subscription_expired): ?>
                    <div class="alert-badge">
                        <i class="fas fa-exclamation-circle"></i>
                        <span><?php echo e(($subscription && $subscription->isPro()) ? 'Subscription' : 'Trial'); ?>: Expired</span>
                    </div>
                <?php elseif($days_left && $days_left <= 7): ?>
                    <div class="alert-badge">
                        <i class="fas fa-clock"></i>
                        <span><?php echo e(($subscription && $subscription->isPro()) ? 'Subscription' : 'Trial'); ?>: <?php echo e($days_left); ?> days left</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($student_limit_reached): ?>
                    <div class="alert-badge">
                        <i class="fas fa-users"></i>
                        <span>Student limit reached</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($stats['pending_lecturers'] > 0): ?>
                    <div class="alert-badge">
                        <i class="fas fa-user-clock"></i>
                        <span><?php echo e($stats['pending_lecturers']); ?> approvals pending</span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
            <div class="alert-banner-actions">
                <button class="btn-banner-dismiss" onclick="this.closest('.alert-banner').style.display='none'">Dismiss</button>
            </div>
        </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <!-- Page Header -->
        <div class="dashboard-header">
            <div class="header-left">
                <h1 class="dashboard-title">Admin Dashboard</h1>
                <p class="dashboard-subtitle">Welcome back, <?php echo e(Auth::user()->first_name); ?>. Here's what's happening today.</p>
            </div>
            <div class="header-right space-x-2 flex items-center">
                <!-- Plan Badge -->
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($subscription): ?>
                    <span class="plan-badge <?php if($subscription->price == 0): ?> plan-basic <?php elseif($subscription->isPro()): ?> plan-pro <?php endif; ?>">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($subscription->price == 0): ?>
                            Skeeme Basic
                        <?php elseif($subscription->isPro()): ?>
                            Skeeme Pro
                        <?php else: ?>
                            <?php echo e($subscription->plan_name); ?>

                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </span>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($subscription && $days_left !== null && $days_left <= 15 && $days_left > 0): ?>
                    <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <i class="fas fa-calendar text-amber-600 dark:text-amber-400"></i>
                        <span class="text-sm font-medium text-amber-900 dark:text-amber-300">
                            <strong><?php echo e($days_left); ?></strong> day<?php echo e($days_left !== 1 ? 's' : ''); ?> left
                        </span>
                    </div>
                    
                    <a 
                        href="<?php echo e(route('settings.subscription-billing')); ?>"
                        class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition inline-flex items-center gap-2"
                    >
                        <i class="fas fa-sync"></i> Renew Now
                    </a>
                <?php elseif($subscription_expired): ?>
                    <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <i class="fas fa-exclamation-circle text-red-600 dark:text-red-400"></i>
                        <span class="text-sm font-medium text-red-900 dark:text-red-300">
                            Subscription Expired
                        </span>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                
                <!-- Live Users Dropdown -->
                <?php if (isset($component)) { $__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::dropdown','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::dropdown'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['class' => 'relative']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'relative']); ?>
                        <span class="flex h-2 w-2 absolute top-1 right-1">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <i class="fas fa-chart-line"></i>
                        Live
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

                    <?php if (isset($component)) { $__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.index','data' => ['class' => 'min-w-64']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'min-w-64']); ?>
                        <?php if (isset($component)) { $__componentOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.heading','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.heading'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>Online Users (<?php echo e(count($onlineUsers)); ?>) <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d)): ?>
<?php $attributes = $__attributesOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d; ?>
<?php unset($__attributesOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d)): ?>
<?php $component = $__componentOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d; ?>
<?php unset($__componentOriginal0fbd4b2c49e1ec06a4cd4ecfc19d5c6d); ?>
<?php endif; ?>
                        
                        <?php if (isset($component)) { $__componentOriginald5e1eb3ae521062f8474178ba08933ca = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald5e1eb3ae521062f8474178ba08933ca = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.separator','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.separator'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald5e1eb3ae521062f8474178ba08933ca)): ?>
<?php $attributes = $__attributesOriginald5e1eb3ae521062f8474178ba08933ca; ?>
<?php unset($__attributesOriginald5e1eb3ae521062f8474178ba08933ca); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald5e1eb3ae521062f8474178ba08933ca)): ?>
<?php $component = $__componentOriginald5e1eb3ae521062f8474178ba08933ca; ?>
<?php unset($__componentOriginald5e1eb3ae521062f8474178ba08933ca); ?>
<?php endif; ?>

                        <div class="max-h-64 overflow-y-auto">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $onlineUsers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $user): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <?php if (isset($component)) { $__componentOriginal5027d420cfeeb03dd925cfc08ae44851 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.item','data' => ['class' => 'flex items-center gap-3 py-2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'flex items-center gap-3 py-2']); ?>
                                    <div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                                        <?php echo e(strtoupper(substr($user->first_name, 0, 1) . substr($user->last_name, 0, 1))); ?>

                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                            <?php echo e($user->first_name); ?> <?php echo e($user->last_name); ?>

                                        </div>
                                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                            <?php echo e(ucwords($user->role)); ?>

                                        </div>
                                    </div>
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $attributes = $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $component = $__componentOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <div class="p-6 text-center text-zinc-400">
                                    <i class="fas fa-user-slash text-xl opacity-20 mb-2"></i>
                                    <p class="text-xs font-medium">No other users online</p>
                                </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>

                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($onlineUsers) > 0): ?>
                            <?php if (isset($component)) { $__componentOriginald5e1eb3ae521062f8474178ba08933ca = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald5e1eb3ae521062f8474178ba08933ca = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.separator','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.separator'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald5e1eb3ae521062f8474178ba08933ca)): ?>
<?php $attributes = $__attributesOriginald5e1eb3ae521062f8474178ba08933ca; ?>
<?php unset($__attributesOriginald5e1eb3ae521062f8474178ba08933ca); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald5e1eb3ae521062f8474178ba08933ca)): ?>
<?php $component = $__componentOriginald5e1eb3ae521062f8474178ba08933ca; ?>
<?php unset($__componentOriginald5e1eb3ae521062f8474178ba08933ca); ?>
<?php endif; ?>
                            <?php if (isset($component)) { $__componentOriginal5027d420cfeeb03dd925cfc08ae44851 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::menu.item','data' => ['class' => 'justify-center text-xs font-bold text-indigo-500 uppercase tracking-widest']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::menu.item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'justify-center text-xs font-bold text-indigo-500 uppercase tracking-widest']); ?>
                                View Activity Map
                             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $attributes = $__attributesOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__attributesOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851)): ?>
<?php $component = $__componentOriginal5027d420cfeeb03dd925cfc08ae44851; ?>
<?php unset($__componentOriginal5027d420cfeeb03dd925cfc08ae44851); ?>
<?php endif; ?>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a)): ?>
<?php $attributes = $__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a; ?>
<?php unset($__attributesOriginalf7749b857446d2788d0b6ca0c63f9d3a); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a)): ?>
<?php $component = $__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a; ?>
<?php unset($__componentOriginalf7749b857446d2788d0b6ca0c63f9d3a); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888)): ?>
<?php $attributes = $__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888; ?>
<?php unset($__attributesOriginal2b4bb2cd4b8f1a3c08bae49ea918b888); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888)): ?>
<?php $component = $__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888; ?>
<?php unset($__componentOriginal2b4bb2cd4b8f1a3c08bae49ea918b888); ?>
<?php endif; ?>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <!-- Students Card -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-value"><?php echo e(number_format($stats['total_students'])); ?></div>
                <div class="stat-footer">
                    <span class="stat-badge stat-badge-success">
                        <i class="fas fa-arrow-up"></i>
                        <?php echo e($stats['students_mom_growth']); ?>% MoM
                    </span>
                    <span class="stat-detail">Active this week: <?php echo e(number_format($stats['active_students_week'])); ?></span>
                </div>
            </div>

            <!-- Lecturers Card -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon stat-icon-success">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div class="stat-label">Lecturers</div>
                </div>
                <div class="stat-value"><?php echo e(number_format($stats['total_lecturers'])); ?></div>
                <div class="stat-footer">
                    <span class="stat-badge stat-badge-success">
                        <i class="fas fa-arrow-up"></i>
                        +<?php echo e($stats['new_lecturers_month'] > 0 ? round(($stats['new_lecturers_month'] / max($stats['total_lecturers'] - $stats['new_lecturers_month'], 1)) * 100, 1) : 0); ?>%
                    </span>
                    <span class="stat-detail">New this month: <?php echo e($stats['new_lecturers_month']); ?></span>
                </div>
            </div>

            <!-- Classes Card -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon stat-icon-info">
                        <i class="fas fa-school"></i>
                    </div>
                    <div class="stat-label">Classes</div>
                </div>
                <div class="stat-value"><?php echo e(number_format($stats['total_classes'])); ?></div>
                <div class="stat-footer">
                    <span class="stat-badge stat-badge-success">
                        <i class="fas fa-arrow-up"></i>
                        +0%
                    </span>
                    <span class="stat-detail">Total classes</span>
                </div>
            </div>

            <!-- Engagement Card -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon stat-icon-warning">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-label">Engagement</div>
                </div>
                <div class="stat-value"><?php echo e($stats['engagement_rate']); ?>%</div>
                <div class="stat-footer">
                    <span class="stat-badge stat-badge-success">
                        <i class="fas fa-arrow-up"></i>
                        +<?php echo e($stats['engagement_rate'] > 0 ? round($stats['engagement_rate'] * 0.048, 1) : 0); ?>%
                    </span>
                    <span class="stat-detail">Avg. session <?php echo e($stats['avg_session_time']); ?>m</span>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
            <!-- Recent Activities -->
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                    <h2 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Recent Activities</h2>
                </div>
                <div class="p-6 flex-1">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($recent_activities) > 0): ?>
                        <div class="flex flex-col gap-6">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $recent_activities->take(5); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $activity): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="flex gap-4 group">
                                    <div class="relative">
                                        <div class="w-2 h-2 rounded-full <?php if($activity->type == 'enrollment'): ?> bg-indigo-500 <?php else: ?> bg-emerald-500 <?php endif; ?> mt-2 z-10 relative"></div>
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$loop->last): ?>
                                            <div class="absolute top-4 left-1 w-[1px] h-[calc(100%+8px)] bg-zinc-200 dark:bg-zinc-800"></div>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors cursor-pointer">
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($activity->type == 'enrollment'): ?>
                                                Course "<?php echo e($activity->course_name); ?>" published
                                            <?php else: ?>
                                                <?php echo e($activity->first_name); ?> <?php echo e($activity->last_name); ?> registered
                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        </h4>
                                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">
                                            <?php echo e(\Carbon\Carbon::parse($activity->created_at)->diffForHumans()); ?> •
                                            <span class="text-zinc-500"><?php echo e($this->getActivityLabel($activity)); ?></span>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="py-12 text-center text-zinc-400">
                            <i class="fas fa-history text-3xl opacity-20 mb-3"></i>
                            <p class="text-sm font-medium">No recent activities to show.</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>

            <!-- Classes Overview -->
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                    <h2 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Classes Overview</h2>
                </div>
                <div class="p-6 flex-1">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($classes) > 0): ?>
                        <div class="flex flex-col gap-4">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = collect($classes)->take(5); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $class): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                            <i class="fas fa-school text-xs"></i>
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($class->name); ?></h4>
                                            <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Capacity: <?php echo e($class->capacity ?? 'N/A'); ?></div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-end gap-1">
                                        <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($class->student_count); ?></span>
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Students</span>
                                    </div>
                                </div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="py-12 text-center text-zinc-400">
                            <i class="fas fa-school text-3xl opacity-20 mb-3"></i>
                            <p class="text-sm font-medium">No classes found.</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Announcements -->
        <div class="mb-12">
            <h2 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i class="fas fa-bullhorn text-zinc-400"></i> Announcements
            </h2>
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(count($announcements) > 0): ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $announcements->take(3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $announcement): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                            <div>
                                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors line-clamp-2 mb-4"><?php echo e($announcement->title); ?></h3>
                            </div>
                            <div class="flex items-center justify-between mt-auto">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter"><?php echo e(\Carbon\Carbon::parse($announcement->published_at)->format('M d, Y')); ?></span>
                                <div class="flex gap-1">
                                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['size' => 'xs','variant' => 'ghost']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'xs','variant' => 'ghost']); ?>View <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $attributes = $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580)): ?>
<?php $component = $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580; ?>
<?php unset($__componentOriginalc04b147acd0e65cc1a77f86fb0e81580); ?>
<?php endif; ?>
                                    <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['size' => 'xs','variant' => 'ghost']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'xs','variant' => 'ghost']); ?>Duplicate <?php echo $__env->renderComponent(); ?>
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
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            <?php else: ?>
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-2xl text-center text-zinc-400 shadow-sm">
                    <i class="fas fa-volume-mute text-3xl opacity-20 mb-3"></i>
                    <p class="text-sm font-medium">Clear skies! No announcements at the moment.</p>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>
    </div>

    <!-- Custom Styles -->
    <style>
        /* CSS Custom Properties for Enhanced Color Palette */
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --accent-purple: #8b5cf6;
            --accent-blue: #3b82f6;
            --accent-green: #10b981;
            --accent-orange: #f59e0b;
            --glass-bg-light: rgba(255, 255, 255, 0.85);
            --glass-bg-dark: rgba(39, 39, 42, 0.8);
            --glass-border-light: rgba(255, 255, 255, 0.2);
            --glass-border-dark: rgba(255, 255, 255, 0.1);
        }

        /* Reset and Base */

        /* Alert Banner */
        .alert-banner {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }

        .alert-banner-content {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .alert-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.95);
            padding: 0.375rem 0.875rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #92400e;
        }

        .alert-badge i {
            font-size: 0.875rem;
        }

        .alert-banner-actions {
            display: flex;
            gap: 0.75rem;
        }

        .btn-banner-action,
        .btn-banner-dismiss {
            padding: 0.5rem 1.25rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            text-decoration: none;
        }

        .btn-banner-action {
            background: rgba(255, 255, 255, 0.95);
            color: #92400e;
        }

        .btn-banner-action:hover {
            background: white;
            transform: translateY(-1px);
        }

        .btn-banner-dismiss {
            background: transparent;
            color: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .btn-banner-dismiss:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        /* Dashboard Header */
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
        }

        .dashboard-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 0.25rem;
        }

        .dark .dashboard-title {
            color: #fafafa;
        }

        .dashboard-subtitle {
            font-size: 0.9375rem;
            color: #71717a;
            margin: 0;
        }

        .dark .dashboard-subtitle {
            color: #a1a1aa;
        }

        .header-right {
            display: flex;
            gap: 0.75rem;
        }

        .plan-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: default;
        }

        .plan-basic {
            background: #f3e8ff;
            border: 1px solid #e9d5ff;
            color: #7e22ce;
        }

        .dark .plan-basic {
            background: #6b21a8;
            border-color: #7e22ce;
            color: #e9d5ff;
        }

        .plan-pro {
            background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
            border: 1px solid #86efac;
            color: #15803d;
        }

        .dark .plan-pro {
            background: linear-gradient(135deg, #166534 0%, #064e3b 100%);
            border-color: #22c55e;
            color: #86efac;
        }

        .btn-header-action {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: white;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #52525b;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .dark .btn-header-action {
            background: #27272a;
            border-color: #3f3f46;
            color: #d4d4d8;
        }

        .btn-header-action:hover {
            background: #f4f4f5;
            border-color: #a1a1aa;
        }

        .dark .btn-header-action:hover {
            background: #3f3f46;
            border-color: #71717a;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
            zoom: 85%;
        }

        .stat-card {
            background: var(--glass-bg-light);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid var(--glass-border-light);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
            border-radius: 16px 16px 0 0;
        }

        .stat-card:nth-child(2)::before {
            background: var(--success-gradient);
        }

        .stat-card:nth-child(3)::before {
            background: var(--info-gradient);
        }

        .stat-card:nth-child(4)::before {
            background: var(--warning-gradient);
        }

        .dark .stat-card {
            background: var(--glass-bg-dark);
            border: 1px solid var(--glass-border-dark);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .dark .stat-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .stat-card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
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
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .stat-icon-success {
            background: var(--success-gradient);
            box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
        }

        .stat-icon-info {
            background: var(--info-gradient);
            box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
        }

        .stat-icon-warning {
            background: var(--warning-gradient);
            box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
        }

        .stat-label {
            font-size: 0.875rem;
            color: #71717a;
            font-weight: 500;
        }

        .dark .stat-label {
            color: #a1a1aa;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 0.75rem;
        }

        .dark .stat-value {
            color: #fafafa;
        }

        .stat-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
        }

        .stat-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.625rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .stat-badge-success {
            background: #d1fae5;
            color: #065f46;
        }

        .dark .stat-badge-success {
            background: #064e3b;
            color: #34d399;
        }

        .stat-detail {
            font-size: 0.8125rem;
            color: #a1a1aa;
        }

        .dark .stat-detail {
            color: #71717a;
        }

        /* Quick Actions Grid */
        .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
            zoom: 85%;
        }

        .action-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }

        .dark .action-card {
            background: #27272a;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .dark .action-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .action-card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }

        .action-icon {
            width: 2.5rem;
            height: 2.5rem;
            background: #dbeafe;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3b82f6;
            font-size: 1.125rem;
            flex-shrink: 0;
        }

        .dark .action-icon {
            background: #1e3a8a;
            color: #60a5fa;
        }

        .action-icon-success {
            background: #d1fae5;
            color: #10b981;
        }

        .dark .action-icon-success {
            background: #064e3b;
            color: #34d399;
        }

        .action-icon-info {
            background: #e0e7ff;
            color: #6366f1;
        }

        .dark .action-icon-info {
            background: #312e81;
            color: #818cf8;
        }

        .action-icon-warning {
            background: #fef3c7;
            color: #f59e0b;
        }

        .dark .action-icon-warning {
            background: #92400e;
            color: #fbbf24;
        }

        .action-info {
            flex: 1;
        }

        .action-title {
            font-size: 1rem;
            font-weight: 600;
            color: #18181b;
            margin: 0 0 0.125rem 0;
        }

        .dark .action-title {
            color: #fafafa;
        }

        .action-time {
            font-size: 0.8125rem;
            color: #a1a1aa;
        }

        .dark .action-time {
            color: #71717a;
        }

        .action-description {
            font-size: 0.875rem;
            color: #71717a;
            margin-bottom: 1rem;
            line-height: 1.5;
        }

        .dark .action-description {
            color: #a1a1aa;
        }

        .btn-action {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-action-primary {
            background: #3b82f6;
            color: white;
        }

        .btn-action-primary:hover {
            background: #2563eb;
        }

        .btn-action-success {
            background: #10b981;
            color: white;
        }

        .btn-action-success:hover {
            background: #059669;
        }

        .btn-action-info {
            background: #6366f1;
            color: white;
        }

        .btn-action-info:hover {
            background: #4f46e5;
        }

        .btn-action-warning {
            background: #f59e0b;
            color: white;
        }

        .btn-action-warning:hover {
            background: #d97706;
        }

        /* Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        /* Empty State */

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #a1a1aa;
        }

        .dark .empty-state {
            color: #71717a;
        }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state p {
            margin: 0;
            font-size: 0.9375rem;
        }

        /* Announcements Section */
        .announcements-section {
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 1rem;
        }

        .dark .section-title {
            color: #fafafa;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .admin-dashboard {
                padding: 1rem 0;
            }

            .container-fluid {
                padding: 0 1rem;
            }

            .dashboard-header {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }

            .header-right {
                width: 100%;
            }

            .btn-header-action {
                flex: 1;
                justify-content: center;
            }

            .alert-banner {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }

            .alert-banner-content {
                flex-direction: column;
                align-items: stretch;
            }

            .alert-badge {
                justify-content: center;
            }

            .alert-banner-actions {
                flex-direction: column;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .stat-value {
                font-size: 1.75rem;
            }

            .quick-actions-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .class-item {
                flex-wrap: wrap;
            }

            .class-details {
                width: 100%;
                justify-content: space-between;
                margin-top: 0.5rem;
            }

            .announcement-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }

            .announcement-actions {
                width: 100%;
            }

            .btn-announcement-action {
                flex: 1;
                text-align: center;
            }
        }

        /* Animations */
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .stat-card {
            animation: slideUp 0.4s ease forwards;
        }

        .stat-card:nth-child(1) {
            animation-delay: 0.05s;
        }

        .stat-card:nth-child(2) {
            animation-delay: 0.1s;
        }

        .stat-card:nth-child(3) {
            animation-delay: 0.15s;
        }

        .stat-card:nth-child(4) {
            animation-delay: 0.2s;
        }

        .action-card {
            animation: slideUp 0.4s ease forwards;
        }

        .action-card:nth-child(1) {
            animation-delay: 0.25s;
        }

        .action-card:nth-child(2) {
            animation-delay: 0.3s;
        }

        .action-card:nth-child(3) {
            animation-delay: 0.35s;
        }

        .action-card:nth-child(4) {
            animation-delay: 0.4s;
        }

        /* Additional hover effects */
        .btn-action:active {
            transform: scale(0.98);
        }

        .btn-header-action:active {
            transform: scale(0.95);
        }

        /* Focus states for accessibility */
        .btn-action:focus,
        .btn-header-action:focus,
        .btn-class-manage:focus,
        .btn-announcement-action:focus,
        .btn-banner-action:focus,
        .btn-banner-dismiss:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }

        /* Print styles */
        @media print {
            .alert-banner,
            .header-right,
            .btn-action,
            .btn-class-manage,
            .btn-announcement-action {
                display: none;
            }

            .stat-card,
            .action-card,
            .content-card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #e2e8f0;
            }
        }
    </style>
</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views\livewire\admin-dashboard.blade.php ENDPATH**/ ?>