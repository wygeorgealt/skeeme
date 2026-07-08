import { Router } from 'express';
import { streamObject } from 'ai';
import { getModel } from '../services/aiProvider';
import { z } from 'zod';
import { authorizeAndDeduct, refundCredits } from '../services/laravelAuth';
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
    let headersSent = false;
    const idempotencyKey = req.headers['idempotency-key'] as string || randomUUID();

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        const { topic, difficulty, question_count = 5, provider, extraction_id } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // M5: Validate topic or document is present before hitting the AI
        if (!topic?.trim() && !extraction_id) {
            return res.status(400).json({ error: 'topic or document is required' });
        }

        const cost = question_count * 10;

        try {
            authResult = await authorizeAndDeduct(token, 'quiz_generation', cost, idempotencyKey, extraction_id);
            if (!authResult.success) {
                return res.status(authResult.status || 402).json({ error: authResult.error });
            }
        } catch (e: any) {
            return res.status(500).json({ error: 'Authorization service unavailable' });
        }

        const model = getModel(provider || 'anthropic');
        const finalTopic = authResult.extractedText ? authResult.extractedText : topic;

        const result = streamObject({
            model,
            schema: quizSchema,
            system: `You are an expert tutor generating high-quality quizzes. Create ${question_count} questions about the topic. Make them ${difficulty} difficulty. Ensure mathematical content uses valid LaTeX.`,
            prompt: `Topic: ${finalTopic}`
        });

        // Mark that we've started streaming so the catch block knows headers are sent
        headersSent = true;
        await result.pipeTextStreamToResponse(res);

    } catch (error: any) {
        console.error('Quiz generate error:', error);
        if (authResult?.success && authResult?.userId) {
            await refundCredits(authResult.userId, idempotencyKey);
        }
        if (headersSent) {
            // C7: Headers already sent — can't send JSON; emit an SSE error event instead
            sendSseError(res, 'stream_interrupted');
        } else {
            res.status(500).json({ error: 'Failed to generate quiz' });
        }
    }
});

export default router;
