
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AppMode } from '../types';
import { MODE_CONFIG, EXAMPLE_TEMPLATES } from '../constants';
import { remixProject, getProjects } from '../services/storageService';
import {
  Search, ArrowLeft, Heart, MessageCircle, GitFork,
  Sparkles, Layout, Gamepad2, Cpu, Filter, ThumbsUp, CheckCircle
} from 'lucide-react';
import { playSoundEffect } from '../services/soundService';
import { updateCreatorScore, addXP } from '../services/gamificationService';

const MOCK_COMMUNITY_PROJECTS = [
  { id: 'c1', name: 'Super Mario Clone', author: 'CodyKid', mode: AppMode.GAME, likes: 124, remixes: 45, color: 'bg-orange-500', description: 'A platformer with coins and enemies!' },
  { id: 'c2', name: 'Weather App', author: 'CodeQueen', mode: AppMode.APP, likes: 89, remixes: 12, color: 'bg-blue-500', description: 'Check weather with AI integration' },
  { id: 'c3', name: 'Smart Plant Waterer', author: 'MakerMax', mode: AppMode.HARDWARE, likes: 210, remixes: 67, color: 'bg-emerald-500', description: 'Auto-water your plants' },
  { id: 'c4', name: 'Space Invaders AI', author: 'RobotBob', mode: AppMode.GAME, likes: 156, remixes: 30, color: 'bg-purple-500', description: 'Classic game with AI enemies' },
  { id: 'c5', name: 'Calculator Pro', author: 'JuniorDev', mode: AppMode.APP, likes: 45, remixes: 5, color: 'bg-sky-500', description: 'Full-featured calculator' },
  { id: 'c6', name: 'LED Music Visualizer', author: 'SoundWave', mode: AppMode.HARDWARE, likes: 312, remixes: 89, color: 'bg-rose-500', description: 'Lights dance to music!' },
];

const GalleryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { setProject, darkMode } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AppMode | 'all'>('all');
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [showRemixSuccess, setShowRemixSuccess] = useState<string | null>(null);

  const filtered = MOCK_COMMUNITY_PROJECTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.author.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.mode === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRemix = (proj: any) => {
      // Find matching template or create from example
      const template = EXAMPLE_TEMPLATES.find(t => t.mode === proj.mode);
      
      if (template) {
          const newProj = {
              id: crypto.randomUUID(),
              name: `${proj.name} (Remix)`,
              mode: proj.mode,
              lastEdited: Date.now(),
              data: {
                  commands: template.commands.map(c => ({...c, id: crypto.randomUUID()})),
                  hardwareState: {} as any,
                  spriteState: {} as any,
                  appState: {} as any,
                  circuitComponents: template.circuitComponents || [],
                  pcbColor: '#059669'
              }
          };
          setProject(newProj as any);
      } else {
          // Fallback to empty project of same mode
          const newProj = {
              id: crypto.randomUUID(),
              name: `${proj.name} (Remix)`,
              mode: proj.mode,
              lastEdited: Date.now(),
              data: {
                  commands: [],
                  hardwareState: {} as any,
                  spriteState: {} as any,
                  appState: {} as any,
                  circuitComponents: [],
                  pcbColor: '#059669'
              }
          };
          setProject(newProj as any);
      }
      
      // Update gamification
      updateCreatorScore('remix');
      addXP(25);
      
      playSoundEffect('powerup');
      setShowRemixSuccess(proj.name);
      setTimeout(() => setShowRemixSuccess(null), 3000);
  };

  const handleLike = (projId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newLiked = new Set(likedProjects);
      if (newLiked.has(projId)) {
          newLiked.delete(projId);
      } else {
          newLiked.add(projId);
          updateCreatorScore('like');
          addXP(5);
          playSoundEffect('coin');
      }
      setLikedProjects(newLiked);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} transition-colors font-sans p-6`}>
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            Community Gallery <Sparkles className="text-yellow-500" />
                        </h1>
                        <p className="text-slate-500 font-medium">Explore, learn, and remix projects from other kids!</p>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-2xl font-black text-violet-500">{MOCK_COMMUNITY_PROJECTS.length}</div>
                        <div className="text-xs text-slate-500 font-bold">Projects</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-2xl font-black text-blue-500">{MOCK_COMMUNITY_PROJECTS.reduce((sum, p) => sum + p.remixes, 0)}</div>
                        <div className="text-xs text-slate-500 font-bold">Remixes</div>
                    </div>
                </div>
            </div>

            {/* Remix Success Toast */}
            {showRemixSuccess && (
                <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right z-50">
                    <CheckCircle size={24} />
                    <div>
                        <div className="font-bold">Project Remixed!</div>
                        <div className="text-sm opacity-80">"{showRemixSuccess}" is now in your projects</div>
                    </div>
                    <div className="text-2xl">🎉</div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for games, apps, or gadgets..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === 'all' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>All</button>
                    <button onClick={() => setFilter(AppMode.GAME)} className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === AppMode.GAME ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Games</button>
                    <button onClick={() => setFilter(AppMode.APP)} className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === AppMode.APP ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Apps</button>
                    <button onClick={() => setFilter(AppMode.HARDWARE)} className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === AppMode.HARDWARE ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Hardware</button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((proj) => (
                    <div key={proj.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                        {/* Preview Area */}
                        <div className={`h-48 ${proj.color} relative flex items-center justify-center text-white/20`}>
                            {proj.mode === AppMode.GAME ? <Gamepad2 size={80} /> : proj.mode === AppMode.APP ? <Layout size={80} /> : <Cpu size={80} />}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm p-6">
                                <div className="text-white text-center">
                                    <div className="font-bold text-lg">{proj.name}</div>
                                    <div className="text-sm opacity-80">{proj.description}</div>
                                </div>
                                <button onClick={() => handleRemix(proj)} className="px-8 py-3 bg-white text-slate-900 font-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center gap-2">
                                    <GitFork size={18} /> REMIX NOW
                                </button>
                            </div>
                            
                            {/* Mode Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full text-white uppercase tracking-widest bg-black/30 backdrop-blur-sm`}>
                                    {proj.mode}
                                </span>
                            </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest ${MODE_CONFIG[proj.mode].color}`}>
                                    {proj.mode}
                                </span>
                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                                    <button onClick={(e) => handleLike(proj.id, e)} className={`flex items-center gap-1 transition-colors ${likedProjects.has(proj.id) ? 'text-red-500' : 'hover:text-red-500'}`}>
                                        <Heart size={14} className={likedProjects.has(proj.id) ? 'fill-current' : ''} /> {proj.likes + (likedProjects.has(proj.id) ? 1 : 0)}
                                    </button>
                                    <span className="flex items-center gap-1"><GitFork size={14} /> {proj.remixes}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{proj.name}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-3">{proj.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                        {proj.author[0]}
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">by <span className="text-violet-500 font-bold">{proj.author}</span></span>
                                </div>
                                <button onClick={() => handleRemix(proj)} className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-sm flex items-center gap-1">
                                    <GitFork size={14} /> Remix
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search size={40} />
                    </div>
                    <h3 className="text-xl font-bold">No projects found</h3>
                    <p className="text-slate-500">Try searching for something else!</p>
                </div>
            )}
            
            {/* Publish Your Project CTA */}
            <div className="mt-12 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white text-center shadow-2xl">
                <Sparkles size={48} className="mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-black mb-2">Share Your Creation!</h2>
                <p className="text-white/80 mb-6 max-w-xl mx-auto">Publish your projects to the community gallery and inspire other kids to learn coding. Get likes, comments, and remixes!</p>
                <button className="px-8 py-4 bg-white text-violet-600 font-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-2">
                    <ThumbsUp size={20} /> Publish Your Project
                </button>
            </div>
        </div>
    </div>
  );
};

export default GalleryPage;
