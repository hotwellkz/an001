import React, { useEffect, useState } from 'react';
import '../styles/GiftAnimation.css';

export default function GiftAnimation() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowMessage(true), 500);
  }, []);

  return (
    <div className="gift-animation">
      <div className="gift">🎁</div>
      {showMessage && (
        <div className="message">
          <h3>Поздравляем!</h3>
          <p>Вам начислено 100 токенов</p>
        </div>
      )}
    </div>
  );
}