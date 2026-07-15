import React, { useState, useEffect, useRef } from 'react';

export type TransitionType = 'fade' | 'slide_left' | 'slide_right' | 'slide_up' | 'slide_down' | 'zoom_in' | 'zoom_out' | 'dissolve' | 'wipe';

interface ScreenTransitionProps {
  type: TransitionType;
  duration?: number;
  color?: string;
  isActive: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  type,
  duration = 500,
  color = '#000',
  isActive,
  onComplete,
  children,
}) => {
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [showContent, setShowContent] = useState(true);
  const timerRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      setPhase('out');
      setShowContent(false);
      timerRef.current = window.setTimeout(() => {
        setPhase('in');
        setShowContent(true);
        timerRef.current = window.setTimeout(() => {
          setPhase('idle');
          onComplete?.();
        }, duration / 2);
      }, duration / 2);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive, duration, onComplete]);

  if (phase === 'idle') return <>{children}</>;

  const halfDur = duration / 2;

  const getOverlayStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      zIndex: 100,
      pointerEvents: 'all',
    };

    switch (type) {
      case 'fade':
        return { ...base, backgroundColor: color, opacity: phase === 'out' ? 1 : 0, transition: `opacity ${halfDur}ms ease-in-out` };
      case 'slide_left':
        return { ...base, backgroundColor: color, transform: phase === 'out' ? 'translateX(0)' : 'translateX(-100%)', transition: `transform ${halfDur}ms ease-in-out` };
      case 'slide_right':
        return { ...base, backgroundColor: color, transform: phase === 'out' ? 'translateX(0)' : 'translateX(100%)', transition: `transform ${halfDur}ms ease-in-out` };
      case 'slide_up':
        return { ...base, backgroundColor: color, transform: phase === 'out' ? 'translateY(0)' : 'translateY(-100%)', transition: `transform ${halfDur}ms ease-in-out` };
      case 'slide_down':
        return { ...base, backgroundColor: color, transform: phase === 'out' ? 'translateY(0)' : 'translateY(100%)', transition: `transform ${halfDur}ms ease-in-out` };
      case 'zoom_in':
        return { ...base, backgroundColor: color, transform: phase === 'out' ? 'scale(0)' : 'scale(1)', transition: `transform ${halfDur}ms ease-in-out`, borderRadius: '50%' };
      case 'zoom_out':
        return { ...base, backgroundColor: color, transform: phase === 'out' ? 'scale(2)' : 'scale(1)', transition: `transform ${halfDur}ms ease-in-out`, borderRadius: '50%' };
      case 'wipe':
        return { ...base, backgroundColor: color, clipPath: phase === 'out' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 0)', transition: `clip-path ${halfDur}ms ease-in-out` };
      case 'dissolve':
        return { ...base, backgroundColor: color, opacity: phase === 'out' ? 1 : 0, filter: `blur(${phase === 'out' ? 10 : 0}px)`, transition: `all ${halfDur}ms ease-in-out` };
      default:
        return { ...base, backgroundColor: color, opacity: phase === 'out' ? 1 : 0, transition: `opacity ${halfDur}ms` };
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {showContent && children}
      <div style={getOverlayStyle()} />
    </div>
  );
};

export const TRANSITION_PRESETS: { type: TransitionType; label: string; emoji: string }[] = [
  { type: 'fade', label: 'Fade', emoji: '🌅' },
  { type: 'slide_left', label: 'Slide Left', emoji: '➡️' },
  { type: 'slide_right', label: 'Slide Right', emoji: '⬅️' },
  { type: 'slide_up', label: 'Slide Up', emoji: '⬆️' },
  { type: 'slide_down', label: 'Slide Down', emoji: '⬇️' },
  { type: 'zoom_in', label: 'Zoom In', emoji: '🔍' },
  { type: 'zoom_out', label: 'Zoom Out', emoji: '🔎' },
  { type: 'wipe', label: 'Wipe', emoji: '🧹' },
  { type: 'dissolve', label: 'Dissolve', emoji: '💫' },
];
