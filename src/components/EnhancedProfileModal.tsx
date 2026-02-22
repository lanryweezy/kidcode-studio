import React, { useState, useEffect } from 'react';
import { Trophy, Star, Edit2, Gamepad2, Layout, Cpu, Calendar, Play, Trash2, MoreVertical, Save, Award, Target, TrendingUp, Users, Crown, Sparkles, Lock, CheckCircle, Circle } from 'lucide-react';
import { UserProfile, Badge, Quest, Trophy as TrophyType, SkillNode, LeaderboardEntry } from '../types';
import { SavedProject, getProjects } from '../services/storageService';
import { updateUserName, updateUserAvatar } from '../services/userService';
import { getAllBadges, getDailyQuests, getWeeklyQuests, getLocalLeaderboard, getUserRank, updateSkillTree, SKILL_TREE, BADGE_DEFINITIONS, TROPHY_DEFINITIONS } from '../services/gamificationService';

interface EnhancedProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onLoadProject: (project: SavedProject) => void;
}

const EnhancedProfileModal: React.FC<EnhancedProfileModalProps> = ({ user, onClose, onUpdateUser, onLoadProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'quests' | 'trophies' | 'skills' | 'leaderboard'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [allBadges, setAllBadges] = useState<(Badge & { progress?: number; maxProgress?: number })[]>([]);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [allTrophies, setAllTrophies] = useState<TrophyType[]>([]);
  const [skillTree, setSkillTree] = useState<SkillNode[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);

  const refreshData = () => {
    setProjects(getProjects());
    setAllBadges(getAllBadges());
    setDailyQuests(getDailyQuests());
    setWeeklyQuests(getWeeklyQuests());
    setAllTrophies(TROPHY_DEFINITIONS.map(t => ({ ...t })));
    setSkillTree(updateSkillTree());
    setLeaderboard(getLocalLeaderboard());
    setUserRank(getUserRank());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveName = () => {
    const updated = updateUserName(newName);
    onUpdateUser(updated);
    setIsEditing(false);
  };

  const handleAvatarChange = (emoji: string) => {
    const updated = updateUserAvatar(emoji);
    onUpdateUser(updated);
  };

  // Calculate stats
  const totalProjects = projects.length;
  const appProjects = projects.filter(p => p.mode === 'APP').length;
  const gameProjects = projects.filter(p => p.mode === 'GAME').length;
  const hardwareProjects = projects.filter(p => p.mode === 'HARDWARE').length;

  // Calculate Progress to next level
  const xpForCurrentLevel = (user.level - 1) * 100;
  const xpForNextLevel = user.level * 100;
  const progressPercent = Math.min(100, Math.max(0, ((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100));

  const unlockedBadges = allBadges.filter(b => b.unlockedAt);
  const unlockedTrophies = allTrophies.filter(t => t.unlockedAt);
  const completedQuests = [...dailyQuests, ...weeklyQuests].filter(q => q.completed);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white p-8 relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><Star size={20} /></button>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center text-7xl shadow-xl border-4 border-white/30 backdrop-blur-sm">
                {user.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-sm font-black px-3 py-1 rounded-full border-2 border-white shadow-lg">
                Lvl {user.level}
              </div>
              {/* Avatar Picker Hover */}
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {['🚀','🐱','🤖','👩‍💻','🦁','🦄','🎮','⚡','👾','🦊','🐲','🌟'].map(e => (
                    <button key={e} onClick={() => handleAvatarChange(e)} className="hover:scale-125 transition-transform text-2xl">{e}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xl font-bold outline-none focus:border-white/50 text-white"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors">Save</button>
                </div>
              ) : (
                <h2 className="text-3xl font-black flex items-center gap-2 justify-center md:justify-start group cursor-pointer" onClick={() => setIsEditing(true)}>
                  {user.name}
                  <Edit2 size={18} className="text-white/50 group-hover:text-white transition-colors" />
                </h2>
              )}
              <p className="text-white/70 font-medium text-lg">Master Builder</p>

              {/* XP Bar */}
              <div className="mt-4 max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-xs font-bold text-white/70 mb-2">
                  <span>XP: {user.xp}</span>
                  <span>Level {user.level + 1}: {xpForNextLevel} XP</span>
                </div>
                <div className="h-4 bg-black/30 rounded-full overflow-hidden border border-white/20 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                <StatBadge icon={Trophy} value={user.streak} label="Day Streak" color="bg-orange-500" />
                <StatBadge icon={Award} value={unlockedBadges.length} label="Badges" color="bg-yellow-500" />
                <StatBadge icon={Target} value={completedQuests.length} label="Quests Done" color="bg-green-500" />
                <StatBadge icon={TrendingUp} value={`#${userRank}`} label="Rank" color="bg-blue-500" />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-center min-w-[90px]">
                <div className="text-3xl font-black text-white">{totalProjects}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Projects</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-center min-w-[90px]">
                <div className="text-3xl font-black text-yellow-300">{Math.floor(user.xp / 50)}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Missions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-center min-w-[90px]">
                <div className="text-3xl font-black text-purple-300">{user.creatorScore || 0}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Creator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0 bg-white overflow-x-auto">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Star} label="Overview" />
          <TabButton active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} icon={Award} label={`Badges (${unlockedBadges.length}/${allBadges.length})`} />
          <TabButton active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} icon={Target} label="Quests" />
          <TabButton active={activeTab === 'trophies'} onClick={() => setActiveTab('trophies')} icon={Crown} label="Trophies" />
          <TabButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} icon={Sparkles} label="Skill Tree" />
          <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={Users} label="Leaderboard" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          {activeTab === 'overview' && (
            <OverviewTab user={user} projects={projects} onLoadProject={onLoadProject} unlockedBadges={unlockedBadges} dailyQuests={dailyQuests} weeklyQuests={weeklyQuests} />
          )}
          {activeTab === 'badges' && (
            <BadgesTab badges={allBadges} />
          )}
          {activeTab === 'quests' && (
            <QuestsTab dailyQuests={dailyQuests} weeklyQuests={weeklyQuests} />
          )}
          {activeTab === 'trophies' && (
            <TrophiesTab trophies={allTrophies} />
          )}
          {activeTab === 'skills' && (
            <SkillTreeTab skills={skillTree} />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab leaderboard={leaderboard} userRank={userRank} currentUser={user} />
          )}
        </div>
      </div>
    </div>
  );
};

// === TAB COMPONENTS ===

const OverviewTab: React.FC<{ user: UserProfile; projects: SavedProject[]; onLoadProject: (p: SavedProject) => void; unlockedBadges: Badge[]; dailyQuests: Quest[]; weeklyQuests: Quest[] }> = ({ user, projects, onLoadProject, unlockedBadges, dailyQuests, weeklyQuests }) => {
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Recent Badges */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Award className="text-yellow-500" /> Recent Achievements</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {unlockedBadges.slice(-5).reverse().map(badge => (
            <div key={badge.id} className="flex-shrink-0 w-24 h-28 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 flex flex-col items-center justify-center p-2">
              <div className="text-4xl mb-1">{badge.icon}</div>
              <div className="text-[10px] font-bold text-center text-slate-700">{badge.name}</div>
            </div>
          ))}
          {unlockedBadges.length === 0 && (
            <div className="text-slate-400 text-sm">Complete projects to earn badges!</div>
          )}
        </div>
      </div>

      {/* Active Quests */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Target className="text-green-500" /> Active Quests</h3>
        <div className="space-y-3">
          {[...dailyQuests, ...weeklyQuests].filter(q => !q.completed).slice(0, 4).map(quest => (
            <div key={quest.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Circle size={20} className="text-slate-400" />
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">{quest.name}</div>
                <div className="text-xs text-slate-500">{quest.description}</div>
              </div>
              <div className="text-xs font-bold text-green-600">+{quest.xpReward} XP</div>
            </div>
          ))}
          {[...dailyQuests, ...weeklyQuests].filter(q => !q.completed).length === 0 && (
            <div className="text-slate-400 text-sm">All quests completed! 🎉</div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Play className="text-blue-500" /> Recent Projects</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentProjects.map(proj => (
            <button
              key={proj.id}
              onClick={() => onLoadProject(proj)}
              className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 hover:scale-105 transition-all border-2 border-slate-200 hover:border-blue-300"
            >
              <div className="text-3xl mb-1">{proj.mode === 'GAME' ? '🎮' : proj.mode === 'APP' ? '📱' : '⚡'}</div>
              <div className="text-[10px] font-bold text-slate-600 truncate max-w-full px-2">{proj.name}</div>
            </button>
          ))}
          {recentProjects.length === 0 && (
            <div className="col-span-full text-slate-400 text-sm text-center py-8">No projects yet. Start creating!</div>
          )}
        </div>
      </div>
    </div>
  );
};

const BadgesTab: React.FC<{ badges: (Badge & { progress?: number; maxProgress?: number })[] }> = ({ badges }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {badges.map(badge => (
        <div
          key={badge.id}
          className={`relative p-4 rounded-2xl border-2 transition-all ${badge.unlockedAt ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md hover:scale-105' : 'bg-slate-100 border-slate-200 opacity-50 grayscale'}`}
        >
          <div className="text-5xl mb-2 text-center">{badge.icon}</div>
          <div className="text-sm font-bold text-center text-slate-800">{badge.name}</div>
          <div className="text-xs text-center text-slate-500 mt-1">{badge.description}</div>
          {badge.unlockedAt && (
            <div className="absolute top-2 right-2">
              <CheckCircle size={16} className="text-green-500" />
            </div>
          )}
          {!badge.unlockedAt && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl">
              <Lock size={24} className="text-slate-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const QuestsTab: React.FC<{ dailyQuests: Quest[]; weeklyQuests: Quest[] }> = ({ dailyQuests, weeklyQuests }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-500" />
          <h3 className="text-lg font-bold text-slate-800">Daily Quests</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Resets in 24h</span>
        </div>
        <div className="space-y-3">
          {dailyQuests.map(quest => (
            <QuestItem key={quest.id} quest={quest} />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-purple-500" />
          <h3 className="text-lg font-bold text-slate-800">Weekly Quests</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">Resets in 7 days</span>
        </div>
        <div className="space-y-3">
          {weeklyQuests.map(quest => (
            <QuestItem key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
};

const QuestItem: React.FC<{ quest: Quest }> = ({ quest }) => {
  const [progress, setProgress] = useState(quest.progress || 0);

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${quest.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${quest.completed ? 'bg-green-500' : 'bg-slate-300'}`}>
        {quest.completed ? <CheckCircle size={20} className="text-white" /> : <Circle size={20} className="text-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${quest.completed ? 'text-green-800 line-through' : 'text-slate-800'}`}>{quest.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${quest.difficulty === 'easy' ? 'bg-green-100 text-green-700' : quest.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {quest.difficulty}
          </span>
        </div>
        <div className="text-sm text-slate-500">{quest.description}</div>
        {!quest.completed && (
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      <div className={`text-lg font-black ${quest.completed ? 'text-green-600' : 'text-blue-600'}`}>+{quest.xpReward} XP</div>
    </div>
  );
};

const TrophiesTab: React.FC<{ trophies: TrophyType[] }> = ({ trophies }) => {
  const rarityColors = {
    common: 'from-slate-100 to-slate-200 border-slate-300',
    rare: 'from-blue-100 to-blue-200 border-blue-300',
    epic: 'from-purple-100 to-purple-200 border-purple-300',
    legendary: 'from-yellow-100 to-orange-200 border-yellow-300'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trophies.map(trophy => (
        <div
          key={trophy.id}
          className={`relative p-6 rounded-2xl border-2 bg-gradient-to-br transition-all hover:scale-105 ${trophy.unlockedAt ? rarityColors[trophy.rarity] : 'bg-slate-100 border-slate-200 opacity-50 grayscale'}`}
        >
          <div className="flex items-start gap-4">
            <div className="text-6xl">{trophy.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{trophy.rarity}</div>
              <div className="text-lg font-black text-slate-800">{trophy.name}</div>
              <div className="text-sm text-slate-600 mt-1">{trophy.description}</div>
              {trophy.unlockedAt && (
                <div className="text-xs text-slate-400 mt-2">Unlocked {new Date(trophy.unlockedAt).toLocaleDateString()}</div>
              )}
            </div>
            {trophy.unlockedAt ? (
              <CheckCircle size={24} className="text-green-500" />
            ) : (
              <Lock size={24} className="text-slate-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const SkillTreeTab: React.FC<{ skills: SkillNode[] }> = ({ skills }) => {
  const categories = ['coding', 'creativity', 'community', 'mastery'] as const;
  const categoryColors: Record<string, string> = {
    coding: 'bg-blue-500',
    creativity: 'bg-purple-500',
    community: 'bg-green-500',
    mastery: 'bg-yellow-500'
  };

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`}></div>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.filter(s => s.category === category).map(skill => (
              <div
                key={skill.id}
                className={`p-4 rounded-xl border-2 transition-all ${skill.unlocked ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md' : 'bg-slate-50 border-slate-200 opacity-50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{skill.icon}</div>
                  <div className="font-bold text-slate-800">{skill.name}</div>
                </div>
                <div className="text-sm text-slate-500">{skill.description}</div>
                {skill.unlocked && (
                  <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
                    <CheckCircle size={12} /> Unlocked
                  </div>
                )}
                {!skill.unlocked && skill.requirements.length > 0 && (
                  <div className="mt-2 text-xs text-slate-400">Requires: {skill.requirements.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const LeaderboardTab: React.FC<{ leaderboard: LeaderboardEntry[]; userRank: number; currentUser: UserProfile }> = ({ leaderboard, userRank, currentUser }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="text-blue-500" /> Global Leaderboard</h3>
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${index === 0 ? 'bg-yellow-50 border-yellow-300' : index === 1 ? 'bg-slate-50 border-slate-300' : index === 2 ? 'bg-orange-50 border-orange-300' : 'bg-white border-slate-200'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-orange-400 text-orange-900' : 'bg-slate-100 text-slate-500'}`}>
              {entry.rank <= 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : `#${entry.rank}`}
            </div>
            <div className="text-3xl">{entry.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-slate-800">{entry.name}</div>
              <div className="text-xs text-slate-500">Level {entry.level}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-blue-600">{entry.xp.toLocaleString()} XP</div>
            </div>
          </div>
        ))}
      </div>

      {/* User's Rank */}
      <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center font-black">
            #{userRank}
          </div>
          <div className="text-3xl">{currentUser.avatar}</div>
          <div className="flex-1">
            <div className="font-bold text-slate-800">{currentUser.name} (You)</div>
            <div className="text-xs text-slate-500">Level {currentUser.level}</div>
          </div>
          <div className="text-right">
            <div className="font-black text-violet-600">{currentUser.xp.toLocaleString()} XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === HELPER COMPONENTS ===

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${active ? 'border-violet-500 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const StatBadge: React.FC<{ icon: any; value: string | number; label: string; color: string }> = ({ icon: Icon, value, label, color }) => (
  <div className={`${color} text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg`}>
    <Icon size={16} />
    <div>
      <div className="text-lg font-black">{value}</div>
      <div className="text-[9px] opacity-80 uppercase">{label}</div>
    </div>
  </div>
);

export default EnhancedProfileModal;
