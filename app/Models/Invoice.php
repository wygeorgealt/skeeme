<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'school_id',
        'subscription_id',
        'invoice_number',
        'plan_name',
        'amount',
        'currency',
        'invoice_date',
        'due_date',
        'paid_date',
        'status',
        'description',
        'notes',
        'file_path',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    /**
     * Get the school that owns the invoice
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the subscription for this invoice
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get payments for this invoice
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if invoice is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid' && $this->paid_date !== null;
    }

    /**
     * Check if invoice is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === 'overdue' && now()->isAfter($this->due_date);
    }

    /**
     * Mark invoice as paid
     */
    public function markAsPaid(): void
    {
        $this->status = 'paid';
        $this->paid_date = now();
        $this->save();
    }

    /**
     * Mark invoice as sent
     */
    public function markAsSent(): void
    {
        $this->status = 'sent';
        $this->save();
    }

    /**
     * Get total paid amount from payments
     */
    public function getTotalPaid(): float
    {
        return (float) $this->payments()
            ->where('status', 'completed')
            ->sum('amount');
    }

    /**
     * Get remaining amount to be paid
     */
    public function getRemainingAmount(): float
    {
        return max(0, $this->amount - $this->getTotalPaid());
    }

    /**
     * Generate unique invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $lastInvoice = static::latest('id')->first();
        $number = $lastInvoice ? intval(substr($lastInvoice->invoice_number, -5)) + 1 : 1;
        return 'INV-' . now()->format('Ymd') . '-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Scope for paid invoices
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope for recent invoices
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('invoice_date', 'desc');
    }
}
