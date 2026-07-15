/**
 * Contextual Spaces System
 * Replaces tabs/modes with adaptive workspaces.
 * Each space transforms the entire UI to focus on one creative domain.
 */

export type SpaceType =
  | 'art'
  | 'world'
  | 'character'
  | 'story'
  | 'logic'
  | 'music'
  | 'cutscene'
  | 'publish'
  | 'graph';

export interface SpaceDefinition {
  id: SpaceType;
  name: string;
  emoji: string;
  description: string;
  color: string;
  gradient: string;
  panels: PanelDefinition[];
  tools: ToolDefinition[];
  aiAgents: string[];
  shortcuts: Record<string, string>;
}

export interface PanelDefinition {
  id: string;
  name: string;
  icon: string;
  defaultSize: number;
  minSize: number;
  component: string;
  collapsible: boolean;
}

export interface ToolDefinition {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  action: string;
}

export const SPACES: Record<SpaceType, SpaceDefinition> = {
  art: {
    id: 'art',
    name: 'Art Space',
    emoji: '🎨',
    description: 'Create sprites, tiles, and visual assets',
    color: '#f43f5e',
    gradient: 'from-rose-500 to-pink-600',
    panels: [
      { id: 'canvas', name: 'Canvas', icon: '🖼️', defaultSize: 500, minSize: 300, component: 'PixelEditor', collapsible: false },
      { id: 'palette', name: 'Palette', icon: '🎨', defaultSize: 200, minSize: 150, component: 'ColorPalette', collapsible: true },
      { id: 'layers', name: 'Layers', icon: '📚', defaultSize: 200, minSize: 150, component: 'LayerPanel', collapsible: true },
      { id: 'assets', name: 'Assets', icon: '📁', defaultSize: 250, minSize: 200, component: 'AssetBrowser', collapsible: true },
    ],
    tools: [
      { id: 'brush', name: 'Brush', icon: '🖌️', shortcut: 'B', action: 'tool:brush' },
      { id: 'eraser', name: 'Eraser', icon: '🧹', shortcut: 'E', action: 'tool:eraser' },
      { id: 'fill', name: 'Fill', icon: '🪣', shortcut: 'G', action: 'tool:fill' },
      { id: 'select', name: 'Select', icon: '✂️', shortcut: 'S', action: 'tool:select' },
      { id: 'ai-generate', name: 'AI Generate', icon: '🤖', action: 'ai:generateSprite' },
    ],
    aiAgents: ['art-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'pan' },
  },

  world: {
    id: 'world',
    name: 'World Space',
    emoji: '🌍',
    description: 'Design terrain, placement, and environment',
    color: '#22c55e',
    gradient: 'from-emerald-500 to-green-600',
    panels: [
      { id: 'viewport', name: 'Viewport', icon: '👁️', defaultSize: 600, minSize: 400, component: 'WorldViewport', collapsible: false },
      { id: 'terrain', name: 'Terrain', icon: '🏔️', defaultSize: 250, minSize: 200, component: 'TerrainBrush', collapsible: true },
      { id: 'objects', name: 'Objects', icon: '🧩', defaultSize: 250, minSize: 200, component: 'ObjectPlacer', collapsible: true },
      { id: 'weather', name: 'Weather', icon: '🌤️', defaultSize: 200, minSize: 150, component: 'WeatherControl', collapsible: true },
    ],
    tools: [
      { id: 'paint', name: 'Paint', icon: '🖌️', shortcut: 'P', action: 'tool:paintTerrain' },
      { id: 'erase', name: 'Erase', icon: '🧹', shortcut: 'E', action: 'tool:eraseTerrain' },
      { id: 'place', name: 'Place Object', icon: '📍', shortcut: 'O', action: 'tool:placeObject' },
      { id: 'paint-forest', name: 'Paint Forest', icon: '🌲', action: 'ai:paintForest' },
      { id: 'paint-village', name: 'Paint Village', icon: '🏘️', action: 'ai:paintVillage' },
      { id: 'paint-dungeon', name: 'Paint Dungeon', icon: '🏰', action: 'ai:paintDungeon' },
    ],
    aiAgents: ['level-agent', 'environment-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'pan', 'Tab': 'toggleObjects' },
  },

  character: {
    id: 'character',
    name: 'Character Space',
    emoji: '👤',
    description: 'Design characters, animations, and behaviors',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    panels: [
      { id: 'preview', name: 'Preview', icon: '👁️', defaultSize: 400, minSize: 300, component: 'CharacterPreview', collapsible: false },
      { id: 'appearance', name: 'Appearance', icon: '🎨', defaultSize: 250, minSize: 200, component: 'AppearanceEditor', collapsible: true },
      { id: 'animation', name: 'Animation', icon: '🎬', defaultSize: 300, minSize: 200, component: 'AnimationTimeline', collapsible: true },
      { id: 'behavior', name: 'AI Brain', icon: '🧠', defaultSize: 250, minSize: 200, component: 'BehaviorEditor', collapsible: true },
      { id: 'stats', name: 'Stats', icon: '📊', defaultSize: 200, minSize: 150, component: 'StatsEditor', collapsible: true },
    ],
    tools: [
      { id: 'edit-sprite', name: 'Edit Sprite', icon: '🖌️', action: 'tool:editSprite' },
      { id: 'add-animation', name: 'Add Animation', icon: '➕', action: 'tool:addAnimation' },
      { id: 'ai-design', name: 'AI Design Character', icon: '🤖', action: 'ai:designCharacter' },
    ],
    aiAgents: ['character-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'preview' },
  },

  story: {
    id: 'story',
    name: 'Story Space',
    emoji: '📖',
    description: 'Create quests, dialogue, and narrative',
    color: '#eab308',
    gradient: 'from-yellow-500 to-amber-600',
    panels: [
      { id: 'storyboard', name: 'Storyboard', icon: '📋', defaultSize: 500, minSize: 300, component: 'StoryCanvas', collapsible: false },
      { id: 'characters', name: 'Characters', icon: '👥', defaultSize: 200, minSize: 150, component: 'StoryCharacters', collapsible: true },
      { id: 'dialogue', name: 'Dialogue', icon: '💬', defaultSize: 300, minSize: 200, component: 'DialogueEditor', collapsible: true },
      { id: 'quests', name: 'Quests', icon: '📜', defaultSize: 250, minSize: 200, component: 'QuestEditor', collapsible: true },
    ],
    tools: [
      { id: 'add-scene', name: 'Add Scene', icon: '➕', action: 'tool:addScene' },
      { id: 'add-choice', name: 'Add Choice', icon: '🔀', action: 'tool:addChoice' },
      { id: 'ai-write', name: 'AI Write Story', icon: '🤖', action: 'ai:writeStory' },
      { id: 'ai-dialogue', name: 'AI Write Dialogue', icon: '🤖', action: 'ai:writeDialogue' },
    ],
    aiAgents: ['story-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'pan' },
  },

  logic: {
    id: 'logic',
    name: 'Logic Space',
    emoji: '🧩',
    description: 'Program game logic with visual blocks',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    panels: [
      { id: 'workspace', name: 'Workspace', icon: '🧩', defaultSize: 500, minSize: 300, component: 'BlockWorkspace', collapsible: false },
      { id: 'library', name: 'Block Library', icon: '📚', defaultSize: 250, minSize: 200, component: 'BlockLibrary', collapsible: true },
      { id: 'variables', name: 'Variables', icon: '📊', defaultSize: 200, minSize: 150, component: 'VariablePanel', collapsible: true },
      { id: 'preview', name: 'Preview', icon: '▶️', defaultSize: 300, minSize: 200, component: 'GamePreview', collapsible: true },
    ],
    tools: [
      { id: 'add-block', name: 'Add Block', icon: '➕', action: 'tool:addBlock' },
      { id: 'run', name: 'Run', icon: '▶️', shortcut: 'F5', action: 'tool:run' },
      { id: 'debug', name: 'Debug', icon: '🐛', shortcut: 'F9', action: 'tool:debug' },
      { id: 'ai-code', name: 'AI Generate Code', icon: '🤖', action: 'ai:generateCode' },
    ],
    aiAgents: ['programming-agent', 'testing-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'F5': 'run', 'F9': 'debug' },
  },

  music: {
    id: 'music',
    name: 'Music Space',
    emoji: '🎵',
    description: 'Create sound effects and music',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    panels: [
      { id: 'timeline', name: 'Timeline', icon: '🎵', defaultSize: 500, minSize: 300, component: 'AudioTimeline', collapsible: false },
      { id: 'instruments', name: 'Instruments', icon: '🎹', defaultSize: 250, minSize: 200, component: 'InstrumentPanel', collapsible: true },
      { id: 'effects', name: 'Effects', icon: '🎛️', defaultSize: 200, minSize: 150, component: 'EffectsPanel', collapsible: true },
      { id: 'library', name: 'Sound Library', icon: '📁', defaultSize: 250, minSize: 200, component: 'SoundLibrary', collapsible: true },
    ],
    tools: [
      { id: 'record', name: 'Record', icon: '🔴', shortcut: 'R', action: 'tool:record' },
      { id: 'play', name: 'Play', icon: '▶️', shortcut: 'Space', action: 'tool:play' },
      { id: 'ai-compose', name: 'AI Compose', icon: '🤖', action: 'ai:composeMusic' },
    ],
    aiAgents: ['audio-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'play' },
  },

  cutscene: {
    id: 'cutscene',
    name: 'Cutscene Space',
    emoji: '🎬',
    description: 'Create cinematic sequences and transitions',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-600',
    panels: [
      { id: 'timeline', name: 'Timeline', icon: '🎬', defaultSize: 500, minSize: 300, component: 'CutsceneTimeline', collapsible: false },
      { id: 'preview', name: 'Preview', icon: '👁️', defaultSize: 400, minSize: 300, component: 'CutscenePreview', collapsible: false },
      { id: 'camera', name: 'Camera', icon: '📷', defaultSize: 200, minSize: 150, component: 'CameraControls', collapsible: true },
    ],
    tools: [
      { id: 'add-shot', name: 'Add Shot', icon: '➕', action: 'tool:addShot' },
      { id: 'add-transition', name: 'Add Transition', icon: '🔄', action: 'tool:addTransition' },
      { id: 'ai-direct', name: 'AI Direct Scene', icon: '🤖', action: 'ai:directScene' },
    ],
    aiAgents: ['cinematography-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'play' },
  },

  publish: {
    id: 'publish',
    name: 'Publish Space',
    emoji: '🚀',
    description: 'Export, share, and publish your game',
    color: '#10b981',
    gradient: 'from-emerald-500 to-green-600',
    panels: [
      { id: 'export', name: 'Export', icon: '📦', defaultSize: 400, minSize: 300, component: 'ExportPanel', collapsible: false },
      { id: 'analytics', name: 'Analytics', icon: '📊', defaultSize: 300, minSize: 200, component: 'AnalyticsPanel', collapsible: true },
      { id: 'settings', name: 'Settings', icon: '⚙️', defaultSize: 250, minSize: 200, component: 'PublishSettings', collapsible: true },
    ],
    tools: [
      { id: 'export-web', name: 'Export Web', icon: '🌐', action: 'export:web' },
      { id: 'export-mobile', name: 'Export Mobile', icon: '📱', action: 'export:mobile' },
      { id: 'share', name: 'Share', icon: '🔗', action: 'share:link' },
    ],
    aiAgents: ['performance-agent'],
    shortcuts: { 'Ctrl+E': 'export' },
  },

  graph: {
    id: 'graph',
    name: 'World Graph',
    emoji: '🕸️',
    description: 'See relationships between all game assets',
    color: '#a855f7',
    gradient: 'from-purple-500 to-violet-600',
    panels: [
      { id: 'graph', name: 'Graph', icon: '🕸️', defaultSize: 700, minSize: 400, component: 'WorldGraph', collapsible: false },
      { id: 'details', name: 'Details', icon: '📋', defaultSize: 300, minSize: 200, component: 'NodeDetails', collapsible: true },
    ],
    tools: [
      { id: 'add-node', name: 'Add Node', icon: '➕', action: 'graph:addNode' },
      { id: 'add-connection', name: 'Connect', icon: '🔗', action: 'graph:addConnection' },
      { id: 'auto-organize', name: 'Auto Organize', icon: '✨', action: 'graph:autoOrganize' },
      { id: 'ai-connect', name: 'AI Connect Assets', icon: '🤖', action: 'ai:connectAssets' },
    ],
    aiAgents: ['graph-agent'],
    shortcuts: { 'Ctrl+Z': 'undo', 'Ctrl+Y': 'redo', 'Space': 'pan', 'F': 'fitAll' },
  },
};

export function getSpace(id: SpaceType): SpaceDefinition {
  return SPACES[id];
}

export function getAllSpaces(): SpaceDefinition[] {
  return Object.values(SPACES);
}

export function getSpaceColors(type: SpaceType): { bg: string; accent: string; text: string } {
  const space = SPACES[type];
  return {
    bg: `bg-gradient-to-br ${space.gradient}`,
    accent: space.color,
    text: '#fff',
  };
}
