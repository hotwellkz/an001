import { getOpenAIResponse } from './openai';
import { getAnthropicResponse } from './anthropic';
import { textToSpeech as tts } from './elevenlabs';

export const getAIResponse = getOpenAIResponse;
export const textToSpeech = tts;