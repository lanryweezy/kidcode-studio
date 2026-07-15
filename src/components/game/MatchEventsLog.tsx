import React, { useState } from 'react';

interface MatchEvent {
  id: string;
  time: number;
  type: 'goal' | 'foul' | 'card' | 'substitution' | 'period' | 'kick' | 'save';
  text: string;
  team?: 'home' | 'away';
}

interface MatchEventsLogProps {
  events: MatchEvent[];
  maxVisible?: number;
}

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  foul: '⚠️',
  card: '🟨',
  substitution: '🔄',
  period: '⏱️',
  kick: '🦶',
  save: '🧤',
};

export const MatchEventsLog: React.FC<MatchEventsLogProps> = React.memo(({ events, maxVisible = 5 }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleEvents = expanded ? events : events.slice(-maxVisible);

  if (events.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl z-40 max-w-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 text-left text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-between"
      >
        <span>MATCH EVENTS ({events.length})</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      <div className="px-3 pb-2 space-y-1">
        {visibleEvents.map(event => (
          <div key={event.id} className="flex items-center gap-2 text-xs">
            <span>{EVENT_ICONS[event.type] || '📝'}</span>
            <span className="text-slate-300 font-mono">{event.time}'</span>
            <span className={`font-medium ${event.team === 'home' ? 'text-blue-400' : event.team === 'away' ? 'text-red-400' : 'text-white'}`}>
              {event.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export type { MatchEvent };
