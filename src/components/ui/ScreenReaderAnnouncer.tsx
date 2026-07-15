import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextType>({ announce: () => {} });

export function useAnnouncer() {
  return useContext(AnnouncerContext);
}

export function AnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
    }, 3000);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}
