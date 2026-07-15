import React from 'react';
import { Plugin, PluginMetadata, pluginSystem } from '../../services/pluginSystem';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import {
    Puzzle, Search, Download, Trash2, ToggleLeft, ToggleRight,
    Info, Tag, User, Package, ChevronDown, ChevronRight
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
    block: 'Blocks',
    theme: 'Themes',
    engine: 'Engines',
    ui: 'UI Panels',
    ai: 'AI Tools',
    export: 'Exporters',
};

const CATEGORY_ICONS: Record<string, string> = {
    block: '🧱',
    theme: '🎨',
    engine: '⚙️',
    ui: '🖥️',
    ai: '🤖',
    export: '📤',
};

const PLUGIN_CATALOG: PluginMetadata[] = [
    {
        id: 'plugin-collision-pro',
        name: 'Collision Pro',
        version: '1.0.0',
        author: 'KidCode Labs',
        description: 'Advanced collision detection with AABB, circle, and pixel-perfect modes',
        category: 'engine',
        minAppVersion: '1.0.0',
        icon: '💥',
    },
    {
        id: 'plugin-particle-pack',
        name: 'Particle Pack',
        version: '2.1.0',
        author: 'KidCode Labs',
        description: '50+ pre-built particle effects: fire, water, smoke, sparkles, and more',
        category: 'block',
        minAppVersion: '1.0.0',
        icon: '✨',
    },
    {
        id: 'plugin-retro-filters',
        name: 'Retro Filters',
        version: '1.2.0',
        author: 'PixelArt Co',
        description: 'CRT scanline, VHS glitch, and 8-bit pixel art visual filters',
        category: 'theme',
        minAppVersion: '1.0.0',
        icon: '📺',
    },
    {
        id: 'plugin-ai-npc',
        name: 'AI NPC Dialogue',
        version: '1.0.0',
        author: 'KidCode AI',
        description: 'Generate dynamic NPC conversations using AI with memory and personality',
        category: 'ai',
        minAppVersion: '1.0.0',
        icon: '🤖',
    },
    {
        id: 'plugin-unity-export',
        name: 'Unity Exporter',
        version: '1.1.0',
        author: 'KidCode Labs',
        description: 'Export your game project as a Unity-compatible C# project',
        category: 'export',
        minAppVersion: '1.0.0',
        icon: '📦',
    },
    {
        id: 'plugin-tilemap-tools',
        name: 'Tilemap Tools',
        version: '1.0.0',
        author: 'MapMaster',
        description: 'Advanced tilemap editor with auto-tiling, layer blending, and collision maps',
        category: 'ui',
        minAppVersion: '1.0.0',
        icon: '🗺️',
    },
    {
        id: 'plugin-sound-synth',
        name: 'Sound Synthesizer',
        version: '1.0.0',
        author: 'AudioKid',
        description: 'Create chiptune sounds with oscillators, filters, and envelope controls',
        category: 'block',
        minAppVersion: '1.0.0',
        icon: '🎵',
    },
    {
        id: 'plugin-pathfinding',
        name: 'Smart Pathfinding',
        version: '1.0.0',
        author: 'KidCode Labs',
        description: 'A* pathfinding for enemies and NPCs with obstacle avoidance',
        category: 'engine',
        minAppVersion: '1.0.0',
        icon: '🧭',
    },
    {
        id: 'plugin-inventory-plus',
        name: 'Inventory Plus',
        version: '1.3.0',
        author: 'KidCode Labs',
        description: 'Drag-and-drop inventory system with tooltips, stacks, and rarity tiers',
        category: 'ui',
        minAppVersion: '1.0.0',
        icon: '🎒',
    },
    {
        id: 'plugin-web-export',
        name: 'Web Exporter',
        version: '2.0.0',
        author: 'KidCode Labs',
        description: 'Export as a standalone HTML5 game playable in any browser',
        category: 'export',
        minAppVersion: '1.0.0',
        icon: '🌐',
    },
];

interface PluginManagerProps {
    onPluginBlocksReady?: (blocks: Record<string, unknown>[]) => void;
}

