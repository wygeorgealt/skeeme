import { appStorage } from '@/lib/storage';
import { generateUUID } from '@/lib/utils';
import { streamSummaryGenerate } from '@/lib/aiStream';

export interface AiSummary {
    id: string;
    title: string;
    subtitle: string;
    conceptText: string;
    keyPoints: string[];
    mainFormula?: {
        expression: string;
        variables: { label: string; name: string; direction?: 'up' | 'down' }[];
    };
    relatedFormulas: { title: string; expression: string; icon?: string }[];
    mindmapNodes?: { title: string; desc: string; icon?: string }[];
    createdAt: number;
}

const STORAGE_KEY = 'skeeme_ai_summaries';

export async function getStoredSummaries(): Promise<AiSummary[]> {
    try {
        const raw = await appStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as AiSummary[];
    } catch {
        return [];
    }
}

export async function saveSummary(summary: AiSummary): Promise<void> {
    try {
        const existing = await getStoredSummaries();
        const updated = [summary, ...existing.filter(s => s.id !== summary.id)];
        await appStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
}

export async function deleteSummary(id: string): Promise<void> {
    try {
        const existing = await getStoredSummaries();
        const updated = existing.filter(s => s.id !== id);
        await appStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
}

export class SummaryError extends Error {
    constructor(
        public code: 'insufficient_credits' | 'non_educational' | 'network' | 'incomplete' | 'unknown',
        message: string
    ) {
        super(message);
    }
}

/** Pull the first JSON object out of the model text (tolerates ```json fences). */
function parseSummaryJson(raw: string): any {
    const cleaned = raw.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/i, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new SummaryError('incomplete', 'The summary came back incomplete.');
    return JSON.parse(match[0]);
}

/**
 * Generate a real, topic-specific AI summary via the Go backend
 * (POST /api/summaries/generate). There is intentionally NO canned fallback:
 * if generation fails the caller shows the error instead of fake content.
 */
export function generateAiSummary(
    topic: string,
    extractionId?: string | null,
    onStatus?: (status: string) => void
): Promise<AiSummary> {
    const cleanTopic = topic.trim();

    return new Promise<AiSummary>((resolve, reject) => {
        streamSummaryGenerate(
            { topic: cleanTopic, extraction_id: extractionId || null },
            {
                onStatus,
                onComplete: async (fullText) => {
                    try {
                        const parsed = parseSummaryJson(fullText);
                        if (parsed.error === 'non_educational') {
                            return reject(new SummaryError('non_educational', 'Summaries are for academic topics only.'));
                        }
                        if (!parsed.title || !Array.isArray(parsed.keyPoints) || parsed.keyPoints.length === 0) {
                            return reject(new SummaryError('incomplete', 'The summary came back incomplete.'));
                        }
                        const result: AiSummary = {
                            id: generateUUID(),
                            title: parsed.title,
                            subtitle: parsed.subtitle || `Study Guide • ${parsed.title}`,
                            conceptText: parsed.conceptText || '',
                            keyPoints: parsed.keyPoints,
                            mainFormula: parsed.mainFormula?.expression ? parsed.mainFormula : undefined,
                            relatedFormulas: Array.isArray(parsed.relatedFormulas) ? parsed.relatedFormulas : [],
                            mindmapNodes: Array.isArray(parsed.mindmapNodes) ? parsed.mindmapNodes : [],
                            createdAt: Date.now(),
                        };
                        await saveSummary(result);
                        resolve(result);
                    } catch (e) {
                        reject(e instanceof SummaryError ? e : new SummaryError('incomplete', 'The summary came back incomplete.'));
                    }
                },
                onError: (error, isInsufficientCredits) => {
                    if (isInsufficientCredits) return reject(new SummaryError('insufficient_credits', error));
                    if (error === 'non_educational') return reject(new SummaryError('non_educational', error));
                    if (error === 'incomplete_response') return reject(new SummaryError('incomplete', error));
                    reject(new SummaryError('network', error));
                },
            }
        );
    });
}
