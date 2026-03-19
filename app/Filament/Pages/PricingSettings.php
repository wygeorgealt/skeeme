<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\DateTimePicker;
use Filament\Pages\Page;
use Filament\Notifications\Notification;

class PricingSettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected string $view = 'filament.pages.pricing-settings';

    public static function getNavigationIcon(): ?string
    {
        return 'heroicon-o-currency-dollar';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Settings';
    }

    public ?array $data = [];

    public function mount(): void
    {
        $settings = SystemSetting::get('pricing', [
            'ngn' => [
                'standard' => ['monthly' => 3500, 'yearly' => 25000, 'promoMonthly' => 2600],
                'elite' => ['monthly' => 5000, 'yearly' => 50000, 'promoMonthly' => 3700]
            ],
            'usd' => [
                'standard' => ['monthly' => 4.99, 'yearly' => 39.99, 'promoMonthly' => 3.4],
                'elite' => ['monthly' => 9.99, 'yearly' => 79.99, 'promoMonthly' => 6.99]
            ],
            'promos' => [
                'standard_end' => '2026-03-22 23:59:59',
                'elite_end' => '2026-03-15 23:59:59'
            ],
            'credit_packs' => [
                'ngn' => [
                    ['amount' => 200, 'price' => 1500],
                    ['amount' => 500, 'price' => 2800],
                    ['amount' => 1000, 'price' => 4000],
                    ['amount' => 5000, 'price' => 9500]
                ],
                'usd' => [
                    ['amount' => 200, 'price' => 2.00],
                    ['amount' => 500, 'price' => 3.70],
                    ['amount' => 1000, 'price' => 6.00],
                    ['amount' => 5000, 'price' => 15.00]
                ]
            ]
        ]);

        $this->form->fill($settings);
    }

    public function form(Schema $form): Schema
    {
        return $form
            ->schema([
                Tabs::make('Pricing')
                    ->tabs([
                        Tabs\Tab::make('NGN Pricing')
                            ->schema([
                                Section::make('Standard Plan')
                                    ->schema([
                                        TextInput::make('ngn.standard.monthly')->numeric()->required()->label('Monthly (NGN)'),
                                        TextInput::make('ngn.standard.promoMonthly')->numeric()->required()->label('Promo Monthly (NGN)'),
                                        TextInput::make('ngn.standard.yearly')->numeric()->required()->label('Yearly (NGN)'),
                                    ])->columns(['default' => 3]),
                                Section::make('Elite Plan')
                                    ->schema([
                                        TextInput::make('ngn.elite.monthly')->numeric()->required()->label('Monthly (NGN)'),
                                        TextInput::make('ngn.elite.promoMonthly')->numeric()->required()->label('Promo Monthly (NGN)'),
                                        TextInput::make('ngn.elite.yearly')->numeric()->required()->label('Yearly (NGN)'),
                                    ])->columns(['default' => 3]),
                                Section::make('Credit Packs (NGN)')
                                    ->schema([
                                        Repeater::make('credit_packs.ngn')
                                            ->schema([
                                                TextInput::make('amount')->numeric()->required()->label('Credits Amount'),
                                                TextInput::make('price')->numeric()->required()->label('Price (NGN)'),
                                            ])->columns(['default' => 2])->defaultItems(4)
                                    ])
                            ]),
                        Tabs\Tab::make('USD Pricing')
                            ->schema([
                                Section::make('Standard Plan')
                                    ->schema([
                                        TextInput::make('usd.standard.monthly')->numeric()->required()->label('Monthly (USD)'),
                                        TextInput::make('usd.standard.promoMonthly')->numeric()->required()->label('Promo Monthly (USD)'),
                                        TextInput::make('usd.standard.yearly')->numeric()->required()->label('Yearly (USD)'),
                                    ])->columns(['default' => 3]),
                                Section::make('Elite Plan')
                                    ->schema([
                                        TextInput::make('usd.elite.monthly')->numeric()->required()->label('Monthly (USD)'),
                                        TextInput::make('usd.elite.promoMonthly')->numeric()->required()->label('Promo Monthly (USD)'),
                                        TextInput::make('usd.elite.yearly')->numeric()->required()->label('Yearly (USD)'),
                                    ])->columns(['default' => 3]),
                                Section::make('Credit Packs (USD)')
                                    ->schema([
                                        Repeater::make('credit_packs.usd')
                                            ->schema([
                                                TextInput::make('amount')->numeric()->required()->label('Credits Amount'),
                                                TextInput::make('price')->numeric()->required()->label('Price (USD)'),
                                            ])->columns(['default' => 2])->defaultItems(4)
                                    ])
                            ]),
                        Tabs\Tab::make('Promo Dates')
                            ->schema([
                                DateTimePicker::make('promos.standard_end')
                                    ->label('Standard Promo Ends At')
                                    ->required(),
                                DateTimePicker::make('promos.elite_end')
                                    ->label('Elite Promo Ends At')
                                    ->required(),
                            ])->columns(['default' => 2])
                    ])
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save Changes')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        
        SystemSetting::set('pricing', $data, 'App active pricing structure across mobile UI and backend checkouts.');

        Notification::make()
            ->title('Pricing successfully updated.')
            ->success()
            ->send();
    }
}