const PluginManager: React.FC<PluginManagerProps> = React.memo(({ onPluginBlocksReady }) => {
    const { toast } = useToast();
    const [search, setSearch] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
    const [expandedPlugins, setExpandedPlugins] = React.useState<Record<string, boolean>>({});
    const [installedPlugins, setInstalledPlugins] = React.useState<Plugin[]>([]);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    React.useEffect(() => {
        setInstalledPlugins(pluginSystem.getAllPlugins());
    }, []);

    const installedIds = React.useMemo(
        () => new Set(installedPlugins.map(p => p.metadata.id)),
        [installedPlugins]
    );

    const filteredCatalog = React.useMemo(() => {
        return PLUGIN_CATALOG.filter(p => {
            const matchesSearch = !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase()) ||
                p.author.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !activeCategory || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [search, activeCategory]);

    const handleInstall = React.useCallback(async (meta: PluginMetadata) => {
        const placeholderPlugin: Plugin = {
            metadata: meta,
            onLifecycle: (event, ctx) => {
                if (event === 'init' && meta.category === 'block') {
                    const blockCount = Math.floor(Math.random() * 5) + 3;
                    for (let i = 0; i < blockCount; i++) {
                        ctx.registerBlock(`${meta.id}_block_${i}`, {
                            label: `${meta.name} Block ${i + 1}`,
                            color: 'bg-violet-500',
                            category: meta.name,
                            params: [
                                { name: 'value', type: 'number', default: 10 },
                            ],
                            execute: () => {},
                        });
                    }
                }
            },
            enabled: true,
        };

        const result = await pluginSystem.register(placeholderPlugin);
        if (result.success) {
            toast('success', `Installed ${meta.name}`);
            setInstalledPlugins(pluginSystem.getAllPlugins());
            forceUpdate();
        } else {
            toast('error', result.error || 'Failed to install');
        }
    }, [toast]);

    const handleUninstall = React.useCallback(async (id: string) => {
        const success = await pluginSystem.unregister(id);
        if (success) {
            toast('success', 'Plugin removed');
            setInstalledPlugins(pluginSystem.getAllPlugins());
            forceUpdate();
        }
    }, [toast]);

    const handleToggle = React.useCallback(async (id: string) => {
        const plugin = pluginSystem.getRegistered(id);
        if (!plugin) return;
        if (plugin.enabled) {
            await pluginSystem.disable(id);
            toast('info', 'Plugin disabled');
        } else {
            await pluginSystem.enable(id);
            toast('success', 'Plugin enabled');
        }
        setInstalledPlugins(pluginSystem.getAllPlugins());
        forceUpdate();
    }, [toast]);

    const toggleExpand = React.useCallback((id: string) => {
        setExpandedPlugins(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const categories = React.useMemo(() => {
        const cats = new Map<string, number>();
        for (const p of PLUGIN_CATALOG) {
            cats.set(p.category, (cats.get(p.category) || 0) + 1);
        }
        return Array.from(cats.entries());
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center">
                        <Puzzle size={18} />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Plugins</h3>
                    <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-1 rounded-full font-bold ml-auto">
                        {installedPlugins.length} installed
                    </span>
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search plugins..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                        aria-label="Search plugins"
                    />
                </div>
            </div>

            <div className="flex gap-1 p-2 overflow-x-auto border-b border-slate-200">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full whitespace-nowrap transition-colors ${
                        !activeCategory ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    All
                </button>
                    {categories.map(([cat, count]) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                            activeCategory === cat ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                            {CATEGORY_LABELS[cat] || cat}
                            <span className="opacity-60">({count})</span>
                        </button>
                    ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredCatalog.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Search size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No plugins match "{search}"</p>
                    </div>
                ) : (
                    filteredCatalog.map(meta => {
                        const isInstalled = installedIds.has(meta.id);
                        const installedPlugin = installedPlugins.find(p => p.metadata.id === meta.id);
                        const isEnabled = installedPlugin?.enabled ?? false;
                        const isExpanded = expandedPlugins[meta.id];
                        const CatIcon = CATEGORY_ICONS[meta.category] || Puzzle;

                        return (
                            <div
                                key={meta.id}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                            >
                                <div
                                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleExpand(meta.id)}
                                >
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                                        {meta.icon || '📦'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-800 truncate">{meta.name}</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full shrink-0">v{meta.version}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 truncate">{meta.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isInstalled ? (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggle(meta.id); }}
                                                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                                    title={isEnabled ? 'Disable' : 'Enable'}
                                                    aria-label={isEnabled ? `Disable ${meta.name}` : `Enable ${meta.name}`}
                                                >
                                                    {isEnabled ? (
                                                        <ToggleRight size={20} className="text-violet-500" />
                                                    ) : (
                                                        <ToggleLeft size={20} className="text-slate-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUninstall(meta.id); }}
                                                    className="p-1 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                                                    title="Uninstall"
                                                    aria-label={`Uninstall ${meta.name}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="xs"
                                                icon={<Download size={12} />}
                                                onClick={(e) => { e.stopPropagation(); handleInstall(meta); }}
                                            >
                                                Install
                                            </Button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleExpand(meta.id); }}
                                            className="p-1 text-slate-400"
                                            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                        >
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50">
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <User size={10} /> {meta.author}
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <Tag size={10} /> {CATEGORY_LABELS[meta.category] || meta.category}
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <Package size={10} /> Requires v{meta.minAppVersion}+
                                            </div>
                                            {meta.dependencies && meta.dependencies.length > 0 && (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Info size={10} /> Deps: {meta.dependencies.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                                            {meta.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

PluginManager.displayName = 'PluginManager';
export default PluginManager;
