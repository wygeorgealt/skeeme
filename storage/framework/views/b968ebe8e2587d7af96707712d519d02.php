<div>
    <div class="lecturer-management">
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Manage Lecturers</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Approve, reject, or manage lecturer accounts for your school.</p>
        </div>
        <div>
            <?php if (isset($component)) { $__componentOriginalc04b147acd0e65cc1a77f86fb0e81580 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc04b147acd0e65cc1a77f86fb0e81580 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::button.index','data' => ['wire:click' => 'exportLecturers','icon' => 'arrow-down-tray','variant' => 'primary']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:click' => 'exportLecturers','icon' => 'arrow-down-tray','variant' => 'primary']); ?>Export CSV <?php echo $__env->renderComponent(); ?>
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

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <!-- Search -->
        <div class="md:col-span-2">
            <?php if (isset($component)) { $__componentOriginal26c546557cdc09040c8dd00b2090afd0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26c546557cdc09040c8dd00b2090afd0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'e60dd9d2c3a62d619c9acb38f20d5aa5::input.index','data' => ['wire:model.live' => 'search','icon' => 'magnifying-glass','placeholder' => 'Search lecturers by name or email...']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('flux::input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['wire:model.live' => 'search','icon' => 'magnifying-glass','placeholder' => 'Search lecturers by name or email...']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $attributes = $__attributesOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__attributesOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26c546557cdc09040c8dd00b2090afd0)): ?>
<?php $component = $__componentOriginal26c546557cdc09040c8dd00b2090afd0; ?>
<?php unset($__componentOriginal26c546557cdc09040c8dd00b2090afd0); ?>
<?php endif; ?>
        </div>

        <!-- Filters -->
        <div class="md:col-span-1">
            <select wire:model.live="statusFilter" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none transition-all text-zinc-700 dark:text-zinc-300">
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>

        <div class="md:col-span-1">
            <select wire:model.live="sortBy" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none transition-all text-zinc-700 dark:text-zinc-300">
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="status">Sort by Status</option>
                <option value="created_at">Registration Date</option>
            </select>
        </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
            <div class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Active</div>
            <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($lecturers->where('status', 'active')->count()); ?></div>
        </div>
        <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
            <div class="text-xs text-amber-500 font-medium uppercase tracking-wider">Pending</div>
            <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($lecturers->where('status', 'pending')->count()); ?></div>
        </div>
        <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
            <div class="text-xs text-red-500 font-medium uppercase tracking-wider">Rejected</div>
            <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($lecturers->where('status', 'rejected')->count()); ?></div>
        </div>
        <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
            <div class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</div>
            <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100"><?php echo e($lecturers->total()); ?></div>
        </div>
    </div>

        <!-- Lecturers Table -->
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($lecturers->count() > 0): ?>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th wire:click="sortBy('name')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center gap-2">
                                    Lecturer
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($sortBy === 'name'): ?>
                                        <i class="fas fa-sort-<?php echo e($sortDirection === 'asc' ? 'up' : 'down'); ?> text-zinc-900 dark:text-zinc-100"></i>
                                    <?php else: ?>
                                        <i class="fas fa-sort opacity-50"></i>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </th>
                            <th wire:click="sortBy('email')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center gap-2">
                                    Email
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($sortBy === 'email'): ?>
                                        <i class="fas fa-sort-<?php echo e($sortDirection === 'asc' ? 'up' : 'down'); ?> text-zinc-900 dark:text-zinc-100"></i>
                                    <?php else: ?>
                                        <i class="fas fa-sort opacity-50"></i>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </th>
                            <th wire:click="sortBy('status')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center justify-center gap-2">
                                    Status
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($sortBy === 'status'): ?>
                                        <i class="fas fa-sort-<?php echo e($sortDirection === 'asc' ? 'up' : 'down'); ?> text-zinc-900 dark:text-zinc-100"></i>
                                    <?php else: ?>
                                        <i class="fas fa-sort opacity-50"></i>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </th>
                            <th wire:click="sortBy('created_at')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center justify-center gap-2">
                                    Registered
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($sortBy === 'created_at'): ?>
                                        <i class="fas fa-sort-<?php echo e($sortDirection === 'asc' ? 'up' : 'down'); ?> text-zinc-900 dark:text-zinc-100"></i>
                                    <?php else: ?>
                                        <i class="fas fa-sort opacity-50"></i>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </th>
                            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $lecturers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $lecturer): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold text-xs shadow-sm">
                                            <?php echo e(substr($lecturer->first_name, 0, 1)); ?><?php echo e(substr($lecturer->last_name, 0, 1)); ?>

                                        </div>
                                        <div>
                                            <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100"><?php echo e($lecturer->first_name); ?> <?php echo e($lecturer->last_name); ?></div>
                                            <div class="text-[10px] items-center px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase inline-flex mt-1">LECTURER</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                    <?php echo e($lecturer->email); ?>

                                </td>
                                <td class="px-6 py-4 text-center">
                                    <?php
                                        $statusColors = [
                                            'active' => 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                                            'pending' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                                            'rejected' => 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
                                        ];
                                        $color = $statusColors[$lecturer->status] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200';
                                    ?>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border <?php echo e($color); ?> uppercase tracking-tight">
                                        <?php echo e($lecturer->status); ?>

                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium italic">
                                    <?php echo e($lecturer->created_at->format('M d, Y')); ?>

                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex justify-end gap-2">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($lecturer->status === 'pending'): ?>
                                            <button wire:click="openApproveModal(<?php echo e($lecturer->id); ?>)" 
                                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    title="Approve Lecturer">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button wire:click="openRejectModal(<?php echo e($lecturer->id); ?>)" 
                                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    title="Reject Lecturer">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        <?php elseif($lecturer->status === 'active'): ?>
                                            <button wire:click="openRemoveModal(<?php echo e($lecturer->id); ?>)" 
                                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    title="Remove Lecturer">
                                                <i class="fas fa-user-minus"></i>
                                            </button>
                                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        <button wire:click="viewLecturerDetails(<?php echo e($lecturer->id); ?>)" 
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </tbody>
                </table>
                <!-- Pagination -->
                <div class="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <?php echo e($lecturers->links()); ?>

                </div>
            <?php else: ?>
                <div class="py-20 text-center text-zinc-500">
                    <div class="flex flex-col items-center gap-3">
                        <i class="fas fa-users-slash text-4xl opacity-20"></i>
                        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No Lecturers Found</h3>
                        <p class="max-w-xs mx-auto">No lecturers match your current filters. Try adjusting your search or status filter.</p>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

        <div class="bootstrap-styles">
            <!-- Approve Confirmation Modal -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showApproveModal): ?>
            <div class="modal fade show" id="approveModal" tabindex="-1" role="dialog" aria-labelledby="approveModalLabel" aria-hidden="false" style="display: block;" wire:ignore.self>
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="approveModalLabel">Approve Lecturer</h5>
                            <button type="button" class="close" wire:click="closeModals" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedLecturer): ?>
                                <p>Are you sure you want to approve <strong><?php echo e($selectedLecturer->first_name ?? ''); ?> <?php echo e($selectedLecturer->last_name ?? ''); ?></strong>?</p>
                                <p>This will grant them full access to the system and create a free subscription plan.</p>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" wire:click="closeModals">Cancel</button>
                            <button type="button" class="btn btn-success" wire:click="confirmApprove" wire:loading.attr="disabled">
                                <span wire:loading.remove>Approve</span>
                                <span wire:loading>Approving...</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show" wire:click="closeModals"></div>
            </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Reject Confirmation Modal -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showRejectModal): ?>
            <div class="modal fade show" id="rejectModal" tabindex="-1" role="dialog" aria-labelledby="rejectModalLabel" aria-hidden="false" style="display: block;" wire:ignore.self>
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="rejectModalLabel">Reject Lecturer</h5>
                            <button type="button" class="close" wire:click="closeModals" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedLecturer): ?>
                                <p>Are you sure you want to reject <strong><?php echo e($selectedLecturer->first_name ?? ''); ?> <?php echo e($selectedLecturer->last_name ?? ''); ?></strong>?</p>
                                <p>A rejection email will be sent, and the account will be scheduled for deletion in 8 hours.</p>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" wire:click="closeModals">Cancel</button>
                            <button type="button" class="btn btn-danger" wire:click="confirmReject" wire:loading.attr="disabled">
                                <span wire:loading.remove>Reject</span>
                                <span wire:loading>Rejecting...</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show" wire:click="closeModals"></div>
            </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Remove Confirmation Modal -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showRemoveModal): ?>
            <div class="modal fade show" id="removeModal" tabindex="-1" role="dialog" aria-labelledby="removeModalLabel" aria-hidden="false" style="display: block;" wire:ignore.self>
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="removeModalLabel">Remove Lecturer</h5>
                            <button type="button" class="close" wire:click="closeModals" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedLecturer): ?>
                                <p>Are you sure you want to remove <strong><?php echo e($selectedLecturer->first_name ?? ''); ?> <?php echo e($selectedLecturer->last_name ?? ''); ?></strong>?</p>
                                <p>This will revoke their access and change their status back to pending. The account will be preserved for potential re-approval.</p>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" wire:click="closeModals">Cancel</button>
                            <button type="button" class="btn btn-warning" wire:click="confirmRemove" wire:loading.attr="disabled">
                                <span wire:loading.remove>Remove</span>
                                <span wire:loading>Removing...</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show" wire:click="closeModals"></div>
            </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Details Modal -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($showDetailsModal): ?>
            <div class="modal fade show" id="detailsModal" tabindex="-1" role="dialog" aria-labelledby="detailsModalLabel" aria-hidden="false" style="display: block;" wire:ignore.self>
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="detailsModalLabel">Lecturer Details</h5>
                            <button type="button" class="close" wire:click="closeModals" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($lecturerDetails): ?>
                                <div class="lecturer-detail-grid">
                                    <div class="detail-item">
                                        <label>Full Name</label>
                                        <span><?php echo e($lecturerDetails['full_name']); ?></span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Email</label>
                                        <span><?php echo e($lecturerDetails['email']); ?></span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Phone</label>
                                        <span><?php echo e($lecturerDetails['phone']); ?></span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Status</label>
                                        <span class="status-badge status-<?php echo e($lecturerDetails['status']); ?>"><?php echo e(ucfirst($lecturerDetails['status'])); ?></span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Registration Date</label>
                                        <span><?php echo e($lecturerDetails['registration_date']); ?></span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Total Courses</label>
                                        <span><?php echo e($lecturerDetails['courses_used']); ?> / <?php echo e($lecturerDetails['courses_limit'] ?? 'Unlimited'); ?></span>
                                    </div>
                                    <div class="detail-item full-width">
                                        <label>Subscription Plan</label>
                                        <span class="plan-badge">
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($selectedLecturer->school_id): ?>
                                                School Plan: <?php echo e($selectedLecturer->school->activeSubscription?->plan_name ?? 'No School Plan'); ?>

                                            <?php else: ?>
                                                Individual Plan: <?php echo e($lecturerDetails['subscription_plan']); ?>

                                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                        </span>
                                    </div>
                                </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" wire:click="closeModals">Close</button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show" wire:click="closeModals"></div>
            </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <!-- Flash Messages -->
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(session()->has('message')): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <?php echo e(session('message')); ?>

                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

            <?php if(session()->has('error')): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <?php echo e(session('error')); ?>

                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

    <!-- Custom Styles -->
    <style>
        .lecturer-management {
            padding: 2rem 0;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .page-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #18181b;
            margin: 0;
        }
        .dark .page-title { color: #fafafa; }

        .page-subtitle {
            color: #71717a;
            margin: 0.25rem 0 0 0;
            font-size: 0.9375rem;
        }
        .dark .page-subtitle { color: #a1a1aa; }

        .btn-export {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: #3b82f6;
            color: white;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .dark .btn-export { background: #27272a; border-color: #3f3f46; color: #d4d4d8; }

        .btn-export:hover {
            background: #2563eb;
            border-color: #a1a1aa;
            transform: translateY(-1px);
        }
        .dark .btn-export:hover { background: #3f3f46; border-color: #71717a; }

        .filters-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .search-container {
            position: relative;
            flex: 1;
            min-width: 300px;
        }

        .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            font-size: 1rem;
            background: white;
            color: #18181b;
        }
        .dark .search-input { background: #27272a; border-color: #3f3f46; color: #fafafa; }

        .search-input:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
            border-color: #3b82f6;
            box-shadow: none;
        }

        .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
        }

        .filters-container {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .filter-select, .sort-select {
            padding: 0.625rem 1rem;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            background: white;
            font-size: 0.9375rem;
            color: #52525b;
        }
        .dark .filter-select, .dark .sort-select { background: #27272a; border-color: #3f3f46; color: #d4d4d8; }

        .sort-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .sort-label {
            font-weight: 500;
            color: #374151;
        }

        .stats-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-item {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        .stat-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .dark .stat-item { background: #27272a; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 0.25rem;
        }
        .dark .stat-number { color: #fafafa; }

        .stat-label {
            color: #71717a;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .dark .stat-label { color: #a1a1aa; }

        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .dark .table-container { background: #27272a; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

        .lecturers-table {
            width: 100%;
            border-collapse: collapse;
        }

        .lecturers-table th,
        .lecturers-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #f3f4f6;
        }

        .lecturers-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #52525b;
            cursor: pointer;
            user-select: none;
        }
        .dark .lecturers-table th { background: #3f3f46; color: #d4d4d8; }

        .sortable:hover {
            background: #f1f5f9;
        }
        .dark .sortable:hover { background: #52525b; }

        .sorted {
            background: #e5e7eb;
        }
        .dark .sorted { background: #3f3f46; }

        .lecturer-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .lecturer-avatar {
            width: 2.5rem;
            height: 2.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .lecturer-details {
            display: flex;
            flex-direction: column;
        }

        .lecturer-name {
            font-weight: 600;
            color: #18181b;
        }
        .dark .lecturer-name { color: #fafafa; }

        .lecturer-role {
            font-size: 0.75rem;
            color: #71717a;
        }
        .dark .lecturer-role { color: #a1a1aa; }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-active {
            background: #d1fae5;
            color: #065f46;
        }
        .dark .status-active { background: #064e3b; color: #34d399; }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        .dark .status-pending { background: #92400e; color: #fbbf24; }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }
        .dark .status-rejected { background: #7f1d1d; color: #fecaca; }

        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .btn-action {
            padding: 0.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #52525b;
        }
        .dark .btn-action { color: #d4d4d8; }

        .btn-action:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-approve {
            color: #10b981;
            background: #d1fae5;
        }
        .dark .btn-approve { background: #064e3b; color: #34d399; }

        .btn-reject {
            color: #ef4444;
            background: #fee2e2;
        }
        .dark .btn-reject { background: #7f1d1d; color: #fecaca; }

        .btn-remove {
            color: #f59e0b;
            background: #fef3c7;
        }
        .dark .btn-remove { background: #92400e; color: #fbbf24; }

        .btn-view {
            color: #3b82f6;
            background: #dbeafe;
        }
        .dark .btn-view { background: #1e3a8a; color: #60a5fa; }

        .btn-approve:hover {
            background: #10b981;
            color: white;
        }

        .btn-reject:hover {
            background: #ef4444;
            color: white;
        }

        .btn-remove:hover {
            background: #f59e0b;
            color: white;
        }

        .btn-view:hover {
            background: #3b82f6;
            color: white;
        }

        .pagination-container {
            padding: 1rem;
            display: flex;
            justify-content: center;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #a1a1aa;
        }
        .dark .empty-state { color: #71717a; }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state h3 {
            margin-bottom: 0.5rem;
            color: #18181b;
        }
        .dark .empty-state h3 { color: #fafafa; }

        .modal {
        display: none;
        }

        .modal.show {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1055 !important;
            overflow: hidden;
            outline: 0;
        }

        .modal .modal-dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 22cm;
            /* max-width: 500px; */
            margin: 0;
            z-index: 1056;
        }

        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1050 !important;
            background-color: rgba(0, 0, 0, 0.5);
        }
        .modal-content {
            border-radius: 12px;
            background: white;
        }
        .dark .modal-content { background: #27272a; }

        .modal-header {
            border-bottom: 1px solid #f1f5f9;
            padding: 1rem 1.5rem;
        }
        .dark .modal-header { border-bottom: 1px solid #3f3f46; }

        .modal-title {
            margin: 0;
            font-weight: 600;
        }

        .close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .modal-footer {
            border-top: 1px solid #f1f5f9;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }
        .dark .modal-footer { border-top: 1px solid #3f3f46; }

        .btn {
            padding: 0.625rem 1rem;
            border: 1px solid #d4d4d8;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .dark .btn { background: #27272a; border-color: #3f3f46; color: #d4d4d8; }

        .btn-secondary {
            background: white;
            color: #52525b;
        }
        .btn-secondary:hover { background: #f8fafc; border-color: #a1a1aa; }
        .dark .btn-secondary { background: #27272a; color: #d4d4d8; }
        .dark .btn-secondary:hover { background: #3f3f46; border-color: #71717a; }

        .btn-success {
            background: #10b981;
            color: white;
            border-color: #10b981;
        }
        .btn-success:hover { background: #059669; }

        .btn-danger {
            background: #ef4444;
            color: white;
            border-color: #ef4444;
        }
        .btn-danger:hover { background: #dc2626; }

        .btn-warning {
            background: #f59e0b;
            color: white;
            border-color: #f59e0b;
        }
        .btn-warning:hover { background: #d97706; }

        .lecturer-detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
        }

        .detail-item.full-width {
            grid-column: 1 / -1;
        }

        .detail-item label {
            font-weight: 500;
            color: #71717a;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
        }

        .detail-item span {
            color: #18181b;
            font-weight: 600;
        }
        .dark .detail-item span { color: #fafafa; }

        .plan-badge {
            padding: 0.5rem 1rem;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 8px;
            font-weight: 600;
        }
        .dark .plan-badge { background: #1e3a8a; color: #60a5fa; }

        .alert {
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 1rem;
        }

        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        .dark .alert-success { background: #064e3b; color: #34d399; border-color: #065f46; }

        .alert-danger {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }
        .dark .alert-danger { background: #7f1d1d; color: #fecaca; border-color: #991b1b; }

        .alert-dismissible .close {
            float: right;
            font-weight: bold;
            line-height: 1;
            color: inherit;
            text-shadow: none;
            opacity: 0.5;
        }

        .alert-dismissible .close:hover {
            opacity: 0.75;
        }

        @media (max-width: 768px) {
            .filters-section {
                flex-direction: column;
                align-items: stretch;
            }

            .search-container {
                min-width: auto;
            }

            .filters-container {
                flex-direction: column;
                align-items: stretch;
            }

            .lecturers-table {
                font-size: 0.875rem;
            }

            .lecturers-table th,
            .lecturers-table td {
                padding: 0.75rem 0.5rem;
            }

            .action-buttons {
                flex-wrap: wrap;
            }

            .lecturer-info {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.25rem;
            }

            .modal-dialog {
                margin: 0.5rem;
            }
        }
    </style>


</div><?php /**PATH C:\Users\kritex\Herd\skeeme\resources\views/livewire/lecturer-management.blade.php ENDPATH**/ ?>