<?php

namespace Tests\Feature;

use Tests\TestCase;

class StudentLandingPageTest extends TestCase
{
    /**
     * Test that the student landing page loads successfully.
     */
    public function test_student_landing_page_loads_successfully()
    {
        $response = $this->get(route('products.students'));

        $response->assertStatus(200);
        $response->assertSee('Ace your exams');
        $response->assertSee('with AI.');
        $response->assertSee('Turn your messy notes into practice quizzes instantly.');
    }

    /**
     * Test that pricing information is visible.
     */
    public function test_student_pricing_is_visible()
    {
        $response = $this->get(route('products.students'));

        $response->assertSee('Simple Student Pricing');
        $response->assertSee('Free Plan');
        $response->assertSee('Unlimited');
    }
}
