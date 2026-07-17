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
  setIsPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  advanceTime: (hours: number) => void;
}

export const useGameLoop = ({
  tickRate = 1000,
  onTick,
}: UseGameLoopProps): UseGameLoopReturn => {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTickRef = useRef(onTick);
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const dt = 0.1 * speed;
      advanceTime(dt);
      onTickRef.current(dt, speed);
    }, tickRate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, speed, tickRate, advanceTime]);

  return {
    isPaused,
    speed,
    day,
    hour,
    setIsPaused,
    setSpeed,
    advanceTime,
  };
};
