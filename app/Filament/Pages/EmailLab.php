<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
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
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        
        $this->form->fill([
            'test_email' => $user?->email,
            'template' => 'standard',
            'has_cta' => false,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Email Lab')
                    ->description('Compose and send engagement emails using the Skeeme design system.')
                    ->schema([
                        // ── Audience ──
                        Select::make('target_audience')
                            ->label('Target Audience')
                            ->options([
                                'test' => '🧪 Test (My Email)',
                                'custom' => '📩 Custom Email Address(es)',
                                'all_users' => '👥 All Users',
                                'students' => '🎓 All Students',
                                'new_users' => '🆕 New Users (Last 7 Days)',
                                'random_10' => '🎲 Random 10 Users',
                            ])
                            ->default('test')
                            ->required()
                            ->reactive(),

                        TextInput::make('test_email')
                            ->label('Test Email Address')
                            ->email()
                            ->default(function () {
                                /** @var \App\Models\User|null $user */
                                $user = Auth::user();
                                return $user?->email;
                            })
                            ->visible(fn ($get) => $get('target_audience') === 'test')
                            ->required(fn ($get) => $get('target_audience') === 'test'),

                        TextInput::make('custom_emails')
                            ->label('Custom Email Address(es)')
                            ->placeholder('e.g. jdoe@example.com, another@test.com')
                            ->visible(fn ($get) => $get('target_audience') === 'custom')
                            ->required(fn ($get) => $get('target_audience') === 'custom')
                            ->columnSpanFull(),

                        // ── Template ──
                        Select::make('template')
                            ->label('Email Template')
                            ->options([
                                'standard' => '📝 Standard — Clean header + body',
                                'announcement' => '📢 Announcement — Big hero headline + body',
                                'survey' => '📊 Survey/Feedback — Hero headline + body + CTA',
                            ])
                            ->default('standard')
                            ->required()
                            ->reactive()
                            ->helperText('Choose the email style. "Announcement" and "Survey" display the header as a large hero title.'),

                        // ── Content ──
                        TextInput::make('subject')
                            ->label('Email Subject')
                            ->required()
                            ->placeholder('e.g. New features just dropped! 🚀')
                            ->columnSpanFull(),

                        TextInput::make('header')
                            ->label(fn ($get) => match ($get('template')) {
                                'announcement', 'survey' => 'Hero Headline (supports line breaks with <br>)',
                                default => 'Email Bold Header',
                            })
                            ->required()
                            ->placeholder(fn ($get) => match ($get('template')) {
                                'announcement' => 'e.g. Fresh out of the lab ✨',
                                'survey' => 'e.g. One quick question for you',
                                default => 'e.g. Hey Skeemers!',
                            })
                            ->columnSpanFull(),
                        
                        RichEditor::make('body')
                            ->label('Email Body')
                            ->required()
                            ->columnSpanFull(),

                        // ── CTA Button (optional) ──
                        Toggle::make('has_cta')
                            ->label('Add a CTA Button')
                            ->default(false)
                            ->reactive()
                            ->columnSpanFull(),

                        TextInput::make('cta_text')
                            ->label('Button Text')
                            ->placeholder('e.g. Open Skeeme, Take the Survey, Learn More')
                            ->visible(fn ($get) => $get('has_cta'))
                            ->required(fn ($get) => $get('has_cta')),

                        TextInput::make('cta_url')
                            ->label('Button URL')
                            ->url()
                            ->placeholder('https://skeeme.com/...')
                            ->visible(fn ($get) => $get('has_cta'))
                            ->required(fn ($get) => $get('has_cta')),
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
        $template = $state['template'] ?? 'standard';
        $ctaText = ($state['has_cta'] ?? false) ? ($state['cta_text'] ?? null) : null;
        $ctaUrl = ($state['has_cta'] ?? false) ? ($state['cta_url'] ?? null) : null;

        try {
            $mailable = new DynamicBulkMail(
                subjectText: $subject,
                headerText: $header,
                bodyHtml: $body,
                template: $template,
                ctaText: $ctaText,
                ctaUrl: $ctaUrl,
            );

            $recipients = match ($audience) {
                'test' => collect([ (object)['email' => $state['test_email']] ]),
                'custom' => collect(array_map(fn($e) => (object)['email' => trim($e)], explode(',', $state['custom_emails']))),
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
