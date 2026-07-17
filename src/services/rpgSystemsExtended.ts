/**
 * Extended RPG Systems - Improvements #43-58
 * Equipment, crafting, skill tree, elemental system, stamina/mana,
 * NPC interaction, party system, area transitions
 */

import { SpriteState, GameEntity, InventoryItem, CharacterStats, RPGQuest } from '../types';

// ─── Equipment System (#45) ───

export interface Equipment {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  accessory: InventoryItem | null;
  cosmetic: InventoryItem | null;
}

export interface EquipmentStats {
  strength: number;
  defense: number;
  speed: number;
  criticalChance: number;
  maxHP: number;
  elementalBonus: Record<string, number>;
}

export function getEquipmentStats(equipment: Equipment): EquipmentStats {
  const stats: EquipmentStats = {
    strength: 0, defense: 0, speed: 0, criticalChance: 0, maxHP: 0,
    elementalBonus: {},
  };

  for (const item of [equipment.weapon, equipment.armor, equipment.accessory]) {
    if (!item?.effect) continue;
    switch (item.effect.type) {
      case 'damage': stats.strength += item.effect.value; break;
      case 'shield': stats.defense += item.effect.value; break;
      case 'speed': stats.speed += item.effect.value; break;
      case 'heal': stats.maxHP += item.effect.value; break;
    }
  }

  return stats;
}

export function equipItem(state: SpriteState, item: InventoryItem, slot: keyof Equipment): SpriteState {
  const equipment = (state.variables.equipment as Equipment) || { weapon: null, armor: null, accessory: null, cosmetic: null };
  const prevEquipped = equipment[slot];

  let newInventory = [...state.inventory];
  // Remove new item from inventory
  newInventory = newInventory.filter(i => i.id !== item.id);
  // Add previously equipped item back
  if (prevEquipped) {
    newInventory.push(prevEquipped);
  }

  return {
    ...state,
    inventory: newInventory,
    variables: {
      ...state.variables,
      equipment: { ...equipment, [slot]: item },
    },
  };
}

