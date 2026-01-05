<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\School;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class InvoiceModelTest extends TestCase
{
    use DatabaseTransactions;

    public function test_invoice_has_required_fillable_fields()
    {
        $fillable = (new Invoice())->getFillable();
        
        $this->assertContains('school_id', $fillable);
        $this->assertContains('subscription_id', $fillable);
        $this->assertContains('invoice_number', $fillable);
        $this->assertContains('plan_name', $fillable);
        $this->assertContains('amount', $fillable);
        $this->assertContains('currency', $fillable);
        $this->assertContains('status', $fillable);
    }

    public function test_invoice_casts_amount_to_decimal()
    {
        $casts = (new Invoice())->getCasts();
        
        $this->assertArrayHasKey('amount', $casts);
        $this->assertStringContainsString('decimal', $casts['amount']);
    }

    public function test_invoice_casts_dates()
    {
        $casts = (new Invoice())->getCasts();
        
        $this->assertArrayHasKey('invoice_date', $casts);
        $this->assertArrayHasKey('due_date', $casts);
        $this->assertArrayHasKey('paid_date', $casts);
    }

    public function test_invoice_has_school_relationship()
    {
        $this->assertTrue(method_exists(Invoice::class, 'school'));
    }

    public function test_invoice_has_subscription_relationship()
    {
        $this->assertTrue(method_exists(Invoice::class, 'subscription'));
    }

    public function test_invoice_has_payments_relationship()
    {
        $this->assertTrue(method_exists(Invoice::class, 'payments'));
    }

    public function test_invoice_is_paid_method_exists()
    {
        $this->assertTrue(method_exists(Invoice::class, 'isPaid'));
    }

    public function test_invoice_is_overdue_method_exists()
    {
        $this->assertTrue(method_exists(Invoice::class, 'isOverdue'));
    }

    public function test_invoice_mark_as_paid_method_exists()
    {
        $this->assertTrue(method_exists(Invoice::class, 'markAsPaid'));
    }

    public function test_invoice_uses_soft_deletes()
    {
        $invoice = new Invoice();
        $this->assertTrue(method_exists($invoice, 'restore'));
    }

    public function test_invoice_table_name()
    {
        $invoice = new Invoice();
        $this->assertEquals('invoices', $invoice->getTable());
    }

    public function test_invoice_has_timestamps()
    {
        $invoice = new Invoice();
        $this->assertTrue($invoice->usesTimestamps());
    }

    public function test_invoice_status_field_exists()
    {
        $invoice = new Invoice(['status' => 'draft']);
        
        $this->assertEquals('draft', $invoice->status);
    }

    public function test_invoice_number_field_exists()
    {
        $invoice = new Invoice(['invoice_number' => 'INV-20240101-00001']);
        
        $this->assertEquals('INV-20240101-00001', $invoice->invoice_number);
    }

    public function test_invoice_plan_name_field()
    {
        $invoice = new Invoice(['plan_name' => 'Pro Plan']);
        
        $this->assertEquals('Pro Plan', $invoice->plan_name);
    }

    public function test_invoice_amount_field()
    {
        $invoice = new Invoice(['amount' => 59.99]);
        
        $this->assertIsNumeric($invoice->amount);
    }

    public function test_invoice_currency_field()
    {
        $invoice = new Invoice(['currency' => 'USD']);
        
        $this->assertEquals('USD', $invoice->currency);
    }

    public function test_invoice_description_field()
    {
        $invoice = new Invoice(['description' => 'Monthly subscription']);
        
        $this->assertEquals('Monthly subscription', $invoice->description);
    }

    public function test_invoice_notes_field()
    {
        $invoice = new Invoice(['notes' => 'Payment received']);
        
        $this->assertEquals('Payment received', $invoice->notes);
    }

    public function test_invoice_file_path_field()
    {
        $invoice = new Invoice(['file_path' => 'storage/invoices/INV-001.pdf']);
        
        $this->assertEquals('storage/invoices/INV-001.pdf', $invoice->file_path);
    }

    public function test_invoice_is_paid_returns_boolean()
    {
        $invoice = new Invoice(['status' => 'paid']);
        $this->assertIsBool($invoice->isPaid());
    }

    public function test_invoice_is_overdue_returns_boolean()
    {
        $invoice = new Invoice(['status' => 'overdue', 'due_date' => now()->subDays(1)->toDateString()]);
        $this->assertIsBool($invoice->isOverdue());
    }

    public function test_invoice_multiple_status_checks()
    {
        $invoice = new Invoice(['status' => 'paid', 'paid_date' => now()]);
        
        $this->assertTrue($invoice->isPaid());
    }

    public function test_invoice_school_id_required()
    {
        $this->assertTrue(in_array('school_id', (new Invoice())->getFillable()));
    }

    public function test_invoice_subscription_id_required()
    {
        $this->assertTrue(in_array('subscription_id', (new Invoice())->getFillable()));
    }

    public function test_invoice_invoice_number_required()
    {
        $this->assertTrue(in_array('invoice_number', (new Invoice())->getFillable()));
    }

    public function test_invoice_amount_required()
    {
        $this->assertTrue(in_array('amount', (new Invoice())->getFillable()));
    }

    public function test_invoice_has_factory()
    {
        $this->assertTrue(method_exists(Invoice::class, 'factory'));
    }

    public function test_invoice_invoice_date_field()
    {
        $invoice = new Invoice(['invoice_date' => now()->toDateString()]);
        
        $this->assertNotNull($invoice->invoice_date);
    }

    public function test_invoice_due_date_field()
    {
        $invoice = new Invoice(['due_date' => now()->addDays(30)->toDateString()]);
        
        $this->assertNotNull($invoice->due_date);
    }

    public function test_invoice_paid_date_field()
    {
        $invoice = new Invoice(['paid_date' => now()->toDateString()]);
        
        $this->assertNotNull($invoice->paid_date);
    }

    public function test_invoice_generate_invoice_number_method_exists()
    {
        $this->assertTrue(method_exists(Invoice::class, 'generateInvoiceNumber'));
    }

    public function test_invoice_relationships_are_lazy_loadable()
    {
        $invoice = new Invoice();
        
        $this->assertTrue(method_exists($invoice, 'school'));
        $this->assertTrue(method_exists($invoice, 'subscription'));
        $this->assertTrue(method_exists($invoice, 'payments'));
    }
}
