<?php

namespace App\Jobs;

use App\Models\Note;
use App\Services\NoteIngestionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IngestNoteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 600];

    protected $note;

    /**
     * Create a new job instance.
     *
     * @param Note $note
     */
    public function __construct(Note $note)
    {
        $this->note = $note;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $ingestionService = new NoteIngestionService();
        $ingestionService->ingestNote($this->note);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception)
    {
        \Illuminate\Support\Facades\Log::error('IngestNoteJob failed for note ' . $this->note->id, [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