// ─── Crafting System (#46) ───

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  { id: 'craft_iron_sword', name: 'Iron Sword', result: { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', type: 'weapon', description: 'A sturdy blade', quantity: 1, maxStack: 1, effect: { type: 'damage', value: 12 } }, ingredients: [{ itemId: 'iron_ore', quantity: 3 }, { itemId: 'wood', quantity: 1 }], category: 'weapons', requiredLevel: 1 },
  { id: 'craft_health_potion', name: 'Health Potion', result: { id: 'health_potion', name: 'Health Potion', icon: '🧪', type: 'consumable', description: 'Restores 30 HP', quantity: 2, maxStack: 10, effect: { type: 'heal', value: 30 } }, ingredients: [{ itemId: 'herb', quantity: 2 }], category: 'consumables', requiredLevel: 1 },
  { id: 'craft_iron_shield', name: 'Iron Shield', result: { id: 'iron_shield', name: 'Iron Shield', icon: '🛡️', type: 'weapon', description: 'Blocks damage', quantity: 1, maxStack: 1, effect: { type: 'shield', value: 8 } }, ingredients: [{ itemId: 'iron_ore', quantity: 4 }, { itemId: 'wood', quantity: 2 }], category: 'armor', requiredLevel: 3 },
];

export function canCraft(state: SpriteState, recipe: CraftingRecipe): boolean {
  for (const ingredient of recipe.ingredients) {
    const item = state.inventory.find(i => i.id === ingredient.itemId);
    if (!item || item.quantity < ingredient.quantity) return false;
  }
  return state.inventory.length < state.maxInventorySize || recipe.ingredients.length > 0;
}

export function craftItem(state: SpriteState, recipe: CraftingRecipe): { state: SpriteState; success: boolean } {
  if (!canCraft(state, recipe)) return { state, success: false };

  const newInventory = [...state.inventory];
  // Remove ingredients
  for (const ingredient of recipe.ingredients) {
    const idx = newInventory.findIndex(i => i.id === ingredient.itemId);
    if (idx !== -1) {
      newInventory[idx] = { ...newInventory[idx], quantity: newInventory[idx].quantity - ingredient.quantity };
      if (newInventory[idx].quantity <= 0) {
        newInventory.splice(idx, 1);
      }
    }
  }
  // Add result
  const existing = newInventory.find(i => i.id === recipe.result.id);
  if (existing) {
    existing.quantity = Math.min(existing.maxStack, existing.quantity + recipe.result.quantity);
  } else {
    newInventory.push({ ...recipe.result });
  }

  return {
    state: { ...state, inventory: newInventory },
    success: true,
  };
}

// ─── Elemental System (#51) ───

export type ElementalType = 'fire' | 'ice' | 'lightning' | 'water' | 'earth' | 'none';

export const ELEMENT_CHART: Record<ElementalType, Record<ElementalType, number>> = {
  fire:     { fire: 0.5, ice: 2.0, lightning: 1.0, water: 0.5, earth: 1.0, none: 1.0 },
  ice:      { fire: 0.5, ice: 0.5, lightning: 1.0, water: 1.5, earth: 2.0, none: 1.0 },
  lightning:{ fire: 1.0, ice: 1.0, lightning: 0.5, water: 2.0, earth: 0.0, none: 1.0 },
  water:    { fire: 2.0, ice: 0.5, lightning: 0.5, water: 0.5, earth: 1.5, none: 1.0 },
  earth:    { fire: 1.0, ice: 1.0, lightning: 2.0, water: 0.5, earth: 1.0, none: 1.0 },
  none:     { fire: 1.0, ice: 1.0, lightning: 1.0, water: 1.0, earth: 1.0, none: 1.0 },
};

export function getElementalMultiplier(attack: ElementalType, defense: ElementalType): number {
  return ELEMENT_CHART[attack][defense] ?? 1.0;
}

// ─── Stamina / Mana System (#52) ───

export interface ResourceState {
  stamina: number;
  maxStamina: number;
  staminaRegen: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
}

export function createResourceState(): ResourceState {
  return {
    stamina: 100, maxStamina: 100, staminaRegen: 0.5,
    mana: 50, maxMana: 50, manaRegen: 0.3,
  };
}

export function useStamina(state: SpriteState, amount: number): { state: SpriteState; success: boolean } {
  const res = (state.variables.resources as ResourceState) || createResourceState();
  if (res.stamina < amount) return { state, success: false };
  return {
    state: {
      ...state,
      variables: { ...state.variables, resources: { ...res, stamina: res.stamina - amount } },
    },
    success: true,
  };
}

export function useMana(state: SpriteState, amount: number): { state: SpriteState; success: boolean } {
  const res = (state.variables.resources as ResourceState) || createResourceState();
  if (res.mana < amount) return { state, success: false };
  return {
    state: {
      ...state,
      variables: { ...state.variables, resources: { ...res, mana: res.mana - amount } },
    },
    success: true,
  };
}

export function regenResources(state: SpriteState): SpriteState {
  const res = (state.variables.resources as ResourceState) || createResourceState();
  return {
    ...state,
    variables: {
      ...state.variables,
      resources: {
        ...res,
        stamina: Math.min(res.maxStamina, res.stamina + res.staminaRegen),
        mana: Math.min(res.maxMana, res.mana + res.manaRegen),
      },
    },
  };
}

// ─── Skill Tree (#50) ───

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'offensive' | 'defensive' | 'utility';
  cost: number;
  requires: string[];
  unlocked: boolean;
  effect: { type: string; value: number };
}

