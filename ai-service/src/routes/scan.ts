import { Router } from 'express';
import { streamText } from 'ai';
import { getModel } from '../services/aiProvider';
import { authorizeAndDeduct, refundCredits } from '../services/laravelAuth';
import { randomUUID } from 'crypto';

const router = Router();

/** Write a structured SSE error event when headers are already sent. */
function sendSseError(res: any, code: string) {
    try {
        res.write(`event: error\ndata: ${JSON.stringify({ error: code })}\n\n`);
        res.end();
    } catch (_) { /* response already closed */ }
}

router.post('/solve', async (req, res) => {
    let authResult: any = null;
    let headersSent = false;
    const idempotencyKey = req.headers['idempotency-key'] as string || randomUUID();

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        const { image, provider } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        try {
            authResult = await authorizeAndDeduct(token, 'scan_solve', 25, idempotencyKey);
            if (!authResult.success) {
                return res.status(402).json({ error: authResult.error });
            }
        } catch (e: any) {
            return res.status(500).json({ error: 'Authorization service unavailable' });
        }

        const model = getModel(provider || 'anthropic');

        const result = streamText({
            model,
            system: `You are an expert tutor. Solve the problem presented in the image. 
Break down your solution step by step. Use markdown formatting and valid LaTeX for math inside $$ $$ or $ $ blocks.`,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Solve the problem in this image.' },
                        { type: 'image', image: image }
                    ]
                }
            ],
            async onFinish({ text }) {
                console.log(`[scan] Finished streaming (${text.length} chars) for user ${authResult?.userId}`);
            }
        });

        // Mark that we've started streaming so the catch block knows headers are sent
        headersSent = true;
        await result.pipeTextStreamToResponse(res);

    } catch (error: any) {
        console.error('Scan solve error:', error);
        
        if (authResult?.success && authResult?.userId) {
            await refundCredits(authResult.userId, idempotencyKey);
        }
        if (headersSent) {
            // C7: Headers already sent — emit SSE error event instead of JSON
            sendSseError(res, 'stream_interrupted');
        } else {
            res.status(500).json({ error: 'Failed to process image' });
        }
    }
});

router.post('/chat', async (req, res) => {
    let authResult: any = null;
    const idempotencyKey = req.headers['idempotency-key'] as string || randomUUID();

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        const { messages, context, provider } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        try {
            // Check authorization but we don't deduct credits yet (handled by frontend limits or separate pricing)
            authResult = await authorizeAndDeduct(token, 'scan_chat', 0, idempotencyKey);
            if (!authResult.success) {
                return res.status(402).json({ error: authResult.error });
            }
        } catch (e: any) {
            return res.status(500).json({ error: 'Authorization service unavailable' });
        }

        const model = getModel(provider || 'anthropic');

        const result = streamText({
            model,
            system: `You are an expert tutor helping a student with a problem they scanned.
Here is the context of the problem and the initial solution provided:
${context || 'No context provided.'}

Answer the user's follow-up questions clearly and concisely. Use markdown and valid LaTeX for math.`,
            messages
        });

        await result.pipeTextStreamToResponse(res);

    } catch (error: any) {
        console.error('Scan chat error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

export default router;
