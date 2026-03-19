<?php

namespace App\Livewire;

use App\Mail\InvoiceEmail;
use App\Mail\WelcomeEmail;
use App\Mail\UpgradeConfirmationEmail;
use App\Models\Invoice;
use App\Models\User;
use App\Models\Subscription;
use Livewire\Component;
use Illuminate\Support\Facades\Mail;

class TestEmailPreview extends Component
{
    public $testEmail = '';
    public $selectedEmailType = 'invoice';
    public $selectedInvoice = null;
    public $selectedUser = null;
    public $selectedSubscription = null;
    public $invoices = [];
    public $users = [];
    public $subscriptions = [];
    public $sending = false;
    public $message = '';
    public $previewMode = 'html';

    public function mount()
    {
        $this->loadData();
        // Set default test email to the configured mail from address
        $this->testEmail = config('mail.from.address', '');
    }

    public function updatedSelectedEmailType()
    {
        $this->message = '';
        $this->selectedInvoice = null;
        $this->selectedUser = null;
        $this->selectedSubscription = null;
    }

    public function loadData()
    {
        $this->loadInvoices();
        $this->loadUsers();
        $this->loadSubscriptions();
    }

    public function loadInvoices()
    {
        $this->invoices = Invoice::with('subscription')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($inv) => [
                'id' => $inv->id,
                'label' => "Invoice {$inv->invoice_number} - " . ($inv->subscription?->school?->name ?? 'Unknown') . " - ₦" . number_format($inv->amount, 2),
            ])
            ->toArray();
    }

    public function loadUsers()
    {
        $this->users = User::where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'label' => "{$user->first_name} {$user->last_name} ({$user->email})",
            ])
            ->toArray();
    }

    public function loadSubscriptions()
    {
        $this->subscriptions = Subscription::with('school')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($sub) => [
                'id' => $sub->id,
                'label' => ($sub->school?->name ?? 'Unknown School') . " - " . ($sub->plan_name ?? 'Unknown Plan'),
            ])
            ->toArray();
    }

    public function sendTestEmail()
    {
        $this->validate([
            'testEmail' => 'required|email',
        ]);

        if ($this->selectedEmailType === 'invoice' && !$this->selectedInvoice) {
            $this->message = '❌ Please select an invoice';
            return;
        }

        if ($this->selectedEmailType === 'welcome' && !$this->selectedUser) {
            $this->message = '❌ Please select a user';
            return;
        }

        if ($this->selectedEmailType === 'upgrade' && !$this->selectedSubscription) {
            $this->message = '❌ Please select a subscription';
            return;
        }

        $this->sending = true;
        $this->message = '';

        try {
            \Log::info('Starting email test', [
                'type' => $this->selectedEmailType,
                'to' => $this->testEmail,
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
            ]);

            match($this->selectedEmailType) {
                'invoice' => $this->sendInvoiceEmail(),
                'welcome' => $this->sendWelcomeEmail(),
                'upgrade' => $this->sendUpgradeEmail(),
                default => throw new \Exception('Unknown email type'),
            };

            $this->message = "✅ Test email sent successfully to {$this->testEmail}! Check your Mailtrap inbox.";
        } catch (\Exception $e) {
            \Log::error('Email test failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $this->message = '❌ Error: ' . $e->getMessage();
        } finally {
            $this->sending = false;
        }
    }

    private function sendInvoiceEmail()
    {
        $invoice = Invoice::findOrFail($this->selectedInvoice);
        \Log::info('Sending invoice email', ['to' => $this->testEmail, 'invoice' => $invoice->id]);
        
        try {
            Mail::mailer('resend')->to($this->testEmail)->send(new InvoiceEmail($invoice, $this->testEmail));
            \Log::info('Invoice email sent successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to send invoice email', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    private function sendWelcomeEmail()
    {
        $user = User::findOrFail($this->selectedUser);
        $schoolName = $user->school?->name ?? 'Skeeme';
        \Log::info('Sending welcome email', ['to' => $this->testEmail, 'user' => $user->id]);
        
        try {
            Mail::mailer('resend')->to($this->testEmail)->send(new WelcomeEmail($user, $schoolName));
            \Log::info('Welcome email sent successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to send welcome email', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    private function sendUpgradeEmail()
    {
        $subscription = Subscription::findOrFail($this->selectedSubscription);
        $planName = $subscription->plan_name ?? 'Premium Plan';
        $billingPeriod = $subscription->billing_period ?? 'monthly';
        \Log::info('Sending upgrade email', ['to' => $this->testEmail, 'subscription' => $subscription->id]);
        
        try {
            Mail::mailer('resend')->to($this->testEmail)->send(new UpgradeConfirmationEmail($subscription, $planName, $billingPeriod));
            \Log::info('Upgrade email sent successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to send upgrade email', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function previewEmail()
    {
        if ($this->selectedEmailType === 'invoice' && !$this->selectedInvoice) {
            $this->message = '❌ Please select an invoice';
            return;
        }

        if ($this->selectedEmailType === 'welcome' && !$this->selectedUser) {
            $this->message = '❌ Please select a user';
            return;
        }

        if ($this->selectedEmailType === 'upgrade' && !$this->selectedSubscription) {
            $this->message = '❌ Please select a subscription';
            return;
        }

        // View will auto-refresh with Livewire
    }

    public function render()
    {
        $previewData = null;

        if ($this->selectedEmailType === 'invoice' && $this->selectedInvoice) {
            $invoice = Invoice::with('subscription')->find($this->selectedInvoice);
            $previewData = [
                'type' => 'invoice',
                'invoice' => $invoice,
                'school' => $invoice->school,
                'paymentLink' => null,
            ];
        } elseif ($this->selectedEmailType === 'welcome' && $this->selectedUser) {
            $user = User::find($this->selectedUser);
            $previewData = [
                'type' => 'welcome',
                'user' => $user,
                'schoolName' => $user->school?->name ?? 'Skeeme',
            ];
        } elseif ($this->selectedEmailType === 'upgrade' && $this->selectedSubscription) {
            $subscription = Subscription::with('school')->find($this->selectedSubscription);
            $previewData = [
                'type' => 'upgrade',
                'subscription' => $subscription,
                'planName' => $subscription->plan_name ?? 'Premium Plan',
            ];
        }

        return view('livewire.test-email-preview', [
            'previewData' => $previewData,
        ]);
    }
}
