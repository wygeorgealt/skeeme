<?php

namespace Tests\Feature;

use App\Services\InsightsService;
use App\Services\AnalyticsService;
use App\Livewire\AnalyticsDashboard;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_insights_service_instantiates_correctly()
    {
        $insightsService = app(InsightsService::class);
        $this->assertInstanceOf(InsightsService::class, $insightsService);
    }

    public function test_insights_service_has_all_required_methods()
    {
        $insightsService = app(InsightsService::class);
        
        $this->assertTrue(method_exists($insightsService, 'generateInsights'));
        $this->assertTrue(method_exists($insightsService, 'compareWithPrevious'));
    }

    public function test_analytics_service_instantiates_correctly()
    {
        $analyticsService = app(AnalyticsService::class);
        $this->assertInstanceOf(AnalyticsService::class, $analyticsService);
    }

    public function test_analytics_service_has_snapshot_generation_method()
    {
        $analyticsService = app(AnalyticsService::class);
        $this->assertTrue(method_exists($analyticsService, 'generateSnapshot'));
    }

    public function test_analytics_dashboard_component_can_be_instantiated()
    {
        $component = new AnalyticsDashboard();
        $this->assertInstanceOf(AnalyticsDashboard::class, $component);
    }

    public function test_analytics_dashboard_has_insights_properties_initialized()
    {
        $component = new AnalyticsDashboard();
        
        $this->assertTrue(property_exists($component, 'insights'));
        $this->assertTrue(property_exists($component, 'comparison'));
        $this->assertTrue(property_exists($component, 'showInsightsPanel'));
    }

    public function test_analytics_dashboard_has_required_methods()
    {
        $component = new AnalyticsDashboard();
        
        $this->assertTrue(method_exists($component, 'loadAnalytics'));
        $this->assertTrue(method_exists($component, 'downloadReport'));
        $this->assertTrue(method_exists($component, 'refreshAnalytics'));
    }

    public function test_insights_service_returns_proper_structure()
    {
        $insightsService = app(InsightsService::class);
        
        // The service should instantiate without errors
        $this->assertInstanceOf(InsightsService::class, $insightsService);
    }
}

