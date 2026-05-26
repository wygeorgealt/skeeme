<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Services\DeepseekAIService;
use App\Livewire\Landing\StudentAiProduct;
use Livewire\Livewire;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Mockery\MockInterface;

class StudentAiProductTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test guest can generate one quiz successfully.
     */
    public function test_guest_can_generate_one_quiz_successfully()
    {
        $this->mock(DeepseekAIService::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateQuestions')->once()->andReturn([
                ['question_text' => 'Test Q', 'options' => ['A', 'B'], 'correct_answer' => 'A', 'question_type' => 'multiple_choice']
            ]);
        });

        Livewire::test(StudentAiProduct::class)
            ->set('topic', 'Laravel')
            ->call('generate')
            ->assertSet('isGenerating', false)
            ->assertCount('generatedQuestions', 1)
            ->assertSet('showSignupModal', false);
    }

    /**
     * Test guest is blocked after one use.
     */
    public function test_guest_is_blocked_after_one_use()
    {
        // Force environment to not be local to avoid the bypass
        $this->app['env'] = 'production';

        $aiMock = $this->mock(DeepseekAIService::class, function (MockInterface $mock) {
            $mock->shouldNotReceive('generateQuestions');
        });

        Livewire::withCookie('skeeme_guest_quiz_usage', 1)
            ->test(StudentAiProduct::class)
            ->set('topic', 'PHP')
            ->call('generate')
            ->assertSet('showSignupModal', true)
            ->assertCount('generatedQuestions', 0);
    }

    /**
     * Test credit deduction for registered students.
     */
    public function test_registered_student_deducts_credits()
    {
        $user = User::factory()->create(['role' => 'student', 'credits' => 100, 'subscription_tier' => 'free']);
        $this->actingAs($user);

        $this->mock(DeepseekAIService::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateQuestions')->once()->andReturn([
                ['question_text' => 'Test Q', 'options' => ['A', 'B'], 'correct_answer' => 'A', 'question_type' => 'multiple_choice']
            ]);
        });

        Livewire::test(StudentAiProduct::class)
            ->set('topic', 'Biology')
            ->call('generate')
            ->assertSet('isGenerating', false);

        $user->refresh();
        $this->assertEquals(50, $user->credits);
    }



    /**
     * Test access is blocked when credits are low.
     */
    public function test_access_blocked_when_credits_low()
    {
        $user = User::factory()->create(['role' => 'student', 'credits' => 40, 'subscription_tier' => 'free']);
        $this->actingAs($user);

        Livewire::test(StudentAiProduct::class)
            ->set('topic', 'Physics')
            ->call('generate')
            ->assertSet('showUpgradeModal', true);
    }
}
