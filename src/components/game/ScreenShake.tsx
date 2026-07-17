import React, { useState, useEffect } from 'react';

interface ScreenShakeProps {
  active: boolean;
  intensity?: number;
  duration?: number;
  children: React.ReactNode;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  active,
  intensity = 5,
  duration = 300,
  children,
}) => {
  const [shake, setShake] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) {
      setShake({ x: 0, y: 0 });
      return;
    }

    const startTime = Date.now();
    let frameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        setShake({ x: 0, y: 0 });
        return;
      }

      const decay = 1 - elapsed / duration;
      const x = (Math.random() - 0.5) * intensity * decay * 2;
      const y = (Math.random() - 0.5) * intensity * decay * 2;
      setShake({ x, y });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [active, intensity, duration]);

  return (
    <div
      className="w-full h-full"
      style={{
        transform: `translate(${shake.x}px, ${shake.y}px)`,
      }}
    >
      {children}
    </div>
  );
};
