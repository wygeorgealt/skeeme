/**
 * Centralized AI Streaming Service
 * 
 * Replaces the messy EventSource/SSE logic scattered across scan.tsx, generate.tsx,
 * and flashcards/[id].tsx with a clean service that calls the Node.js microservice.
 * 
 * The Node.js microservice uses the Vercel AI SDK to stream text back.
 * This client reads that stream using a simple fetch + ReadableStream approach.
 */

import { useAuthStore } from '@/store/authStore';
import { generateUUID } from '@/lib/utils';

// Point to the Node.js microservice
// In production, this would be your deployed microservice URL
const AI_SERVICE_URL = process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://10.0.2.2:3001';

export interface StreamCallbacks {
    onToken?: (token: string) => void;
    onComplete?: (fullText: string) => void;
    onError?: (error: string, isInsufficientCredits?: boolean) => void;
    onStatus?: (message: string) => void;
}

/**
 * Generic streaming fetch from the Node.js AI microservice.
 * Returns an abort function to cancel the stream.
 */
export function streamFromAI(
    endpoint: string,
    body: Record<string, any>,
    callbacks: StreamCallbacks
): () => void {
    const abortController = new AbortController();
    const token = useAuthStore.getState().token;
    const idempotencyKey = generateUUID();

    const run = async () => {
        try {
            callbacks.onStatus?.('Connecting to Skeeme AI...');

            const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify(body),
                signal: abortController.signal,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let errorMsg = 'Generation failed. Please try again.';
                let isInsufficientCredits = false;

                try {
                    const parsed = JSON.parse(errorBody);
                    errorMsg = parsed.error || errorMsg;
                    if (response.status === 402) {
                        isInsufficientCredits = true;
                    }
                } catch (_) {}

                callbacks.onError?.(errorMsg, isInsufficientCredits);
                return;
            }

            callbacks.onStatus?.('Generating...');

            // Read the streaming response
            const reader = response.body?.getReader();
            if (!reader) {
                callbacks.onError?.('Stream not available');
                return;
            }

            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                callbacks.onToken?.(chunk);
            }

            callbacks.onComplete?.(fullText);

        } catch (error: any) {
            if (error.name === 'AbortError') {
                // User cancelled, don't report error
                return;
            }
            
            const errorMsg = error.message?.includes('Network') || error.message?.includes('fetch')
                ? 'Network connection lost. Please check your internet and try again.'
                : 'Generation failed. Please try again.';
            callbacks.onError?.(errorMsg);
        }
    };

    run();

    return () => {
        abortController.abort();
    };
}

// ── Convenience wrappers ──────────────────────────────────────────────────

/**
 * Stream a scan/solve request.
 */
export function streamScanSolve(
    imageBase64: string,
    provider: 'deepseek' | 'anthropic',
    callbacks: StreamCallbacks
): () => void {
    return streamFromAI('/api/scan/solve', { image: imageBase64, provider }, callbacks);
}

/**
 * Stream a quiz generation request.
 */
export function streamQuizGenerate(
    params: {
        topic: string;
        question_count: number;
        difficulty: string;
        question_types: string[];
        extraction_id?: string | null;
    },
    callbacks: StreamCallbacks
): () => void {
    return streamFromAI('/api/quizzes/generate', params, callbacks);
}

/**
 * Stream a flashcard generation request.
 */
export function streamFlashcardGenerate(
    params: {
        topic: string;
        card_count: number;
        difficulty: string;
        deck_id: string;
        extraction_id?: string | null;
    },
    callbacks: StreamCallbacks
): () => void {
    return streamFromAI('/api/flashcards/generate', params, callbacks);
}

/**
 * Stream a follow-up chat request for a scan.
 */
export function streamScanFollowUpChat(
    params: {
        messages: { role: string; content: string }[];
        context: string;
    },
    callbacks: StreamCallbacks
): () => void {
    return streamFromAI('/api/scan/chat', params, callbacks);
}
