import OpenAI from 'openai';
import { AI_SYSTEM_PROMPT } from './constants';
import { formatErrorResponse } from './utils';

const openai = new OpenAI({
  apiKey: import.meta.env.PUBLIC_OPENAI_API_KEY
});

export async function getOpenAIResponse(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: AI_SYSTEM_PROMPT
        },
        { role: 'user', content: message }
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Response Error:', error);
    throw new Error(formatErrorResponse(error));
  }
}