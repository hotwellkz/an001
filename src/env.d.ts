/// <reference path="../.astro/types.d.ts" />
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Volume2, Loader } from 'lucide-react';
import '../styles/AIChat.css';

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
    const startNotificationInterval = () => {
      if (chatInterval.current) return;
      
      chatInterval.current = setInterval(() => {
        if (!isOpen) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        }
      }, 60000);
    };

    startNotificationInterval();

    return () => {
      if (chatInterval.current) {
        clearInterval(chatInterval.current);
        chatInterval.current = undefined;
      }
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
        text: data.response || 'Извините, произошла ошибка.',
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
    if (!text) return;
    
    const button = document.querySelector('.play-audio') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.classList.add('loading');
    }

    try {
      // Show loading state for the audio button
      const audioButton = document.querySelector('.playing-audio');
      if (audioButton) audioButton.classList.add('loading');

      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get audio');
      }
      
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        throw new Error('Invalid audio data received');
      }

      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onerror = () => {
        throw new Error('Failed to play audio');
      };
      
      await audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (button) {
          button.disabled = false;
          button.classList.remove('loading');
        }
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      // Show error message to user
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Не удалось воспроизвести аудио. Попробуйте позже.',
        isAI: true,
        timestamp: formatTime(new Date()),
      }]);
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
      }
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