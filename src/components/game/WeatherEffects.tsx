import React, { useEffect, useRef } from 'react';

interface WeatherEffectsProps {
  weather: string;
  width: number;
  height: number;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  wobble?: number;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weather, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (weather === 'none' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    const count = weather === 'rain' ? 100 : weather === 'snow' ? 60 : weather === 'ash' ? 40 : weather === 'fireflies' ? 20 : 30;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 2 + Math.random() * 4,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      wobble: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;

        switch (weather) {
          case 'rain':
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 2, p.y + 10);
            ctx.stroke();
            p.y += p.speed * 2;
            p.x -= 1;
            break;

          case 'snow':
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed * 0.5;
            p.x += Math.sin(p.wobble || 0) * 0.5;
            p.wobble = (p.wobble || 0) + 0.02;
            break;

          case 'fog':
            ctx.fillStyle = `rgba(200, 200, 200, ${p.opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 20, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.speed * 0.2;
            p.y += Math.sin(p.wobble || 0) * 0.3;
            p.wobble = (p.wobble || 0) + 0.01;
            break;

          case 'storm':
            // Rain + lightning flash
            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 3, p.y + 15);
            ctx.stroke();
            p.y += p.speed * 3;
            p.x -= 2;
            break;

          case 'ash':
            ctx.fillStyle = '#78716c';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed * 0.3;
            p.x += Math.sin(p.wobble || 0) * 1;
            p.wobble = (p.wobble || 0) + 0.03;
            break;

          case 'fireflies':
            const glow = (Math.sin(Date.now() * 0.005 + p.x) + 1) / 2;
            ctx.fillStyle = `rgba(250, 204, 21, ${glow * p.opacity})`;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fill();
            p.x += Math.sin(p.wobble || 0) * 0.8;
            p.y += Math.cos(p.wobble || 0) * 0.5;
            p.wobble = (p.wobble || 0) + 0.02;
            break;

          case 'wind':
            ctx.strokeStyle = `rgba(148, 163, 184, ${p.opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 20, p.y);
            ctx.stroke();
            p.x += p.speed * 2;
            p.y += Math.sin(p.wobble || 0) * 2;
            p.wobble = (p.wobble || 0) + 0.05;
            break;

          case 'meteor_shower':
            ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 8, p.y + 16);
            ctx.stroke();
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
            ctx.beginPath();
            ctx.arc(p.x + 4, p.y + 8, 1, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed * 4;
            p.x += p.speed * 1.5;
            break;

          case 'aurora':
            const auroraHue = (Date.now() * 0.01 + p.x * 0.1) % 360;
            ctx.fillStyle = `hsla(${auroraHue}, 70%, 60%, ${p.opacity * 0.15})`;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size * 40, p.size * 8, 0, 0, Math.PI * 2);
            ctx.fill();
            p.x += Math.sin(p.wobble || 0) * 0.3;
            p.y += Math.cos(p.wobble || 0) * 0.2;
            p.wobble = (p.wobble || 0) + 0.01;
            break;

          case 'space_dust':
            ctx.fillStyle = `rgba(147, 197, 253, ${p.opacity * 0.6})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.speed * 0.3;
            p.y += Math.sin(p.wobble || 0) * 0.4;
            p.wobble = (p.wobble || 0) + 0.015;
            break;
        }

        // Reset particles that go off screen
        if (p.y > height + 20) { p.y = -10; p.x = Math.random() * width; }
        if (p.x > width + 20) { p.x = -10; p.y = Math.random() * height; }
        if (p.x < -20) { p.x = width + 10; }

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [weather, width, height]);

  if (weather === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-20"
    />
  );
};
