<?php
 
namespace App\Observers;
 
use App\Models\SupportTicket;
use App\Jobs\AutoDraftSupportResponseJob;
 
class SupportTicketObserver
{
    /**
     * Handle the SupportTicket "created" event.
     */
    public function created(SupportTicket $supportTicket): void
    {
        // Dispatch the job to generate an AI draft response
        AutoDraftSupportResponseJob::dispatch($supportTicket);
    }
}
