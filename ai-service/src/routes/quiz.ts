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

router.post('/generate', async (req, res) => {
    let authResult: any = null;
    const idempotencyKey = req.headers['idempotency-key'] as string || randomUUID();

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        const { topic, difficulty, question_count = 5, provider, extraction_id } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cost = question_count * 10;

        try {
            authResult = await authorizeAndDeduct(token, 'quiz_generation', cost, idempotencyKey, extraction_id);
            if (!authResult.success) {
                return res.status(402).json({ error: authResult.error });
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

        await result.pipeTextStreamToResponse(res);

    } catch (error: any) {
        console.error('Quiz generate error:', error);
        if (authResult?.success && authResult?.userId) {
            await refundCredits(authResult.userId, idempotencyKey);
        }
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

export default router;
