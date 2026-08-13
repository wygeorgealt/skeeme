import { Router } from 'express';
import { streamText } from 'ai';
import { getModel } from '../services/aiProvider';
import { authorizeAndDeduct, refundCredits } from '../services/laravelAuth';
import { randomUUID } from 'crypto';
import axios from 'axios';
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
            return res.status(401).json({ error: 'Authentication required. Please log in to solve problems.' });
        }

        if (!image) {
            return res.status(400).json({ error: 'Image is required. Please capture or upload a clear photo of the problem.' });
        }

        try {
            authResult = await authorizeAndDeduct(token, 'scan_solve', 25, idempotencyKey);
            if (!authResult.success) {
                return res.status(authResult.status || 402).json({ 
                    error: authResult.error || 'You do not have enough credits to solve this scan. Please refill or upgrade.' 
                });
            }
        } catch (e: any) {
            return res.status(500).json({ error: 'Credit authorization service is currently unavailable. Please try again shortly.' });
        }

        const model = getModel(provider || 'anthropic');

        let finalMessages: any[] = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Solve the problem in this image.' },
                    { type: 'image', image: image }
                ]
            }
        ];

        // Deepseek is text-only, so we MUST extract text from the image first using Google Vision OCR
        if (provider === 'deepseek') {
            const googleVisionKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
            if (!googleVisionKey) {
                throw new Error('Google Cloud Vision API Key is missing for Deepseek fallback.');
            }
            
            const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
            const visionRes = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${googleVisionKey}`, {
                requests: [
                    {
                        image: { content: base64Data },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                    }
                ]
            });
            
            const extractedText = visionRes.data.responses?.[0]?.fullTextAnnotation?.text || '';
            if (!extractedText.trim()) {
                throw new Error('Could not read any text from the image. Please try a clearer photo.');
            }
            
            finalMessages = [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Solve the problem from this extracted text:\n\n' + extractedText }
                    ]
                }
            ];
        }

        const result = streamText({
            model,
            system: `You are an expert tutor. Solve the problem presented in the image. 
Break down your solution step by step. Use markdown formatting and valid LaTeX for math inside $$ $$ or $ $ blocks.

CRITICAL INSTRUCTION: Ensure your final "solution" exactly matches the logical conclusion of your "steps". Do not contradict yourself or hallucinate a different final answer.

You MUST respond with a valid JSON object in exactly this format:
{
  "results": [
    {
      "question": "The question text from the image",
      "solution": "The final solution/answer",
      "steps": ["Step 1 explanation", "Step 2 explanation"],
      "type": "theory", 
      "topic": "The main topic",
      "explanation": "Detailed explanation of the concept"
    }
  ]
}
Do not include any other text outside the JSON block.`,
            messages: finalMessages,
            async onFinish({ text }) {
                console.log(`[scan] Finished streaming (${text.length} chars) for user ${authResult?.userId}`);
            }
        });

        // Mark that we've started streaming so the catch block knows headers are sent
        headersSent = true;
        
        // React Native doesn't support raw streaming fetch, so we MUST send standard SSE format
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of result.textStream) {
            // Write each text chunk as a data event
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        
        // Signal completion
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error: any) {
        console.error('Scan solve error:', error);
        
        if (authResult?.success && authResult?.userId) {
            await refundCredits(authResult.userId, idempotencyKey);
        }
        if (headersSent) {
            // C7: Headers already sent — emit SSE error event instead of JSON
            sendSseError(res, 'stream_interrupted');
        } else {
            res.status(500).json({ error: error.message || 'Failed to process and solve image. Please try taking a clearer picture.' });
        }
    }
});

router.post('/chat', async (req, res) => {
    let authResult: any = null;
    let headersSent = false;
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
            authResult = await authorizeAndDeduct(token, 'scan_chat', 0, idempotencyKey);
            if (!authResult.success) {
                return res.status(authResult.status || 402).json({ error: authResult.error });
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

        headersSent = true;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of result.textStream) {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error: any) {
        console.error('Scan chat error:', error);
        
        if (headersSent) {
            sendSseError(res, 'stream_interrupted');
        } else {
            res.status(500).json({ error: 'Failed to process chat' });
        }
    }
});

export default router;
