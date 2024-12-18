import React, { useEffect, useState } from 'react';
import '../styles/Notification.css';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {type === 'success' && <span className="icon">✅</span>}
        {type === 'error' && <span className="icon">❌</span>}
        {type === 'info' && <span className="icon">ℹ️</span>}
        <p>{message}</p>
      </div>
    </div>
  );
}