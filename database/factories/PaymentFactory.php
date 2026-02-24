<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'user_id' => User::factory(),
            'subscription_id' => null,
            'invoice_id' => null,
            'transaction_id' => 'PAY-' . $this->faker->unique()->numerify('########'),
            'payment_method' => 'paystack',
            'amount' => 5000,
            'currency' => 'NGN',
            'status' => 'pending',
            'metadata' => null,
            'paid_at' => null,
            'failure_reason' => null,
            'retry_count' => 0,
            'notes' => null,
        ];
    }
}
