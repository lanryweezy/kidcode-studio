import React from 'react';
import { Trophy, Check, X, Target } from 'lucide-react';
import { Mission } from '../types';

interface MissionProgressProps {
  mission: Mission;
  progress: number; // 0-100
  tasks: Array<{ description: string; completed: boolean }>;
  onDismiss?: () => void;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({
  mission,
  progress,
  tasks,
  onDismiss
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/50 via-slate-900/50 to-blue-900/50 border border-purple-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md"></div>
            <div className="relative bg-slate-800 rounded-full p-2 border border-purple-500/50">
              <Trophy size={18} className="text-yellow-400" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-white text-sm tracking-tight">
              Current Mission
            </h3>
            <p className="text-xs text-purple-300 font-semibold">
              {mission.title}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Dismiss mission"
          >
            <X size={16} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Progress
          </span>
          <span className="text-xs font-black text-yellow-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
            }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {tasks.map((task, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 text-xs p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`
              w-4 h-4 rounded-full flex items-center justify-center shrink-0
              ${task.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-slate-500'}
            `}>
              {task.completed ? <Check size={10} strokeWidth={3} /> : <Target size={10} />}
            </div>
            <span className={`
              font-medium
              ${task.completed 
                ? 'text-green-400 line-through opacity-70' 
                : 'text-slate-300'}
            `}>
              {task.description}
            </span>
          </div>
        ))}
      </div>

      {/* Reward hint */}
      <div className="mt-3 pt-3 border-t border-purple-500/20">
        <p className="text-[10px] text-slate-400 text-center">
          🎁 Complete to earn XP + badge
        </p>
      </div>
    </div>
  );
};

export default MissionProgress;
