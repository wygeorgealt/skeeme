<?php

namespace App\Filament\Resources\DemoRequests\Schemas;

use Filament\Schemas\Schema;

class DemoRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                \Filament\Schemas\Components\TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255),
                \Filament\Schemas\Components\TextInput::make('school_name')
                    ->required()
                    ->maxLength(255),
                \Filament\Schemas\Components\TextInput::make('role')
                    ->maxLength(255),
                \Filament\Schemas\Components\TextInput::make('phone')
                    ->tel()
                    ->maxLength(255),
                \Filament\Schemas\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'contacted' => 'Contacted',
                        'scheduled' => 'Scheduled',
                        'closed' => 'Closed',
                    ])
                    ->required()
                    ->default('pending'),
                \Filament\Schemas\Components\Textarea::make('message')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                \Filament\Schemas\Components\TextInput::make('ip_address')
                    ->disabled()
                    ->maxLength(255),
            ]);
    }
}
