import React from 'react';

interface GameEndScreenProps {
  type: 'victory' | 'gameover';
  title: string;
  stats: { label: string; value: string | number; icon?: string }[];
  onRestart?: () => void;
  onExit: () => void;
}

export const GameEndScreen: React.FC<GameEndScreenProps> = ({
  type,
  title,
  stats,
  onRestart,
  onExit,
}) => (
  <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="max-w-lg bg-slate-900 rounded-2xl p-8 border border-slate-700 text-center animate-in zoom-in-95">
      <div className="text-6xl mb-4">{type === 'victory' ? '🎉' : '💰'}</div>
      <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
      <p className="text-slate-400 mb-6">
        {type === 'victory' ? 'Congratulations! You achieved your goal!' : 'Game Over'}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-4">
            <div className="text-2xl mb-1">{stat.icon || '📊'}</div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        {onRestart && (
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all"
          >
            🔄 Play Again
          </button>
        )}
        <button
          onClick={onExit}
          className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all"
        >
          🏠 Back to Menu
        </button>
      </div>
    </div>
  </div>
);

interface TutorialScreenProps {
  title: string;
  emoji: string;
  description: string;
  tips: { icon: string; text: string }[];
  onStart: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({
  title,
  emoji,
  description,
  tips,
  onStart,
}) => (
  <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center p-4">
    <div className="max-w-lg bg-slate-900 rounded-2xl p-8 border border-slate-700">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>

      <div className="space-y-4 mb-6">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-xl mt-0.5">{tip.icon}</span>
            <div className="text-slate-300 text-sm">{tip.text}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
      >
        Start Playing! 🚀
      </button>
    </div>
  </div>
);
