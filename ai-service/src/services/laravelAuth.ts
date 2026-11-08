import axios from 'axios';

const configuredGoApiUrl = (process.env.GO_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const GO_API_URL = configuredGoApiUrl.endsWith('/api/v2')
    ? configuredGoApiUrl
    : `${configuredGoApiUrl}${configuredGoApiUrl.endsWith('/api') ? '/v2' : '/api/v2'}`;

export interface AuthResult {
    success: boolean;
    userId?: number;
    maxItems?: number;
    error?: string;
    status?: number;
    extractedText?: string;
    code?: string;
    feature?: string;
    limit?: number;
    used?: number;
    resetAt?: string;
}

/**
 * Validates the user token and reserves the daily allowance for an action.
 */
export async function authorizeUsage(
    token: string, 
    actionType: 'scan_solve' | 'quiz_generation' | 'flashcard_generation' | 'scan_chat',
    requestId: string,
    extractionId?: string
): Promise<AuthResult> {
    try {
        console.log(`[auth] Calling Go usage authorization: action=${actionType} url=${GO_API_URL}/internal/ai/authorize`);
        const response = await axios.post(`${GO_API_URL}/internal/ai/authorize`, {
            action_type: actionType,
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
                maxItems: response.data.max_items,
                extractedText: response.data.extracted_text
            };
        }
        
        console.log(`[auth] Authorization failed: ${response.data.message}`);
        return { success: false, error: response.data.message || 'Authorization failed' };
    } catch (error: any) {
        console.error(`[auth] Authorization error: status=${error.response?.status} data=${JSON.stringify(error.response?.data)} message=${error.message}`);
        if (error.response) {
            const data = error.response.data;
            return {
                success: false,
                error: data?.error || data?.message || 'Authorization failed',
                status: error.response.status,
                code: data?.code,
                feature: data?.feature,
                limit: data?.limit,
                used: data?.used,
                resetAt: data?.reset_at,
            };
        }
        return { success: false, error: error.message, status: 500 };
    }
}

/**
 * Releases the daily allowance reservation if generation fails.
 */
export async function releaseUsage(
    token: string,
    userId: number,
    requestId: string
): Promise<void> {
    try {
        await axios.post(`${GO_API_URL}/internal/ai/refund`, {
            user_id: userId,
            request_id: requestId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Failed to release daily usage reservation:', error);
    }
}

/**
 * Marks a successful generation so a later retry or cleanup cannot release it.
 */
export async function completeUsage(token: string, requestId: string): Promise<void> {
    try {
        await axios.post(`${GO_API_URL}/internal/ai/complete`, {
            request_id: requestId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Failed to complete daily usage reservation:', error);
    }
}
