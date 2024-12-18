import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import GiftAnimation from './GiftAnimation';
import Notification from './Notification';
import { getUserTokens } from '../utils/firebaseHelpers';
import '../styles/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  type: 'login' | 'register';
  onClose: () => void;
}

export default function AuthModal({ isOpen, type, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showGift, setShowGift] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const { setUser, setTokens } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (type === 'register') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          tokens: 100,
          createdAt: new Date(),
        });
        setUser(user);
        setTokens(100);
        setShowNotification(true);
        setShowGift(true);
        setTimeout(() => {
          setShowGift(false);
          onClose();
        }, 3000);
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const tokens = await getUserTokens(user.uid);
        setUser(user);
        setTokens(tokens);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        
        <h2>{type === 'login' ? 'Вход' : 'Регистрация'}</h2>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          <button type="submit" className="btn btn-primary">
            {type === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        {showGift && <GiftAnimation />}
        {showNotification && (
          <Notification
            message="Поздравляем! Вам начислено 100 токенов за регистрацию"
            type="success"
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>
    </div>
  );
}