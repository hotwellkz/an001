import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.PUBLIC_ANTHROPIC_API_KEY
});

export async function getAnthropicResponse(message: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
    });
    return response.content[0].text;
  } catch (error) {
    console.error('Anthropic Response Error:', error);
    throw new Error('Failed to get Anthropic response');
  }
}