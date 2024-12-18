import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import GiftAnimation from './GiftAnimation';
import Notification from './Notification';
import '../styles/AuthForms.css';

export default function RegisterForm() {
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
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error">{error}</div>}
      
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
        Зарегистрироваться
      </button>

      {showGift && <GiftAnimation />}
      {showNotification && (
        <Notification
          message="Поздравляем! Вам начислено 100 токенов за регистрацию"
          type="success"
          onClose={() => setShowNotification(false)}
        />
      )}
    </form>
  );
}