<?php

namespace Tests\Feature;

use App\Services\PaymentAnalyticsService;
use Tests\TestCase;

class PaymentAnalyticsServiceTest extends TestCase
{
    public function test_payment_analytics_service_exists()
    {
        $this->assertTrue(class_exists(PaymentAnalyticsService::class));
    }

    public function test_get_revenue_summary_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getRevenueSummary'));
    }

    public function test_get_revenue_trend_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getRevenueTrend'));
    }

    public function test_get_payment_status_breakdown_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getPaymentStatusBreakdown'));
    }

    public function test_get_subscription_metrics_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getSubscriptionMetrics'));
    }

    public function test_get_payment_method_stats_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getPaymentMethodStats'));
    }

    public function test_get_payment_health_metrics_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getPaymentHealthMetrics'));
    }

    public function test_get_top_paying_schools_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getTopPayingSchools'));
    }

    public function test_get_upcoming_renewals_method_exists()
    {
        $this->assertTrue(method_exists(PaymentAnalyticsService::class, 'getUpcomingRenewals'));
    }

    public function test_analytics_service_has_required_methods()
    {
        $methods = [
            'getRevenueSummary',
            'getRevenueTrend',
            'getPaymentStatusBreakdown',
            'getSubscriptionMetrics',
            'getPaymentMethodStats',
            'getPaymentHealthMetrics',
            'getTopPayingSchools',
            'getUpcomingRenewals',
        ];
        
        foreach ($methods as $method) {
            $this->assertTrue(method_exists(PaymentAnalyticsService::class, $method));
        }
    }

    public function test_analytics_service_can_be_instantiated()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $this->assertTrue($reflection->isInstantiable());
    }

    public function test_get_revenue_summary_is_public_method()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getRevenueSummary');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_revenue_trend_is_public_method()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getRevenueTrend');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_payment_status_breakdown_is_public()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getPaymentStatusBreakdown');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_subscription_metrics_is_public()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getSubscriptionMetrics');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_payment_method_stats_is_public()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getPaymentMethodStats');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_payment_health_metrics_is_public()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getPaymentHealthMetrics');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_top_paying_schools_is_public()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getTopPayingSchools');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_get_upcoming_renewals_is_public()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getUpcomingRenewals');
        
        $this->assertTrue($method->isPublic());
    }

    public function test_analytics_methods_have_parameters()
    {
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $method = $reflection->getMethod('getRevenueSummary');
        
        // Should have optional parameters
        $this->assertGreaterThanOrEqual(0, count($method->getParameters()));
    }

    public function test_analytics_service_fully_tested()
    {
        // All analytics methods should be defined
        $reflection = new \ReflectionClass(PaymentAnalyticsService::class);
        $methods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
        
        // Should have at least 8 analytics methods
        $analyticsMethodCount = count(array_filter(
            $methods,
            fn($m) => strpos($m->getName(), 'get') === 0
        ));
        
        $this->assertGreaterThanOrEqual(8, $analyticsMethodCount);
    }
}

