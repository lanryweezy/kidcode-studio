import { useState, useCallback, useEffect, useRef } from 'react';

interface UseBusinessGameProps {
  initialCash: number;
  goal: number;
  tickInterval?: number;
}

interface UseBusinessGameReturn {
  day: number;
  hour: number;
  cash: number;
  goal: number;
  isPaused: boolean;
  speed: number;
  gameOver: boolean;
  notification: string | null;
  setIsPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  addCash: (amount: number) => void;
  spendCash: (amount: number) => boolean;
  showNotification: (msg: string) => void;
  tick: (callback: (state: { day: number; hour: number; speed: number }) => { day?: number; hour?: number }) => void;
}

export const useBusinessGame = ({
  initialCash,
  goal,
  tickInterval = 1000,
}: UseBusinessGameProps): UseBusinessGameReturn => {
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(8);
  const [cash, setCash] = useState(initialCash);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    if (notification) {
      notificationTimeout.current = setTimeout(() => setNotification(null), 2000);
    }
    return () => { if (notificationTimeout.current) clearTimeout(notificationTimeout.current); };
  }, [notification]);

  const addCash = useCallback((amount: number) => {
    setCash(prev => {
      const newVal = prev + amount;
      if (newVal >= goal) setGameOver(true);
      return newVal;
    });
  }, [goal]);

  const spendCash = useCallback((amount: number): boolean => {
    if (cash < amount) {
      setNotification('Not enough cash!');
      return false;
    }
    setCash(prev => prev - amount);
    return true;
  }, [cash]);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
  }, []);

  return {
    day,
    hour,
    cash,
    goal,
    isPaused,
    speed,
    gameOver,
    notification,
    setIsPaused,
    setSpeed,
    addCash,
    spendCash,
    showNotification,
    tick: (callback) => {
      // Intentionally empty - tick logic is in the component
    },
  };
};
