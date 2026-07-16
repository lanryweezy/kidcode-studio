import React from 'react';

interface SportsScoreboardSettingsProps {
  homeTeam: string;
  awayTeam: string;
  matchDuration: number;
  periods: string[];
  onUpdate: (settings: Partial<SportsScoreboardSettingsProps>) => void;
}

export const SportsScoreboardSettings: React.FC<SportsScoreboardSettingsProps> = ({
  homeTeam,
  awayTeam,
  matchDuration,
  periods,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-300 uppercase">Match Settings</div>
      
      <div className="space-y-2">
        <label className="block text-xs text-slate-500">Home Team</label>
        <input
          type="text"
          value={homeTeam}
          onChange={e => onUpdate({ homeTeam: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs text-slate-500">Away Team</label>
        <input
          type="text"
          value={awayTeam}
          onChange={e => onUpdate({ awayTeam: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs text-slate-500">Duration (seconds)</label>
        <input
          type="number"
          value={matchDuration}
          onChange={e => onUpdate({ matchDuration: Number(e.target.value) })}
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs text-slate-500">Periods</label>
        <div className="flex flex-wrap gap-1">
          {periods.map(p => (
            <span key={p} className="px-2 py-1 bg-slate-700 rounded text-xs text-white">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
