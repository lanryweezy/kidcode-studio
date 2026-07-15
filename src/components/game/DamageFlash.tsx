import React, { useState, useEffect } from 'react';

interface DamageFlashProps {
  active: boolean;
  color?: string;
  duration?: number;
}

export const DamageFlash: React.FC<DamageFlashProps> = ({
  active,
  color = 'rgba(239, 68, 68, 0.3)',
  duration = 200,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 animate-pulse"
      style={{
        backgroundColor: color,
        animation: `flash ${duration}ms ease-out`,
      }}
    />
  );
};
