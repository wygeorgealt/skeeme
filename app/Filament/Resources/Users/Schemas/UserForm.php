<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\DateTimePicker;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\FileUpload;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        TextInput::make('password')
                            ->password()
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn (string $context): bool => $context === 'create'),
                    ])->columns(2),

                Section::make('Role & Status')
                    ->schema([
                        Select::make('role')
                            ->options([
                                'student' => 'Student',
                                'lecturer' => 'Lecturer',
                                'admin' => 'Admin',
                                'founder' => 'Founder',
                            ])
                            ->required(),
                        Select::make('status')
                            ->options([
                                'active' => 'Active',
                                'inactive' => 'Inactive',
                                'pending' => 'Pending',
                            ])
                            ->default('active')
                            ->required(),
                                                Select::make('subscription_tier')
                            ->label('Subscription Tier')
                            ->options([
                                'free' => 'Free',
                                'pro' => 'Pro',
                                'max' => 'Max',
                            ])
                            ->required()
                            ->columnSpanFull(),
                    ])->columns(2),

                Section::make('Profile Details')
                    ->schema([
                        TextInput::make('first_name')
                            ->maxLength(255),
                        TextInput::make('last_name')
                            ->maxLength(255),
                        TextInput::make('phone_number')
                            ->tel()
                            ->maxLength(255),
                        TextInput::make('credits')
                            ->numeric()
                            ->default(500),
                        FileUpload::make('avatar')
                            ->image()
                            ->disk('s3') // Matches project's R2 setup
                            ->directory('avatars')
                            ->visibility('public'),
                    ])->columns(2),

                Section::make('System')
                    ->schema([
                        DateTimePicker::make('email_verified_at'),
                        DateTimePicker::make('approved_at'),
                    ])->columns(2),
            ]);
    }
}
