<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('messages.Choose Your Plan') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">Choose the perfect plan for your school</h1>
                        <p class="text-xl text-gray-600">All plans include our core features. Upgrade or downgrade at any time.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        @foreach($plans as $planKey => $plan)
                            <div class="border border-gray-200 rounded-lg p-6 {{ $planKey === 'Pro' ? 'border-blue-500 relative' : '' }}">
                                @if($planKey === 'Pro')
                                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
                                    </div>
                                @endif

                                <div class="text-center">
                                    <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ $plan['name'] }}</h3>
                                    <p class="text-gray-600 mb-4">{{ $plan['description'] }}</p>

                                    <div class="mb-6">
                                        @if($planKey === 'Free/Basic Plan')
                                            <span class="text-4xl font-bold text-gray-900">Free</span>
                                            <span class="text-gray-600">/month</span>
                                        @elseif($planKey === 'Pro')
                                            <div class="text-center">
                                                <div class="text-sm text-gray-600">Starting from</div>
                                                <span class="text-4xl font-bold text-gray-900">$99</span>
                                                <span class="text-gray-600">/month</span>
                                                <div class="text-xs text-gray-500 mt-1">
                                                    ₦100,000/month • £79/month • €89/month
                                                </div>
                                            </div>
                                        @else
                                            <span class="text-4xl font-bold text-gray-900">${{ number_format($plan['price'], 2) }}</span>
                                            <span class="text-gray-600">/month</span>
                                        @endif
                                    </div>

                                    <div class="mb-6">
                                        <p class="text-sm text-gray-600">
                                            @if($planKey === 'Free/Basic Plan')
                                                Up to 150 students
                                            @elseif($planKey === 'Pro')
                                                Unlimited students
                                            @else
                                                {{ $plan['student_limit'] ?: 'Unlimited' }} students
                                            @endif
                                        </p>
                                    </div>

                                    <form method="POST" action="{{ route('subscriptions.subscribe') }}">
                                        @csrf
                                        <input type="hidden" name="plan" value="{{ $planKey }}">
                                        <input type="hidden" name="school_id" value="{{ auth()->user()->school_id ?? 1 }}">

                                        <button
                                            type="submit"
                                            class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white {{ $planKey === 'Pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700' }} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {{ $plan['price'] > 0 ? 'Subscribe Now' : 'Get Started' }}
                                        </button>
                                    </form>
                                </div>

                                <div class="mt-8">
                                    <h4 class="text-lg font-medium text-gray-900 mb-4">What's included:</h4>
                                    <ul class="space-y-3">
                                        @foreach($plan['features'] as $feature => $enabled)
                                            <li class="flex items-center">
                                                @if($enabled)
                                                    <svg class="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                    </svg>
                                                @else
                                                    <svg class="h-5 w-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                                    </svg>
                                                @endif
                                                <span class="ml-3 text-sm text-gray-700">
                                                    {{ ucwords(str_replace('_', ' ', $feature)) }}
                                                </span>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <div class="mt-12 text-center">
                        <p class="text-gray-600">
                            Transparent pricing with all core features included. No hidden costs.
                        </p>
                        <p class="text-sm text-gray-500 mt-2">
                            Need a custom plan? <a href="#" class="text-blue-600 hover:text-blue-500">Contact us</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
