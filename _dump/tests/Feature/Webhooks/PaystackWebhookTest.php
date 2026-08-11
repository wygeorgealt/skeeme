<?php

namespace Tests\Feature\Webhooks;

use Tests\TestCase;
use App\Models\Payment;
use App\Models\School;
use App\Models\User;
use App\Services\PaystackService;
use Mockery\MockInterface;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class PaystackWebhookTest extends TestCase
{
    use DatabaseTransactions;

    public function test_paystack_webhook_validates_signature()
    {
        $payload = ['event' => 'charge.success', 'data' => []];
        
        // Mock PaystackService to fail the signature check
        $this->mock(PaystackService::class, function (MockInterface $mock) {
            $mock->shouldReceive('verifyWebhookSignature')->andReturn(false);
        });

        $response = $this->postJson('/webhooks/paystack', $payload, [
            'X-Paystack-Signature' => 'invalid_signature'
        ]);

        $response->assertStatus(401)
                 ->assertJson(['error' => 'Invalid signature']);
    }

    public function test_paystack_webhook_processes_charge_success()
    {
        $reference = 'test_' . uniqid();
        $payload = [
            'event' => 'charge.success',
            'data' => [
                'reference' => $reference
            ]
        ];
        
        $school = School::factory()->create();
        $user = User::factory()->create(['school_id' => $school->id]);

        $payment = Payment::factory()->create([
            'transaction_id' => $reference,
            'amount' => 1000,
            'currency' => 'NGN',
            'status' => 'pending',
            'school_id' => $school->id,
            'user_id' => $user->id,
        ]);

        // Mock PaystackService to pass the signature check
        $this->mock(PaystackService::class, function (MockInterface $mock) {
            $mock->shouldReceive('verifyWebhookSignature')->andReturn(true);
        });

        $response = $this->postJson('/webhooks/paystack', $payload, [
            'X-Paystack-Signature' => 'valid_signature'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('completed', $payment->fresh()->status);
    }
}
