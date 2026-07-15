import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'text-white', trend, trendValue }) => (
  <div className="bg-slate-800 rounded-xl p-3">
    <div className="flex items-center justify-between">
      <div className="text-slate-400 text-sm">{label}</div>
      {icon && <span className="text-lg">{icon}</span>}
    </div>
    <div className={`font-bold mt-1 ${color}`}>{value}</div>
    {trend && trendValue && (
      <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trendValue}
      </div>
    )}
  </div>
);

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'from-green-500 to-emerald-500',
  height = 8,
  showLabel = false,
  label,
}) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{label || `${value}/${max}`}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="bg-slate-700 rounded-full overflow-hidden" style={{ height }}>
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface GameTopBarProps {
  day?: number;
  time?: string;
  cash: number;
  reputation?: number;
  onPause: () => void;
  onExit: () => void;
  isPaused: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  extraStats?: React.ReactNode;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  day,
  time,
  cash,
  reputation,
  onPause,
  onExit,
  isPaused,
  speed,
  onSpeedChange,
  extraStats,
}) => (
  <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
    <div className="flex items-center gap-4">
      <button onClick={onExit} className="text-slate-400 hover:text-white text-lg">🏠</button>
      {day !== undefined && <span className="text-white font-bold">Day {day}</span>}
      {time && <span className="text-slate-400 text-sm">⏰ {time}</span>}
    </div>
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className="text-green-400 font-bold">${cash.toLocaleString()}</div>
        <div className="text-slate-500 text-xs">Cash</div>
      </div>
      {reputation !== undefined && (
        <div className="text-center">
          <div className="text-yellow-400 font-bold">⭐ {reputation}</div>
          <div className="text-slate-500 text-xs">Reputation</div>
        </div>
      )}
      {extraStats}
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onPause} className="px-3 py-1 bg-slate-800 text-white rounded-lg text-sm">
        {isPaused ? '▶️' : '⏸️'}
      </button>
      <select value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} className="bg-slate-800 text-white rounded-lg px-2 py-1 text-sm">
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={5}>5x</option>
        <option value={10}>10x</option>
      </select>
    </div>
  </div>
);

interface NotificationToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`absolute top-16 left-1/2 -translate-x-1/2 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};

interface GoalProgressProps {
  current: number;
  goal: number;
  label?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ current, goal, label = 'Goal' }) => (
  <div className="bg-slate-800 rounded-xl p-3">
    <div className="text-slate-400 text-sm">{label}</div>
    <div className="text-yellow-400 font-bold">${goal.toLocaleString()}</div>
    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
        style={{ width: `${Math.min(100, (current / goal) * 100)}%` }}
      />
    </div>
    <div className="text-xs text-slate-500 mt-1">{((current / goal) * 100).toFixed(1)}%</div>
  </div>
);

interface GamePanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const GamePanel: React.FC<GamePanelProps> = ({ title, children, className = '', action }) => (
  <div className={`bg-slate-900 border-r border-slate-800 overflow-y-auto ${className}`}>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  </div>
);

interface QuickTradeButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'buy' | 'sell' | 'neutral';
}

export const QuickTradeButton: React.FC<QuickTradeButtonProps> = ({ label, onClick, disabled, variant = 'neutral' }) => {
  const colors = {
    buy: 'bg-green-600 hover:bg-green-700',
    sell: 'bg-red-600 hover:bg-red-700',
    neutral: 'bg-slate-700 hover:bg-slate-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 ${colors[variant]} text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
};
