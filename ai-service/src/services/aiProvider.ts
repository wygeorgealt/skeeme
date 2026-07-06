import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Returns the appropriate AI model based on the provider config.
 * Deepseek uses the OpenAI-compatible SDK since it follows the same API format.
 */
export function getModel(provider: 'anthropic' | 'deepseek' = 'anthropic') {
    if (provider === 'deepseek') {
        const deepseek = createOpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com',
        });
        return deepseek('deepseek-chat');
    }

    if (provider !== 'anthropic') {
        // m4: Unknown provider — log and fall back gracefully instead of passing invalid value
        console.warn(`[aiProvider] Unknown provider "${provider}", falling back to anthropic.`);
    }

    // Default to Anthropic Claude
    return anthropic('claude-sonnet-4-20250514');
}
