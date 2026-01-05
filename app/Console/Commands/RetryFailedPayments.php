<?php

namespace App\Console\Commands;

use App\Services\PaymentRetryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RetryFailedPayments extends Command
{
    protected $signature = 'payments:retry-failed {--dry-run : Show what would be retried without actually retrying}';

    protected $description = 'Retry failed payments that are eligible for retry';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $retryService = app(PaymentRetryService::class);

            $this->info('🔄 Starting payment retry process...');

            // Get eligible payments first to show in dry-run mode
            $eligiblePayments = $retryService->getRetryablePayments();

            if (empty($eligiblePayments)) {
                $this->info('✅ No payments eligible for retry at this time.');
                return;
            }

            $this->info("Found " . count($eligiblePayments) . " payment(s) eligible for retry.\n");

            if ($this->option('dry-run')) {
                $this->info('📋 DRY-RUN MODE: Showing eligible payments without retrying');
                $this->newLine();

                foreach ($eligiblePayments as $payment) {
                    $this->line("  • Payment ID: {$payment['id']}");
                    $this->line("    - Amount: {$payment['amount']} {$payment['currency']}");
                    $this->line("    - Retry Count: {$payment['retry_count']}");
                    $this->line("    - Last Updated: {$payment['updated_at']}");
                    $this->newLine();
                }

                $this->info("\nTo actually retry these payments, run without --dry-run flag");
                return;
            }

            // Run actual retry
            $this->info('Starting retry process...');
            $this->newLine();

            $results = $retryService->retryAllEligiblePayments();

            $this->info('✅ Payment retry process completed!');
            $this->newLine();
            $this->info("📊 Results:");
            $this->line("  • Total Attempted: {$results['total']}");
            $this->line("  • Successful: {$results['successful']}");
            $this->line("  • Failed: {$results['failed']}");

            // Show stats
            $stats = $retryService->getRetryStatistics();
            $this->newLine();
            $this->info("📈 Retry Statistics:");
            $this->line("  • Total Failed Payments: {$stats['total_failed']}");
            $this->line("  • Total Abandoned: {$stats['total_abandoned']}");
            $this->line("  • Total Retried: {$stats['total_retried']}");
            $this->line("  • Recovery Rate: {$stats['recovery_rate']}%");

            Log::info('Payment retry command executed', [
                'results' => $results,
                'stats' => $stats,
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Error during payment retry: " . $e->getMessage());
            Log::error('Payment retry command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }
    }
}
