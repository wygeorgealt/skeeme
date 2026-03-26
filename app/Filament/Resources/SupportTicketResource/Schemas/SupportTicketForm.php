<?php
 
namespace App\Filament\Resources\SupportTicketResource\Schemas;
 
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Placeholder;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;
use App\Models\TicketResponse;
 
class SupportTicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('AI Assistant')
                    ->description('Proposed draft from Skeeme AI Agent')
                    ->icon('heroicon-o-sparkles')
                    ->aside()
                    ->schema([
                        MarkdownEditor::make('ai_draft')
                            ->label('Auto-Generated Draft')
                            ->placeholder('No AI draft generated yet.')
                            ->afterStateHydrated(function ($component, $record) {
                                if (!$record) return;
                                $draft = TicketResponse::where('ticket_id', $record->id)
                                    ->where('is_internal', true)
                                    ->latest()
                                    ->first();
                                $component->state($draft?->response);
                            })
                            ->disabled()
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),
 
                Section::make('Ticket Information')
                    ->schema([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(255),
                        Select::make('user_id')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->required(),
                        MarkdownEditor::make('description')
                            ->required()
                            ->columnSpanFull(),
                    ])->columns(2),
 
                Section::make('Management')
                    ->schema([
                        Select::make('status')
                            ->options([
                                'open' => 'Open',
                                'pending' => 'Pending',
                                'resolved' => 'Resolved',
                                'closed' => 'Closed',
                            ])
                            ->required()
                            ->default('open'),
                        Select::make('priority')
                            ->options([
                                'low' => 'Low',
                                'normal' => 'Normal',
                                'high' => 'High',
                                'critical' => 'Critical',
                            ])
                            ->required()
                            ->default('normal'),
                        Select::make('category')
                            ->options([
                                'technical' => 'Technical',
                                'billing' => 'Billing',
                                'app_support' => 'App Support',
                                'feature_request' => 'Feature Request',
                            ])
                            ->required()
                            ->default('app_support'),
                        Select::make('assigned_to')
                            ->label('Assigned To')
                            ->options(function () {
                                return \App\Models\TeamMember::with('user')->get()->mapWithKeys(function ($member) {
                                    return [$member->id => $member->user ? $member->user->name : 'Unknown User'];
                                });
                            })
                            ->searchable(),
                    ])->columns(2),
 
                Section::make('Resolution')
                    ->schema([
                        MarkdownEditor::make('resolution_notes')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),
            ]);
    }
}
