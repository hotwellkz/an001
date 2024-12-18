import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import AuthModal from './AuthModal';
import { Menu, X } from 'lucide-react';
import '../styles/Header.css';

export default function Header() {
  const { user, tokens, clearAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    clearAuth();
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav-header">
          <a href="/" className="logo">
            Бизнес Аналитик
          </a>

          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <a href="/program" className="nav-link">Программа</a>
            
            {user ? (
              <>
                <div className="tokens">
                  <span className="token-icon">🪙</span>
                  <span className="token-amount">{tokens}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="btn btn-secondary"
                >
                  Вход
                </a>
                <a
                  href="/register"
                  className="btn btn-primary"
                >
                  Регистрация
                </a>
              </>
            )}
            <div className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}></div>
          </div>
        </nav>
      </div>
    </header>
  );
}