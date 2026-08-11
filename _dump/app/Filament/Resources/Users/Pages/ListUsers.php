<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('purgePending')
                ->label('Purge Pending Students')
                ->icon('heroicon-o-trash')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Purge Stale Pending Students')
                ->modalDescription('This will permanently delete all student accounts that have been in "pending" status for more than 2 hours. This action cannot be undone.')
                ->action(function () {
                    $deleted = User::where('role', 'student')
                        ->where('status', 'pending')
                        ->where('created_at', '<', now()->subHours(2))
                        ->delete();

                    Notification::make()
                        ->title("Purged {$deleted} stale pending students")
                        ->success()
                        ->send();
                }),
            CreateAction::make(),
        ];
    }
}

