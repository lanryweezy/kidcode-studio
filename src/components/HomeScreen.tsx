
import React from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { AppMode, CircuitComponent } from '../types';
import { MODE_CONFIG, EXAMPLE_TEMPLATES } from '../constants';
import { STARTER_TEMPLATES } from '../constants/templates/starter';
import { createNewProject, getProjects, remixProject, deleteProject, SavedProject } from '../services/storageService';
import { generateModePlaceholder } from '../services/thumbnailGenerator';
import { playSoundEffect } from '../services/soundService';
import { trackFeatureUse } from '../services/kidcodeAnalytics';
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
    X,
    FolderPlus,
    Play,
    Gamepad2,
    Smartphone,
    Cpu,
    Pickaxe,
    TrendingUp,
    Heart,
    Eye,
} from 'lucide-react';
import { SkeletonCard } from './ui/Skeleton';
import { STORAGE_KEYS } from '../constants/actions';
import { getStudios, Studio } from '../services/studioService';
import { GalleryProject } from '../types/gallery';
import { getTrendingProjects, initGalleryWithSamples } from '../services/galleryService';
import { getSampleProjects } from '../constants/sampleProjects';

const SCATTERED_ROTATIONS = [-2, 1.5, -0.8, 2, -1.2];
const SCATTERED_OFFSETS = [
    { x: -6, y: 4 },
    { x: 8, y: -3 },
    { x: -3, y: 7 },
    { x: 5, y: -5 },
    { x: -8, y: 2 },
];

