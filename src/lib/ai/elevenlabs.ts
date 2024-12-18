import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Volume2, Loader } from 'lucide-react';
import '../styles/AIChat.css';
import { formatErrorResponse } from './utils';
import Voice from 'elevenlabs-node';

const voice = new Voice({
  apiKey: import.meta.env.PUBLIC_ELEVENLABS_API_KEY
});

const VOICE_CONFIG = {
  voiceId: 'your_voice_id_here',
  model: 'eleven_multilingual_v2'
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start notification interval when component mounts
    chatInterval.current = setInterval(() => {
      if (!isOpen) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }, 60000); // Every minute

    return () => {
      if (chatInterval.current) {
        clearInterval(chatInterval.current);
      }
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAI: false,
      timestamp: formatTime(new Date()),
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isAI: true,
        timestamp: formatTime(new Date()),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Извините, произошла ошибка. Попробуйте позже.',
        isAI: true,
        timestamp: formatTime(new Date()),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (text: string) => {
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to get audio');
      const audioBuffer = await response.arrayBuffer();

      if (audioBuffer) {
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
        
        // Очистка URL после воспроизведения
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <>
      <div className={`ai-chat ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>ИИ-наставник</h3>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="messages">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.isAI ? 'ai' : 'user'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                {message.isAI && (
                  <button
                    className="play-audio"
                    onClick={() => playAudio(message.text)}
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
              <span className="timestamp">
                {message.timestamp}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="loading">
                <Loader className="spin" size={20} />
                <span>ИИ печатает...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задайте вопрос..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Отправить
          </button>
        </form>
      </div>

      {!isOpen && (
        <button
          className={`chat-toggle ${showNotification ? 'notification' : ''}`}
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={24} />
        </button>
      )}
    </>
  );
}

export async function textToSpeech(text: string) {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    if (!import.meta.env.PUBLIC_ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key is not configured');
    }

    const audioResponse = await voice.textToSpeech({
      text,
      ...VOICE_CONFIG
    });
    
    if (!audioResponse || audioResponse.byteLength === 0) {
      throw new Error('No audio data received from ElevenLabs');
    }

    return audioResponse;
  } catch (error) {
    console.error('Text to Speech Error:', error);
    throw new Error(formatErrorResponse(error));
  }
}