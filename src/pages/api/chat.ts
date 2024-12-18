import type { APIRoute } from 'astro';
import { getOpenAIResponse } from '../../lib/ai/openai';
import type { ChatRequest } from '../../lib/ai/types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json() as ChatRequest;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400
      });
    }
    
    const response = await getOpenAIResponse(message);

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('AI Response Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
      status: 500
    });
  }
}