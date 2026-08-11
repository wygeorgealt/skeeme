<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Support\AiJobCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AIJobStatusController extends Controller
{
    /**
     * Check the status of an AI generation job.
     */
    public function show(Request $request, $jobId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated. Please log in.'], 401);
        }
        $ownerId = AiJobCache::ownerId($jobId);
        if ($ownerId === null || $ownerId !== $user->id) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Job ID not found or expired.',
            ], 404);
        }

        $status = Cache::get("ai_job_status:{$jobId}", "not_found");

        if ($status === "not_found") {
            return response()->json(['status' => 'not_found', 'message' => 'Job ID not found or expired.'], 404);
        }

        $response = ['status' => $status];

        if ($status === "completed") {
            $response['result'] = Cache::get("ai_job_result:{$jobId}");
        }

        if ($status === "failed") {
            $response['error'] = Cache::get("ai_job_error:{$jobId}", "Unknown error during AI generation.");
        }

        return response()->json($response);
    }
}
