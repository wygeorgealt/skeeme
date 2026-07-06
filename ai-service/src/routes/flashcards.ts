import { Router } from 'express';
import { streamObject } from 'ai';
import { getModel } from '../services/aiProvider';
import { z } from 'zod';
import { authorizeAndDeduct, refundCredits } from '../services/laravelAuth';
import { randomUUID } from 'crypto';

const router = Router();

const flashcardSchema = z.array(z.object({
    front: z.string(),
    back: z.string(),
    hint: z.string().optional()
}));

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
        const { topic, difficulty, deck_id, provider, extraction_id } = req.body;

        // m5: Cap card_count server-side — mirror the client clamp so API callers can't bypass it
        const card_count = Math.min(Number(req.body.card_count) || 10, 30);

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cost = card_count * 5; // 5 credits per card

        try {
            authResult = await authorizeAndDeduct(token, 'flashcard_generation', cost, idempotencyKey, extraction_id);
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
            schema: flashcardSchema,
            system: `You are an expert tutor creating high-quality flashcards for studying. Create ${card_count} flashcards about the topic. Make them ${difficulty} difficulty. Each card should have a clear question on the front and a comprehensive answer on the back. Use valid LaTeX for any mathematical content.`,
            prompt: `Topic: ${finalTopic}`
        });

        // Mark that we've started streaming so the catch block knows headers are sent
        headersSent = true;
        await result.pipeTextStreamToResponse(res);

    } catch (error: any) {
        console.error('Flashcard generate error:', error);
        if (authResult?.success && authResult?.userId) {
            await refundCredits(authResult.userId, idempotencyKey);
        }
        if (headersSent) {
            // C7: Headers already sent — emit an SSE error event instead of JSON
            sendSseError(res, 'stream_interrupted');
        } else {
            res.status(500).json({ error: 'Failed to generate flashcards' });
        }
    }
});

export default router;
