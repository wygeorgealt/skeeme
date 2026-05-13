import { apiStandard } from './api';
import { generateUUID } from './utils';
import EventSource from 'react-native-sse';
import { useAuthStore } from '@/store/authStore';

export type ScanResult = {
    question: string;
    solution: string;
    steps?: string[];
    type: 'theory' | 'calculation' | 'multiple_choice';
    topic?: string;
    explanation?: string;
    summary?: string;
};

export type SolveResponse = {
    results: ScanResult[];
    cost: number;
    remaining_credits: number;
};

/**
 * Service to handle AI question solving.
 * Addresses "Separation of Concerns" by moving logic out of UI components.
 */
export const scannerService = {
    /**
     * Solves a question using a base64 image or a File/Blob (multipart).
     * Sends an idempotency key per attempt to prevent duplicate credit deductions.
     */
    solve: async (image: string | any, mode: 'base64' | 'multipart' = 'base64'): Promise<SolveResponse> => {
        const idempotencyKey = generateUUID();
        const idempotencyHeaders = { 'Idempotency-Key': idempotencyKey };

        if (mode === 'base64') {
            return await apiStandard.post<SolveResponse>('scan/solve', { image }, { headers: idempotencyHeaders });
        } else {
            // Multipart support for better performance with large files
            const formData = new FormData();
            formData.append('image', image);
            return await apiStandard.post<SolveResponse>('scan/solve', formData, {
                headers: { 'Content-Type': 'multipart/form-data', ...idempotencyHeaders }
            });
        }
    },

    /**
     * Solves a question using streaming SSE.
     */
    streamSolve: (
        base64: string,
        callbacks: {
            onStatus?: (message: string) => void;
            onDelta?: (partialResults: ScanResult[]) => void;
            onFullResult?: (results: ScanResult[]) => void;
            onComplete?: (creditsRemaining: number) => void;
            onError?: (error: string) => void;
            onDone?: () => void;
        }
    ): (() => void) => {
        const token = useAuthStore.getState().token;
        const idempotencyKey = generateUUID();
        const url = `${process.env.EXPO_PUBLIC_API_URL}scan/solve/stream`;

        const es = new EventSource(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Idempotency-Key': idempotencyKey,
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream, application/json',
            },
            method: 'POST',
            body: JSON.stringify({ image: base64 }),
        } as any);

        let accumulatedJson = '';
        let streamErrored = false;

         es.addEventListener('message', (event: any) => {
            if (event.data === '[DONE]') {
                es.close();
                callbacks.onDone?.();
                return;
            }

            try {
                const chunk = JSON.parse(event.data || '{}');
                switch (chunk.type) {
                    case 'status': {
                        if (chunk.message) {
                            callbacks.onStatus?.(chunk.message);
                        }
                        break;
                    }
                    case 'text_delta': {
                        if (chunk.text) {
                            accumulatedJson += chunk.text;
                            const partial = repairPartialJson(accumulatedJson);
                            if (partial?.results?.length) {
                                callbacks.onDelta?.(partial.results);
                            }
                        }
                        break;
                    }
                    case 'full_result': {
                        if (chunk.data?.results) {
                            callbacks.onFullResult?.(chunk.data.results);
                        }
                        break;
                    }
                    case 'complete': {
                        if (typeof chunk.credits_remaining === 'number') {
                            callbacks.onComplete?.(chunk.credits_remaining);
                        }
                        break;
                    }
                    case 'error': {
                        streamErrored = true;
                        es.close();
                        callbacks.onError?.(chunk.message || 'Failed to solve. Please try again.');
                        break;
                    }
                }
            } catch (e) {
                if (__DEV__) console.error('Stream parse error', e);
            }
        });

        es.addEventListener('error', (event: any) => {
            if (__DEV__) console.error('SSE Error Detail:', event);
            es.close();
            
            if (!streamErrored) {
                streamErrored = true;
                
                // Differentiate between intentional server errors and network/client errors
                let errorMessage = 'Connection interrupted. Please check your internet and try again.';
                
                if (event?.message) {
                    if (event.message.includes('network connection was lost') || 
                        event.message.includes('Network Error') || 
                        event.xhrStatus === 0) {
                        errorMessage = 'Network connection lost. Please try again.';
                    } else {
                        errorMessage = event.message;
                    }
                }
                
                callbacks.onError?.(errorMessage);
            }
        });

        return () => {
            es.close();
        };
    }
};

/**
 * Depth-aware JSON repair: tracks string/escape state and bracket depth,
 * strips dangling tokens, then closes open structures so partial streams
 * can be parsed mid-flight without the closing-bracket hacks.
 */
export const repairPartialJson = (input: string): any | null => {
    if (!input) return null;
    let s = input.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');

    try { return JSON.parse(s); } catch { }

    const stack: string[] = [];
    let inString = false;
    let escape = false;

    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (escape) { escape = false; continue; }
        if (inString) {
            if (c === '\\') escape = true;
            else if (c === '"') inString = false;
            continue;
        }
        if (c === '"') { inString = true; continue; }
        if (c === '{' || c === '[') stack.push(c);
        else if (c === '}' && stack[stack.length - 1] === '{') stack.pop();
        else if (c === ']' && stack[stack.length - 1] === '[') stack.pop();
    }

    let cutIdx = s.length;
    if (inString) {
        const lastQuote = s.lastIndexOf('"');
        if (lastQuote >= 0 && !s.endsWith('\\"')) {
            s = s.substring(0, lastQuote + 1);
        } else {
            s += '"';
        }
    } else {
        const lastColon = s.lastIndexOf(':');
        const lastComma = s.lastIndexOf(',');
        const lastOpenObj = s.lastIndexOf('{');
        const lastOpenArr = s.lastIndexOf('[');

        const danglingIdx = Math.max(lastColon, lastComma);
        if (danglingIdx > Math.max(lastOpenObj, lastOpenArr)) {
            const afterDangling = s.substring(danglingIdx + 1).trim();
            if (!afterDangling || afterDangling === 'n' || afterDangling === 'nu' || afterDangling === 'nul' || afterDangling === 't' || afterDangling === 'tr' || afterDangling === 'tru' || afterDangling === 'f' || afterDangling === 'fa' || afterDangling === 'fal' || afterDangling === 'fals') {
                cutIdx = danglingIdx;
            }
        }
        s = s.substring(0, cutIdx).trim();
    }

    for (let i = stack.length - 1; i >= 0; i--) {
        s += stack[i] === '{' ? '}' : ']';
    }

    try { return JSON.parse(s); } catch { return null; }
};
