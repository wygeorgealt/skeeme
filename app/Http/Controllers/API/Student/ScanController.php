<?php

namespace App\Http\Controllers\API\Student;

use App\Services\DeepseekAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Jobs\ProcessAIScanSolve;
use App\Http\Controllers\Controller;

class ScanController extends Controller
{
    protected DeepseekAIService $aiService;

    public function __construct(DeepseekAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Solve a question from a scanned image.
     */
    public function solve(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // base64-encoded image
        ]);

        // Security: Payload size validation (max 5MB base64 string ~3.7MB image)
        if (strlen($request->input('image')) > 5 * 1024 * 1024) {
            return response()->json(['message' => 'Image payload too large. Please use a smaller photo.'], 422);
        }

        $user = $request->user();
        $baseCost = 2; // Flat fee for OCR scanning
        $costPerSolution = 4; // Fee per question solved

        Log::info('Scan & Solve Started', ['user_id' => $user->id]);

        // 3. Preliminary Check & Lock Credits (Atomic)
        $canProceed = DB::transaction(function() use ($user, $baseCost, $costPerSolution) {
            $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
            
            if (!$lockedUser->is_unlimited && $lockedUser->credits < ($baseCost + $costPerSolution)) {
                return false;
            }
            return true;
        });

        if (!$canProceed) {
            return response()->json([
                'message' => "Insufficient credits. You need at least 6 credits for a basic scan.",
                'required' => 6,
                'available' => $user->credits,
            ], 403);
        }

        try {
            // 4. Dispatch Background Job
            $jobId = (string) Str::uuid();
            Cache::put("ai_job_status:{$jobId}", "pending", 1800);

            // Deduct base + initial solution cost (Atomic)
            if (!$user->is_unlimited) {
                DB::transaction(function() use ($user, $baseCost, $costPerSolution) {
                    \App\Models\User::where('id', $user->id)->lockForUpdate()->first()->decrement('credits', ($baseCost + $costPerSolution));
                });
                Log::info('Initial Scan Credits Deducted', ['user_id' => $user->id, 'initial' => ($baseCost + $costPerSolution)]);
            }

            ProcessAIScanSolve::dispatch(
                $request->input('image'),
                $user->id,
                $jobId,
                $user->is_unlimited ? 0 : ($baseCost + $costPerSolution),
                $baseCost,
                $costPerSolution
            );

            return response()->json([
                'message' => 'Image processing started.',
                'job_id' => $jobId,
                'status' => 'pending',
                'credits_deducted' => $user->is_unlimited ? 0 : ($baseCost + $costPerSolution),
                'remaining_credits' => $user->fresh()->credits
            ]);

        } catch (\Exception $e) {
            Log::error('Scan & Solve Dispatch Failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to initiate the scan. Please try again.',
            ], 500);
        }
    }
}
