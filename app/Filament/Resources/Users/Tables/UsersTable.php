<?php

namespace App\Filament\Resources\Users\Tables;

use App\Models\User;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Actions\Action as PageAction;
use Filament\Actions\EditAction as PageEditAction;
use Filament\Actions\DeleteAction as PageDeleteAction;
use Filament\Actions\BulkAction as PageBulkAction;
use Filament\Actions\BulkActionGroup as PageBulkActionGroup;
use Filament\Actions\DeleteBulkAction as PageDeleteBulkAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use App\Mail\PromotionalMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Collection;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar')
                    ->circular()
                    ->disk('s3'),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn (User $record) => $record->email),
                TextColumn::make('role')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'student' => 'gray',
                        'lecturer' => 'info',
                        'admin' => 'warning',
                        'founder' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'danger',
                        'pending' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('credits')
                    ->numeric()
                    ->sortable(),
                IconColumn::make('is_unlimited_student')
                    ->label('Pro')
                    ->boolean()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('role')
                    ->options([
                        'student' => 'Student',
                        'lecturer' => 'Lecturer',
                        'admin' => 'Admin',
                        'founder' => 'Founder',
                    ]),
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                        'pending' => 'Pending',
                    ]),
            ])
            ->actions([
                PageAction::make('resetCredits')
                    ->label('Reset Credits')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        $record->update(['credits' => 500]);
                        Notification::make()
                            ->title('Credits reset to 500')
                            ->success()
                            ->send();
                    }),
                PageAction::make('togglePro')
                    ->label(fn (User $record) => $record->is_unlimited_student ? 'Revoke Pro' : 'Make Pro')
                    ->icon('heroicon-o-sparkles')
                    ->color('info')
                    ->action(function (User $record) {
                        $record->update(['is_unlimited_student' => !$record->is_unlimited_student]);
                        Notification::make()
                            ->title($record->is_unlimited_student ? 'User is now Pro' : 'Pro status revoked')
                            ->success()
                            ->send();
                    }),
                PageAction::make('sendEmail')
                    ->label('Send Email')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('info')
                    ->form([
                        Select::make('template')
                            ->options([
                                'welcome_v2' => 'Marketing: Welcome (Modern)',
                                'stats_v2' => 'Marketing: Weekly Stats',
                                'announcement_v2' => 'Marketing: Announcement',
                                'survey_v2' => 'Marketing: Survey Request',
                                'subscription_v2' => 'Marketing: Billing Confirmed',
                                'upgrade_confirmation' => 'App: Upgrade Confirmed (Elite/Standard)',
                                'welcome' => 'App: Welcome (Warm/Family Tone)',
                            ])
                            ->required()
                            ->reactive()
                            ->afterStateUpdated(fn ($state, callable $set) => $set('subject', match($state) {
                                'welcome_v2' => 'Welcome to the future of learning!',
                                'stats_v2' => 'Your Weekly Skeeme Growth Report',
                                'announcement_v2' => 'Big news from the Skeeme team',
                                'survey_v2' => 'We value your feedback',
                                'subscription_v2' => 'Subscription Confirmed',
                                'upgrade_confirmation' => 'Congratulations! Your Upgrade is Confirmed 🚀',
                                'welcome' => 'Welcome to the Skeeme family! ❤️',
                                default => 'A message from Skeeme',
                            })),
                        TextInput::make('subject')
                            ->required()
                            ->default('A message from Skeeme'),
                    ])
                    ->action(function (User $record, array $data) {
                        try {
                            Mail::mailer('resend')->to($record->email)->send(new PromotionalMail($record, $data['template'], $data['subject']));
                            Notification::make()
                                ->title('Email sent successfully')
                                ->success()
                                ->send();
                        } catch (\Exception $e) {
                            Notification::make()
                                ->title('Failed to send email')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),
                PageEditAction::make(),
                PageDeleteAction::make(),
            ])
            ->bulkActions([
                PageBulkActionGroup::make([
                    PageBulkAction::make('sendBulkEmail')
                        ->label('Send Bulk Email')
                        ->icon('heroicon-o-paper-airplane')
                        ->form([
                            Select::make('template')
                                ->options([
                                    'welcome_v2' => 'Marketing: Welcome (Modern)',
                                    'stats_v2' => 'Marketing: Weekly Stats',
                                    'announcement_v2' => 'Marketing: Announcement',
                                    'survey_v2' => 'Marketing: Survey Request',
                                    'subscription_v2' => 'Marketing: Billing Confirmed',
                                    'upgrade_confirmation' => 'App: Upgrade Confirmed (Elite/Standard)',
                                    'welcome' => 'App: Welcome (Warm/Family Tone)',
                                ])
                                ->required()
                                ->reactive()
                                ->afterStateUpdated(fn ($state, callable $set) => $set('subject', match($state) {
                                    'welcome_v2' => 'Welcome to the future of learning!',
                                    'stats_v2' => 'Your Weekly Skeeme Growth Report',
                                    'announcement_v2' => 'Big news from the Skeeme team',
                                    'survey_v2' => 'We value your feedback',
                                    'subscription_v2' => 'Subscription Confirmed',
                                    'upgrade_confirmation' => 'Congratulations! Your Upgrade is Confirmed 🚀',
                                    'welcome' => 'Welcome to the Skeeme family! ❤️',
                                    default => 'A message from Skeeme',
                                })),
                            TextInput::make('subject')
                                ->required()
                                ->default('A message from Skeeme'),
                        ])
                        ->action(function (Collection $records, array $data) {
                            $records->each(function (User $user) use ($data) {
                                Mail::mailer('resend')->to($user->email)->queue(new PromotionalMail($user, $data['template'], $data['subject']));
                            });

                            Notification::make()
                                ->title('Emails queued for delivery')
                                ->success()
                                ->send();
                        }),
                    PageDeleteBulkAction::make(),
                ]),
            ]);
    }
}
