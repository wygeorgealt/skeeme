import { Router } from 'express';
import { streamObject } from 'ai';
import { getModel } from '../services/aiProvider';
import { z } from 'zod';
import { authorizeUsage, completeUsage, releaseUsage } from '../services/laravelAuth';
import { randomUUID } from 'crypto';

const router = Router();

// Define Zod schema for quiz generation
const quizSchema = z.object({
    questions: z.array(z.object({
        type: z.enum(['mcq', 'theory']),
        question_text: z.string(),
        options: z.array(z.string()).optional(),
        correct_answer: z.string().optional(),
        explanation: z.string().optional()
    }))
});

/** Write a structured SSE error event when headers are already sent. */
function sendSseError(res: any, code: string) {
    try {
        res.write(`event: error\ndata: ${JSON.stringify({ error: code })}\n\n`);
        res.end();
    } catch (_) { /* response already closed */ }
}

router.post('/generate', async (req, res) => {
    let authResult: any = null;
    let token: string | null = null;
    let headersSent = false;
    const idempotencyKey = req.headers['idempotency-key'] as string || randomUUID();

    try {
        const authHeader = req.headers.authorization;
        token = authHeader ? authHeader.replace('Bearer ', '') : null;
        const { topic, difficulty, provider, extraction_id } = req.body;
        let questionCount = Math.min(Number(req.body.question_count) || 5, 30);

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please log in to generate quizzes.' });
        }

        // M5: Validate topic or document is present before hitting the AI
        if (!topic?.trim() && !extraction_id) {
            return res.status(400).json({ error: 'Please provide a topic or document to generate a quiz.' });
        }

        try {
            authResult = await authorizeUsage(token, 'quiz_generation', idempotencyKey, extraction_id);
            if (!authResult.success) {
                return res.status(authResult.status || 500).json({
                    error: authResult.error || 'Daily usage authorization failed.',
                    code: authResult.code,
                    feature: authResult.feature,
                    limit: authResult.limit,
                    used: authResult.used,
                    reset_at: authResult.resetAt,
                });
            }
        } catch (e: any) {
            return res.status(500).json({ error: 'Usage authorization service is currently unavailable. Please try again shortly.' });
        }
        questionCount = Math.min(questionCount, authResult.maxItems || 30);

        const model = getModel(provider || 'anthropic');
        const finalTopic = authResult.extractedText ? authResult.extractedText : topic;

        const result = streamObject({
            model,
            schema: quizSchema,
            system: `You are an expert tutor generating high-quality quizzes. Create ${questionCount} questions about the topic. Make them ${difficulty} difficulty. Ensure mathematical content uses valid LaTeX.`,
            prompt: `Topic: ${finalTopic}`
        });

        // Mark that we've started streaming so the catch block knows headers are sent
        headersSent = true;
        
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        for await (const partialObject of result.partialObjectStream) {
            res.write(`data: ${JSON.stringify(partialObject)}\n\n`);
        }
        await completeUsage(token, idempotencyKey);
        res.end();

    } catch (error: any) {
        console.error('Quiz generate error:', error);
        if (authResult?.success && authResult?.userId && token) {
            await releaseUsage(token, authResult.userId, idempotencyKey);
        }
        if (headersSent) {
            // C7: Headers already sent — can't send JSON; emit an SSE error event instead
            sendSseError(res, 'stream_interrupted');
        } else {
            res.status(500).json({ error: 'Failed to generate quiz questions. Please check the topic and try again.' });
        }
    }
});

export default router;