export const SKILL_TREE: SkillNode[] = [
  // Offensive
  { id: 'power_strike', name: 'Power Strike', description: '+20% damage', icon: '⚔️', category: 'offensive', cost: 1, requires: [], unlocked: false, effect: { type: 'damage_mult', value: 1.2 } },
  { id: 'critical_mastery', name: 'Critical Mastery', description: '+10% crit chance', icon: '💥', category: 'offensive', cost: 2, requires: ['power_strike'], unlocked: false, effect: { type: 'crit_chance', value: 10 } },
  { id: 'cleave', name: 'Cleave', description: 'Hit 2 enemies at once', icon: '🌀', category: 'offensive', cost: 3, requires: ['power_strike'], unlocked: false, effect: { type: 'aoe_count', value: 2 } },
  // Defensive
  { id: 'thick_skin', name: 'Thick Skin', description: '+15% damage reduction', icon: '🛡️', category: 'defensive', cost: 1, requires: [], unlocked: false, effect: { type: 'damage_reduce', value: 15 } },
  { id: 'regeneration', name: 'Regeneration', description: 'Heal 1 HP/sec', icon: '💚', category: 'defensive', cost: 2, requires: ['thick_skin'], unlocked: false, effect: { type: 'hp_regen', value: 1 } },
  { id: 'iron_wall', name: 'Iron Wall', description: 'Block 50% damage when stationary', icon: '🏰', category: 'defensive', cost: 3, requires: ['thick_skin'], unlocked: false, effect: { type: 'block_chance', value: 50 } },
  // Utility
  { id: 'swift_feet', name: 'Swift Feet', description: '+20% speed', icon: '👟', category: 'utility', cost: 1, requires: [], unlocked: false, effect: { type: 'speed_mult', value: 1.2 } },
  { id: 'treasure_sense', name: 'Treasure Sense', description: 'See items through walls', icon: '👁️', category: 'utility', cost: 2, requires: ['swift_feet'], unlocked: false, effect: { type: 'xray_items', value: 1 } },
  { id: 'double_jump', name: 'Double Jump', description: 'Jump again in mid-air', icon: '🦘', category: 'utility', cost: 3, requires: ['swift_feet'], unlocked: false, effect: { type: 'double_jump', value: 1 } },
];

export function unlockSkill(state: SpriteState, skillId: string): { state: SpriteState; success: boolean } {
  const skillPoints = (state.variables.skillPoints as number) || 0;
  const skill = SKILL_TREE.find(s => s.id === skillId);
  if (!skill) return { state, success: false };
  if (skillPoints < skill.cost) return { state, success: false };
  if (skill.requires.some(r => !(state.variables.unlockedSkills as string[])?.includes(r))) return { state, success: false };

  const unlocked = (state.variables.unlockedSkills as string[]) || [];
  return {
    state: {
      ...state,
      variables: {
        ...state.variables,
        skillPoints: skillPoints - skill.cost,
        unlockedSkills: [...unlocked, skillId],
      },
    },
    success: true,
  };
}

// ─── NPC Interaction (#56) ───

export interface NPC {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  dialogue: string[];
  type: 'quest_giver' | 'shopkeeper' | 'info' | 'companion';
  interactionRange: number;
}

export function checkNPCProximity(playerX: number, playerY: number, npcs: NPC[]): NPC | null {
  for (const npc of npcs) {
    const dist = Math.hypot(playerX - npc.x, playerY - npc.y);
    if (dist < npc.interactionRange) return npc;
  }
  return null;
}

// ─── Area Transitions (#58) ───

export interface Portal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetLevel: string;
  targetX: number;
  targetY: number;
  requiredKey?: string;
  requiredLevel?: number;
}

export function checkPortalCollision(
  playerX: number, playerY: number,
  portals: Portal[],
  state: SpriteState
): Portal | null {
  for (const portal of portals) {
    if (
      playerX >= portal.x && playerX <= portal.x + portal.width &&
      playerY >= portal.y && playerY <= portal.y + portal.height
    ) {
      if (portal.requiredKey) {
        const hasKey = state.inventory.some(i => i.id === portal.requiredKey && i.quantity > 0);
        if (!hasKey) continue;
      }
      if (portal.requiredLevel) {
        const level = (state.variables.characterStats as CharacterStats)?.level || 1;
        if (level < portal.requiredLevel) continue;
      }
      return portal;
    }
  }
  return null;
}

// ─── Use Item in Game (#46) ───

