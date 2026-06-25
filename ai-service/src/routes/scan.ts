import { Router } from 'express';
import { streamText } from 'ai';
import { getModel } from '../services/aiProvider';
import { authorizeAndDeduct, refundCredits } from '../services/laravelAuth';
import { randomUUID } from 'crypto';

const router = Router();

router.post('/solve', async (req, res) => {
    let authResult: any = null;
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

        await result.pipeTextStreamToResponse(res);

    } catch (error: any) {
        console.error('Scan solve error:', error);
        
        if (authResult?.success && authResult?.userId) {
            await refundCredits(authResult.userId, idempotencyKey);
        }
        res.status(500).json({ error: 'Failed to process image' });
    }
});

export default router;
