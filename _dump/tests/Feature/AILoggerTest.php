<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\AILogger;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AILoggerTest extends TestCase
{
    #[Test]
    public function test_ai_logger_sends_structured_success_payload_to_ai_channel()
    {
        Log::shouldReceive('channel')
            ->once()
            ->with('ai')
            ->andReturnSelf();

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, 'AI Action Succeeded: generate_questions') &&
                    $context['provider'] === 'anthropic' &&
                    $context['model'] === 'claude-sonnet-4-6' &&
                    $context['action'] === 'generate_questions' &&
                    $context['cache']['status'] === 'miss' &&
                    $context['request']['numberOfQuestions'] === 5 &&
                    $context['response']['status'] === 'success' &&
                    $context['response']['latency_ms'] === 1500.0 &&
                    $context['response']['questions_count'] === 5;
            });

        AILogger::log([
            'provider' => 'anthropic',
            'model' => 'claude-sonnet-4-6',
            'action' => 'generate_questions',
            'cache' => ['status' => 'miss', 'key' => 'test-key'],
            'request' => ['numberOfQuestions' => 5],
            'response' => ['questions_count' => 5],
            'latency_ms' => 1500.0,
        ]);
    }

    #[Test]
    public function test_ai_logger_sends_structured_error_payload_to_ai_channel()
    {
        Log::shouldReceive('channel')
            ->once()
            ->with('ai')
            ->andReturnSelf();

        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, 'AI Action Failed: generate_flashcards') &&
                    $context['provider'] === 'deepseek' &&
                    $context['action'] === 'generate_flashcards' &&
                    $context['response']['status'] === 'failed' &&
                    isset($context['error']['message']) &&
                    $context['error']['message'] === 'API Connection Timeout';
            });

        $exception = new \Exception('API Connection Timeout', 504);

        AILogger::log([
            'provider' => 'deepseek',
            'model' => 'deepseek-v4-flash',
            'action' => 'generate_flashcards',
            'request' => ['numberOfCards' => 10],
            'latency_ms' => 5000.0,
            'error' => $exception,
        ]);
    }

    #[Test]
    public function test_ai_logger_captures_personalization_details_from_user()
    {
        Log::shouldReceive('channel')
            ->once()
            ->with('ai')
            ->andReturnSelf();

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $context['personalization']['applied'] === true &&
                    $context['personalization']['profile']['academic_level'] === 'undergraduate' &&
                    $context['personalization']['profile']['tone'] === 'fun' &&
                    $context['user']['name'] === 'Jane Doe' &&
                    $context['user']['email'] === 'jane@example.com';
            });

        // Mock a user with preferences
        $user = new User([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);
        $user->ai_preferences = [
            'education_level' => 'undergraduate',
            'learning_style' => 'simple',
            'tone' => 'fun',
            'analogy_focus' => 'tech',
            'academic_goal' => 'conceptual',
        ];

        AILogger::log([
            'provider' => 'anthropic',
            'model' => 'claude-sonnet-4-6',
            'action' => 'generate_questions',
        ], $user);
    }
}
