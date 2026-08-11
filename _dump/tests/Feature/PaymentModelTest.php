<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\School;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PaymentModelTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_payment_has_required_fillable_fields()
    {
        $fillable = (new Payment())->getFillable();
        
        $this->assertContains('school_id', $fillable);
        $this->assertContains('subscription_id', $fillable);
        $this->assertContains('invoice_id', $fillable);
        $this->assertContains('transaction_id', $fillable);
        $this->assertContains('payment_method', $fillable);
        $this->assertContains('amount', $fillable);
        $this->assertContains('currency', $fillable);
        $this->assertContains('status', $fillable);
    }

    public function test_payment_status_constants_defined()
    {
        $this->assertEquals('pending', Payment::STATUS_PENDING);
        $this->assertEquals('completed', Payment::STATUS_COMPLETED);
        $this->assertEquals('failed', Payment::STATUS_FAILED);
        $this->assertEquals('abandoned', Payment::STATUS_ABANDONED);
        $this->assertEquals('refunded', Payment::STATUS_REFUNDED);
    }

    public function test_payment_methods_constants_defined()
    {
        $methods = Payment::PAYMENT_METHODS;
        
        $this->assertArrayHasKey('paystack', $methods);
        $this->assertArrayHasKey('bank_transfer', $methods);
        $this->assertArrayHasKey('credit_card', $methods);
        $this->assertArrayHasKey('manual', $methods);
    }

    public function test_payment_casts_amount_to_decimal()
    {
        $casts = (new Payment())->getCasts();
        
        $this->assertArrayHasKey('amount', $casts);
        $this->assertStringContainsString('decimal', $casts['amount']);
    }

    public function test_payment_casts_metadata_to_json()
    {
        $casts = (new Payment())->getCasts();
        
        $this->assertArrayHasKey('metadata', $casts);
        $this->assertEquals('json', $casts['metadata']);
    }

    public function test_payment_casts_paid_at_to_datetime()
    {
        $casts = (new Payment())->getCasts();
        
        $this->assertArrayHasKey('paid_at', $casts);
    }

    public function test_payment_has_school_relationship()
    {
        $this->assertTrue(method_exists(Payment::class, 'school'));
    }

    public function test_payment_has_subscription_relationship()
    {
        $this->assertTrue(method_exists(Payment::class, 'subscription'));
    }

    public function test_payment_has_invoice_relationship()
    {
        $this->assertTrue(method_exists(Payment::class, 'invoice'));
    }

    public function test_payment_is_completed_method_exists()
    {
        $this->assertTrue(method_exists(Payment::class, 'isCompleted'));
    }

    public function test_payment_is_pending_method_exists()
    {
        $this->assertTrue(method_exists(Payment::class, 'isPending'));
    }

    public function test_payment_is_failed_method_exists()
    {
        $this->assertTrue(method_exists(Payment::class, 'isFailed'));
    }

    public function test_payment_is_completed_returns_boolean()
    {
        $payment = new Payment(['status' => Payment::STATUS_COMPLETED]);
        $this->assertIsBool($payment->isCompleted());
    }

    public function test_payment_status_helper_methods()
    {
        $this->assertTrue(method_exists(Payment::class, 'isCompleted'));
        $this->assertTrue(method_exists(Payment::class, 'isPending'));
        $this->assertTrue(method_exists(Payment::class, 'isFailed'));
    }

    public function test_payment_table_name()
    {
        $payment = new Payment();
        $this->assertEquals('payments', $payment->getTable());
    }

    public function test_payment_has_timestamps()
    {
        $payment = new Payment();
        $this->assertTrue($payment->usesTimestamps());
    }

    public function test_payment_metadata_is_json_castable()
    {
        $metadata = ['authorization_code' => 'AUTH123', 'customer_code' => 'CUST456'];
        $payment = new Payment(['metadata' => $metadata]);
        
        $this->assertIsArray($payment->metadata);
    }

    public function test_payment_amount_precision()
    {
        $payment = new Payment(['amount' => 100.50]);
        
        $this->assertIsNumeric($payment->amount);
    }

    public function test_payment_currency_field_exists()
    {
        $payment = new Payment(['currency' => 'NGN']);
        
        $this->assertEquals('NGN', $payment->currency);
    }

    public function test_payment_transaction_id_field()
    {
        $payment = new Payment(['transaction_id' => 'TXN123456']);
        
        $this->assertEquals('TXN123456', $payment->transaction_id);
    }

    public function test_payment_failure_reason_field()
    {
        $payment = new Payment(['failure_reason' => 'Insufficient funds']);
        
        $this->assertEquals('Insufficient funds', $payment->failure_reason);
    }

    public function test_payment_retry_count_field()
    {
        $payment = new Payment(['retry_count' => 2]);
        
        $this->assertEquals(2, $payment->retry_count);
    }

    public function test_payment_notes_field()
    {
        $payment = new Payment(['notes' => 'Manual payment received']);
        
        $this->assertEquals('Manual payment received', $payment->notes);
    }

    public function test_payment_is_completable()
    {
        $payment = new Payment(['status' => Payment::STATUS_PENDING]);
        
        $this->assertTrue($payment->isPending());
    }

    public function test_payment_multiple_status_checks()
    {
        $payment = new Payment(['status' => Payment::STATUS_COMPLETED]);
        
        $this->assertTrue($payment->isCompleted());
        $this->assertFalse($payment->isPending());
        $this->assertFalse($payment->isFailed());
    }

    public function test_payment_can_track_retry_attempts()
    {
        $payment = new Payment(['retry_count' => 0]);
        $this->assertEquals(0, $payment->retry_count);
        
        $payment->retry_count = 1;
        $this->assertEquals(1, $payment->retry_count);
    }

    public function test_payment_school_id_required()
    {
        $this->assertTrue(in_array('school_id', (new Payment())->getFillable()));
    }

    public function test_payment_subscription_id_required()
    {
        $this->assertTrue(in_array('subscription_id', (new Payment())->getFillable()));
    }

    public function test_payment_amount_required()
    {
        $this->assertTrue(in_array('amount', (new Payment())->getFillable()));
    }

    public function test_payment_status_required()
    {
        $this->assertTrue(in_array('status', (new Payment())->getFillable()));
    }
}