export function useItem(state: SpriteState, itemId: string): { state: SpriteState; message: string } {
  const item = state.inventory.find(i => i.id === itemId && i.quantity > 0);
  if (!item) return { state, message: 'Item not found' };

  let newState = { ...state };
  let message = '';

  if (item.effect) {
    switch (item.effect.type) {
      case 'heal': {
        const newHP = Math.min(state.maxHealth, state.health + item.effect.value);
        newState = { ...newState, health: newHP };
        message = `Healed ${item.effect.value} HP`;
        break;
      }
      case 'damage':
        message = `Equipped ${item.name} (+${item.effect.value} ATK)`;
        break;
      case 'shield':
        message = `Equipped ${item.name} (+${item.effect.value} DEF)`;
        break;
      case 'speed':
        message = `Used ${item.name} (+${item.effect.value} SPD)`;
        break;
      default:
        message = `Used ${item.name}`;
    }
  }

  // Consume item
  const newInv = newState.inventory.map(i =>
    i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
  ).filter(i => i.quantity > 0);

  return { state: { ...newState, inventory: newInv }, message };
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 6 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Reputation System ───

export interface Reputation {
  factions: Record<string, number>; // faction name -> reputation (-100 to 100)
}

export function createReputation(): Reputation {
  return { factions: {} };
}

export function changeReputation(
  state: SpriteState,
  faction: string,
  amount: number
): SpriteState {
  const rep = (state.variables.reputation as Reputation) || createReputation();
  const current = rep.factions[faction] || 0;
  const newRep = Math.max(-100, Math.min(100, current + amount));

  return {
    ...state,
    variables: {
      ...state.variables,
      reputation: {
        ...rep,
        factions: { ...rep.factions, [faction]: newRep },
      },
    },
  };
}

export function getReputationLevel(rep: number): string {
  if (rep >= 80) return 'Revered';
  if (rep >= 50) return 'Honored';
  if (rep >= 20) return 'Friendly';
  if (rep >= -20) return 'Neutral';
  if (rep >= -50) return 'Unfriendly';
  if (rep >= -80) return 'Hostile';
  return 'Hated';
}

// ─── Guild/Party System ───

export interface PartyMember {
  id: string;
  name: string;
  emoji: string;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  speed: number;
  isActive: boolean;
  abilities: string[];
}

export function createPartyMember(
  name: string,
  emoji: string,
  level: number = 1,
  element: ElementalType = 'none'
): PartyMember {
  return {
    id: crypto.randomUUID(),
    name,
    emoji,
    level,
    hp: 50 + level * 10,
    maxHp: 50 + level * 10,
    strength: 5 + level * 2,
    defense: 3 + level,
    speed: 5 + level,
    element,
    isActive: true,
    abilities: [],
  };
}

export function addPartyMember(
  state: SpriteState,
  member: PartyMember
): SpriteState {
  const party = (state.variables.party as PartyMember[]) || [];
  if (party.length >= 4) return state; // Max 4 party members

  return {
    ...state,
    variables: {
      ...state.variables,
      party: [...party, member],
    },
  };
}

export function getActivePartyMembers(state: SpriteState): PartyMember[] {
  const party = (state.variables.party as PartyMember[]) || [];
  return party.filter(m => m.isActive && m.hp > 0);
}

// ─── Achievement System ───

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_kill', name: 'First Blood', description: 'Defeat your first enemy', icon: '⚔️', unlocked: false },
  { id: 'collector', name: 'Collector', description: 'Collect 100 items', icon: '🎒', unlocked: false },
  { id: 'survivor', name: 'Survivor', description: 'Survive 10 waves', icon: '🛡️', unlocked: false },
  { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat your first boss', icon: '🐉', unlocked: false },
  { id: 'speedrunner', name: 'Speedrunner', description: 'Complete a level in under 60 seconds', icon: '⚡', unlocked: false },
  { id: 'pacifist', name: 'Pacifist', description: 'Complete a level without killing anyone', icon: '☮️', unlocked: false },
  { id: 'completionist', name: 'Completionist', description: 'Collect all items in a level', icon: '🏆', unlocked: false },
  { id: 'level_10', name: 'Veteran', description: 'Reach level 10', icon: '⭐', unlocked: false },
  { id: 'gold_hoarder', name: 'Gold Hoarder', description: 'Accumulate 1000 gold', icon: '💰', unlocked: false },
  { id: 'craft_master', name: 'Craft Master', description: 'Craft 10 items', icon: '🔨', unlocked: false },
];

export function checkAchievements(
  state: SpriteState,
  stats: {
    enemiesKilled?: number;
    itemsCollected?: number;
    wavesSurvived?: number;
    bossesDefeated?: number;
    level?: number;
    gold?: number;
    itemsCrafted?: number;
  }
): { state: SpriteState; newAchievements: Achievement[] } {
  const unlocked = (state.variables.unlockedAchievements as string[]) || [];
  const newUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.includes(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first_kill':
        shouldUnlock = (stats.enemiesKilled || 0) >= 1;
        break;
      case 'collector':
        shouldUnlock = (stats.itemsCollected || 0) >= 100;
        break;
      case 'survivor':
        shouldUnlock = (stats.wavesSurvived || 0) >= 10;
        break;
      case 'boss_slayer':
        shouldUnlock = (stats.bossesDefeated || 0) >= 1;
        break;
      case 'level_10':
        shouldUnlock = (stats.level || 0) >= 10;
        break;
      case 'gold_hoarder':
        shouldUnlock = (stats.gold || 0) >= 1000;
        break;
      case 'craft_master':
        shouldUnlock = (stats.itemsCrafted || 0) >= 10;
        break;
    }

    if (shouldUnlock) {
      newUnlocked.push({ ...achievement, unlocked: true, unlockedAt: Date.now() });
    }
  }

  if (newUnlocked.length > 0) {
    return {
      state: {
        ...state,
        variables: {
          ...state.variables,
          unlockedAchievements: [...unlocked, ...newUnlocked.map(a => a.id)],
        },
      },
      newAchievements: newUnlocked,
    };
  }

  return { state, newAchievements: [] };
}

