<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\AnthropicAIService;
use App\Services\DeepseekAIService;

class AIHealthCheck extends Command
{
    protected $signature = 'app:ai-health-check';

    protected $description = 'Health-check Claude and DeepSeek AI services. Sets the active provider and alerts admin if both are down.';

    public function handle(): int
    {
        $this->info('🔍 Starting AI health check...');

        $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
        if ($aiConfig['is_manual']) {
            $this->warn('⚠️ Manual Override is ACTIVE (' . strtoupper($aiConfig['provider']) . '). Skipping auto-health check.');
            return self::SUCCESS;
        }

        $claudeError = null;
        $deepseekError = null;

        // ── 1. Try Claude ──────────────────────────────────────────────
        try {
            $this->info('Testing Claude (Anthropic)...');
            $claude = app(AnthropicAIService::class);
            $result = $claude->generateText('Reply with exactly: OK', 'You are a health-check bot. Reply with the single word OK.');

            if (str_contains(strtolower($result), 'ok')) {
                $this->info('✅ Claude is healthy.');
                Cache::put('skeeme:active_ai_provider', 'claude', now()->addHours(3));
                Log::info('AI Health Check: Claude is active.');
                return self::SUCCESS;
            }

            // Response came back but wasn't what we expected — still alive though
            $this->warn('⚠️ Claude responded but with unexpected content: ' . substr($result, 0, 100));
            Cache::put('skeeme:active_ai_provider', 'claude', now()->addHours(3));
            Log::info('AI Health Check: Claude is active (soft warning).');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $claudeError = $e->getMessage();
            $this->error("❌ Claude failed: {$claudeError}");
            Log::warning('AI Health Check: Claude failed.', ['error' => $claudeError]);
        }

        // ── 2. Claude is down — try DeepSeek ───────────────────────────
        try {
            $this->info('Testing DeepSeek (fallback)...');
            $deepseek = app(DeepseekAIService::class);
            $result = $deepseek->generateText('Reply with exactly: OK', 'You are a health-check bot. Reply with the single word OK.');

            if (str_contains(strtolower($result), 'ok')) {
                $this->info('✅ DeepSeek is healthy. Using as fallback.');
                Cache::put('skeeme:active_ai_provider', 'deepseek', now()->addHours(3));
                Log::info('AI Health Check: DeepSeek is active (Claude was down).');
                return self::SUCCESS;
            }

            $this->warn('⚠️ DeepSeek responded but with unexpected content: ' . substr($result, 0, 100));
            Cache::put('skeeme:active_ai_provider', 'deepseek', now()->addHours(3));
            Log::info('AI Health Check: DeepSeek is active (soft warning, Claude was down).');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $deepseekError = $e->getMessage();
            $this->error("❌ DeepSeek also failed: {$deepseekError}");
            Log::error('AI Health Check: BOTH providers are down.', [
                'claude_error' => $claudeError,
                'deepseek_error' => $deepseekError,
            ]);
        }

        // ── 3. Both down — send alert email ────────────────────────────
        $this->error('🚨 BOTH AI providers are down! Sending alert email...');

        try {
            Mail::raw(
                $this->buildAlertBody($claudeError, $deepseekError),
                function ($message) {
                    $message->to('otuturusolomom@gmail.com')
                            ->subject('🚨 CRITICAL: All Skeeme AI Services Are Down')
                            ->from(config('mail.from.address'), config('mail.from.name'));
                }
            );
            $this->info('📧 Alert email sent to otuturusolomom@gmail.com');
        } catch (\Exception $e) {
            $this->error('Failed to send alert email: ' . $e->getMessage());
            Log::critical('AI Health Check: Could not send alert email.', ['error' => $e->getMessage()]);
        }

        // Mark no provider available
        Cache::put('skeeme:active_ai_provider', 'none', now()->addHours(3));

        return self::FAILURE;
    }

    /**
     * Build a clear, detailed plain-text alert body.
     */
    private function buildAlertBody(string $claudeError, string $deepseekError): string
    {
        $timestamp = now()->toDateTimeString();
        $server = $_SERVER['SERVER_NAME'] ?? 'CLI';
        $env = app()->environment();

        return <<<BODY
        =========================================
        🚨 SKEEME AI SERVICE OUTAGE ALERT
        =========================================

        Time: {$timestamp}
        Server: {$server}
        Environment: {$env}

        -----------------------------------------
        ❌ CLAUDE (Anthropic) — FAILED
        -----------------------------------------
        {$claudeError}

        -----------------------------------------
        ❌ DEEPSEEK — FAILED
        -----------------------------------------
        {$deepseekError}

        -----------------------------------------
        📋 IMPACT
        -----------------------------------------
        All AI-powered features are currently unavailable:
        • Quiz generation
        • Flashcard generation
        • AI grading
        • Scan & Solve
        • AI Tutor chat

        -----------------------------------------
        🔧 RECOMMENDED ACTIONS
        -----------------------------------------
        1. Check Anthropic status: https://status.anthropic.com
        2. Check DeepSeek status: https://platform.deepseek.com
        3. Verify API keys in .env are correct
        4. Check credit/billing dashboards for both providers
        5. Review Laravel logs: storage/logs/laravel.log

        This is an automated alert from the Skeeme AI Health Check job.
        BODY;
    }
}
