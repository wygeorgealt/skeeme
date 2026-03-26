<?php
 
namespace App\Jobs;
 
use App\Models\SupportTicket;
use App\Models\TicketResponse;
use App\Services\DeepseekAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
 
class AutoDraftSupportResponseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
 
    protected $ticket;
 
    /**
     * Create a new job instance.
     */
    public function __construct(SupportTicket $ticket)
    {
        $this->ticket = $ticket;
    }
 
    /**
     * Execute the job.
     */
    public function handle(DeepseekAIService $aiService)
    {
        $user = $this->ticket->user;
        
        $prompt = "You are the Skeeme AI Support Agent. Your goal is to draft a helpful, professional, and empathetic response to a student's support ticket.
 
Student Name: {$user->name}
Student Plan: " . ($user->is_unlimited_student ? 'Elite (Pro)' : 'Standard/Free') . "
Ticket Title: {$this->ticket->title}
Ticket Category: {$this->ticket->category}
 
Student Message:
\"\"\"
{$this->ticket->description}
\"\"\"
 
Instructions:
1. Start by acknowledging their issue and empathizing.
2. If it's a technical issue, suggest they try restarting the app or checking their internet.
3. If it's about credits, mention that Elite users have unlimited credits and suggest upgrading if they are on Free.
4. Keep the response concise (under 150 words).
5. Address them by their first name.
 
Draft Response:";
 
        try {
            $draftResponse = $aiService->getChatCompletion([
                ['role' => 'system', 'content' => 'You are a helpful support agent for Skeeme, an AI study app.'],
                ['role' => 'user', 'content' => $prompt]
            ]);
 
            if ($draftResponse) {
                TicketResponse::create([
                    'ticket_id' => $this->ticket->id,
                    'team_member_id' => null, // null means AI generated
                    'response' => $draftResponse,
                    'is_internal' => true, // Marked as internal so student doesn't see it until approved
                ]);
                
                Log::info("[AI Agent] Generated draft response for Ticket #{$this->ticket->id}");
            }
        } catch (\Exception $e) {
            Log::error("[AI Agent] Failed to generate response: " . $e->getMessage());
        }
    }
}
