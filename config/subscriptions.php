<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subscription Plans Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for all subscription plans available
    | in the Skeeme platform. Each plan defines features, limits, and pricing.
    |
    */

    'plans' => [
        'Free/Basic Plan' => [
            'name' => 'Free Plan',
            'description' => 'Perfect for small schools getting started',
            'student_limit' => 150,
            'price' => 0.00,
            'currency' => 'USD',
            'billing_cycle' => 'monthly',
            'features' => [
                'basic_course_management' => true,
                'student_enrollment' => true,
                'basic_reporting' => true,
                'email_support' => true,
                'advanced_analytics' => false,
                'custom_branding' => false,
                'api_access' => false,
                'priority_support' => false,
                'unlimited_storage' => false,
                'export_data' => true,
                'mobile_app' => false,
                'multi_language' => false,
            ],
        ],

        'Pro' => [
            'name' => 'Pro Plan',
            'description' => 'Ideal for growing schools with advanced needs',
            'student_limit' => null, // Unlimited
            'price' => 59.99,
            'currency' => 'USD',
            'billing_cycle' => 'monthly',
            'features' => [
                'basic_course_management' => true,
                'student_enrollment' => true,
                'basic_reporting' => true,
                'email_support' => true,
                'advanced_analytics' => true,
                'custom_branding' => true,
                'api_access' => false,
                'priority_support' => false,
                'unlimited_storage' => false,
                'export_data' => true,
                'mobile_app' => true,
                'multi_language' => true,
            ],
        ],

        'Enterprise' => [
            'name' => 'Enterprise Plan',
            'description' => 'Complete solution for large institutions',
            'student_limit' => null, // Unlimited
            'price' => null, // Custom pricing - requires contact
            'currency' => 'USD',
            'billing_cycle' => 'monthly',
            'features' => [
                'basic_course_management' => true,
                'student_enrollment' => true,
                'basic_reporting' => true,
                'email_support' => true,
                'advanced_analytics' => true,
                'custom_branding' => true,
                'api_access' => true,
                'priority_support' => true,
                'unlimited_storage' => true,
                'export_data' => true,
                'mobile_app' => true,
                'multi_language' => true,
                'white_label' => true,
                'dedicated_support' => true,
                'custom_integrations' => true,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Plan
    |--------------------------------------------------------------------------
    |
    | The default plan assigned to new schools upon registration.
    |
    */
    'default_plan' => 'Free/Basic Plan',

    /*
    |--------------------------------------------------------------------------
    | Trial Period
    |--------------------------------------------------------------------------
    |
    | Number of days for trial period (0 = no trial)
    |
    */
    'trial_days' => 14,

    /*
    |--------------------------------------------------------------------------
    | Payment Settings
    |--------------------------------------------------------------------------
    */
    'payment' => [
        'currency' => 'USD',
        'supported_currencies' => ['USD', 'EUR', 'GBP', 'NGN'],
        'payment_methods' => ['paystack', 'stripe'],
        'default_payment_method' => 'paystack',
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Restrictions
    |--------------------------------------------------------------------------
    |
    | Define which features are restricted and their limits
    |
    */
    'restrictions' => [
        'max_courses_per_school' => [
            'Free/Basic Plan' => 10,
            'Pro' => 50,
            'Enterprise' => null, // Unlimited
        ],
        'max_classes_per_course' => [
            'Free/Basic Plan' => 5,
            'Pro' => 20,
            'Enterprise' => null,
        ],
        'max_assignments_per_course' => [
            'Free/Basic Plan' => 20,
            'Pro' => 100,
            'Enterprise' => null,
        ],
        'storage_limit_gb' => [
            'Free/Basic Plan' => 1,
            'Pro' => 10,
            'Enterprise' => null,
        ],
    ],
];
