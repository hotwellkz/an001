import type { APIRoute } from 'astro';
import { textToSpeech } from '../../lib/ai/elevenlabs';
import type { TextToSpeechRequest } from '../../lib/ai/types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json() as TextToSpeechRequest;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400
      });
    }

    const audioResponse = await textToSpeech(text);

    return new Response(audioResponse, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });
  } catch (error) {
    console.error('Text to Speech Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to convert text to speech' }), {
      status: 500
    });
  }
}