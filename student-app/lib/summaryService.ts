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
        conceptText: '**Motion** is the change in position of an object over time. It is governed by **kinematics** ($v$, $a$) and **Newton\'s Laws of Motion** ($F = ma$).',
        keyPoints: [
            '**Displacement** ($\\Delta x$) measures change in position relative to a reference frame.',
            '**Speed** is a scalar quantity defined as $\\text{Speed} = \\frac{d}{t}$.',
            '**Velocity** is a vector quantity defined as $v = \\frac{\\Delta x}{\\Delta t}$.',
            '**Acceleration** represents the rate of change of velocity: $a = \\frac{v_f - v_i}{t}$.',
            '**Newton\'s Second Law**: Net unbalanced force produces acceleration ($F_{\\text{net}} = ma$).',
        ],
        mainFormula: {
            expression: '$F = m \\cdot a$',
            variables: [
                { label: 'Force (F)', name: 'F', direction: 'down' },
                { label: 'Mass (m)', name: 'm', direction: 'down' },
                { label: 'Accel (a)', name: 'a', direction: 'down' },
            ],
        },
        relatedFormulas: [
            { title: 'Velocity', expression: '$v = \\frac{\\Delta x}{\\Delta t}$', icon: 'Zap' },
            { title: 'Acceleration', expression: '$a = \\frac{v_2 - v_1}{t}$', icon: 'Gauge' },
            { title: 'Kinetic Energy', expression: '$KE = \\frac{1}{2}mv^2$', icon: 'Flame' },
            { title: 'Momentum', expression: '$p = m \\cdot v$', icon: 'Clock' },
        ],
        mindmapNodes: [
            { title: 'Kinematics', desc: 'Describing motion with displacement $\\Delta x$, velocity $v$, and acceleration $a$', icon: 'Compass' },
            { title: 'Dynamics', desc: '**Newton\'s Laws**, net force $\\sum F = ma$, friction, and equilibrium', icon: 'Activity' },
            { title: 'Energy & Work', desc: 'Work-energy theorem ($W = \\Delta KE$) and conservation of momentum', icon: 'Zap' },
        ],
    },
    'biology': {
        title: 'Cell Division & Mitosis',
        subtitle: 'Biology • Cellular Processes',
        conceptText: '**Mitosis** is the process where a single eukaryotic cell divides into **two genetically identical daughter cells** ($2n \\rightarrow 2n$), essential for growth and tissue repair.',
        keyPoints: [
            '**Interphase** ($G_1, S, G_2$) precedes mitosis, replicating DNA and cellular organelles.',
            '**Prophase** condenses chromatin into visible paired sister chromatids.',
            '**Metaphase** aligns chromosomes along the equatorial **metaphase plate**.',
            '**Anaphase** separates sister chromatids toward opposite spindle poles.',
            '**Telophase & Cytokinesis** reform nuclear envelopes and divide the cytoplasm into $2^n$ cells.',
        ],
        mainFormula: {
            expression: '$N = N_0 \\cdot 2^n$',
            variables: [
                { label: 'Initial (N₀)', name: 'N₀', direction: 'down' },
                { label: 'Cycles (n)', name: 'n', direction: 'down' },
                { label: 'Total (N)', name: 'N', direction: 'down' },
            ],
        },
        relatedFormulas: [
            { title: 'Cell Cycle', expression: '$G_1 \\rightarrow S \\rightarrow G_2 \\rightarrow M$', icon: 'Clock' },
            { title: 'Cell Yield', expression: '$N = N_0 \\times 2^n$', icon: 'Activity' },
            { title: 'Mitotic Index', expression: '$MI = \\frac{\\text{Mitotic}}{\\text{Total}}$', icon: 'Percent' },
        ],
        mindmapNodes: [
            { title: 'Interphase (G₁, S, G₂)', desc: '**DNA replication** ($2n \\rightarrow 4c$) and organelle preparation', icon: 'Layers' },
            { title: 'Mitotic Stages (PMAT)', desc: '**Prophase**, **Metaphase**, **Anaphase**, and **Telophase**', icon: 'Grid' },
            { title: 'Cytokinesis', desc: 'Physical cleavage furrow or cell plate division into $2$ daughter cells', icon: 'Split' },
        ],
    },
    'calculus': {
        title: 'Calculus: Derivatives',
        subtitle: 'Mathematics • Differential Calculus',
        conceptText: 'The **derivative** $f\'(x)$ measures the **instantaneous rate of change** of a function or the slope of the tangent line at any point $x$.',
        keyPoints: [
            '**Limit Definition**: $f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$.',
            '**Power Rule**: For $f(x) = x^n$, the derivative is $\\frac{d}{dx}(x^n) = nx^{n-1}$.',
            '**Product Rule**: $(uv)\' = u\'v + uv\'$.',
            '**Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)$.',
            '**Critical Points** occur where $f\'(x) = 0$ or $f\'(x)$ is undefined.',
        ],
        mainFormula: {
            expression: '$\\frac{d}{dx}(x^n) = nx^{n-1}$',
            variables: [
                { label: 'Operator', name: 'd/dx', direction: 'down' },
                { label: 'Base (xⁿ)', name: 'xⁿ', direction: 'down' },
                { label: 'Slope', name: 'nxⁿ⁻¹', direction: 'down' },
            ],
        },
        relatedFormulas: [
            { title: 'Limit Def', expression: '$\\frac{f(x+h)-f(x)}{h}$', icon: 'Zap' },
            { title: 'Chain Rule', expression: '$f\'(g(x)) \\cdot g\'(x)$', icon: 'Activity' },
            { title: 'Quotient', expression: '$\\frac{u\'v - uv\'}{v^2}$', icon: 'Percent' },
        ],
        mindmapNodes: [
            { title: 'Foundations & Limits', desc: 'Instantaneous rate of change via $\\lim_{h \\to 0} \\frac{\\Delta y}{\\Delta x}$', icon: 'Compass' },
            { title: 'Differentiation Rules', desc: '**Power**, **Product**, **Quotient**, and **Chain** rules', icon: 'Zap' },
            { title: 'Optimization & Curve Sketching', desc: 'Finding maxima/minima with $f\'(x) = 0$ and concavity via $f\'\'(x)$', icon: 'Activity' },
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

    // Try live AI summary synthesis first for rich Markdown & LaTeX output
    try {
        const sourcePrompt = extractedText
            ? `Topic: "${cleanTopic}"\nDocument Excerpt:\n${extractedText.slice(0, 3000)}`
            : `Topic: "${cleanTopic}"`;

        const res = await api.post('ai/chat', {
            messages: [
                {
                    role: 'user',
                    content: `Create a structured study summary for the following topic. Use **bold** for key terms and inline LaTeX ($...$) for mathematical or scientific formulas/symbols where appropriate. Return ONLY valid JSON (no markdown code fences) matching this exact structure:
{
  "title": "Concise Title",
  "subtitle": "Subject • Subtopic",
  "conceptText": "2-3 sentence overview using **bold** and $...$ math where appropriate.",
  "keyPoints": ["4-5 bullet strings using **bold** and $...$ inline LaTeX"],
  "mainFormula": {
    "expression": "$LaTeX formula or key relation$",
    "variables": [
      { "label": "Var 1", "name": "x", "direction": "down" },
      { "label": "Var 2", "name": "y", "direction": "down" },
      { "label": "Result", "name": "z", "direction": "down" }
    ]
  },
  "relatedFormulas": [
    { "title": "Formula Name", "expression": "$LaTeX$", "icon": "Zap" }
  ],
  "mindmapNodes": [
    { "title": "Node Title", "desc": "Concise explanation with **bold** or $...$", "icon": "Brain" }
  ]
}

${sourcePrompt}`,
                },
            ],
        });

        const rawReply: string = res.data?.reply || res.data?.message || res.data?.content || '';
        const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.title && parsed.conceptText && Array.isArray(parsed.keyPoints)) {
                const aiResult: AiSummary = {
                    id: generateUUID(),
                    title: parsed.title,
                    subtitle: parsed.subtitle || `Study Guide • ${parsed.title}`,
                    conceptText: parsed.conceptText,
                    keyPoints: parsed.keyPoints,
                    mainFormula: parsed.mainFormula,
                    relatedFormulas: Array.isArray(parsed.relatedFormulas) ? parsed.relatedFormulas : [],
                    mindmapNodes: Array.isArray(parsed.mindmapNodes) ? parsed.mindmapNodes : [],
                    createdAt: Date.now(),
                };
                await saveSummary(aiResult);
                return aiResult;
            }
        }
    } catch {
        // Fall back cleanly to curated/local synthesis if offline or AI endpoint unavailable
    }

    // Check knowledge matches for instant fidelity
    let matchedKnowledge: Partial<AiSummary> | null = null;
    if (lower.includes('motion') || lower.includes('force') || lower.includes('physics')) {
        matchedKnowledge = PRESET_KNOWLEDGE['motion'];
    } else if (lower.includes('cell') || lower.includes('bio') || lower.includes('mitosis')) {
        matchedKnowledge = PRESET_KNOWLEDGE['biology'];
    } else if (lower.includes('calc') || lower.includes('deriv')) {
        matchedKnowledge = PRESET_KNOWLEDGE['calculus'];
    }

    if (matchedKnowledge) {
        const result: AiSummary = {
            id: generateUUID(),
            title: matchedKnowledge.title || cleanTopic,
            subtitle: matchedKnowledge.subtitle || cleanTopic,
            conceptText: matchedKnowledge.conceptText || `**${cleanTopic}** is a fundamental concept requiring mastery of core principles, definitions, and mathematical relationships.`,
            keyPoints: matchedKnowledge.keyPoints || [
                `Understanding the fundamental definition of **${cleanTopic}**.`,
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
            : `**${cleanTopic}** encompasses critical theoretical principles, structured relationships, and core applications essential for academic mastery.`,
        keyPoints: [
            `Core definitions and structural framework of **${cleanTopic}**.`,
            'Fundamental relationships and operational mechanisms.',
            'Standard problem-solving methodologies and formulas.',
            'Common edge cases and high-yield retention takeaways.',
        ],
        mainFormula: {
            expression: '$A \\propto B$',
            variables: [
                { label: 'Input (A)', name: 'A', direction: 'down' },
                { label: 'Rate (k)', name: 'k', direction: 'down' },
                { label: 'Output (B)', name: 'B', direction: 'up' },
            ],
        },
        relatedFormulas: [
            { title: 'Core Principle', expression: '$\\text{Output} = k \\cdot t$', icon: 'Zap' },
            { title: 'Efficiency', expression: '$\\eta = \\frac{W_{\\text{out}}}{E_{\\text{in}}}$', icon: 'Activity' },
            { title: 'Balance', expression: '$\\sum \\text{In} = \\sum \\text{Out}$', icon: 'Check' },
        ],
        mindmapNodes: [
            { title: 'Core Concept', desc: `Essential principles of **${cleanTopic}**`, icon: 'BookOpen' },
            { title: 'Key Mechanisms', desc: 'Step-by-step processes and interactions', icon: 'Layers' },
            { title: 'Exam Focus', desc: 'High-yield definitions and formulas', icon: 'Zap' },
        ],
        createdAt: Date.now(),
    };

    await saveSummary(result);
    return result;
}

