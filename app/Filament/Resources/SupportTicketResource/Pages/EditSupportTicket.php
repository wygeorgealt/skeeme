<?php
 
namespace App\Filament\Resources\SupportTicketResource\Pages;
 
use App\Filament\Resources\SupportTicketResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Actions\Action;
use Filament\Resources\Pages\EditRecord;
use App\Jobs\AutoDraftSupportResponseJob;
use Filament\Notifications\Notification;
 
class EditSupportTicket extends EditRecord
{
    protected static string $resource = SupportTicketResource::class;
 
    protected function getHeaderActions(): array
    {
        return [
            Action::make('magicReply')
                ->label('Magic AI Reply')
                ->icon('heroicon-o-sparkles')
                ->color('info')
                ->action(function () {
                    AutoDraftSupportResponseJob::dispatch($this->record);
                    
                    Notification::make()
                        ->title('AI is thinking...')
                        ->body('Refresh in a few seconds to see the new draft.')
                        ->info()
                        ->send();
                }),
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
