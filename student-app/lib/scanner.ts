import { apiStandard } from './api';
import { generateUUID } from './utils';
import { useAuthStore } from '@/store/authStore';
import { streamScanSolve } from './aiStream';

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
     * Solves a question using the Node.js AI microservice (streaming).
     * Replaces the old EventSource SSE approach with a clean fetch-based stream.
     */
    streamSolve: (
        base64: string,
        callbacks: {
            onStatus?: (message: string) => void;
            onDelta?: (partialResults: ScanResult[]) => void;
            onFullResult?: (results: ScanResult[]) => void;
            onComplete?: (creditsRemaining: number, reward?: any, streak?: any) => void;
            onError?: (error: string, isInsufficientCredits?: boolean) => void;
            onDone?: () => void;
        }
    ): (() => void) => {
        let accumulatedText = '';

        const cleanup = streamScanSolve(base64, {
            onStatus: (message) => {
                callbacks.onStatus?.(message);
            },
            onToken: (token) => {
                accumulatedText += token;
                // Try to parse partial results as they stream in
                const partial = repairPartialJson(accumulatedText);
                if (partial?.results?.length) {
                    callbacks.onDelta?.(partial.results);
                }
            },
            onComplete: (fullText) => {
                // Parse the complete response
                const parsed = repairPartialJson(fullText);
                if (parsed?.results) {
                    callbacks.onFullResult?.(parsed.results);
                }
                // Refresh credits from the server
                callbacks.onComplete?.(0); // Credits will be refreshed by the UI
                callbacks.onDone?.();
            },
            onError: (error, isInsufficientCredits) => {
                callbacks.onError?.(error, isInsufficientCredits);
                callbacks.onDone?.();
            }
        });

        return cleanup;
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
