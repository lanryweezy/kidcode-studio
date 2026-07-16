
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
    Users,
    CheckCircle2,
    X
} from 'lucide-react';
import { SkeletonCard } from './ui/Skeleton';

const HomeScreen: React.FC = () => {
    const {
        userProfile,
        setShowPricing,
        setShowProfile,
        setProject,
        setShowGallery
    } = useStore();

    const [recentProjects, setRecentProjects] = React.useState(getProjects());
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleRemix = React.useCallback((e: React.MouseEvent, proj: any) => {
        e.stopPropagation();
        const optimisticId = 'temp-remix-' + Date.now();
        const optimisticProject = { ...proj, id: optimisticId, name: proj.name + ' (Remix)', lastEdited: Date.now() };
        setRecentProjects(prev => [optimisticProject, ...prev]);
        playSoundEffect('powerup');

        try {
            remixProject(proj);
            setRecentProjects(getProjects());
        } catch (error) {
            setRecentProjects(prev => prev.filter(p => p.id !== optimisticId));
        }
    }, []);

    const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
    const [loadingTemplate, setLoadingTemplate] = React.useState<string | null>(null);

    const [onboardingDismissed, setOnboardingDismissed] = React.useState(() => {
        return localStorage.getItem('kidcode_onboarding_dismissed') === 'true';
    });

    const isReturningUser = recentProjects.length > 0;

    const handleDismissOnboarding = () => {
        setOnboardingDismissed(true);
        localStorage.setItem('kidcode_onboarding_dismissed', 'true');
    };

    const onboardingSteps = [
        { label: 'Choose a mode', description: 'Pick App, Game, or Hardware', done: false },
        { label: 'Drag your first block', description: 'Start coding visually', done: false },
        { label: 'Run your project', description: 'See it come to life', done: false },
        { label: 'Try a starter template', description: 'Jump-start your creation', done: false },
    ];

    const handleDelete = React.useCallback((e: React.MouseEvent, proj: { id: string; name: string }) => {
        e.stopPropagation();
        setDeleteTarget({ id: proj.id, name: proj.name });
    }, []);

    const confirmDelete = React.useCallback(() => {
        if (!deleteTarget) return;
        const previousProjects = recentProjects;
        setRecentProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
        playSoundEffect('hurt');
        setDeleteTarget(null);

        try {
            deleteProject(deleteTarget.id);
        } catch (error) {
            setRecentProjects(previousProjects);
        }
    }, [deleteTarget, recentProjects]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors font-sans pb-20">
            <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-float">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black tracking-tight leading-none">KidCode Studio</h1>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-violet-500 mt-1">DASHBOARD</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => useStore.getState().setShowLanding(true)}
                        className="text-xs font-bold text-slate-400 hover:text-violet-500 transition-colors mr-4"
                    >
                        View Public Page
                    </button>
                    <button
                        onClick={() => setShowPricing(true)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-4 rounded-full shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Crown size={16} fill="currentColor" />
                        <span className="hidden sm:inline">PRO</span>
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="flex items-center gap-2 py-2 px-4 rounded-full bg-white shadow-sm border border-slate-200 hover:border-violet-400 transition-all hover:scale-105"
                    >
                        <span className="text-2xl">{userProfile?.avatar || '👤'}</span>
                        <div className="flex flex-col items-start leading-none hidden sm:flex">
                            <span className="font-bold text-xs">{userProfile?.name || 'Explorer'}</span>
                            <div className="bg-yellow-400 text-yellow-900 text-[8px] font-black px-1 rounded mt-0.5 uppercase">LVL {userProfile?.level || 1}</div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Returning User Welcome */}
                {isReturningUser && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 animate-in fade-in slide-in-from-top-2 duration-500">
                        <p className="text-sm font-bold text-violet-700">
                            Welcome back, {userProfile?.name || 'Explorer'}! 👋 Ready to keep building?
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <h2 className="text-4xl font-black animate-in slide-in-from-left-10 fade-in duration-500">What do you want to build?</h2>
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest leading-none">324 Kids Building Live</span>
                    </div>
                </div>

                {/* Social Proof Stats Bar */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10 py-4 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <span className="text-2xl">🧑‍💻</span>
                        <span><span className="text-violet-600 text-lg">200+</span> Blocks</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <span className="text-2xl">🎮</span>
                        <span><span className="text-emerald-600 text-lg">3D</span> Game Engine</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <span className="text-2xl">⚡</span>
                        <span><span className="text-amber-600 text-lg">50+</span> Circuit Parts</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <span className="text-2xl">📱</span>
                        <span>Publish to <span className="text-blue-600 text-lg">Web</span></span>
                    </div>
                </div>

                {/* Onboarding Checklist for New Users */}
                {!onboardingDismissed && !isReturningUser && (
                    <div className="mb-8 p-6 rounded-2xl bg-white border border-violet-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles size={18} className="text-violet-500" /> Getting Started
                            </h3>
                            <button onClick={handleDismissOnboarding} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {onboardingSteps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500 text-white' : 'bg-violet-100 text-violet-500'}`}>
                                        {step.done ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{step.label}</p>
                                        <p className="text-[10px] text-slate-400">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                                className={`relative group min-h-64 rounded-3xl p-8 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.05] hover:rotate-1 hover:shadow-2xl text-white ${config.color} touch-feedback`}
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
                                disabled={loadingTemplate === tpl.id}
                                onClick={() => {
                                    setLoadingTemplate(tpl.id);
                                    setTimeout(() => {
                                        const newProj = createNewProject(tpl.mode);
                                        newProj.name = tpl.name;
                                        newProj.data.commands = tpl.commands.map(c => ({ ...c, id: (window.crypto as any).randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11) }));
                                        if (tpl.circuitComponents && tpl.mode === AppMode.HARDWARE) {
                                            newProj.data.circuitComponents = tpl.circuitComponents as CircuitComponent[];
                                        }
                                        setProject(newProj);
                                    }, 400);
                                }}
                                className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-violet-400 hover:shadow-lg transition-all text-left group"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-md ${tpl.color} ${loadingTemplate === tpl.id ? 'animate-pulse' : ''}`}>
                                    {loadingTemplate === tpl.id ? <Zap size={24} className="animate-spin" /> : React.createElement(tpl.icon, { size: 24 })}
                                    {React.createElement(tpl.icon, { size: 24 })}
                                </div>
                                <h4 className="font-bold text-lg text-slate-800 group-hover:text-violet-600 transition-colors">{tpl.name}</h4>
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

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : recentProjects.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-4 left-8 text-6xl rotate-12">🎮</div>
                            <div className="absolute top-8 right-12 text-5xl -rotate-6">⚡</div>
                            <div className="absolute bottom-6 left-16 text-5xl rotate-[-8deg]">📱</div>
                            <div className="absolute bottom-4 right-8 text-6xl rotate-6">🚀</div>
                        </div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                                <FileCode size={36} className="text-violet-500" />
                            </div>
                            <p className="text-lg font-bold text-slate-700 mb-2">No projects yet</p>
                            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Start building your first game, app, or circuit project above!</p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        const newProj = createNewProject(AppMode.GAME);
                                        setProject(newProj);
                                    }}
                                    className="touch-feedback px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all text-sm"
                                >
                                    Create First Project
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {recentProjects.map(proj => (
                            <div
                                key={proj.id}
                                className="bg-white border border-slate-200 p-4 rounded-2xl hover:shadow-md transition-all text-left relative group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${(MODE_CONFIG as any)[proj.mode]?.color || 'bg-slate-500'}`}>
                                        {(MODE_CONFIG as any)[proj.mode]?.label || proj.mode}
                                    </span>

                                    <span className="text-[10px] text-slate-400">{new Date(proj.lastEdited).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 truncate mb-4">{proj.name}</h4>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setProject(proj)}
                                        className="p-2 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-600 hover:text-white transition-all flex-1 flex justify-center"
                                        title="Open"
                                    >
                                        <FolderOpen size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemix(e, proj)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex-1 flex justify-center"
                                        title="Remix"
                                    >
                                        <GitFork size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, proj)}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all flex-1 flex justify-center"
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

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Delete Project?</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteTarget.name}"</span> forever?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(HomeScreen);
