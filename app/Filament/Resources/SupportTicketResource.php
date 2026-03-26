<?php
 
namespace App\Filament\Resources;
 
use App\Filament\Resources\SupportTicketResource\Pages\CreateSupportTicket;
use App\Filament\Resources\SupportTicketResource\Pages\EditSupportTicket;
use App\Filament\Resources\SupportTicketResource\Pages\ListSupportTickets;
use App\Filament\Resources\SupportTicketResource\Pages\ViewSupportTicket;
use App\Filament\Resources\SupportTicketResource\Schemas\SupportTicketForm;
use App\Filament\Resources\SupportTicketResource\Tables\SupportTicketsTable;
use App\Models\SupportTicket;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
 
class SupportTicketResource extends Resource
{
    protected static ?string $model = SupportTicket::class;
 
    protected static ?string $navigationIcon = 'heroicon-o-ticket';
 
    protected static ?string $navigationGroup = 'Support';
 
    protected static ?string $recordTitleAttribute = 'title';
 
    public static function form(Schema $schema): Schema
    {
        return SupportTicketForm::configure($schema);
    }
 
    public static function table(Table $table): Table
    {
        return SupportTicketsTable::configure($table);
    }
 
    public static function getRelations(): array
    {
        return [
            //
        ];
    }
 
    public static function getPages(): array
    {
        return [
            'index' => ListSupportTickets::route('/'),
            'create' => CreateSupportTicket::route('/create'),
            'view' => ViewSupportTicket::route('/{record}'),
            'edit' => EditSupportTicket::route('/{record}/edit'),
        ];
    }
}
