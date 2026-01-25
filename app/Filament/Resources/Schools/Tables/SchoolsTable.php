<?php

namespace App\Filament\Resources\Schools\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Table;

class SchoolsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                \Filament\Tables\Columns\TextColumn::make('activeSubscription.plan_name')
                    ->label('Current Plan')
                    ->default('None')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'Pro' => 'success',
                        'Enterprise' => 'warning',
                        'Free/Basic Plan' => 'gray',
                        default => 'danger',
                    }),
                \Filament\Tables\Columns\TextColumn::make('activeSubscription.expiry_date')
                    ->label('Expires At')
                    ->date()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                \Filament\Actions\Action::make('giftPro')
                    ->label('Gift Pro Plan')
                    ->icon('heroicon-o-gift')
                    ->color('success')
                    ->form([
                        \Filament\Forms\Components\TextInput::make('days')
                            ->label('Duration in Days')
                            ->numeric()
                            ->default(30)
                            ->required(),
                        \Filament\Forms\Components\Select::make('plan')
                            ->label('Plan to Gift')
                            ->options([
                                'Pro' => 'Pro Plan',
                                'Enterprise' => 'Enterprise Plan',
                            ])
                            ->default('Pro')
                            ->required(),
                    ])
                    ->action(function (\App\Models\School $record, array $data): void {
                        // Deactivate current active subscriptions
                        $record->subscriptions()->update(['is_active' => false]);

                        // Create new subscription
                        $record->subscriptions()->create([
                            'plan_name' => $data['plan'],
                            'is_active' => true,
                            'start_date' => now(),
                            'expiry_date' => now()->addDays($data['days']),
                            'price' => 0.00, // Gifted
                            'student_limit' => $data['plan'] === 'Pro' ? 1000 : null,
                            'auto_renew' => false,
                        ]);

                        \Filament\Notifications\Notification::make()
                            ->title('Plan Gifted successfully!')
                            ->success()
                            ->send();
                    }),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
