export interface AIResponse {
  response: string;
  error?: string;
}

export interface TextToSpeechRequest {
  text: string;
}

export interface ChatRequest {
  message: string;
}