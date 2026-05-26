<?php

namespace App\Filament\Resources\Users\Tables;

use App\Models\User;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Collection;
use App\Mail\DynamicBulkMail;
use Filament\Forms\Components\RichEditor;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar')
                    ->circular()
                    ->disk('s3'),
                TextColumn::make('subscription_tier')
                    ->badge()
                    ->enum([
                        'free' => 'Free',
                        'pro' => 'Pro',
                        'max' => 'Max',
                    ]),
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
            ->recordActions([
                Action::make('resetCredits')
                    ->label('Reset Credits')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        $record->update(['credits' => 100]);
                        Notification::make()
                            ->title('Credits reset to 100')
                            ->success()
                            ->send();
                    }),
                Action::make('sendEmail')
                    ->label('Send Email')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('info')
                    ->form([
                        TextInput::make('subject')
                            ->label('Email Subject')
                            ->required()
                            ->default('A message from Skeeme'),
                        TextInput::make('header')
                            ->label('Email Bold Header')
                            ->required()
                            ->default('Important Update'),
                        RichEditor::make('body')
                            ->label('Email Body')
                            ->required()
                            ->default('<p>Hello there,</p>'),
                    ])
                    ->action(function (User $record, array $data) {
                        try {
                            Mail::mailer(config('mail.default'))->to($record->email)->send(new DynamicBulkMail($data['subject'], $data['header'], $data['body']));
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
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('sendBulkEmail')
                        ->label('Send Bulk Email')
                        ->icon('heroicon-o-paper-airplane')
                        ->form([
                            TextInput::make('subject')
                                ->label('Email Subject')
                                ->required()
                                ->default('A message from Skeeme'),
                            TextInput::make('header')
                                ->label('Email Bold Header')
                                ->required()
                                ->default('Important Update'),
                            RichEditor::make('body')
                                ->label('Email Body')
                                ->required()
                                ->default('<p>Hello there,</p>'),
                        ])
                        ->action(function (Collection $records, array $data) {
                            $mailable = new DynamicBulkMail($data['subject'], $data['header'], $data['body']);
                            
                            $records->each(function (User $user) use ($mailable) {
                                Mail::mailer(config('mail.default'))->to($user->email)->queue($mailable);
                            });

                            Notification::make()
                                ->title('Emails queued for delivery')
                                ->success()
                                ->send();
                        }),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
