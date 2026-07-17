
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { AppMode, BlockDefinition, CommandType, ComponentType } from '../types';
import { AVAILABLE_BLOCKS, CIRCUIT_PALETTE, CHARACTER_PALETTE, MODE_CONFIG } from '../constants';
import SidebarDock from './SidebarDock';
import AIChat from './AIChat';
import ComponentThumbnail from './ComponentThumbnail';
import { Skeleton } from './ui/Skeleton';
import {
    Search, ChevronDown, ChevronRight, Layout, Plus, Palette, Square,
    ToggleLeft, SlidersHorizontal, PanelTop, Trash2, Ghost, Paintbrush,
    Loader2, Sparkles, MessageSquare, Terminal, Pencil, Image, Code2, Download, FileCode, Music, Mic, Box, Film, Headphones, Scissors
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { exportToPython, exportToJavaScript } from '../services/codeExporter';
import AnimationSequencer from './AnimationSequencer';
import MissionProgress from './MissionProgress';

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
};

const SidebarTabContent: React.FC<any> = ({
    activeTab, mode, designTab, setDesignTab,
    localSearch, setLocalSearch, blockSearch, isSearchDebouncing,
    isBlockListLoading, groupedBlocks, groupedComponents,
    circuitSearch, setCircuitSearch, expandedCategories, setExpandedCategories,
    pythonCode, jsCode, toast,
    spriteState, handleGenerateSprite, isGeneratingSprite,
    handleAppendCode, handleReplaceCode,
    setShowPixelEditor, setShowParticleEditor, setShowMusicStudio,
    setShowSoundRecorder, setShowAssetManager, setShowAI3DCreator,
    setShowMusicGenerator, setShowSpriteExtractor,
}) => {
    if (activeTab === 'export') {
        return (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-touch bg-slate-50 min-h-0 tab-fade-in">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center">
                        <Code2 size={16} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Code Export</h3>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <FileCode size={12} className="text-blue-500" /> Python
                            </span>
                            <button onClick={() => { navigator.clipboard.writeText(pythonCode); toast('success', 'Python code copied!'); }} className="text-[10px] font-bold text-violet-500 hover:text-violet-600 px-2 py-1 rounded-md bg-white border border-slate-200">COPY</button>
                        </div>
                        <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">{pythonCode}</pre>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <FileCode size={12} className="text-yellow-500" /> JavaScript
                            </span>
                            <button onClick={() => { navigator.clipboard.writeText(jsCode); toast('success', 'JavaScript code copied!'); }} className="text-[10px] font-bold text-violet-500 hover:text-violet-600 px-2 py-1 rounded-md bg-white border border-slate-200">COPY</button>
                        </div>
                        <pre className="p-4 bg-slate-950 text-blue-400 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">{jsCode}</pre>
                    </div>
                </div>
            </div>
        );
    }
    if (activeTab === 'ai') {
        return <div className="flex-1 flex flex-col min-h-0 tab-fade-in"><AIChat currentMode={mode} onAppendCode={handleAppendCode} onReplaceCode={handleReplaceCode} /></div>;
    }
    if (activeTab === 'design' && mode === AppMode.APP) {
        return (
            <div className="flex flex-col h-full bg-slate-50 tab-fade-in">
                <div className="p-4 bg-white border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layout className="text-blue-500" size={16} /> App Designer</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-touch">
                    <button className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 mb-4">
                        <Plus size={16} /> Add New Screen
                    </button>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 mb-4">
                        <h4 className="font-semibold text-slate-600 text-xs uppercase mb-3">UI Components</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {['Text', 'Button', 'Input', 'Image'].map(name => (
                                <button key={name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <Square className="text-slate-500" size={16} />
                                    <span className="text-xs font-medium">{name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (activeTab === 'design' && mode === AppMode.GAME) {
        return (
            <div className="flex flex-col h-full bg-slate-50 tab-fade-in">
                <div className="p-4 bg-white border-b border-slate-200">
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button onClick={() => setDesignTab('sprite')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${designTab === 'sprite' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}><Ghost size={16} /> Sprite</button>
                        <button onClick={() => setDesignTab('animations')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${designTab === 'animations' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}><Film size={16} /> Anims</button>
                    </div>
                </div>
                {designTab === 'sprite' ? (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-touch">
                            <div className="aspect-square bg-white rounded-xl border border-slate-200 mb-4 flex items-center justify-center relative overflow-hidden">
                            {spriteState.texture ? (
                                <img src={spriteState.texture} className="max-w-[80%] max-h-[80%] object-contain" alt="Sprite Texture" loading="lazy" />
                            ) : (
                                <span className="text-5xl">{spriteState.emoji}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setShowPixelEditor(true)} className="flex items-center justify-center gap-1.5 p-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors">
                                <Paintbrush size={16} /> Draw
                            </button>
                            <button onClick={handleGenerateSprite} disabled={isGeneratingSprite} className="flex items-center justify-center gap-1.5 p-3 bg-violet-600 text-white font-semibold text-xs rounded-xl hover:bg-violet-700 transition-colors">
                                {isGeneratingSprite ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                AI Generate
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimationSequencer />
                )}
            </div>
        );
    }
    if (activeTab === 'components' && mode === AppMode.HARDWARE) {
        return (
            <div className="flex-1 flex flex-col min-h-0 tab-fade-in">
                <div className="p-3 border-b border-slate-200 bg-white">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search parts..." value={circuitSearch} onChange={(e) => setCircuitSearch(e.target.value)} className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-lg text-sm outline-none border border-slate-200 focus:border-violet-400 sculpted-inset" />
                    </div>
                </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1 scroll-touch">
                    {(Object.entries(groupedComponents) as [string, any[]][]).map(([category, components]) => {
                        const filtered = components.filter((c: any) => c.label.toLowerCase().includes(circuitSearch.toLowerCase()));
                        if (filtered.length === 0) return null;
                        const isExpanded = expandedCategories[category] !== false;
                        return (
                            <div key={category} className="mb-2">
                                <button onClick={() => setExpandedCategories({ ...expandedCategories, [category]: !isExpanded })} className="section-heading flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2">
                                    {category}
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="space-y-1.5 py-1">
                                            {filtered.map((comp: any, idx: number) => (
                                                <div key={comp.type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(comp)); }} className={`flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-grab active:cursor-grabbing hover:border-violet-300 transition-all ${isExpanded ? 'animate-in slide-in-from-left-4 fade-in duration-200' : ''}`}
                                                     style={{ animationDelay: `${idx * 30}ms` }}>
                                                    <ComponentThumbnail type={comp.type} />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-sm text-slate-700">{comp.label}</span>
                                                        <span className="text-[10px] text-slate-400 leading-snug line-clamp-2">{comp.description}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 flex flex-col min-h-0 tab-fade-in">
            <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-700 text-sm mb-2">Block Library</h3>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search blocks..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-lg text-sm outline-none border border-slate-200 focus:border-violet-400 sculpted-inset" />
                    {isSearchDebouncing && (
                        <div className="absolute right-2 top-2">
                            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scroll-touch custom-scrollbar">
                {isBlockListLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height="48px" rounded="rounded-xl" />
                        ))}
                    </div>
                ) : !blockSearch && (
                    <div className="mb-6">
                        <h4 className="font-bold text-slate-700 text-xs mb-3">Starter Blocks</h4>
                        <div className="grid grid-cols-1 gap-1.5">
                            {groupedBlocks['Events']?.slice(0, 2).map((def: any) => (
                                <div key={def.type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(def)); }} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white cursor-grab active:cursor-grabbing hover:border-violet-300 transition-all">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${def.color} shadow-sm`}>{React.createElement(def.icon as React.ComponentType<any>, { size: 14 })}</div>
                                    <span className="font-semibold text-xs text-slate-700">{def.label}</span>
                                </div>
                            ))}
                            {groupedBlocks['Motion']?.slice(0, 2).map((def: any) => (
                                <div key={def.type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(def)); }} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white cursor-grab active:cursor-grabbing hover:border-violet-300 transition-all">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${def.color} shadow-sm`}>{React.createElement(def.icon as React.ComponentType<any>, { size: 14 })}</div>
                                    <span className="font-semibold text-xs text-slate-700">{def.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {(Object.entries(groupedBlocks) as [string, any[]][]).map(([category, blocks]) => {
                    const filtered = blocks.filter((b: any) => b.label.toLowerCase().includes(blockSearch.toLowerCase()));
                    if (filtered.length === 0) return null;
                    const isExpanded = expandedCategories[category] !== false;
                    const isStarterCategory = category === 'Events' || category === 'Motion';
                    if (!blockSearch && isStarterCategory) return null;
                    return (
                        <div key={category} className="mb-2 border-b border-slate-100 pb-2 last:border-b-0">
                            <button onClick={() => setExpandedCategories({ ...expandedCategories, [category]: !isExpanded })} className="section-heading flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2 hover:text-slate-600 transition-colors group">
                                <span className="flex items-center gap-2">
                                    {category}
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{filtered.length}</span>
                                </span>
                                <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}><ChevronDown size={14} /></span>
                            </button>
                            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="space-y-1.5 py-1">
                                        {filtered.map((def: any, idx: number) => (
                                            <div key={def.type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(def)); }} className={`flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white cursor-grab active:cursor-grabbing hover:border-violet-300 transition-all ${isExpanded ? 'animate-in slide-in-from-left-4 fade-in duration-200' : ''}`}
                                                 style={{ animationDelay: `${idx * 25}ms` }}>
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${def.color} shadow-sm`}>{React.createElement(def.icon as React.ComponentType<any>, { size: 14 })}</div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-semibold text-xs text-slate-700 block">{def.label}</span>
                                                    {def.description && <span className="text-[10px] text-slate-400 leading-snug line-clamp-2 block">{def.description}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {blockSearch && (Object.entries(groupedBlocks) as [string, any[]][]).every(([_, blocks]) =>
                    blocks.filter((b: any) => b.label.toLowerCase().includes(blockSearch.toLowerCase())).length === 0
                ) && (
                    <div className="text-center py-8 px-4">
                        <Search size={28} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-sm text-slate-500 font-semibold mb-1">No blocks found for "{blockSearch}"</p>
                        <button onClick={() => setLocalSearch('')} className="text-xs font-bold text-violet-500 hover:text-violet-600 underline underline-offset-2">Clear search</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Sidebar: React.FC<any> = ({
    handleAppendCode,
    handleReplaceCode,
    handleGenerateSprite,
    isGeneratingSprite,
    isMobileDrawerOpen = false,
    onCloseMobileDrawer,
}) => {
    const { toast } = useToast();
    const [designTab, setDesignTab] = useState<'sprite' | 'animations'>('sprite');
    const [isBlockListLoading, setIsBlockListLoading] = useState(true);
    const [localSearch, setLocalSearch] = useState('');
    const debouncedSearch = useDebounce(localSearch, 300);
    const isSearchDebouncing = localSearch !== debouncedSearch;
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const drawerRef = useRef<HTMLDivElement>(null);
    const drawerTouchStart = useRef(0);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (isMobileDrawerOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else if (isMobile) {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileDrawerOpen, isMobile]);

    const handleDrawerBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onCloseMobileDrawer?.();
    }, [onCloseMobileDrawer]);

    const handleDrawerTouchStart = useCallback((e: React.TouchEvent) => {
        drawerTouchStart.current = e.touches[0].clientX;
    }, []);

    const handleDrawerTouchEnd = useCallback((e: React.TouchEvent) => {
        if (e.changedTouches[0].clientX - drawerTouchStart.current < -50) {
            onCloseMobileDrawer?.();
        }
    }, [onCloseMobileDrawer]);

    const {
        mode,
        activeTab, setActiveTab,
        setShowHome,
        setShowProfile,
        leftPanelWidth, setLeftPanelWidth,
        appState, updateAppState,
        spriteState, updateSpriteState,
        commands,
        setShowPixelEditor,
        setShowParticleEditor,
        setShowMusicStudio,
        setShowSoundRecorder,
        setShowAssetManager,
        setShowAI3DCreator,
        setShowMusicGenerator,
        setShowSpriteExtractor,
        circuitSearch, setCircuitSearch,
        blockSearch, setBlockSearch,
        expandedCategories, setExpandedCategories,
        setShowStats,
        activeMission, setActiveMission
    } = useStore();

    useEffect(() => {
        const timer = setTimeout(() => setIsBlockListLoading(false), 200);
        return () => clearTimeout(timer);
    }, [mode]);

    useEffect(() => {
        setBlockSearch(debouncedSearch);
    }, [debouncedSearch, setBlockSearch]);

    useEffect(() => {
        setLocalSearch(blockSearch);
    }, []);


    const pythonCode = exportToPython(commands, mode);
    const jsCode = exportToJavaScript(commands, mode);

    const groupedBlocks = (AVAILABLE_BLOCKS[mode] as BlockDefinition[]).reduce((acc, block) => {
        const cat = block.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(block);
        return acc;
    }, {} as Record<string, BlockDefinition[]>);

    const groupedComponents = CIRCUIT_PALETTE.reduce((acc, comp) => {
        const cat = comp.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(comp);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="flex h-full relative">
            {isMobile && (
                <>
                    <div
                        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm ${isMobileDrawerOpen ? 'backdrop-enter' : 'hidden'}`}
                        onClick={handleDrawerBackdropClick}
                    />
                    <div
                        ref={drawerRef}
                        className={`fixed top-14 left-0 bottom-0 z-50 flex sculpted gpu-accelerated ${isMobileDrawerOpen ? 'drawer-enter' : 'hidden'}`}
                        onTouchStart={handleDrawerTouchStart}
                        onTouchEnd={handleDrawerTouchEnd}
                    >
                        <SidebarDock
                            mode={mode}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            onHome={() => { setShowHome(true); onCloseMobileDrawer?.(); }}
                            onOpenProfile={() => { setShowProfile(true); onCloseMobileDrawer?.(); }}
                            onShowStats={() => { setShowStats(true); onCloseMobileDrawer?.(); }}
                        />
                        <div className="w-72 glass border-r border-slate-200 flex flex-col h-full relative z-20 min-h-0">
                            <SidebarTabContent
                                activeTab={activeTab} mode={mode} designTab={designTab} setDesignTab={setDesignTab}
                                localSearch={localSearch} setLocalSearch={setLocalSearch} blockSearch={blockSearch}
                                isSearchDebouncing={isSearchDebouncing} isBlockListLoading={isBlockListLoading}
                                groupedBlocks={groupedBlocks} groupedComponents={groupedComponents}
                                circuitSearch={circuitSearch} setCircuitSearch={setCircuitSearch}
                                expandedCategories={expandedCategories} setExpandedCategories={setExpandedCategories}
                                pythonCode={pythonCode} jsCode={jsCode} toast={toast}
                                spriteState={spriteState} handleGenerateSprite={handleGenerateSprite}
                                isGeneratingSprite={isGeneratingSprite} handleAppendCode={handleAppendCode}
                                handleReplaceCode={handleReplaceCode} setShowPixelEditor={setShowPixelEditor}
                                setShowParticleEditor={setShowParticleEditor} setShowMusicStudio={setShowMusicStudio}
                                setShowSoundRecorder={setShowSoundRecorder} setShowAssetManager={setShowAssetManager}
                                setShowAI3DCreator={setShowAI3DCreator} setShowMusicGenerator={setShowMusicGenerator}
                                setShowSpriteExtractor={setShowSpriteExtractor}
                            />
                        </div>
                    </div>
                </>
            )}

            {!isMobile && (
                <>
                    <SidebarDock
                        mode={mode}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onHome={() => setShowHome(true)}
                        onOpenProfile={() => setShowProfile(true)}
                        onShowStats={() => setShowStats(true)}
                    />

                    {activeMission && (
                        <div className="p-3 border-b border-slate-200">
                            <MissionProgress
                                mission={activeMission}
                                progress={50}
                                tasks={[
                                    { description: 'Add 5 blocks', completed: true },
                                    { description: 'Run your code', completed: false },
                                    { description: 'Save project', completed: false }
                                ]}
                                onDismiss={() => setActiveMission(null)}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs z-10 hover:bg-violet-600 transition-colors shadow-sm"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? '›' : '‹'}
                    </button>

                    <div className={`${isCollapsed ? 'w-16' : 'w-72'} glass border-r border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out relative z-20 min-h-0 sculpted`}>
                        {isCollapsed ? (
                            <div className="flex flex-col items-center gap-2 p-2">
                                <button onClick={() => { setLocalSearch(''); setIsCollapsed(false); }} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Blocks">
                                    <Palette size={18} className="text-slate-600" />
                                </button>
                                <button onClick={() => { setDesignTab('sprite'); setIsCollapsed(false); }} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Design">
                                    <Paintbrush size={18} className="text-slate-600" />
                                </button>
                                <button onClick={() => setIsCollapsed(false)} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Export">
                                    <Code2 size={18} className="text-slate-600" />
                                </button>
                                <button onClick={() => setIsCollapsed(false)} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="AI Assistant">
                                    <Sparkles size={18} className="text-slate-600" />
                                </button>
                            </div>
                        ) : (
                            <SidebarTabContent
                                activeTab={activeTab} mode={mode} designTab={designTab} setDesignTab={setDesignTab}
                                localSearch={localSearch} setLocalSearch={setLocalSearch} blockSearch={blockSearch}
                                isSearchDebouncing={isSearchDebouncing} isBlockListLoading={isBlockListLoading}
                                groupedBlocks={groupedBlocks} groupedComponents={groupedComponents}
                                circuitSearch={circuitSearch} setCircuitSearch={setCircuitSearch}
                                expandedCategories={expandedCategories} setExpandedCategories={setExpandedCategories}
                                pythonCode={pythonCode} jsCode={jsCode} toast={toast}
                                spriteState={spriteState} handleGenerateSprite={handleGenerateSprite}
                                isGeneratingSprite={isGeneratingSprite} handleAppendCode={handleAppendCode}
                                handleReplaceCode={handleReplaceCode} setShowPixelEditor={setShowPixelEditor}
                                setShowParticleEditor={setShowParticleEditor} setShowMusicStudio={setShowMusicStudio}
                                setShowSoundRecorder={setShowSoundRecorder} setShowAssetManager={setShowAssetManager}
                                setShowAI3DCreator={setShowAI3DCreator} setShowMusicGenerator={setShowMusicGenerator}
                                setShowSpriteExtractor={setShowSpriteExtractor}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(Sidebar);
