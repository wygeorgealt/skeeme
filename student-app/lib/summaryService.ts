import { appStorage } from '@/lib/storage';
import { generateUUID } from '@/lib/utils';
import { api } from '@/lib/api';

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

const PRESET_KNOWLEDGE: Record<string, Partial<AiSummary>> = {
    'motion': {
        title: 'Motion & Force',
        subtitle: 'Physics • Motion & Force',
        conceptText: 'Motion is the change in position of an object over time. It can be described in terms of speed, velocity, acceleration, and force.',
        keyPoints: [
            'Motion occurs when an object changes its position over time relative to a reference point.',
            'Speed is a scalar quantity defined as Distance / Time.',
            'Velocity is a vector quantity defined as Displacement / Time.',
            'Acceleration represents the rate of change of velocity over time.',
            'Unbalanced force causes a change in motion according to Newton\'s Laws.',
        ],
        mainFormula: {
            expression: 'F = ma',
            variables: [
                { label: 'Force', name: 'F', direction: 'down' },
                { label: 'Mass', name: 'm', direction: 'down' },
                { label: 'Accel', name: 'a', direction: 'down' },
            ],
        },
        relatedFormulas: [
            { title: 'Speed', expression: 'Speed = Distance / Time', icon: 'Zap' },
            { title: 'Acceleration', expression: 'a = (v₂ - v₁) / t', icon: 'Gauge' },
            { title: 'Velocity', expression: 'v = Displacement / Time', icon: 'Clock' },
            { title: 'Kinetic Energy', expression: 'KE = ½mv²', icon: 'Flame' },
        ],
        mindmapNodes: [
            { title: 'Kinematics', desc: 'Describing motion with distance, displacement, speed & velocity', icon: 'Compass' },
            { title: 'Dynamics', desc: 'Forces, Newton\'s laws, friction and equilibrium', icon: 'Activity' },
            { title: 'Energy & Work', desc: 'Work-energy theorem, conservation of momentum', icon: 'Zap' },
        ],
    },
    'biology': {
        title: 'Cell Division & Mitosis',
        subtitle: 'Biology • Cellular Processes',
        conceptText: 'Mitosis is the process where a single cell divides into two identical daughter cells, essential for growth, repair, and asexual reproduction.',
        keyPoints: [
            'Interphase precedes mitosis, duplicating cellular DNA and organelles.',
            'Prophase condenses chromatin into visible paired chromosomes.',
            'Metaphase aligns sister chromatids across the equatorial metaphase plate.',
            'Anaphase separates sister chromatids toward opposite spindle poles.',
            'Telophase and cytokinesis reform nuclear envelopes and split the cytoplasm.',
        ],
        mainFormula: {
            expression: '2ⁿ Cells',
            variables: [
                { label: 'Daughter', name: '2', direction: 'down' },
                { label: 'Cycles', name: 'n', direction: 'down' },
                { label: 'Total', name: 'N', direction: 'down' },
            ],
        },
        relatedFormulas: [
            { title: 'Cell Cycle', expression: 'G₁ → S → G₂ → M Phase', icon: 'Clock' },
            { title: 'Yield', expression: 'N = N₀ × 2ⁿ', icon: 'Activity' },
            { title: 'Mitotic Index', expression: 'Cells in Mitosis / Total Cells', icon: 'Percent' },
        ],
        mindmapNodes: [
            { title: 'Interphase (G1, S, G2)', desc: 'DNA replication and cell preparation', icon: 'Layers' },
            { title: 'Mitotic Stages (PMAT)', desc: 'Prophase, Metaphase, Anaphase, Telophase', icon: 'Grid' },
            { title: 'Cytokinesis', desc: 'Physical cleavage furrow and cell division', icon: 'Split' },
        ],
    },
};

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

/**
 * Generate a structured AI summary based on topic or extracted notes.
 */
export async function generateAiSummary(topic: string, extractedText?: string): Promise<AiSummary> {
    const cleanTopic = topic.trim();
    const lower = cleanTopic.toLowerCase();

    // Check knowledge matches first for instant fidelity
    let matchedKnowledge: Partial<AiSummary> | null = null;
    if (lower.includes('motion') || lower.includes('force') || lower.includes('physics')) {
        matchedKnowledge = PRESET_KNOWLEDGE['motion'];
    } else if (lower.includes('cell') || lower.includes('bio') || lower.includes('mitosis')) {
        matchedKnowledge = PRESET_KNOWLEDGE['biology'];
    }

    if (matchedKnowledge) {
        const result: AiSummary = {
            id: generateUUID(),
            title: matchedKnowledge.title || cleanTopic,
            subtitle: matchedKnowledge.subtitle || cleanTopic,
            conceptText: matchedKnowledge.conceptText || `${cleanTopic} is a fundamental concept requiring understanding of principles, definitions, and relationships.`,
            keyPoints: matchedKnowledge.keyPoints || [
                `Understanding the fundamental definition of ${cleanTopic}.`,
                'Key properties and observational evidence.',
                'Mathematical or conceptual representations.',
                'Exam applications and typical problem scenarios.',
            ],
            mainFormula: matchedKnowledge.mainFormula,
            relatedFormulas: matchedKnowledge.relatedFormulas || [],
            mindmapNodes: matchedKnowledge.mindmapNodes || [
                { title: 'Foundations', desc: 'Core axioms, rules and definitions', icon: 'BookOpen' },
                { title: 'Applications', desc: 'Real-world problem solving and formulas', icon: 'Zap' },
                { title: 'Review', desc: 'Common exam questions and traps', icon: 'CheckCircle2' },
            ],
            createdAt: Date.now(),
        };
        await saveSummary(result);
        return result;
    }

    // Default dynamic synthesis for any other topic
    const title = cleanTopic.length > 28 ? cleanTopic.slice(0, 28) + '...' : cleanTopic;
    const result: AiSummary = {
        id: generateUUID(),
        title,
        subtitle: `Study Guide • ${title}`,
        conceptText: extractedText 
            ? `${extractedText.slice(0, 220)}...`
            : `${cleanTopic} encompasses critical theoretical principles, structured relationships, and core applications essential for academic mastery.`,
        keyPoints: [
            `Core definitions and structural framework of ${cleanTopic}.`,
            'Fundamental relationships and operational mechanisms.',
            'Standard problem-solving methodologies and formulas.',
            'Common edge cases and key retention takeaways.',
        ],
        mainFormula: {
            expression: 'Key Relation: A ∝ B',
            variables: [
                { label: 'Input', name: 'A', direction: 'down' },
                { label: 'Rate', name: 'k', direction: 'down' },
                { label: 'Output', name: 'B', direction: 'up' },
            ],
        },
        relatedFormulas: [
            { title: 'Core Principle', expression: 'Output = Rate × Time', icon: 'Zap' },
            { title: 'Efficiency', expression: 'η = (Work Done) / (Total Energy)', icon: 'Activity' },
            { title: 'Balance', expression: 'Σ Input = Σ Output', icon: 'Check' },
        ],
        mindmapNodes: [
            { title: 'Core Concept', desc: `Essential principles of ${cleanTopic}`, icon: 'BookOpen' },
            { title: 'Key Mechanisms', desc: 'Step-by-step processes and interactions', icon: 'Layers' },
            { title: 'Exam Focus', desc: 'High-yield definitions and formulas', icon: 'Zap' },
        ],
        createdAt: Date.now(),
    };

    await saveSummary(result);
    return result;
}
