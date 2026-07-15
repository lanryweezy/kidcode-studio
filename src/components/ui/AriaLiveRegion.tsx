import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';

interface LiveRegionContextType {
  announceGameEvent: (message: string, priority?: 'polite' | 'assertive') => void;
  announceBlockChange: (action: 'added' | 'removed' | 'moved', blockType: string, position?: number) => void;
  announceGameState: (state: Record<string, unknown>) => void;
  announceError: (message: string) => void;
  announceScore: (score: number, label?: string) => void;
  announceHealth: (current: number, maximum: number) => void;
  announceLevel: (level: number) => void;
}

const LiveRegionContext = createContext<LiveRegionContextType>({
  announceGameEvent: () => {},
  announceBlockChange: () => {},
  announceGameState: () => {},
  announceError: () => {},
  announceScore: () => {},
  announceHealth: () => {},
  announceLevel: () => {},
});

export function useGameAnnouncer() {
  return useContext(LiveRegionContext);
}

export const AriaLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (priority === 'assertive') {
      setAssertiveMessage('');
      requestAnimationFrame(() => setAssertiveMessage(message));
    } else {
      setPoliteMessage('');
      requestAnimationFrame(() => setPoliteMessage(message));
    }

    timeoutRef.current = setTimeout(() => {
      setPoliteMessage('');
      setAssertiveMessage('');
    }, 5000);
  }, []);

  const announceGameEvent = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, [announce]);

  const announceBlockChange = useCallback((action: 'added' | 'removed' | 'moved', blockType: string, position?: number) => {
    const posText = position !== undefined ? ` at position ${position}` : '';
    const message = `${blockType} block ${action}${posText}`;
    announce(message, 'polite');
  }, [announce]);

  const announceGameState = useCallback((state: Record<string, unknown>) => {
    const parts: string[] = [];
    if (typeof state.score === 'number') parts.push(`Score: ${state.score}`);
    if (typeof state.health === 'number') parts.push(`Health: ${state.health}`);
    if (typeof state.level === 'number') parts.push(`Level ${state.level}`);
    if (typeof state.lives === 'number') parts.push(`${state.lives} lives remaining`);
    if (typeof state.coins === 'number') parts.push(`${state.coins} coins`);

    if (parts.length > 0) {
      const message = parts.join('. ');
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      setStatusMessage('');
      requestAnimationFrame(() => setStatusMessage(message));
      statusTimeoutRef.current = setTimeout(() => setStatusMessage(''), 3000);
    }
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceScore = useCallback((score: number, label?: string) => {
    const text = label ? `${label}: ${score}` : `Score: ${score}`;
    announce(text, 'polite');
  }, [announce]);

  const announceHealth = useCallback((current: number, maximum: number) => {
    const percent = Math.round((current / maximum) * 100);
    const text = `Health: ${current} of ${maximum}, ${percent}%`;
    announce(text, 'polite');
  }, [announce]);

  const announceLevel = useCallback((level: number) => {
    announce(`Level ${level}`, 'polite');
  }, [announce]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  return (
    <LiveRegionContext.Provider value={{
      announceGameEvent,
      announceBlockChange,
      announceGameState,
      announceError,
      announceScore,
      announceHealth,
      announceLevel,
    }}>
      {children}

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>

      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>
    </LiveRegionContext.Provider>
  );
};

export interface AriaLiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  priority = 'polite',
  className = '',
}) => {
  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  );
};
