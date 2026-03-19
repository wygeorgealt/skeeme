<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Mail;

class EmailLab extends Page implements HasForms
{
    use InteractsWithForms;

    protected string $view = 'filament.pages.email-lab';

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-beaker';

    protected static \UnitEnum|string|null $navigationGroup = 'System Tools';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'email' => auth()->user()->email,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Email Configuration')
                    ->description('Test your system emails here.')
                    ->schema([
                        TextInput::make('email')
                            ->label('Recipient Email')
                            ->email()
                            ->required(),
                        
                        Select::make('template')
                            ->label('Email Template')
                            ->options([
                                'welcome' => 'Welcome Email',
                                'welcome_admin' => 'Welcome Admin Email',
                                'invoice' => 'Invoice Email',
                                'payment_confirmation' => 'Payment Confirmation',
                                'lecturer_approval' => 'Lecturer Approval Notification',
                                'contact_message' => 'Contact Message (Original)',
                            ])
                            ->required()
                            ->native(false),
                    ])->columns(2),
            ])
            ->statePath('data');
    }

    public function sendTest(): void
    {
        $state = $this->form->getState();
        $email = $state['email'];
        $template = $state['template'];

        try {
            $mailable = $this->getMailable($template);
            
            Mail::mailer('resend')->to($email)->send($mailable);

            Notification::make()
                ->title('Email Sent!')
                ->success()
                ->send();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error Sending Email')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    protected function getMailable(string $template)
    {
        $user = \App\Models\User::first() ?? \App\Models\User::factory()->create();
        
        return match ($template) {
            'welcome' => new \App\Mail\WelcomeEmail($user, 'Skeeme Test Academy'),
            'welcome_admin' => new \App\Mail\WelcomeAdminEmail($user, 'Skeeme Test Academy'),
            'invoice' => new \App\Mail\InvoiceEmail(
                $invoice = (\App\Models\Invoice::first() ?? \App\Models\Invoice::factory()->create()),
                'test@example.com',
                'Test Invoice Subject'
            ),
            'payment_confirmation' => new \App\Mail\PaymentConfirmationEmail(
                $invoice ?? \App\Models\Invoice::first() ?? \App\Models\Invoice::factory()->create(),
                $user->school ?? \App\Models\School::first() ?? \App\Models\School::factory()->create(),
                '5000',
                now()->toFormattedDateString(),
                'INV-12345'
            ),
            'lecturer_approval' => new \App\Mail\LecturerApprovalNotificationEmail(
                $user,
                $user->school ?? \App\Models\School::first() ?? \App\Models\School::factory()->create(),
                'System Admin',
                config('app.url') . '/login'
            ),
            'contact_message' => new \App\Mail\ContactMessage([
                'name' => 'Test User',
                'email' => 'test@user.com',
                'subject' => 'Help needed!',
                'message' => 'This is a test message from the Email Lab.'
            ]),
            default => throw new \Exception('Unknown template'),
        };
    }
}
