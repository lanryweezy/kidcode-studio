
import React from 'react';
import { useStore } from '../store/useStore';
import { AppMode, CircuitComponent } from '../types';
import { MODE_CONFIG, EXAMPLE_TEMPLATES } from '../constants';
import { createNewProject, getProjects, remixProject, deleteProject } from '../services/storageService';
import { playSoundEffect } from '../services/soundService';
import {
    Zap,
    Crown,
    Sparkles,
    FileCode,
    Plus,
    GitFork,
    Trash2,
    FolderOpen,
    Users
} from 'lucide-react';

const HomeScreen: React.FC = () => {
    const {
        darkMode,
        userProfile,
        setShowPricing,
        setShowProfile,
        setProject,
        setCommands,
        setCircuitComponents,
        setMode,
        setShowHome,
        setShowGallery
    } = useStore();

    const [recentProjects, setRecentProjects] = React.useState(getProjects());

    const handleRemix = (e: React.MouseEvent, proj: any) => {
        e.stopPropagation();
        const remixed = remixProject(proj);
        setRecentProjects(getProjects());
        playSoundEffect('powerup');
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Delete this project forever?')) {
            deleteProject(id);
            setRecentProjects(getProjects());
            playSoundEffect('hurt');
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} transition-colors font-sans`}>
            <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce-sm">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">KidCode Studio</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowPricing(true)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-4 rounded-full shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Crown size={16} fill="currentColor" />
                        <span className="hidden sm:inline">Upgrade to Pro</span>
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="flex items-center gap-2 py-2 px-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-all hover:scale-105"
                    >
                        <span className="text-2xl">{userProfile?.avatar || '👤'}</span>
                        <span className="font-bold text-sm hidden sm:block">{userProfile?.name || 'Explorer'}</span>
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-black px-1.5 rounded ml-1 animate-pulse">{userProfile?.level || 1}</div>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Social Proof Stats Bar */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10 py-4 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <span className="text-2xl">🧑‍💻</span>
                        <span><span className="text-violet-600 dark:text-violet-400 text-lg">200+</span> Blocks</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <span className="text-2xl">🎮</span>
                        <span><span className="text-emerald-600 dark:text-emerald-400 text-lg">3D</span> Game Engine</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <span className="text-2xl">⚡</span>
                        <span><span className="text-amber-600 dark:text-amber-400 text-lg">50+</span> Circuit Parts</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <span className="text-2xl">📱</span>
                        <span>Publish to <span className="text-blue-600 dark:text-blue-400 text-lg">Web</span></span>
                    </div>
                </div>

                <h2 className="text-4xl font-black mb-8 animate-in slide-in-from-left-10 fade-in duration-500">What do you want to build?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {Object.values(AppMode).map((m, i) => {
                        const config = MODE_CONFIG[m];
                        const Icon = config.icon;
                        return (
                            <button
                                key={m}
                                style={{ animationDelay: `${i * 100}ms` }}
                                onClick={() => {
                                    const newProj = createNewProject(m);
                                    setProject(newProj);
                                }}
                                className={`relative group h-64 rounded-3xl p-8 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.05] hover:rotate-1 hover:shadow-2xl text-white ${config.color}`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                                    <Icon size={120} />
                                </div>
                                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner animate-float">
                                    <Icon size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mb-2">{config.label}</h3>
                                    <p className="opacity-90 font-medium">{m === AppMode.APP ? 'Design real mobile apps with buttons, inputs & screens.' : m === AppMode.GAME ? 'Build 2D platformers & 3D open-world adventures.' : 'Simulate Arduino circuits with 50+ parts.'}</p>
                                </div>
                                <div className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 group-hover:rotate-90 duration-300">
                                    <Plus size={24} />
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="mb-12">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Sparkles size={20} className="text-yellow-500" /> Instant Starters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {EXAMPLE_TEMPLATES.map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => {
                                    const newProj = createNewProject(tpl.mode);
                                    newProj.name = tpl.name;
                                    newProj.data.commands = tpl.commands.map(c => ({ ...c, id: (window.crypto as any).randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11) }));
                                    if (tpl.circuitComponents && tpl.mode === AppMode.HARDWARE) {
                                        newProj.data.circuitComponents = tpl.circuitComponents as CircuitComponent[];
                                    }
                                    setProject(newProj);
                                }}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-violet-400 hover:shadow-lg transition-all text-left group"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-md ${tpl.color}`}>
                                    {React.createElement(tpl.icon, { size: 24 })}
                                </div>
                                <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-violet-600 transition-colors">{tpl.name}</h4>
                                <p className="text-sm text-slate-500">{tpl.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-12">
                    <button
                        onClick={() => setShowGallery(true)}
                        className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-violet-600 to-blue-600 text-white flex items-center justify-between group overflow-hidden relative shadow-xl hover:scale-[1.01] transition-transform"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <Users size={160} />
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-inner">
                                <Users size={40} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-3xl font-black mb-1">Community Gallery</h3>
                                <p className="text-lg opacity-90 font-medium">See what other kids are building and remix their code!</p>
                            </div>
                        </div>
                        <div className="bg-white text-violet-600 px-6 py-3 rounded-2xl font-black shadow-lg group-hover:bg-violet-50 transition-colors flex items-center gap-2">
                            EXPLORE <Sparkles size={18} fill="currentColor" />
                        </div>
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><FileCode size={20} /> Recent Projects</h3>
                    <button className="text-sm font-bold text-violet-500 hover:text-violet-600">View All</button>
                </div>

                {recentProjects.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400 font-medium">No projects yet. Start building!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {recentProjects.map(proj => (
                            <div
                                key={proj.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:shadow-md transition-all text-left relative group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${(MODE_CONFIG as any)[proj.mode]?.color || 'bg-slate-500'}`}>
                                        {(MODE_CONFIG as any)[proj.mode]?.label || proj.mode}
                                    </span>

                                    <span className="text-[10px] text-slate-400">{new Date(proj.lastEdited).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white truncate mb-4">{proj.name}</h4>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setProject(proj)}
                                        className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-600 hover:text-white transition-all flex-1 flex justify-center"
                                        title="Open"
                                    >
                                        <FolderOpen size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemix(e, proj)}
                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex-1 flex justify-center"
                                        title="Remix"
                                    >
                                        <GitFork size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, proj.id)}
                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all flex-1 flex justify-center"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;
