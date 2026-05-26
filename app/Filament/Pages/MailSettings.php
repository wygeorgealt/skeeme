<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Pages\Page;
use Filament\Notifications\Notification;

class MailSettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    public static function getNavigationIcon(): ?string
    {
        return 'heroicon-o-envelope';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Settings';
    }

    public static function getNavigationLabel(): string
    {
        return 'Mail Configuration';
    }

    protected string $view = 'filament.pages.mail-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $settings = SystemSetting::get('mail_config', [
            'active_resend_account' => 'skeeme',
        ]);

        $this->form->fill($settings);
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                Section::make('Mail Account Toggle')
                    ->description('Manually switch the active Resend account used for sending outgoing emails. This overrides the default system mailer instantly.')
                    ->schema([
                        Select::make('active_resend_account')
                            ->label('Active Resend Account')
                            ->options([
                                'skeeme' => 'Skeeme Native (resend)',
                                'campusbites' => 'CampusBites Fallback (campusbites_resend)',
                            ])
                            ->required()
                            ->helperText('Select the Resend account to route all emails through.'),
                    ])
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save Configuration')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        
        SystemSetting::set('mail_config', $data, 'Determines which Resend account is actively sending emails globally.');

        Notification::make()
            ->title('Mail Settings successfully updated.')
            ->success()
            ->send();
    }
}
