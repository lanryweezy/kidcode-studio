import React from 'react';
import { useStore } from '../store/useStore';
import { DailyChallenge } from '../constants/dailyChallenges';
import {
  getTodayChallenges,
  isChallengeCompletedToday,
  getChallengeProgress,
  updateStreak,
} from '../services/challengeService';
import { getUnlockedCount, getTotalAchievementCount } from '../services/achievementService';
import { playSoundEffect } from '../services/soundService';
import { AppMode } from '../types';
import { Trophy, Flame, Clock, CheckCircle2, Zap, ChevronRight, Target, Star, Award } from 'lucide-react';

interface ChallengePanelProps {
  onStartChallenge: (challenge: DailyChallenge) => void;
  onClose: () => void;
}

const DIFFICULTY_CONFIG = {
  easy: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'EASY', emoji: '⭐' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'MEDIUM', emoji: '⭐⭐' },
  hard: { color: 'bg-rose-100 text-rose-700 border-rose-200', label: 'HARD', emoji: '⭐⭐⭐' },
};

const MODE_LABELS: Record<string, string> = {
  [AppMode.GAME]: 'Game',
  [AppMode.APP]: 'App',
  [AppMode.HARDWARE]: 'Hardware',
  [AppMode.MINECRAFT]: 'Minecraft',
  [AppMode.CAD]: 'CAD',
};

const ChallengePanel: React.FC<ChallengePanelProps> = ({ onStartChallenge, onClose }) => {
  const { userProfile, addCoins } = useStore();
  const [challenges, setChallenges] = React.useState<DailyChallenge[]>([]);
  const [progress, setProgress] = React.useState(getChallengeProgress());

  React.useEffect(() => {
    updateStreak();
    setChallenges(getTodayChallenges());
    setProgress(getChallengeProgress());
  }, []);

  const streak = progress.currentStreak;
  const totalCompleted = progress.completedChallenges.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-modal-open">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 text-8xl font-black -rotate-12 translate-x-8 -translate-y-4">⚡</div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Daily Challenges</h2>
                <p className="text-sm text-white/80 font-medium">New challenges every day!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-6 bg-slate-50">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <div>
              <p className="text-lg font-black text-orange-600">{streak}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            <div>
              <p className="text-lg font-black text-yellow-600">{totalCompleted}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Award size={20} className="text-purple-500" />
            <div>
              <p className="text-lg font-black text-purple-600">{getUnlockedCount()}/{getTotalAchievementCount()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Achievements</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const completed = isChallengeCompletedToday(challenge.id);
              const diffStyle = DIFFICULTY_CONFIG[challenge.difficulty];

              return (
                <div
                  key={challenge.id}
                  className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
                    completed
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${diffStyle.color}`}>
                          {diffStyle.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {MODE_LABELS[challenge.mode] || challenge.mode}
                        </span>
                        {challenge.timeLimit > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={10} />
                            {Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 mb-1">{challenge.title}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-3">{challenge.description}</p>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {challenge.requiredBlocks.slice(0, 4).map((block) => (
                          <span
                            key={block}
                            className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full"
                          >
                            {block.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                        {challenge.requiredBlocks.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{challenge.requiredBlocks.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="flex items-center gap-1 text-amber-600">
                          <Zap size={12} /> {challenge.rewards.xp} XP
                        </span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          🪙 {challenge.rewards.coins} coins
                        </span>
                        {challenge.rewards.badge && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <Star size={12} /> Badge
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {completed ? (
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <CheckCircle2 size={28} className="text-white" />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            playSoundEffect('click');
                            onStartChallenge(challenge);
                          }}
                          className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        >
                          <ChevronRight size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-center text-slate-400 font-medium">
            Complete challenges to earn XP, coins, and unlock achievements!
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChallengePanel);
