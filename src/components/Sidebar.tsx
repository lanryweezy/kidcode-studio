
import React from 'react';
import { useStore } from '../store/useStore';
import { AppMode, BlockDefinition, CommandType, ComponentType } from '../types';
import { AVAILABLE_BLOCKS, CIRCUIT_PALETTE, CHARACTER_PALETTE, MODE_CONFIG } from '../constants';
import SidebarDock from './SidebarDock';
import AIChat from './AIChat';
import ComponentThumbnail from './ComponentThumbnail';
import {
    Search, ChevronDown, ChevronRight, Layout, Plus, Palette, Square,
    ToggleLeft, SlidersHorizontal, PanelTop, Trash2, Ghost, Paintbrush,
    Loader2, Sparkles, MessageSquare, Terminal, Pencil, Image, Code2, Download, FileCode, Music, Mic, Box, Film, Headphones, Scissors
} from 'lucide-react';
import { exportToPython, exportToJavaScript } from '../services/codeExporter';
import AnimationSequencer from './AnimationSequencer';

const Sidebar: React.FC<any> = ({
    handleAppendCode,
    handleReplaceCode,
    handleGenerateSprite,
    isGeneratingSprite,
}) => {
    const [designTab, setDesignTab] = React.useState<'sprite' | 'animations'>('sprite');

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
        setShowStats
    } = useStore();


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
        <div className="flex h-full overflow-hidden">
            <SidebarDock
                mode={mode}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onHome={() => setShowHome(true)}
                onOpenProfile={() => setShowProfile(true)}
                onShowStats={() => setShowStats(true)}
            />

            <div className="glass dark:glass-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-all duration-75 relative z-20" style={{ width: leftPanelWidth }}>
                {activeTab === 'export' && (
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-lg flex items-center justify-center">
                                <Code2 size={18} />
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Code Export</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Python Block */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <FileCode size={12} className="text-blue-500" /> Python
                                    </span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(pythonCode); alert('Python code copied!'); }}
                                        className="text-[10px] font-bold text-violet-500 hover:text-violet-600 px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        COPY
                                    </button>
                                </div>
                                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-xl leading-relaxed">
                                    {pythonCode}
                                </pre>
                            </div>

                            {/* JavaScript Block */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <FileCode size={12} className="text-yellow-500" /> JavaScript
                                    </span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(jsCode); alert('JavaScript code copied!'); }}
                                        className="text-[10px] font-bold text-violet-500 hover:text-violet-600 px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        COPY
                                    </button>
                                </div>
                                <pre className="p-4 bg-slate-950 text-blue-400 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-xl leading-relaxed">
                                    {jsCode}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800/30">
                            <p className="text-xs text-violet-600 dark:text-violet-400 font-bold mb-1 italic">Pro Tip!</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                                Learning these languages will help you build real-world software and games! Python is great for AI, and JavaScript is used for every website on Earth.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' ? (
                    <AIChat currentMode={mode} onAppendCode={handleAppendCode} onReplaceCode={handleReplaceCode} />
                ) : activeTab === 'design' && mode === AppMode.APP ? (
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Layout className="text-blue-500" /> App Designer
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-3 mb-6">
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                    <Plus size={18} /> Add New Screen
                                </button>
                            </div>
                            <div className="space-y-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase">UI Components</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Text', 'Button', 'Input', 'Image'].map(name => (
                                        <button key={name} className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                            <Square className="text-slate-600 dark:text-slate-300 mb-1" size={20} />
                                            <span className="text-xs">{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'design' && mode === AppMode.GAME ? (
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <button onClick={() => setDesignTab('sprite')} className={`flex-1 py-1 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${designTab === 'sprite' ? 'bg-white dark:bg-slate-700 shadow text-violet-500' : 'text-slate-500'}`}><Ghost size={16} /> Sprite</button>
                                <button onClick={() => setDesignTab('animations')} className={`flex-1 py-1 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${designTab === 'animations' ? 'bg-white dark:bg-slate-700 shadow text-violet-500' : 'text-slate-500'}`}><Film size={16} /> Anims</button>
                            </div>
                        </div>
                        {designTab === 'sprite' ? (
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="aspect-square bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-center relative shadow-inner overflow-hidden">
                                    {spriteState.texture ? (
                                        <img src={spriteState.texture} className="max-w-[80%] max-h-[80%] object-contain drop-shadow-lg" alt="Sprite Texture" />
                                    ) : (
                                        <span className="text-6xl">{spriteState.emoji}</span>
                                    )}
                                </div>
                                <div className="space-y-3 mb-6">
                                    <button onClick={() => setShowAssetManager(true)} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Box size={18} /> Asset Manager
                                    </button>
                                    <button onClick={() => setShowPixelEditor(true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Paintbrush size={18} /> Draw Pixel Art
                                    </button>
                                    <button onClick={() => setShowParticleEditor(true)} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Sparkles size={18} /> FX Studio
                                    </button>
                                    <button onClick={() => setShowAI3DCreator(true)} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Box size={18} /> AI 3D Creator
                                    </button>
                                    <button onClick={() => setShowMusicStudio(true)} className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Music size={18} /> Music Studio
                                    </button>
                                    <button onClick={() => setShowSoundRecorder(true)} className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Mic size={18} /> Sound Lab
                                    </button>
                                    <button onClick={() => setShowMusicGenerator(true)} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Headphones size={18} /> AI Music Gen
                                    </button>
                                    <button onClick={() => setShowSpriteExtractor(true)} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <Scissors size={18} /> Sprite Extractor
                                    </button>
                                    <button onClick={handleGenerateSprite} disabled={isGeneratingSprite} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        {isGeneratingSprite ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                        AI Generate
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <AnimationSequencer />
                        )}
                    </div>
                ) : activeTab === 'components' && mode === AppMode.HARDWARE ? (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search parts..." value={circuitSearch} onChange={(e) => setCircuitSearch(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 pl-9 pr-3 py-2 rounded-lg text-sm outline-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {(Object.entries(groupedComponents) as [string, any[]][]).map(([category, components]) => {
                                const filtered = components.filter((c: any) => c.label.toLowerCase().includes(circuitSearch.toLowerCase()));
                                if (filtered.length === 0) return null;
                                const isExpanded = expandedCategories[category] !== false;
                                return (
                                    <div key={category} className="mb-2">
                                        <button onClick={() => setExpandedCategories({ ...expandedCategories, [category]: !isExpanded })} className="flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2">
                                            {category}
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <div className="space-y-2 py-1">
                                                    {filtered.map((comp: any) => (
                                                        <div key={comp.type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(comp)); }} className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600 transition-all">
                                                            <ComponentThumbnail type={comp.type} />
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{comp.label}</span>
                                                                <span className="text-[10px] text-slate-400 line-clamp-1">{comp.description}</span>
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
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Block Library</h3>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search blocks..." value={blockSearch} onChange={(e) => setBlockSearch(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 pl-9 pr-3 py-2 rounded-lg text-sm outline-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {Object.entries(groupedBlocks).map(([category, blocks]) => {
                                const filtered = blocks.filter(b => b.label.toLowerCase().includes(blockSearch.toLowerCase()));
                                if (filtered.length === 0) return null;
                                const isExpanded = expandedCategories[category] !== false;
                                return (
                                    <div key={category} className="mb-2">
                                        <button onClick={() => setExpandedCategories({ ...expandedCategories, [category]: !isExpanded })} className="flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2">
                                            {category}
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <div className="space-y-2 py-1">
                                                    {filtered.map((def) => (
                                                        <div key={def.type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(def)); }} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600 transition-all">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${def.color} shadow-sm`}>
                                                                {React.createElement(def.icon, { size: 16 })}
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{def.label}</span>
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
                )}
            </div>
        </div>
    );
};

export default Sidebar;
