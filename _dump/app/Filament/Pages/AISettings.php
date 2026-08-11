<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
use Filament\Pages\Page;
use Filament\Notifications\Notification;

class AISettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.ai-settings';

    public static function getNavigationIcon(): ?string
    {
        return 'heroicon-o-cpu-chip';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Settings';
    }

    public static function getNavigationLabel(): string
    {
        return 'AI Engine Configuration';
    }

    public ?array $data = [];

    public function mount(): void
    {
        $settings = SystemSetting::get('ai_config', [
            'manual_override_enabled' => false,
            'manual_provider_choice' => 'claude',
        ]);

        $this->form->fill($settings);
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                Section::make('AI Provider Override')
                    ->description('Bypass automated health checks and circuit breakers by manually enforcing a specific AI Model. When active, automated failovers are disabled.')
                    ->schema([
                        Toggle::make('manual_override_enabled')
                            ->label('Enable Manual Override')
                            ->helperText('Turn this ON to stop the System Health Cron from auto-switching providers.')
                            ->reactive(),

                        Select::make('manual_provider_choice')
                            ->label('Force Active AI Model')
                            ->options([
                                'claude' => 'Claude 3.5 / 4.5 (Anthropic)',
                                'deepseek' => 'DeepSeek V3 / R1',
                            ])
                            ->hidden(fn (callable $get) => !$get('manual_override_enabled'))
                            ->required(fn (callable $get) => $get('manual_override_enabled'))
                            ->helperText('Select which model all user requests should currently be routed to.'),
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
        
        SystemSetting::set('ai_config', $data, 'Determines if the AI Engine should follow a strict manual provider override, bypassing cron health checks.');

        Notification::make()
            ->title('AI Settings successfully updated.')
            ->success()
            ->send();
    }
}
