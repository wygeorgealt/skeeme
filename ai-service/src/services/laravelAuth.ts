import axios from 'axios';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://skeeme.test/api';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'skeeme-ai-secret-key-123';

export interface AuthResult {
    success: boolean;
    userId?: number;
    creditsRemaining?: number;
    error?: string;
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
        const response = await axios.post(`${LARAVEL_API_URL}/internal/ai/authorize`, {
            action_type: actionType,
            cost: cost,
            request_id: requestId,
            extraction_id: extractionId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Internal-Secret': INTERNAL_SECRET
            }
        });

        if (response.data.success) {
            return {
                success: true,
                userId: response.data.user_id,
                creditsRemaining: response.data.credits_remaining,
                extractedText: response.data.extracted_text
            };
        }
        
        return { success: false, error: response.data.message || 'Authorization failed' };
    } catch (error: any) {
        if (error.response && error.response.status === 402) {
            return { success: false, error: 'Insufficient credits' };
        }
        return { success: false, error: error.message };
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
        await axios.post(`${LARAVEL_API_URL}/internal/ai/refund`, {
            user_id: userId,
            request_id: requestId
        }, {
            headers: {
                'X-Internal-Secret': INTERNAL_SECRET
            }
        });
    } catch (error) {
        console.error('Failed to refund credits:', error);
    }
}
