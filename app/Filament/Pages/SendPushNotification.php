<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use App\Models\User;
use App\Services\PushNotificationService;

class SendPushNotification extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.send-push-notification';

    public static function getNavigationIcon(): ?string
    {
        return 'heroicon-o-bell-alert';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'System Tools';
    }

    public static function getNavigationLabel(): string
    {
        return 'Push Notifications';
    }

    public static function getNavigationSort(): ?int
    {
        return 99;
    }

    public ?string $email = '';
    public ?string $notifTitle = 'Skeeme App 📚';
    public ?string $body = '';
    public ?string $preset = '';

    protected array $presets = [
        'streak' => [
            'title' => 'Keep your streak alive! 🔥',
            'body' => "You haven't studied yet today. Complete a quick quiz to keep your Skeeme streak going!",
        ],
        'credits' => [
            'title' => 'Credits Refilled! 💳',
            'body' => "Your study credits have been topped up! Time to ace some quizzes.",
        ],
        'welcome' => [
            'title' => 'Welcome to Skeeme! 🎓',
            'body' => "Upload your notes and generate your first AI quiz now. Let's get studying!",
        ],
        'new_feature' => [
            'title' => 'New Feature Available! ✨',
            'body' => "We just shipped something new. Open the app to check it out!",
        ],
    ];

    public function form(Forms\Form | \Filament\Schemas\Schema $form): Forms\Form | \Filament\Schemas\Schema
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Recipient')
                    ->schema([
                        Forms\Components\TextInput::make('email')
                            ->label('User Email')
                            ->email()
                            ->required()
                            ->placeholder('user@example.com')
                            ->helperText('The user must have opened the app on a physical device at least once.'),
                    ]),

                Forms\Components\Section::make('Quick Presets')
                    ->schema([
                        Forms\Components\Select::make('preset')
                            ->label('Use a preset')
                            ->options([
                                '' => '— Custom Message —',
                                'streak' => '🔥 Streak Reminder',
                                'credits' => '💳 Credits Refilled',
                                'welcome' => '🎓 Welcome Message',
                                'new_feature' => '✨ New Feature Alert',
                            ])
                            ->reactive()
                            ->afterStateUpdated(function ($state, callable $set) {
                                if ($state && isset($this->presets[$state])) {
                                    $set('notifTitle', $this->presets[$state]['title']);
                                    $set('body', $this->presets[$state]['body']);
                                }
                            }),
                    ]),

                Forms\Components\Section::make('Message')
                    ->schema([
                        Forms\Components\TextInput::make('notifTitle')
                            ->label('Title')
                            ->required()
                            ->maxLength(100),
                        Forms\Components\Textarea::make('body')
                            ->label('Body')
                            ->required()
                            ->rows(3)
                            ->maxLength(500),
                    ]),
            ]);
    }

    public function send(): void
    {
        $this->validate([
            'email' => 'required|email',
            'notifTitle' => 'required|string|max:100',
            'body' => 'required|string|max:500',
        ]);

        $user = User::where('email', $this->email)->first();

        if (!$user) {
            Notification::make()
                ->title('User Not Found')
                ->body("No user found with email: {$this->email}")
                ->danger()
                ->send();
            return;
        }

        if (empty($user->expo_push_token)) {
            Notification::make()
                ->title('No Device Token')
                ->body("This user hasn't opened the app on a physical device yet, so there's no push token to send to.")
                ->warning()
                ->send();
            return;
        }

        $pushService = app(PushNotificationService::class);
        $success = $pushService->send($user->expo_push_token, $this->notifTitle, $this->body);

        if ($success) {
            Notification::make()
                ->title('Notification Sent! 🚀')
                ->body("Push notification delivered to {$user->name} ({$user->email})")
                ->success()
                ->send();
        } else {
            Notification::make()
                ->title('Send Failed')
                ->body("Failed to deliver. Check storage/logs/laravel.log for details.")
                ->danger()
                ->send();
        }
    }
}
