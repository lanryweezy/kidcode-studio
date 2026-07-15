/**
 * Progressive Disclosure System
 * Ported from Kreathief: beginners see only essential tools;
 * advanced users unlock deeper capabilities.
 */

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface DisclosureFeature {
  id: string;
  name: string;
  description: string;
  minLevel: SkillLevel;
  category: string;
  emoji: string;
}

const LEVEL_ORDER: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function levelAtLeast(current: SkillLevel, required: SkillLevel): boolean {
  return LEVEL_ORDER.indexOf(current) >= LEVEL_ORDER.indexOf(required);
}

// All features with their minimum skill level
const FEATURES: DisclosureFeature[] = [
  // Beginner (always visible)
  { id: 'basic_blocks', name: 'Basic Blocks', description: 'Move, Wait, Say, Set Score', minLevel: 'beginner', category: 'coding', emoji: '🧩' },
  { id: 'run_code', name: 'Run Code', description: 'Execute your program', minLevel: 'beginner', category: 'coding', emoji: '▶️' },
  { id: 'simple_enemies', name: 'Simple Enemies', description: 'Spawn basic enemies', minLevel: 'beginner', category: 'game', emoji: '👾' },
  { id: 'collect_items', name: 'Collect Items', description: 'Coins, hearts, stars', minLevel: 'beginner', category: 'game', emoji: '🪙' },
  { id: 'basic_ui', name: 'Basic UI', description: 'Buttons, text, images', minLevel: 'beginner', category: 'app', emoji: '📱' },
  { id: 'pixel_editor', name: 'Pixel Editor', description: 'Draw sprites pixel by pixel', minLevel: 'beginner', category: 'art', emoji: '🎨' },
  { id: 'sound_effects', name: 'Sound Effects', description: 'Play built-in sounds', minLevel: 'beginner', category: 'audio', emoji: '🔊' },

  // Intermediate
  { id: 'variables', name: 'Variables', description: 'Store and change values', minLevel: 'intermediate', category: 'coding', emoji: '📊' },
  { id: 'if_else', name: 'If/Else', description: 'Make decisions', minLevel: 'intermediate', category: 'coding', emoji: '🔀' },
  { id: 'loops', name: 'Loops', description: 'Repeat actions', minLevel: 'intermediate', category: 'coding', emoji: '🔄' },
  { id: 'physics', name: 'Physics', description: 'Gravity, jumping, collision', minLevel: 'intermediate', category: 'game', emoji: '🌍' },
  { id: 'enemy_ai', name: 'Enemy AI', description: 'Patrol, chase behaviors', minLevel: 'intermediate', category: 'game', emoji: '🧠' },
  { id: 'tilemap', name: 'Tilemap Editor', description: 'Paint terrain tiles', minLevel: 'intermediate', category: 'world', emoji: '🗺️' },
  { id: 'multi_screen', name: 'Multi-Screen', description: 'Multiple app screens', minLevel: 'intermediate', category: 'app', emoji: '📄' },
  { id: 'music_studio', name: 'Music Studio', description: 'Create music tracks', minLevel: 'intermediate', category: 'audio', emoji: '🎵' },
  { id: 'dialogue', name: 'Dialogue System', description: 'NPC conversations', minLevel: 'intermediate', category: 'story', emoji: '💬' },

  // Advanced
  { id: 'rpg_stats', name: 'RPG Stats', description: 'HP, ATK, DEF, Level', minLevel: 'advanced', category: 'game', emoji: '⚔️' },
  { id: 'status_effects', name: 'Status Effects', description: 'Poison, burn, freeze', minLevel: 'advanced', category: 'game', emoji: '🔥' },
  { id: 'boss_fights', name: 'Boss Fights', description: 'Multi-phase bosses', minLevel: 'advanced', category: 'game', emoji: '🐉' },
  { id: 'inventory', name: 'Inventory System', description: 'Items, crafting, equipment', minLevel: 'advanced', category: 'game', emoji: '🎒' },
  { id: 'quest_system', name: 'Quest System', description: 'Objectives, rewards, tracking', minLevel: 'advanced', category: 'story', emoji: '📜' },
  { id: 'weather', name: 'Weather System', description: 'Rain, snow, storm effects', minLevel: 'advanced', category: 'world', emoji: '🌧️' },
  { id: 'day_night', name: 'Day/Night Cycle', description: 'Time of day lighting', minLevel: 'advanced', category: 'world', emoji: '🌅' },
  { id: 'cutscenes', name: 'Cutscenes', description: 'Cinematic sequences', minLevel: 'advanced', category: 'story', emoji: '🎬' },
  { id: 'save_load', name: 'Save/Load', description: 'Persist game progress', minLevel: 'advanced', category: 'coding', emoji: '💾' },
  { id: 'code_export', name: 'Code Export', description: 'Export to Python/JS/Arduino', minLevel: 'advanced', category: 'coding', emoji: '📦' },

  // Expert
  { id: 'physics_2d', name: 'Physics 2.0', description: 'Matter.js joints, forces', minLevel: 'expert', category: 'game', emoji: '⚙️' },
  { id: '3d_mode', name: '3D Mode', description: 'Three.js 3D rendering', minLevel: 'expert', category: 'game', emoji: '🧊' },
  { id: 'custom_shaders', name: 'Custom Shaders', description: 'WebGL post-processing', minLevel: 'expert', category: 'art', emoji: '✨' },
  { id: 'multiplayer', name: 'Multiplayer', description: 'Real-time co-op', minLevel: 'expert', category: 'coding', emoji: '🌐' },
  { id: 'hardware', name: 'Hardware Lab', description: 'Arduino, ESP32, sensors', minLevel: 'expert', category: 'hardware', emoji: '🔧' },
  { id: 'circuit_sim', name: 'Circuit Simulator', description: 'Virtual electronics', minLevel: 'expert', category: 'hardware', emoji: '⚡' },
  { id: 'advanced_ai', name: 'Advanced AI', description: 'Pathfinding, state machines', minLevel: 'expert', category: 'game', emoji: '🤖' },
  { id: 'plugin_system', name: 'Plugin System', description: 'Custom components', minLevel: 'expert', category: 'coding', emoji: '🔌' },
];

