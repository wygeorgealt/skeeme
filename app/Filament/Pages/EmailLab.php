<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\DynamicBulkMail;

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
                Section::make('Bulk Email Composer')
                    ->description('Send custom bulk emails using the new minimalist aesthetic.')
                    ->schema([
                        Select::make('target_audience')
                            ->label('Target Audience')
                            ->options([
                                'test' => 'Test (My Email)',
                                'all_users' => 'All Users',
                                'students' => 'All Students',
                                'new_users' => 'New Users (Last 7 Days)',
                                'random_10' => 'Random 10 Users',
                            ])
                            ->default('test')
                            ->required()
                            ->reactive(),

                        TextInput::make('test_email')
                            ->label('Test Email Address')
                            ->email()
                            ->default(auth()->user()->email)
                            ->visible(fn ($get) => $get('target_audience') === 'test')
                            ->required(fn ($get) => $get('target_audience') === 'test'),

                        TextInput::make('subject')
                            ->label('Email Subject')
                            ->required()
                            ->columnSpanFull(),

                        TextInput::make('header')
                            ->label('Email Bold Header')
                            ->required()
                            ->columnSpanFull(),
                        
                        RichEditor::make('body')
                            ->label('Email Body')
                            ->required()
                            ->columnSpanFull(),
                    ])->columns(2),
            ])
            ->statePath('data');
    }

    public function sendTest(): void
    {
        $state = $this->form->getState();
        $audience = $state['target_audience'];
        $subject = $state['subject'];
        $header = $state['header'];
        $body = $state['body'];

        try {
            $mailable = new DynamicBulkMail($subject, $header, $body);

            $recipients = match ($audience) {
                'test' => collect([ (object)['email' => $state['test_email']] ]),
                'all_users' => User::all(['email']),
                'students' => User::where('role', 'student')->get(['email']),
                'new_users' => User::where('created_at', '>=', now()->subDays(7))->get(['email']),
                'random_10' => User::inRandomOrder()->limit(10)->get(['email']),
            };

            if ($recipients->isEmpty()) {
                 Notification::make()->title('No users found for target audience')->warning()->send();
                 return;
            }

            foreach ($recipients as $recipient) {
                // If it's test, send synchronously so we see errors immediately
                if ($audience === 'test') {
                    Mail::mailer('resend')->to($recipient->email)->send($mailable);
                } else {
                    Mail::mailer('resend')->to($recipient->email)->queue($mailable);
                }
            }

            Notification::make()
                ->title("Email queued for " . $recipients->count() . " recipient(s)!")
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
}
