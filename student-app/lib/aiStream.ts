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
import EventSource from 'react-native-sse';

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
    const token = useAuthStore.getState().token;
    const idempotencyKey = generateUUID();
    let isConnecting = true;
    callbacks.onStatus?.('Connecting...');

    const es = new EventSource(`${AI_SERVICE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
        },
        method: 'POST',
        body: JSON.stringify(body),
        pollingInterval: 0,
    } as any);

    let fullText = '';
    let isInsufficientCredits = false;

    const listener = (event: any) => {
        if (event.type === 'open') {
            isConnecting = false;
            callbacks.onStatus?.('Generating...');
        } else if (event.type === 'message') {
            if (event.data === '[DONE]') {
                es.close();
                callbacks.onComplete?.(fullText);
                return;
            }

            try {
                const parsed = JSON.parse(event.data || '{}');
                if (parsed.text) {
                    fullText += parsed.text;
                    callbacks.onToken?.(parsed.text);
                }
            } catch (e) {
                console.error('Failed to parse SSE data', e);
            }
        } else if (event.type === 'error') {
            // Note: react-native-sse sometimes emits an error when the stream finishes normally without [DONE]
            // If we've already received data, we might just be done.
            if (event.message?.includes('402')) {
                isInsufficientCredits = true;
            }
            
            es.close();
            
            const errorMsg = event.message || 'Stream connection failed';
            
            // Only report error if we haven't received anything yet, or if it's a hard error like 402
            if (fullText.length === 0 || isInsufficientCredits) {
                callbacks.onError?.(errorMsg, isInsufficientCredits);
            } else {
                // If we have text and it errored, just complete it
                callbacks.onComplete?.(fullText);
            }
        }
    };

    es.addEventListener('open', listener);
    es.addEventListener('message', listener);
    es.addEventListener('error', listener);

    return () => {
        (es as any).removeAllEventListeners?.();
        es.close();
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
        provider?: 'deepseek' | 'anthropic';
    },
    callbacks: StreamCallbacks
): () => void {
    return streamFromAI('/api/scan/chat', params, callbacks);
}
