<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaystackService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Mockery\MockInterface;

class StudentSubscriptionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Test subscribe initiation.
     */
    public function test_student_can_initiate_subscription()
    {
        $user = User::factory()->create(['role' => 'student', 'is_unlimited_student' => false]);
        $this->actingAs($user);

        $this->mock(PaystackService::class, function (MockInterface $mock) use ($user) {
            $mock->shouldReceive('detectCurrencyFromTimezone')->andReturn('NGN');
            $mock->shouldReceive('initializePayment')->once()->andReturn([
                'authorization_url' => 'https://checkout.paystack.com/test',
                'access_code' => 'test_code',
                'reference' => 'test_ref_' . uniqid(),
            ]);
        });

        $response = $this->get(route('students.subscribe'));

        $response->assertRedirect('https://checkout.paystack.com/test');
        
        $this->assertDatabaseHas('invoices', [
            'user_id' => $user->id,
            'plan_name' => 'Student Unlimited',
            'amount' => 5000,
            'currency' => 'NGN',
        ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 5000,
            'currency' => 'NGN',
            'status' => Payment::STATUS_PENDING,
        ]);
    }

    /**
     * Test successful subscription callback.
     */
    public function test_student_subscription_callback_upgrades_user()
    {
        $user = User::factory()->create(['role' => 'student', 'is_unlimited_student' => false, 'credits' => 100]);
        $this->actingAs($user);

        $reference = 'test_ref_' . uniqid();
        
        $invoiceNumber = 'INV-' . uniqid();
        $invoice = Invoice::create([
            'user_id' => $user->id,
            'invoice_number' => $invoiceNumber,
            'plan_name' => 'Student Unlimited',
            'amount' => 5000,
            'currency' => 'NGN',
            'status' => 'draft',
            'invoice_date' => now(),
            'due_date' => now()->addDay(),
        ]);

        Payment::create([
            'user_id' => $user->id,
            'invoice_id' => $invoice->id,
            'transaction_id' => $reference,
            'payment_method' => 'paystack',
            'amount' => 5000,
            'currency' => 'NGN',
            'status' => Payment::STATUS_PENDING,
        ]);

        $this->mock(PaystackService::class, function (MockInterface $mock) {
            $mock->shouldReceive('verifyPayment')->once()->andReturn([
                'status' => true,
                'data' => [
                    'status' => 'success',
                    'amount' => 500000, // Paystack returns in kobo
                    'reference' => 'test_ref_123'
                ]
            ]);
        });

        $response = $this->get(route('students.callback', ['reference' => $reference]));

        $response->assertRedirect(route('student.profile'));
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue($user->is_unlimited_student);
        $this->assertEquals(999999, $user->credits);

        $this->assertDatabaseHas('payments', [
            'transaction_id' => $reference,
            'status' => Payment::STATUS_COMPLETED,
        ]);
    }

    /**
     * Test failed subscription callback.
     */
    public function test_student_subscription_callback_handles_failure()
    {
        $user = User::factory()->create(['role' => 'student', 'is_unlimited_student' => false]);
        $this->actingAs($user);

        $reference = 'test_ref_fail';

        $this->mock(PaystackService::class, function (MockInterface $mock) {
            $mock->shouldReceive('verifyPayment')->once()->andReturn([
                'status' => false,
                'message' => 'Verification failed'
            ]);
        });

        $response = $this->get(route('students.callback', ['reference' => $reference]));

        $response->assertRedirect(route('student.profile'));
        $response->assertSessionHas('error');

        $user->refresh();
        $this->assertFalse($user->is_unlimited_student);
    }
}
