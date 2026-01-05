<?php

namespace App\Models;

use App\Events\PaymentCompleted;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'school_id',
        'subscription_id',
        'invoice_id',
        'transaction_id',
        'payment_method',
        'amount',
        'currency',
        'status',
        'metadata',
        'paid_at',
        'failure_reason',
        'retry_count',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'json',
        'paid_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_ABANDONED = 'abandoned';
    const STATUS_REFUNDED = 'refunded';

    const PAYMENT_METHODS = [
        'paystack' => 'Paystack',
        'bank_transfer' => 'Bank Transfer',
        'credit_card' => 'Credit Card',
        'manual' => 'Manual Payment',
    ];

    /**
     * Get the school that owns the payment
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the subscription this payment is for
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get the invoice this payment is linked to
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Check if payment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payment is failed
     */
    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Mark payment as completed
     */
    public function markAsCompleted(?string $transactionId = null): void
    {
        $this->status = self::STATUS_COMPLETED;
        $this->paid_at = now();
        if ($transactionId) {
            $this->transaction_id = $transactionId;
        }
        $this->save();

        // Update associated invoice status if exists
        if ($this->invoice) {
            $this->invoice->markAsPaid();
        }

        // Dispatch PaymentCompleted event to trigger email and other actions
        event(new PaymentCompleted($this, [
            'invoice_id' => $this->invoice_id,
            'subscription_id' => $this->subscription_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
        ]));
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed(string $reason): void
    {
        $this->status = self::STATUS_FAILED;
        $this->failure_reason = $reason;
        $this->save();
    }

    /**
     * Mark payment as refunded
     */
    public function refund(string $reason = null): void
    {
        $this->status = self::STATUS_REFUNDED;
        if ($reason) {
            $this->failure_reason = $reason;
        }
        $this->save();
    }

    /**
     * Get payment method display name
     */
    public function getPaymentMethodLabel(): string
    {
        return self::PAYMENT_METHODS[$this->payment_method] ?? $this->payment_method;
    }

    /**
     * Scope: Get completed payments
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope: Get pending payments
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Get failed payments
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope: Get payments from a specific school
     */
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    /**
     * Scope: Get recent payments
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->whereBetween('created_at', [
            now()->subDays($days),
            now()
        ]);
    }

    /**
     * Get total amount received for school in period
     */
    public static function getTotalForSchool($schoolId, $days = 30): float
    {
        return (float) self::forSchool($schoolId)
            ->completed()
            ->recent($days)
            ->sum('amount');
    }

    /**
     * Generate unique transaction reference
     */
    public static function generateReference(): string
    {
        return 'PAY-' . date('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(3)));
    }
}
