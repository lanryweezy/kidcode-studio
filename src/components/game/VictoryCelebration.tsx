import React, { useEffect, useRef } from 'react';

interface VictoryCelebrationProps {
  active: boolean;
  duration?: number;
}

interface Confetti {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

const CONFETTI_COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({ active, duration = 3000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti
    const confetti: Confetti[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 5 + Math.random() * 10,
      speedX: (Math.random() - 0.5) * 4,
      speedY: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.fillStyle = c.color;

        if (c.shape === 'rect') {
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Update position
        c.x += c.speedX;
        c.y += c.speedY;
        c.speedY += 0.1; // gravity
        c.rotation += c.rotationSpeed;

        // Reset if off screen
        if (c.y > canvas.height + 20) {
          c.y = -20;
          c.x = Math.random() * canvas.width;
          c.speedY = 2 + Math.random() * 4;
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
    />
  );
};
