<?php

namespace App\Http\Controllers\API\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\RevenueCatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RevenueCatWebhookController extends Controller
{
    protected $revenueCatService;

    public function __construct(RevenueCatService $revenueCatService)
    {
        $this->revenueCatService = $revenueCatService;
    }

    /**
     * Securely handle RevenueCat Postback
     */
    public function handle(Request $request)
    {
        // 1. Authenticate the Webhook (RevenueCat sends "Bearer <TOKEN>")
        $token = $request->bearerToken();
        $expectedToken = config('services.revenuecat.webhook_token');

        if (!$token || $token !== $expectedToken) {
            Log::warning("RevenueCat: Unauthorized Webhook Attempt", [
                'ip' => $request->ip(),
                'token_received' => $token
            ]);
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $event = $request->input('event');
        if (!$event) {
            return response()->json(['message' => 'No event body'], 400);
        }

        $type = $event['type'] ?? '';
        $appUserId = $event['app_user_id'] ?? '';
        $entitlementIds = $event['entitlement_ids'] ?? [];

        Log::info("RevenueCat Webhook Received", ['type' => $type, 'user' => $appUserId]);

        switch ($type) {
            case 'INITIAL_PURCHASE':
            case 'RENEWAL':
            case 'UNCANCELLATION':
                foreach ($entitlementIds as $eId) {
                    $this->revenueCatService->grantEntitlement($appUserId, $eId, $event['expiration_at_ms'] ?? null);
                }
                break;

            case 'NON_SUBSCRIPTION_PURCHASE':
                $productId = $event['product_id'] ?? '';
                $this->revenueCatService->grantConsumable($appUserId, $productId);
                break;

            case 'CANCELLATION':
            case 'EXPIRATION':
            case 'BILLING_ISSUE':
                foreach ($entitlementIds as $eId) {
                    $this->revenueCatService->revokeEntitlement($appUserId, $eId);
                }
                break;

            case 'TEST':
                Log::info("RevenueCat: Connection Test Successful");
                break;

            default:
                Log::info("RevenueCat: Unhandled Event Type: " . $type);
        }

        return response()->json(['message' => 'Webhook Processed']);
    }
}
