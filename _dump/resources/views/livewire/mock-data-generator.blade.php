<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Mock Data Generator</h1>

            @if (!$accessGranted)
                {{-- Passkey Input --}}
                <div class="mb-6">
                    <label for="passkey" class="block text-sm font-medium text-gray-700 mb-2">
                        Enter Passkey to Access Mock Data Generator
                    </label>
                    <div class="flex gap-4">
                        <input
                            type="password"
                            id="passkey"
                            wire:model="passkey"
                            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter passkey..."
                        >
                        <button
                            wire:click="checkPasskey"
                            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Access
                        </button>
                    </div>
                    @error('passkey')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            @else
                {{-- Mock Data Generation Form --}}
                <form wire:submit.prevent="generateMockData" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {{-- Schools --}}
                        <div>
                            <label for="numSchools" class="block text-sm font-medium text-gray-700 mb-2">
                                Number of Schools
                            </label>
                            <input
                                type="number"
                                id="numSchools"
                                wire:model="numSchools"
                                min="1"
                                max="10"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            @error('numSchools')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Lecturers --}}
                        <div>
                            <label for="numLecturers" class="block text-sm font-medium text-gray-700 mb-2">
                                Lecturers per School
                            </label>
                            <input
                                type="number"
                                id="numLecturers"
                                wire:model="numLecturers"
                                min="1"
                                max="50"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            @error('numLecturers')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Students --}}
                        <div>
                            <label for="numStudents" class="block text-sm font-medium text-gray-700 mb-2">
                                Students per School
                            </label>
                            <input
                                type="number"
                                id="numStudents"
                                wire:model="numStudents"
                                min="1"
                                max="100"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            @error('numStudents')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Classes --}}
                        <div>
                            <label for="numClasses" class="block text-sm font-medium text-gray-700 mb-2">
                                Classes per School
                            </label>
                            <input
                                type="number"
                                id="numClasses"
                                wire:model="numClasses"
                                min="1"
                                max="20"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            @error('numClasses')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Courses --}}
                        <div>
                            <label for="numCourses" class="block text-sm font-medium text-gray-700 mb-2">
                                Courses per School
                            </label>
                            <input
                                type="number"
                                id="numCourses"
                                wire:model="numCourses"
                                min="1"
                                max="20"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            @error('numCourses')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Enrollments --}}
                        <div>
                            <label for="numEnrollments" class="block text-sm font-medium text-gray-700 mb-2">
                                Enrollments per School
                            </label>
                            <input
                                type="number"
                                id="numEnrollments"
                                wire:model="numEnrollments"
                                min="1"
                                max="200"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            @error('numEnrollments')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    {{-- Generate Button --}}
                    <div class="flex justify-center">
                        <button
                            type="submit"
                            wire:loading.attr="disabled"
                            class="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span wire:loading.remove>Generate Mock Data</span>
                            <span wire:loading>Generating...</span>
                        </button>
                    </div>
                </form>

                {{-- Progress Bar --}}
                @if ($isGenerating)
                    <div class="mt-6">
                        <div class="bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                class="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                style="width: {{ $progress }}%;"
                            ></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-2">{{ $currentStep }}</p>
                    </div>
                @endif

                {{-- Generated Data Summary --}}
                @if (!empty($generatedData))
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">Generation Summary</h2>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div class="bg-blue-50 p-4 rounded-lg text-center">
                                <div class="text-2xl font-bold text-blue-600">{{ $generatedData['schools'] ?? 0 }}</div>
                                <div class="text-sm text-gray-600">Schools</div>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg text-center">
                                <div class="text-2xl font-bold text-green-600">{{ $generatedData['lecturers'] ?? 0 }}</div>
                                <div class="text-sm text-gray-600">Lecturers</div>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg text-center">
                                <div class="text-2xl font-bold text-purple-600">{{ $generatedData['students'] ?? 0 }}</div>
                                <div class="text-sm text-gray-600">Students</div>
                            </div>
                            <div class="bg-yellow-50 p-4 rounded-lg text-center">
                                <div class="text-2xl font-bold text-yellow-600">{{ $generatedData['classes'] ?? 0 }}</div>
                                <div class="text-sm text-gray-600">Classes</div>
                            </div>
                            <div class="bg-red-50 p-4 rounded-lg text-center">
                                <div class="text-2xl font-bold text-red-600">{{ $generatedData['courses'] ?? 0 }}</div>
                                <div class="text-sm text-gray-600">Courses</div>
                            </div>
                            <div class="bg-indigo-50 p-4 rounded-lg text-center">
                                <div class="text-2xl font-bold text-indigo-600">{{ $generatedData['enrollments'] ?? 0 }}</div>
                                <div class="text-sm text-gray-600">Enrollments</div>
                            </div>
                        </div>
                    </div>
                @endif

                {{-- Important Notes --}}
                <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-yellow-800 mb-2">Important Notes</h3>
                    <ul class="text-sm text-yellow-700 space-y-1">
                        <li>• All mock data is prefixed with "[MOCK]" to distinguish it from real data</li>
                        <li>• Default password for all generated users is "password123"</li>
                        <li>• Mock data generation may take some time for large datasets</li>
                        <li>• Enrollments are created randomly between students and courses within the same school</li>
                        <li>• Class assignments are made randomly to students</li>
                        <li>• Lecturers are randomly assigned as class teachers</li>
                    </ul>
                </div>
            @endif
        </div>
    </div>
</div>