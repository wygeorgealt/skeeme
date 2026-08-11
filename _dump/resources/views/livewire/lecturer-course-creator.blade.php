<div>
    <flux:button wire:click="$set('showModal', true)" icon="plus" variant="primary">Create Course</flux:button>

    <flux:modal wire:model="showModal" class="md:w-96">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">{{ $isEditing ? 'Edit Course' : 'Create New Course' }}</flux:heading>
                <flux:subheading>{{ $isEditing ? 'Update the details for your course.' : 'Enter the details for your new course.' }}</flux:subheading>
            </div>

            <form wire:submit="saveCourse" class="space-y-6">
                <flux:input wire:model="courseName" label="Course Name" placeholder="e.g. Introduction to Computer Science" />
                
                <flux:textarea wire:model="courseDescription" label="Description" placeholder="Enter course description (optional)" />

                <div class="flex gap-2">
                    <flux:spacer />
                    <flux:button wire:click="cancel">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">{{ $isEditing ? 'Update Course' : 'Create Course' }}</flux:button>
                </div>
            </form>
        </div>
    </flux:modal>
</div>
