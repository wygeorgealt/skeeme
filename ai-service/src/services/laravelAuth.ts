import axios from 'axios';

const GO_API_URL = process.env.GO_API_URL || 'http://localhost:8080/api';

export interface AuthResult {
    success: boolean;
    userId?: number;
    creditsRemaining?: number;
    error?: string;
    status?: number;
    extractedText?: string;
}

/**
 * Validates the user token and deducts credits for a specific action.
 */
export async function authorizeAndDeduct(
    token: string, 
    actionType: 'scan_solve' | 'quiz_generation' | 'flashcard_generation' | 'scan_chat',
    cost: number,
    requestId: string,
    extractionId?: string
): Promise<AuthResult> {
    try {
        console.log(`[auth] Calling Go authorize: action=${actionType} cost=${cost} url=${GO_API_URL}/internal/ai/authorize`);
        const response = await axios.post(`${GO_API_URL}/internal/ai/authorize`, {
            action_type: actionType,
            cost: cost,
            request_id: requestId,
            extraction_id: extractionId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Skeeme-Internal-AI-Service/1.0'
            }
        });

        console.log(`[auth] Go response:`, JSON.stringify(response.data));

        if (response.data.success) {
            return {
                success: true,
                userId: response.data.user_id,
                creditsRemaining: response.data.credits_remaining,
                extractedText: response.data.extracted_text
            };
        }
        
        console.log(`[auth] Authorization failed: ${response.data.message}`);
        return { success: false, error: response.data.message || 'Authorization failed' };
    } catch (error: any) {
        console.error(`[auth] Authorization error: status=${error.response?.status} data=${JSON.stringify(error.response?.data)} message=${error.message}`);
        if (error.response) {
            return { success: false, error: error.response.data?.message || 'Authorization failed', status: error.response.status };
        }
        return { success: false, error: error.message, status: 500 };
    }
}

/**
 * Refunds credits if the generation fails.
 */
export async function refundCredits(
    userId: number,
    requestId: string
): Promise<void> {
    try {
        await axios.post(`${GO_API_URL}/internal/ai/refund`, {
            user_id: userId,
            request_id: requestId
        });
    } catch (error) {
        console.error('Failed to refund credits:', error);
    }
}

