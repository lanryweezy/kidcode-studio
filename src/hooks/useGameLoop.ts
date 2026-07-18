import { useState, useCallback, useEffect, useRef } from 'react';

interface UseGameLoopProps {
  tickRate?: number;
  onTick: (dt: number, speed: number) => void;
}

interface UseGameLoopReturn {
  isPaused: boolean;
  speed: number;
  day: number;
  hour: number;
  fps: number;
  showFPS: boolean;
  setIsPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  setShowFPS: (show: boolean) => void;
  advanceTime: (hours: number) => void;
}

const FIXED_DT = 1000 / 60;
const MAX_DELTA = 250;

export const useGameLoop = ({
  tickRate = 1000,
  onTick,
}: UseGameLoopProps): UseGameLoopReturn => {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(8);
  const [fps, setFps] = useState(0);
  const [showFPS, setShowFPS] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(0);
  const onTickRef = useRef(onTick);
  const tickAccumulatorRef = useRef(0);
  onTickRef.current = onTick;

  const advanceTime = useCallback((hours: number) => {
    setHour(prev => {
      const newHour = prev + hours;
      if (newHour >= 24) {
        setDay(d => d + 1);
        return newHour - 24;
      }
      return newHour;
    });
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;

    const loop = (time: number) => {
      if (isPaused) return;

      let delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (delta > MAX_DELTA) delta = MAX_DELTA;

      accumulatorRef.current += delta;
      frameCountRef.current++;
      fpsTimerRef.current += delta;

      if (fpsTimerRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimerRef.current -= 1000;
      }

      let steps = 0;
      while (accumulatorRef.current >= FIXED_DT && steps < 5) {
        const dt = 0.1 * speed;
        advanceTime(dt);
        onTickRef.current(dt, speed);
        accumulatorRef.current -= FIXED_DT;
        steps++;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, speed, tickRate, advanceTime]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return {
    isPaused,
    speed,
    day,
    hour,
    fps,
    showFPS,
    setIsPaused,
    setSpeed,
    setShowFPS,
    advanceTime,
  };
};
