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

    // Default to Anthropic Claude
    return anthropic('claude-sonnet-4-20250514');
}