export function getVisibleFeatures(level: SkillLevel): DisclosureFeature[] {
  return FEATURES.filter(f => levelAtLeast(level, f.minLevel));
}

export function getHiddenFeatures(level: SkillLevel): DisclosureFeature[] {
  return FEATURES.filter(f => !levelAtLeast(level, f.minLevel));
}

export function getFeaturesByCategory(level: SkillLevel): Record<string, DisclosureFeature[]> {
  const visible = getVisibleFeatures(level);
  const grouped: Record<string, DisclosureFeature[]> = {};
  visible.forEach(f => {
    if (!grouped[f.category]) grouped[f.category] = [];
    grouped[f.category].push(f);
  });
  return grouped;
}

export function isFeatureVisible(featureId: string, level: SkillLevel): boolean {
  const feature = FEATURES.find(f => f.id === featureId);
  return feature ? levelAtLeast(level, feature.minLevel) : false;
}

export function getNextUnlock(level: SkillLevel): DisclosureFeature | null {
  const currentIdx = LEVEL_ORDER.indexOf(level);
  if (currentIdx >= LEVEL_ORDER.length - 1) return null;
  const nextLevel = LEVEL_ORDER[currentIdx + 1];
  const nextFeatures = FEATURES.filter(f => f.minLevel === nextLevel);
  return nextFeatures[0] || null;
}

export function getProgress(level: SkillLevel): { visible: number; total: number; percent: number } {
  const visible = getVisibleFeatures(level).length;
  const total = FEATURES.length;
  return { visible, total, percent: Math.round((visible / total) * 100) };
}

const STORAGE_KEY = 'kidcode_skill_level';

export function getStoredSkillLevel(): SkillLevel {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LEVEL_ORDER.includes(stored as SkillLevel)) return stored as SkillLevel;
  } catch { /* localStorage unavailable — fall back to beginner */ }
  return 'beginner';
}

export function setSkillLevel(level: SkillLevel) {
  try { localStorage.setItem(STORAGE_KEY, level); } catch { /* localStorage unavailable */ }
}

export function autoDetectLevel(blocksUsed: number, gamesCreated: number, timeSpentMinutes: number): SkillLevel {
  if (blocksUsed > 200 && gamesCreated > 3 && timeSpentMinutes > 300) return 'expert';
  if (blocksUsed > 100 && gamesCreated > 1 && timeSpentMinutes > 120) return 'advanced';
  if (blocksUsed > 30 && timeSpentMinutes > 30) return 'intermediate';
  return 'beginner';
}
