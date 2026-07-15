import React from 'react';

interface SportsScoreboardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  timer: number;
  period?: string;
  quarter?: number;
  style?: 'football' | 'basketball' | 'tennis' | 'boxing' | 'default';
}

export const SportsScoreboard: React.FC<SportsScoreboardProps> = React.memo(({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  timer,
  period,
  quarter,
  style = 'default',
}) => {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const bgStyle = style === 'boxing' ? 'bg-red-900/90' : 'bg-slate-900/90';
  const accent = style === 'basketball' ? 'text-orange-400' : style === 'tennis' ? 'text-green-400' : style === 'boxing' ? 'text-red-400' : 'text-white';

  return (
    <div className={`absolute top-2 left-1/2 -translate-x-1/2 ${bgStyle} backdrop-blur-md rounded-xl border border-white/20 shadow-2xl z-40 px-6 py-2`}>
      <div className="flex items-center gap-4">
        {/* Home Team */}
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{homeTeam}</div>
          <div className="text-2xl font-black text-white">{homeScore}</div>
        </div>

        {/* Timer */}
        <div className="text-center px-3" aria-live="polite" aria-label={`Time: ${timeStr}`}>
          <div className="text-[9px] text-slate-300 uppercase">{period || (quarter ? `Q${quarter}` : 'Time')}</div>
          <div className={`text-lg font-mono font-black ${accent}`}>{timeStr}</div>
        </div>

        {/* Away Team */}
        <div className="text-left">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{awayTeam}</div>
          <div className="text-2xl font-black text-white">{awayScore}</div>
        </div>
      </div>
    </div>
  );
});
