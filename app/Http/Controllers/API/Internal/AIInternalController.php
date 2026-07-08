<?php

namespace App\Http\Controllers\API\Internal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;

class AIInternalController extends Controller
{
    /**
     * Authorize user and deduct credits safely.
     */
    public function authorizeRequest(Request $request)
    {
        $request->validate([
            'action_type' => 'required|string',
            'cost' => 'required|integer|min:0',
            'request_id' => 'required|string'
        ]);

        $tokenStr = $request->bearerToken();
        if (!$tokenStr) {
            return response()->json(['success' => false, 'message' => 'Token missing'], 401);
        }

        $accessToken = PersonalAccessToken::findToken($tokenStr);
        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json(['success' => false, 'message' => 'Invalid token'], 401);
        }

        $user = $accessToken->tokenable;
        $cost = $request->input('cost');
        $requestId = $request->input('request_id');
        $actionType = $request->input('action_type');

        Log::info("[AI Auth] User #{$user->id} attempting {$actionType}: cost={$cost}, current_credits={$user->credits}");

        $success = DB::transaction(function () use ($user, $cost, $actionType, $requestId) {
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
            
            Log::info("[AI Auth] Locked user #{$lockedUser->id}: credits={$lockedUser->credits}, cost={$cost}");

            if ($lockedUser->credits < $cost) {
                Log::warning("[AI Auth] Insufficient credits for user #{$lockedUser->id}: has {$lockedUser->credits}, needs {$cost}");
                return false;
            }

            $lockedUser->decrement('credits', $cost);

            $lockedUser->transactions()->create([
                'type' => 'usage',
                'action_type' => $actionType,
                'amount' => -$cost,
                'description' => "AI Request ($actionType)",
                'model_used' => 'vercel-ai-sdk',
                'request_id' => $requestId,
            ]);

            Log::info("[AI Auth] Deducted {$cost} credits from user #{$lockedUser->id}, remaining: " . ($lockedUser->credits));
            return true;
        });

        if (!$success) {
            return response()->json(['success' => false, 'message' => 'Insufficient credits'], 402);
        }

        $extractedText = null;
        if ($request->has('extraction_id')) {
            $extractionId = $request->input('extraction_id');
            $extractionData = Cache::get("extraction_{$extractionId}");
            $extractedText = $extractionData ? $extractionData['text'] : null;
        }

        return response()->json([
            'success' => true,
            'user_id' => $user->id,
            'credits_remaining' => $user->fresh()->credits,
            'extracted_text' => $extractedText
        ]);
    }

    /**
     * Refund credits if the generation fails.
     */
    public function refund(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'request_id' => 'required|string'
        ]);

        $user = User::find($request->input('user_id'));
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Find the transaction
        $transaction = $user->transactions()->where('request_id', $request->input('request_id'))->where('amount', '<', 0)->first();

        if ($transaction) {
            DB::transaction(function () use ($user, $transaction) {
                $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
                $refundAmount = abs($transaction->amount);
                
                $lockedUser->increment('credits', $refundAmount);
                
                $lockedUser->transactions()->create([
                    'type' => 'refund',
                    'action_type' => 'refund_ai',
                    'amount' => $refundAmount,
                    'description' => "Refund for failed AI request",
                    'model_used' => 'vercel-ai-sdk',
                    'request_id' => $transaction->request_id,
                ]);
            });
            
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'Transaction not found']);
    }
}
