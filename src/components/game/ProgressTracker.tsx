import React, { useState, useEffect } from 'react';
import { Star, Trophy, Target, TrendingUp, Award, Zap, Lock, Check, ChevronRight } from 'lucide-react';
import {
  getEducationState, getXPProgress, checkAchievements, updateSkillProgress,
  SKILL_CATEGORIES, ACHIEVEMENTS, getLeaderboard,
  type SkillCategory, type Achievement, type LeaderboardEntry
} from '../../services/educationSystem';
import { Modal } from '../ui/Modal';

interface ProgressTrackerProps {
  open: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'skills' | 'achievements' | 'leaderboard';

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [state, setState] = useState(getEducationState());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const freshState = getEducationState();
    setState(freshState);
    setLeaderboard(getLeaderboard());
    const unlocked = checkAchievements();
    if (unlocked.length > 0) setNewAchievements(unlocked);
  }, [open]);

  const xpProgress = getXPProgress(state.xp);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Target size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Zap size={16} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <TrendingUp size={16} /> },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-100';
      case 'uncommon': return 'text-green-500 bg-green-50';
      case 'rare': return 'text-blue-500 bg-blue-50';
      case 'epic': return 'text-purple-500 bg-purple-50';
      case 'legendary': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-80">Level {state.level}</span>
          <span className="text-sm opacity-80">{state.xp} XP</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
          <div className="bg-white rounded-full h-2.5 transition-all duration-500" style={{ width: `${xpProgress.percent}%` }} />
        </div>
        <div className="flex justify-between text-xs opacity-70">
          <span>{xpProgress.current} / {xpProgress.needed} XP to next level</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-indigo-500">{state.completedProjects}</div>
          <div className="text-xs text-slate-500">Projects</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-500">{Object.keys(state.skills).length}</div>
          <div className="text-xs text-slate-500">Skills</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-500">{state.achievements.length}</div>
          <div className="text-xs text-slate-500">Achievements</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-500">{state.streakDays}</div>
          <div className="text-xs text-slate-500">Day Streak</div>
        </div>
      </div>

      {newAchievements.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">Achievements!</span>
          </div>
          {newAchievements.map(a => (
            <div key={a.id} className="text-xs text-yellow-600">{a.name} (+{a.xpReward} XP)</div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-3">
      {SKILL_CATEGORIES.map(cat => (
        <div key={cat.id} className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-bold text-slate-700">{cat.name}</span>
            </div>
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${selectedCategory === cat.id ? 'rotate-90' : ''}`} />
          </button>
          {selectedCategory === cat.id && (
            <div className="p-3 space-y-2 border-t border-slate-200">
              {cat.skills.map(skill => {
                const progress = state.skills[skill.id] || 0;
                const isUnlocked = progress >= skill.maxProgress;
                const canUnlock = skill.requirements.every(req =>
                  req.type === 'skill' ? (state.skills[req.value as string] || 0) >= 1 : true
                );

                return (
                  <div key={skill.id} className={`flex items-center gap-3 p-2 rounded-lg ${isUnlocked ? 'bg-green-50' : 'bg-white'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isUnlocked ? 'bg-green-100' : canUnlock ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                      {isUnlocked ? <Check size={14} className="text-green-500" /> : canUnlock ? <span>{skill.icon}</span> : <Lock size={12} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700">{skill.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{skill.description}</div>
                      <div className="mt-1 w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-indigo-500 rounded-full h-1 transition-all" style={{ width: `${Math.min(100, (progress / skill.maxProgress) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{progress}/{skill.maxProgress}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-2">
      {ACHIEVEMENTS.map(achievement => {
        const unlocked = state.achievements.includes(achievement.id);
        const progress = Math.min(100, (achievement.progress / achievement.criteria.target) * 100);

        return (
          <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg border ${unlocked ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${unlocked ? 'bg-green-100' : 'bg-slate-100'}`}>
              {unlocked ? achievement.icon : <Lock size={16} className="text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">{achievement.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
              </div>
              <div className="text-xs text-slate-500">{achievement.description}</div>
              {!unlocked && (
                <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-indigo-500 rounded-full h-1.5 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            <div className="text-xs font-bold text-yellow-500">+{achievement.xpReward} XP</div>
          </div>
        );
      })}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-2">
      {leaderboard.map((entry, i) => {
        const isUser = entry.userId === 'current-user';
        return (
          <div key={entry.userId} className={`flex items-center gap-3 p-3 rounded-lg ${isUser ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-slate-200'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : entry.rank}
            </div>
            <div className="text-xl">{entry.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-700">{entry.name}</div>
              <div className="text-[10px] text-slate-500">Lvl {entry.level} · {entry.projects} projects</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-indigo-500">{entry.xp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">XP</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Progress Tracker" size="lg">
      <div className="flex flex-col h-full">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-1">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'skills' && renderSkills()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
        </div>
      </div>
    </Modal>
  );
};

export default ProgressTracker;
