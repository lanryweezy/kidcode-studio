
import React, { useState, useEffect } from 'react';
import { UserProfile, AppMode } from '../types';
import { SavedProject, getProjects, saveProject, deleteProject } from '../services/storageService';
import { updateUserName, updateUserAvatar } from '../services/userService';
import { X, Trophy, Star, Edit2, Gamepad2, Layout, Cpu, Calendar, Play, Trash2, MoreVertical, Save } from 'lucide-react';
import { MODE_CONFIG, CHARACTER_PALETTE } from '../constants';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onLoadProject: (project: SavedProject) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdateUser, onLoadProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  const refreshProjects = () => {
      setProjects(getProjects());
  };

  useEffect(() => {
    refreshProjects();
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

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this project?")) {
          deleteProject(id);
          refreshProjects();
      }
  };

  const startRenameProject = (proj: SavedProject, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingProjectId(proj.id);
      setNewProjectName(proj.name);
  };

  const saveProjectRename = (proj: SavedProject) => {
      saveProject({ ...proj, name: newProjectName });
      setEditingProjectId(null);
      refreshProjects();
  };

  // Calculate stats
  const totalProjects = projects.length;
  const appProjects = projects.filter(p => p.mode === AppMode.APP).length;
  const gameProjects = projects.filter(p => p.mode === AppMode.GAME).length;
  const hardwareProjects = projects.filter(p => p.mode === AppMode.HARDWARE).length;
  
  // Calculate Progress to next level
  const xpForCurrentLevel = (user.level - 1) * 100;
  const xpForNextLevel = user.level * 100;
  const progressPercent = Math.min(100, Math.max(0, ((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100));

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Section */}
        <div className="bg-slate-900 text-white p-8 relative shrink-0">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
           
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-6xl shadow-xl border-4 border-slate-800">
                      {user.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1.5 border border-slate-700">
                      <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">Lvl {user.level}</div>
                  </div>
                  {/* Avatar Picker Hover */}
                  <div className="absolute top-0 left-0 w-full h-full bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="grid grid-cols-4 gap-1 p-2">
                          {['🚀','🐱','🤖','👩‍💻','🦁','🦄','🎮','⚡'].map(e => (
                              <button key={e} onClick={() => handleAvatarChange(e)} className="hover:scale-125 transition-transform">{e}</button>
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
                            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-xl font-bold outline-none focus:border-violet-400 text-white"
                            autoFocus
                          />
                          <button onClick={handleSaveName} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">Save</button>
                      </div>
                  ) : (
                      <h2 className="text-3xl font-black flex items-center gap-2 justify-center md:justify-start group cursor-pointer" onClick={() => setIsEditing(true)}>
                          {user.name} 
                          <Edit2 size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                      </h2>
                  )}
                  <p className="text-slate-400 font-medium">Master Builder</p>
                  
                  {/* XP Bar */}
                  <div className="mt-4 max-w-sm mx-auto md:mx-0">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                          <span>XP: {user.xp}</span>
                          <span>Next Level: {xpForNextLevel}</span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                      </div>
                  </div>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center min-w-[80px]">
                      <div className="text-2xl font-black text-white">{totalProjects}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Projects</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center min-w-[80px]">
                      <div className="text-2xl font-black text-yellow-400">{Math.floor(user.xp / 50)}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Missions</div>
                  </div>
              </div>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-8 shrink-0 bg-white">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-violet-500 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'projects' ? 'border-violet-500 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                My Showcase
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 custom-scrollbar">
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Badges Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Trophy className="text-yellow-500" /> Achievements</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <Badge icon="🌟" label="First Step" unlocked={user.xp > 0} />
                            <Badge icon="🛠️" label="Builder" unlocked={totalProjects >= 3} />
                            <Badge icon="🎮" label="Gamer" unlocked={gameProjects >= 1} />
                            <Badge icon="📱" label="App Dev" unlocked={appProjects >= 1} />
                            <Badge icon="⚡" label="Engineer" unlocked={hardwareProjects >= 1} />
                            <Badge icon="🚀" label="Pro" unlocked={user.level >= 5} />
                            <Badge icon="🎨" label="Artist" unlocked={user.xp > 500} />
                            <Badge icon="👑" label="Legend" unlocked={user.level >= 10} />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Star className="text-violet-500" /> Mastery</h3>
                        <div className="space-y-4">
                            <StatBar label="App Design" value={appProjects * 20} icon={Layout} color="bg-blue-500" />
                            <StatBar label="Game Logic" value={gameProjects * 20} icon={Gamepad2} color="bg-orange-500" />
                            <StatBar label="Electronics" value={hardwareProjects * 20} icon={Cpu} color="bg-emerald-500" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'projects' && (
                <div>
                    {projects.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <div className="text-6xl mb-4">📂</div>
                            <p className="font-bold text-lg">No projects saved yet!</p>
                            <p className="text-sm">Start building to fill your showcase.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(proj => (
                                <div key={proj.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all flex flex-col">
                                    {/* Thumbnail Area */}
                                    <div 
                                        className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center bg-cover bg-center"
                                        style={proj.thumbnail ? { backgroundImage: `url(${proj.thumbnail})` } : {}}
                                    >
                                        {!proj.thumbnail && (
                                            <div className={`p-3 rounded-2xl text-white shadow-md ${MODE_CONFIG[proj.mode].color}`}>
                                                {React.createElement(MODE_CONFIG[proj.mode].icon, { size: 32 })}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        
                                        {/* Actions Overlay */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => startRenameProject(proj, e)} className="p-1.5 bg-white text-slate-600 rounded-lg hover:text-violet-600 shadow-sm" title="Rename"><Edit2 size={14} /></button>
                                            <button onClick={(e) => handleDeleteProject(proj.id, e)} className="p-1.5 bg-white text-slate-600 rounded-lg hover:text-red-600 shadow-sm" title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">{proj.mode}</span>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(proj.lastEdited).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        {editingProjectId === proj.id ? (
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    value={newProjectName}
                                                    onChange={(e) => setNewProjectName(e.target.value)}
                                                    className="flex-1 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-sm font-bold outline-none focus:ring-1 focus:ring-violet-300"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && saveProjectRename(proj)}
                                                />
                                                <button onClick={() => saveProjectRename(proj)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={16} /></button>
                                            </div>
                                        ) : (
                                            <h4 className="font-bold text-slate-800 text-lg mb-1 truncate" title={proj.name}>{proj.name}</h4>
                                        )}

                                        <div className="mt-auto pt-4">
                                            <button 
                                                onClick={() => { onLoadProject(proj); onClose(); }}
                                                className="w-full py-2 bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-600 font-bold rounded-lg border border-slate-200 hover:border-violet-200 transition-all flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Play size={14} fill="currentColor" /> Open Project
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, unlocked }: { icon: string, label: string, unlocked: boolean }) => (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${unlocked ? 'bg-yellow-50 text-slate-800 scale-100' : 'bg-slate-50 opacity-40 grayscale scale-95'}`}>
        <div className="text-3xl filter drop-shadow-sm">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-center">{label}</span>
    </div>
);

const StatBar = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) => (
    <div>
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1.5"><Icon size={14} /> {label}</span>
            <span>{Math.min(100, value)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, value)}%` }} />
        </div>
    </div>
);

export default ProfileModal;