const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const {
        userProfile,
        setShowPricing,
        setShowProfile,
        setProject,
        setShowGallery,
        setShowStudioManager,
        setShowStudioDetail,
    } = useStore();

    const [recentProjects, setRecentProjects] = React.useState(getProjects());
    const [userStudios, setUserStudios] = React.useState<Studio[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        getStudios().then(setUserStudios);
    }, []);

    const handleRemix = React.useCallback(async (e: React.MouseEvent, proj: SavedProject) => {
        e.stopPropagation();
        const optimisticId = `temp-remix-${  Date.now()}`;
        const optimisticProject = { ...proj, id: optimisticId, name: `${proj.name  } (Remix)`, lastEdited: Date.now() };
        setRecentProjects(prev => [optimisticProject, ...prev]);
        playSoundEffect('powerup');

        try {
            await remixProject(proj);
            setRecentProjects(getProjects());
        } catch (error) {
            setRecentProjects(prev => prev.filter(p => p.id !== optimisticId));
        }
    }, []);

    const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
    const [loadingTemplate, setLoadingTemplate] = React.useState<string | null>(null);

    const [onboardingDismissed, setOnboardingDismissed] = React.useState(() => {
        return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DISMISSED) === 'true';
    });

    const isReturningUser = recentProjects.length > 0;
    const isFirstVisit = !localStorage.getItem('kidcode_has_visited');

    const handleQuickStart = React.useCallback(() => {
        trackFeatureUse('quick_start_clicked');
        const starter = STARTER_TEMPLATES[AppMode.GAME];
        const newProj = createNewProject(AppMode.GAME);
        newProj.name = starter.name;
        newProj.data.commands = starter.commands.map(c => ({ ...c, id: window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11) }));
        if (starter.circuitComponents) {
            newProj.data.circuitComponents = starter.circuitComponents as CircuitComponent[];
        }
        setProject(newProj);
    }, [setProject]);

    const handleModeSelect = React.useCallback((selectedMode: AppMode) => {
        trackFeatureUse('mode_selected');
        const starter = STARTER_TEMPLATES[selectedMode];
        const newProj = createNewProject(selectedMode);
        newProj.name = starter.name;
        newProj.data.commands = starter.commands.map(c => ({ ...c, id: window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11) }));
        if (starter.circuitComponents) {
            newProj.data.circuitComponents = starter.circuitComponents as CircuitComponent[];
        }
        setProject(newProj);
    }, [setProject]);

    const handleDismissOnboarding = () => {
        setOnboardingDismissed(true);
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_DISMISSED, 'true');
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

    const confirmDelete = React.useCallback(async () => {
        if (!deleteTarget) return;
        const previousProjects = recentProjects;
        setRecentProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
        playSoundEffect('hurt');
        setDeleteTarget(null);

        try {
            await deleteProject(deleteTarget.id);
        } catch (error) {
            setRecentProjects(previousProjects);
        }
    }, [deleteTarget, recentProjects]);

    const MODE_ICONS: Record<AppMode, React.ReactNode> = {
        [AppMode.GAME]: <Gamepad2 size={32} />,
        [AppMode.APP]: <Smartphone size={32} />,
        [AppMode.HARDWARE]: <Cpu size={32} />,
        [AppMode.MINECRAFT]: <Pickaxe size={32} />,
    };

    const MODE_DESCRIPTIONS: Record<AppMode, string> = {
        [AppMode.GAME]: 'Build platformers, adventures, and arcade games',
        [AppMode.APP]: 'Design mobile apps with buttons, inputs, and screens',
        [AppMode.HARDWARE]: 'Simulate Arduino circuits with LEDs and sensors',
        [AppMode.MINECRAFT]: 'Create Minecraft mods and build terrains',
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors font-sans pb-20 relative">
            {isFirstVisit && (
                <div className="min-h-screen flex flex-col items-center justify-center p-6">
                    <div className="max-w-2xl w-full text-center mb-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl animate-float">
                            <Zap size={40} fill="currentColor" />
                        </div>
                        <h1 className="text-4xl font-black mb-3">What do you want to build today?</h1>
                        <p className="text-lg text-slate-500 font-medium">Pick a mode and start creating in seconds!</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
                        {Object.values(AppMode).map((m) => {
                            const config = MODE_CONFIG[m];
                            return (
                                <button
                                    key={m}
                                    onClick={() => handleModeSelect(m)}
                                    className="group p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-violet-400 hover:shadow-xl transition-all duration-300 text-left hover:scale-[1.03] sculpted"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md ${config.color} group-hover:scale-110 transition-transform`}>
                                        {MODE_ICONS[m]}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">{config.label}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{MODE_DESCRIPTIONS[m]}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!isFirstVisit && (<>
            <div className="absolute top-20 right-[5%] text-4xl bob-float opacity-15 select-none pointer-events-none" aria-hidden="true">🎮</div>
            <div className="absolute top-[40%] left-[3%] text-3xl bob-float bob-float-delay-1 opacity-10 select-none pointer-events-none rotate-12" aria-hidden="true">⚡</div>
            <div className="absolute bottom-[20%] right-[8%] text-3xl bob-float bob-float-delay-2 opacity-10 select-none pointer-events-none -rotate-6" aria-hidden="true">🚀</div>
            <div className="absolute top-[60%] left-[8%] text-2xl bob-float bob-float-delay-3 opacity-10 select-none pointer-events-none" aria-hidden="true">✨</div>
            <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-float">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black tracking-tight leading-none">KidCode Studio</h1>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-violet-500 mt-1">{t('home.dashboard')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => useStore.getState().setShowLanding(true)}
                        className="text-xs font-bold text-slate-400 hover:text-violet-500 transition-colors mr-4"
                    >
                        {t('home.viewPublicPage')}
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
                <div className="volume-hero -mx-6 -mt-8 px-6 py-10 mb-8 rounded-b-3xl">
                    {isReturningUser && (
                        <div className="mb-6 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-violet-200 animate-in fade-in slide-in-from-top-2 duration-500">
                            <p className="text-sm font-bold text-violet-700">
                                {t('home.welcomeBack', { name: userProfile?.name || 'Explorer' })}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-4xl font-black animate-in slide-in-from-left-10 fade-in duration-500">
                                {t('home.whatToBuild')}?
                        </h2>
                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 skew-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest leading-none">{t('home.liveKids')}</span>
                        </div>
                    </div>
                </div>

                {/* Social Proof Stats Bar */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10 py-4 px-6 bg-white rounded-2xl border border-slate-200 sculpted-inset animate-in fade-in slide-in-from-bottom-4 duration-700 skew-1 overflow-accent">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 skew-1">
                        <span className="text-2xl">🧑‍💻</span>
                        <span><span className="text-violet-600 text-lg">200+</span> Blocks</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 skew-2">
                        <span className="text-2xl">🎮</span>
                        <span><span className="text-emerald-600 text-lg">3D</span> Game Engine</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 skew-3">
                        <span className="text-2xl">⚡</span>
                        <span><span className="text-amber-600 text-lg">50+</span> Circuit Parts</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 skew-1">
                        <span className="text-2xl">📱</span>
                        <span>Publish to <span className="text-blue-600 text-lg hand-drawn-underline">Web</span></span>
                    </div>
                </div>

                {/* Onboarding Checklist for New Users */}
                {!onboardingDismissed && !isReturningUser && (
                    <div className="mb-8 p-6 rounded-2xl bg-white border border-violet-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 skew-1">
                                <Sparkles size={18} className="text-violet-500" /> <span className="font-extralight italic">{t('home.gettingStarted').split(' ')[0]}</span> {t('home.gettingStarted').split(' ').slice(1).join(' ')}
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

                <div className="mb-8">
                    <button
                        onClick={handleQuickStart}
                        className="w-full p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] transition-all duration-300 group sculpted-lg"
                    >
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Play size={28} fill="currentColor" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-2xl font-black mb-0.5">Start Building Now</h3>
                            <p className="text-sm opacity-90 font-medium">No setup needed — jump right in!</p>
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" style={{ gap: '1.5rem' }}>
                    {Object.values(AppMode).map((m, i) => {
                        const config = MODE_CONFIG[m];
                        const Icon = config.icon;
                        const rot = SCATTERED_ROTATIONS[i % SCATTERED_ROTATIONS.length];
                        const offset = SCATTERED_OFFSETS[i % SCATTERED_OFFSETS.length];
                        const sizeVar = i % 3 === 0 ? 'min-h-[280px]' : i % 3 === 1 ? 'min-h-[260px]' : 'min-h-[300px]';
                        return (
                            <button
                                key={m}
                                style={{
                                    animationDelay: `${i * 100}ms`,
                                    transform: `rotate(${rot}deg) translate(${offset.x}px, ${offset.y}px)`,
                                }}
                                onClick={() => {
                                    const newProj = createNewProject(m);
                                    setProject(newProj);
                                }}
                                className={`relative group ${sizeVar} rounded-3xl p-8 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.05] hover:shadow-2xl text-white ${config.color} touch-feedback scattered-card`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                                    <Icon size={120} />
                                </div>
                                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner animate-float skew-2">
                                    <Icon size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mb-2 skew-1">{config.label}</h3>
                                    <p className="opacity-90 font-medium text-sm leading-relaxed">{m === AppMode.APP ? 'Design real mobile apps with buttons, inputs & screens.' : m === AppMode.GAME ? 'Build 2D platformers & 3D open-world adventures.' : m === AppMode.HARDWARE ? 'Simulate Arduino circuits with 50+ parts.' : 'Create Minecraft mods and datapacks with blocks!'}</p>
                                </div>
                                <div className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 group-hover:rotate-90 duration-300">
                                    <Plus size={24} />
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="mb-12">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 skew-1"><Sparkles size={20} className="text-yellow-500" /> {t('home.instantStarters').split(' ')[0]} <span className="font-extralight italic text-slate-400">{t('home.instantStarters').split(' ').slice(1).join(' ')}</span></h3>
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
                                        newProj.data.commands = tpl.commands.map(c => ({ ...c, id: window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11) }));
                                        if (tpl.circuitComponents && tpl.mode === AppMode.HARDWARE) {
                                            newProj.data.circuitComponents = tpl.circuitComponents as CircuitComponent[];
                                        }
                                        setProject(newProj);
                                    }, 400);
                                }}
                                className="bg-white border border-slate-200 p-4 rounded-2xl sculpted depth-hover text-left group"
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
                        className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-violet-600 to-blue-600 text-white flex items-center justify-between group overflow-hidden relative shadow-xl hover:scale-[1.01] transition-transform skew-1 scattered-card"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <Users size={160} />
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-inner">
                                <Users size={40} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-3xl font-black mb-1 skew-2">Community <span className="font-extralight italic text-xl text-white/70">Gallery</span></h3>
                                <p className="text-lg opacity-90 font-medium drift-left">See what other kids are building and <span className="font-black hand-drawn-underline">remix</span> their code!</p>
                            </div>
                        </div>
                        <div className="bg-white text-violet-600 px-6 py-3 rounded-2xl font-black shadow-lg group-hover:bg-violet-50 transition-colors flex items-center gap-2">
                            EXPLORE <Sparkles size={18} fill="currentColor" />
                        </div>
                    </button>
                </div>

                <TrendingGallerySection />

                {/* Studios Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 skew-2"><FolderPlus size={20} className="text-violet-500" /> {t('home.myStudios').split(' ')[0]} <span className="font-extralight italic text-slate-400">{t('home.myStudios').split(' ').slice(1).join(' ')}</span></h3>
                        <button
                            onClick={() => setShowStudioManager(true)}
                            className="text-sm font-bold text-violet-500 hover:text-violet-600"
                        >
                            {t('home.manage')}
                        </button>
                    </div>
                    {userStudios.length === 0 ? (
                        <button
                            onClick={() => setShowStudioManager(true)}
                            className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-center group"
                        >
                            <FolderPlus size={28} className="mx-auto text-slate-300 group-hover:text-violet-400 mb-2" />
                            <p className="font-bold text-slate-500 group-hover:text-violet-600 text-sm">{t('home.createFirstStudio')}</p>
                            <p className="text-xs text-slate-400">Organize projects into collections</p>
                        </button>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                            {userStudios.slice(0, 6).map(studio => (
                                <button
                                    key={studio.id}
                                    onClick={() => setShowStudioDetail(studio.id)}
                                    className="min-w-[200px] max-w-[220px] bg-white border border-slate-200 p-4 rounded-2xl hover:shadow-xl hover:border-violet-300 transition-all duration-300 text-left shrink-0 group card-hover-tilt"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-3 group-hover:from-violet-200 group-hover:to-indigo-200 transition-colors">
                                        <FolderPlus size={22} className="text-violet-500" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 truncate group-hover:text-violet-600 transition-colors">{studio.name}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">{studio.projects.length} project{studio.projects.length !== 1 ? 's' : ''}</p>
                                </button>
                            ))}
                            <button
                                onClick={() => setShowStudioManager(true)}
                                className="min-w-[160px] bg-slate-50 border border-dashed border-slate-300 p-4 rounded-2xl hover:bg-violet-50 hover:border-violet-300 transition-all text-center shrink-0 flex flex-col items-center justify-center"
                            >
                                <Plus size={20} className="text-slate-400 mb-1" />
                                <span className="text-xs font-bold text-slate-500">{t('home.newStudio')}</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 skew-1"><FileCode size={20} /> {t('home.recentProjects').split(' ')[0]} <span className="font-extralight italic text-slate-400">{t('home.recentProjects').split(' ').slice(1).join(' ')}</span></h3>
                    <button className="text-sm font-bold text-violet-500 hover:text-violet-600">{t('home.viewAll')}</button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : recentProjects.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden sculpted-inset">
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
                            <p className="text-lg font-bold text-slate-700 mb-2">{t('home.noProjectsYet')}</p>
                            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">{t('home.noProjectsHint')}</p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        const newProj = createNewProject(AppMode.GAME);
                                        setProject(newProj);
                                    }}
                                    className="touch-feedback px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all text-sm"
                                >
                                    {t('home.createFirstProject')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {recentProjects.map(proj => (
                            <div
                                key={proj.id}
                                className="bg-white border border-slate-200 rounded-2xl hover:shadow-xl transition-all duration-300 text-left relative group overflow-hidden card-hover-tilt hover:border-violet-300"
                            >
                                <div
                                    className="relative h-32 bg-cover bg-center flex items-end card-image"
                                    style={{
                                        backgroundImage: proj.thumbnail
                                            ? `url(${proj.thumbnail})`
                                            : `url(${generateModePlaceholder(proj.mode)})`,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="relative z-10 p-3 w-full">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${MODE_CONFIG[proj.mode]?.color || 'bg-slate-500'}`}>
                                            {MODE_CONFIG[proj.mode]?.label || proj.mode}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800 truncate text-sm">{proj.name}</h4>
                                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{new Date(proj.lastEdited).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
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
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl sculpted-lg border border-slate-200 p-6 max-w-sm w-full animate-modal-open">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{t('home.deleteProject')}</h3>
                                <p className="text-sm text-slate-500">{t('home.actionUndone')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            {t('home.deleteConfirm', { name: deleteTarget.name })}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </>)}
        </div>
    );
};

const TrendingGallerySection: React.FC = () => {
    const { setProject, setShowGallery } = useStore();
    const [trending, setTrending] = React.useState<GalleryProject[]>([]);
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            const samples = getSampleProjects();
            await initGalleryWithSamples(samples);
            const projects = await getTrendingProjects(4);
            setTrending(projects);
            setLoaded(true);
        };
        load();
    }, []);

    if (!loaded || trending.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 skew-1">
                    <TrendingUp size={20} className="text-rose-500" /> Trending <span className="font-extralight italic text-slate-400">in Gallery</span>
                </h3>
                <button onClick={() => setShowGallery(true)} className="text-sm font-bold text-violet-500 hover:text-violet-600">
                    View All
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {trending.map((proj) => {
                    const config = MODE_CONFIG[proj.mode];
                    return (
                        <div
                            key={proj.id}
                            className="bg-white border border-slate-200 rounded-2xl hover:shadow-xl transition-all duration-300 text-left relative group overflow-hidden card-hover-tilt hover:border-violet-300"
                        >
                            <div
                                className="relative h-28 bg-cover bg-center flex items-end"
                                style={{
                                    background: proj.thumbnail
                                        ? `url(${proj.thumbnail}) center/cover`
                                        : undefined,
                                    backgroundColor: !proj.thumbnail ? undefined : undefined,
                                }}
                            >
                                {!proj.thumbnail && (
                                    <div className={`absolute inset-0 ${config.color} flex items-center justify-center`}>
                                        <div className="text-white/20">
                                            {React.createElement(config.icon, { size: 40 })}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="relative z-10 p-3 w-full">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${config.color}`}>
                                        {config.label.split(' ')[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-slate-800 truncate text-sm mb-1">{proj.name}</h4>
                                <p className="text-xs text-slate-400 truncate mb-2">by {proj.author}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                    <span className="flex items-center gap-1">
                                        <Heart size={12} className="text-rose-400" /> {proj.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye size={12} /> {proj.views}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(HomeScreen);