// ─── Daily Challenges ───

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  reward: { xp: number; gold: number };
  completed: boolean;
}

export function generateDailyChallenges(): DailyChallenge[] {
  const challenges = [
    { name: 'Slayer', description: 'Defeat 10 enemies', target: 10, reward: { xp: 100, gold: 50 } },
    { name: 'Collector', description: 'Collect 20 items', target: 20, reward: { xp: 80, gold: 30 } },
    { name: 'Survivor', description: 'Survive 5 waves', target: 5, reward: { xp: 120, gold: 60 } },
    { name: 'Crafter', description: 'Craft 3 items', target: 3, reward: { xp: 90, gold: 40 } },
    { name: 'Explorer', description: 'Visit 3 areas', target: 3, reward: { xp: 70, gold: 25 } },
  ];

  // Select 3 random challenges
  const shuffled = challenges.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((c, i) => ({
    ...c,
    id: `daily_${i}`,
    current: 0,
    completed: false,
  }));
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 15 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Crafting System ───

export interface CraftingRecipe {
  id: string;
  name: string;
  result: InventoryItem;
  ingredients: { itemId: string; quantity: number }[];
  category: 'weapons' | 'armor' | 'consumables' | 'materials';
  requiredLevel: number;
}

export const CRAFTING_RECIPES_EXTENDED: CraftingRecipe[] = [
  { id: 'craft_iron_sword', name: 'Iron Sword', result: { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', type: 'weapon', description: 'A sturdy blade', quantity: 1, maxStack: 1, effect: { type: 'damage', value: 12 } }, ingredients: [{ itemId: 'iron_ore', quantity: 3 }, { itemId: 'wood', quantity: 1 }], category: 'weapons', requiredLevel: 1 },
  { id: 'craft_steel_sword', name: 'Steel Sword', result: { id: 'steel_sword', name: 'Steel Sword', icon: '⚔️', type: 'weapon', description: 'A fine blade', quantity: 1, maxStack: 1, effect: { type: 'damage', value: 18 } }, ingredients: [{ itemId: 'iron_ore', quantity: 5 }, { itemId: 'coal', quantity: 2 }], category: 'weapons', requiredLevel: 5 },
  { id: 'craft_iron_shield', name: 'Iron Shield', result: { id: 'iron_shield', name: 'Iron Shield', icon: '🛡️', type: 'weapon', description: 'Blocks damage', quantity: 1, maxStack: 1, effect: { type: 'shield', value: 8 } }, ingredients: [{ itemId: 'iron_ore', quantity: 4 }, { itemId: 'wood', quantity: 2 }], category: 'armor', requiredLevel: 3 },
  { id: 'craft_health_potion', name: 'Health Potion', result: { id: 'health_potion', name: 'Health Potion', icon: '🧪', type: 'consumable', description: 'Restores 30 HP', quantity: 2, maxStack: 10, effect: { type: 'heal', value: 30 } }, ingredients: [{ itemId: 'herb', quantity: 2 }], category: 'consumables', requiredLevel: 1 },
  { id: 'craft_mana_potion', name: 'Mana Potion', result: { id: 'mana_potion', name: 'Mana Potion', icon: '🧪', type: 'consumable', description: 'Restores 30 MP', quantity: 2, maxStack: 10, effect: { type: 'heal', value: 30 } }, ingredients: [{ itemId: 'crystal_shard', quantity: 2 }], category: 'consumables', requiredLevel: 2 },
  { id: 'craft_speed_boots', name: 'Speed Boots', result: { id: 'speed_boots', name: 'Speed Boots', icon: '👟', type: 'armor', description: '+5 SPD', quantity: 1, maxStack: 1, effect: { type: 'speed', value: 5 } }, ingredients: [{ itemId: 'leather', quantity: 3 }, { itemId: 'iron_ore', quantity: 1 }], category: 'armor', requiredLevel: 3 },
];

export function canCraftItem(recipe: CraftingRecipe, inventory: InventoryItem[], playerLevel: number): boolean {
  if (playerLevel < recipe.requiredLevel) return false;
  
  for (const ingredient of recipe.ingredients) {
    const item = inventory.find(i => i.id === ingredient.itemId);
    if (!item || item.quantity < ingredient.quantity) return false;
  }
  
  return true;
}

export function craftItemExtended(
  state: SpriteState,
  recipe: CraftingRecipe
): { state: SpriteState; success: boolean; message: string } {
  if (!canCraftItem(recipe, state.inventory, (state.variables.playerLevel as number) || 1)) {
    return { state, success: false, message: 'Cannot craft: missing materials or level' };
  }

  const newInventory = [...state.inventory];
  
  // Remove ingredients
  for (const ingredient of recipe.ingredients) {
    const idx = newInventory.findIndex(i => i.id === ingredient.itemId);
    if (idx !== -1) {
      newInventory[idx] = { ...newInventory[idx], quantity: newInventory[idx].quantity - ingredient.quantity };
      if (newInventory[idx].quantity <= 0) {
        newInventory.splice(idx, 1);
      }
    }
  }

  // Add result
  const existing = newInventory.find(i => i.id === recipe.result.id);
  if (existing) {
    existing.quantity = Math.min(existing.maxStack, existing.quantity + recipe.result.quantity);
  } else {
    newInventory.push({ ...recipe.result });
  }

  return {
    state: { ...state, inventory: newInventory },
    success: true,
    message: `Crafted ${recipe.name}!`,
  };
}

// ─── Skill Tree System ───

export interface SkillTree {
  nodes: SkillNode[];
  points: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'offensive' | 'defensive' | 'utility';
  cost: number;
  requires: string[];
  unlocked: boolean;
  effect: { type: string; value: number };
}

export const SKILL_TREE_EXTENDED: SkillNode[] = [
  // Offensive
  { id: 'power_strike', name: 'Power Strike', description: '+20% damage', icon: '⚔️', category: 'offensive', cost: 1, requires: [], unlocked: false, effect: { type: 'damage_mult', value: 1.2 } },
  { id: 'critical_mastery', name: 'Critical Mastery', description: '+10% crit chance', icon: '💥', category: 'offensive', cost: 2, requires: ['power_strike'], unlocked: false, effect: { type: 'crit_chance', value: 10 } },
  { id: 'cleave', name: 'Cleave', description: 'Hit 2 enemies at once', icon: '🌀', category: 'offensive', cost: 3, requires: ['power_strike'], unlocked: false, effect: { type: 'aoe_count', value: 2 } },
  { id: 'fire_enchant', name: 'Fire Enchant', description: 'Attacks deal fire damage', icon: '🔥', category: 'offensive', cost: 4, requires: ['critical_mastery'], unlocked: false, effect: { type: 'element', value: 1 } },
  { id: 'executions', name: 'Executions', description: '2x damage to low HP enemies', icon: '💀', category: 'offensive', cost: 5, requires: ['cleave'], unlocked: false, effect: { type: 'execute', value: 2 } },
  
  // Defensive
  { id: 'thick_skin', name: 'Thick Skin', description: '+15% damage reduction', icon: '🛡️', category: 'defensive', cost: 1, requires: [], unlocked: false, effect: { type: 'damage_reduce', value: 15 } },
  { id: 'regeneration', name: 'Regeneration', description: 'Heal 1 HP/sec', icon: '💚', category: 'defensive', cost: 2, requires: ['thick_skin'], unlocked: false, effect: { type: 'hp_regen', value: 1 } },
  { id: 'iron_wall', name: 'Iron Wall', description: 'Block 50% damage when stationary', icon: '🏰', category: 'defensive', cost: 3, requires: ['thick_skin'], unlocked: false, effect: { type: 'block_chance', value: 50 } },
  { id: 'vampiric', name: 'Vampiric', description: 'Heal 10% of damage dealt', icon: '🧛', category: 'defensive', cost: 4, requires: ['regeneration'], unlocked: false, effect: { type: 'lifesteal', value: 10 } },
  { id: 'second_wind', name: 'Second Wind', description: 'Survive lethal hit once', icon: '💨', category: 'defensive', cost: 5, requires: ['iron_wall'], unlocked: false, effect: { type: 'second_life', value: 1 } },
  
  // Utility
  { id: 'swift_feet', name: 'Swift Feet', description: '+20% speed', icon: '👟', category: 'utility', cost: 1, requires: [], unlocked: false, effect: { type: 'speed_mult', value: 1.2 } },
  { id: 'treasure_sense', name: 'Treasure Sense', description: 'See items through walls', icon: '👁️', category: 'utility', cost: 2, requires: ['swift_feet'], unlocked: false, effect: { type: 'xray_items', value: 1 } },
  { id: 'double_jump', name: 'Double Jump', description: 'Jump again in mid-air', icon: '🦘', category: 'utility', cost: 3, requires: ['swift_feet'], unlocked: false, effect: { type: 'double_jump', value: 1 } },
  { id: 'gold_rush', name: 'Gold Rush', description: '+50% gold from enemies', icon: '💰', category: 'utility', cost: 4, requires: ['treasure_sense'], unlocked: false, effect: { type: 'gold_mult', value: 1.5 } },
  { id: 'xp_boost', name: 'XP Boost', description: '+30% XP from all sources', icon: '⭐', category: 'utility', cost: 5, requires: ['gold_rush'], unlocked: false, effect: { type: 'xp_mult', value: 1.3 } },
];

export function canUnlockSkill(skill: SkillNode, unlockedSkills: string[], skillPoints: number): boolean {
  if (skill.unlocked) return false;
  if (skillPoints < skill.cost) return false;
  return skill.requires.every(req => unlockedSkills.includes(req));
}

export function unlockSkillExtended(
  state: SpriteState,
  skillId: string
): { state: SpriteState; success: boolean; message: string } {
  const skill = SKILL_TREE_EXTENDED.find(s => s.id === skillId);
  if (!skill) return { state, success: false, message: 'Skill not found' };

  const unlockedSkills = (state.variables.unlockedSkills as string[]) || [];
  const skillPoints = (state.variables.skillPoints as number) || 0;

  if (!canUnlockSkill(skill, unlockedSkills, skillPoints)) {
    return { state, success: false, message: 'Cannot unlock: missing requirements or points' };
  }

  return {
    state: {
      ...state,
      variables: {
        ...state.variables,
        unlockedSkills: [...unlockedSkills, skillId],
        skillPoints: skillPoints - skill.cost,
      },
    },
    success: true,
    message: `Unlocked ${skill.name}!`,
  };
}

// ─── Elemental System ───

export interface ElementalEffect {
  type: ElementalType;
  duration: number;
  damage: number;
}

export const ELEMENT_CHART_EXTENDED: Record<ElementalType, Record<ElementalType, number>> = {
  fire:     { fire: 0.5, ice: 2.0, lightning: 1.0, water: 0.5, earth: 1.0, none: 1.0 },
  ice:      { fire: 0.5, ice: 0.5, lightning: 1.0, water: 1.5, earth: 2.0, none: 1.0 },
  lightning:{ fire: 1.0, ice: 1.0, lightning: 0.5, water: 2.0, earth: 0.0, none: 1.0 },
  water:    { fire: 2.0, ice: 0.5, lightning: 0.5, water: 0.5, earth: 1.5, none: 1.0 },
  earth:    { fire: 1.0, ice: 1.0, lightning: 2.0, water: 0.5, earth: 1.0, none: 1.0 },
  none:     { fire: 1.0, ice: 1.0, lightning: 1.0, water: 1.0, earth: 1.0, none: 1.0 },
};

export function calculateElementalDamage(
  attackElement: ElementalType,
  defenseElement: ElementalType,
  baseDamage: number
): number {
  const multiplier = ELEMENT_CHART_EXTENDED[attackElement][defenseElement] || 1;
  return Math.round(baseDamage * multiplier);
}

export function getElementEffectiveness(attack: ElementalType, defense: ElementalType): string {
  const mult = ELEMENT_CHART_EXTENDED[attack][defense] || 1;
  if (mult > 1.5) return 'super_effective';
  if (mult < 0.5) return 'not_effective';
  if (mult === 0) return 'immune';
  return 'neutral';
}

// ─── Party System ───

export interface PartyMember {
  id: string;
  name: string;
  emoji: string;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  speed: number;
  element: ElementalType;
  abilities: string[];
}

export function createPartyMemberExtended(
  name: string,
  emoji: string,
  level: number = 1,
  element: ElementalType = 'none'
): PartyMember {
  return {
    id: crypto.randomUUID(),
    name,
    emoji,
    level,
    hp: 50 + level * 10,
    maxHp: 50 + level * 10,
    strength: 5 + level * 2,
    defense: 3 + level,
    speed: 5 + level,
    element,
    isActive: true,
    abilities: [],
  };
}

export function levelUpPartyMember(member: PartyMember): PartyMember {
  const newLevel = member.level + 1;
  const hpGain = 10 + Math.floor(Math.random() * 5);
  
  return {
    ...member,
    level: newLevel,
    hp: member.hp + hpGain,
    maxHp: member.maxHp + hpGain,
    strength: member.strength + 2,
    defense: member.defense + 1,
    speed: member.speed + 1,
  };
}

// ─── Quest System ───

export interface QuestExtended {
  id: string;
  name: string;
  description: string;
  objectives: { id: string; type: string; target: string; current: number; required: number; description: string }[];
  rewards: { xp: number; gold: number; items?: string[] };
  requiredLevel: number;
  isActive: boolean;
  isCompleted: boolean;
}

export const QUEST_DEFINITIONS: QuestExtended[] = [
  { id: 'q_slay_slimes', name: 'Slime Slayer', description: 'Defeat 5 slimes in the Dark Forest.', objectives: [{ id: 'obj1', type: 'kill', target: 'slime', current: 0, required: 5, description: 'Defeat 5 slimes' }], rewards: { xp: 50, gold: 25 }, requiredLevel: 1, isActive: false, isCompleted: false },
  { id: 'q_collect_coins', name: 'Treasure Hunter', description: 'Collect 20 gold coins.', objectives: [{ id: 'obj2', type: 'collect', target: 'coin', current: 0, required: 20, description: 'Collect 20 gold coins' }], rewards: { xp: 30, gold: 10 }, requiredLevel: 1, isActive: false, isCompleted: false },
  { id: 'q_defeat_boss', name: 'Dragon Slayer', description: 'Defeat the Dragon Lord.', objectives: [{ id: 'obj3', type: 'kill', target: 'dragon', current: 0, required: 1, description: 'Defeat the Dragon Lord' }], rewards: { xp: 500, gold: 200 }, requiredLevel: 5, isActive: false, isCompleted: false },
];

export function acceptQuestExtended(
  state: SpriteState,
  questId: string
): { state: SpriteState; success: boolean; message: string } {
  const quest = QUEST_DEFINITIONS.find(q => q.id === questId);
  if (!quest) return { state, success: false, message: 'Quest not found' };

  const playerLevel = (state.variables.playerLevel as number) || 1;
  if (playerLevel < quest.requiredLevel) {
    return { state, success: false, message: `Requires level ${quest.requiredLevel}` };
  }

  const activeQuests = (state.variables.activeQuests as QuestExtended[]) || [];
  if (activeQuests.find(q => q.id === questId)) {
    return { state, success: false, message: 'Quest already active' };
  }

  return {
    state: {
      ...state,
      variables: {
        ...state.variables,
        activeQuests: [...activeQuests, { ...quest, isActive: true, isCompleted: false }],
      },
    },
    success: true,
    message: `Accepted quest: ${quest.name}`,
  };
}
