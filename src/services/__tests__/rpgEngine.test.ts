import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  XP_TABLE,
  getXPForLevel,
  calculateXPGain,
  addXP,
  getCharacterStats,
  setCharacterStat,
  calculateDamage,
  createStatusEffect,
  applyStatusEffect,
  removeStatusEffect,
  removeStatusEffectByType,
  getStatusEffects,
  hasStatusEffect,
  processStatusEffects,
  DIFFICULTY_MULTIPLIERS,
  getDifficulty,
  setDifficulty,
  getWaveConfigs,
  setWaveConfigs,
  getCurrentWave,
  nextWave,
  rollLoot,
  addLootToInventory,
  getActiveQuests,
  acceptQuest,
  updateQuestObjective,
  completeQuest,
  getBossPhaseConfig,
  processBossPhases,
  addGold,
  spendGold,
  generateMinimapData,
} from '../rpgEngine';
import { SpriteState, CharacterStats, StatusEffect, LootDrop, WaveConfig, RPGQuest, BossPhaseConfig } from '../../types';

function createBaseState(overrides: Partial<SpriteState> = {}): SpriteState {
  return {
    x: 100,
    y: 100,
    z: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    emoji: '🧙',
    texture: null,
    frames: [],
    animations: {},
    currentAnimation: null,
    animationSpeed: 1,
    speech: null,
    weather: 'none',
    score: 0,
    keys: 0,
    health: 100,
    maxHealth: 100,
    variables: {},
    is3D: false,
    cameraMode: 'third_person',
    powerups: {},
    vx: 0,
    vy: 0,
    gravity: true,
    isJumping: false,
    jumpForce: 12,
    enemies: [],
    items: [],
    projectiles: [],
    tilemap: [],
    inventory: [],
    maxInventorySize: 30,
    gold: 0,
    activeBoss: undefined,
    ...overrides,
  } as SpriteState;
}

describe('rpgEngine', () => {
  describe('XP & Leveling', () => {
    it('getXPForLevel returns XP for known levels', () => {
      expect(getXPForLevel(1)).toBe(100);
      expect(getXPForLevel(5)).toBe(1200);
      expect(getXPForLevel(10)).toBe(5000);
      expect(getXPForLevel(15)).toBe(15000);
    });

    it('getXPForLevel extrapolates for unknown levels', () => {
      const xp16 = getXPForLevel(16);
      expect(xp16).toBeGreaterThan(15000);
      expect(xp16).toBe(Math.floor(15000 * Math.pow(1.3, 1)));
    });

    it('calculateXPGain scales by difficulty', () => {
      expect(calculateXPGain(100, 'easy')).toBe(80);
      expect(calculateXPGain(100, 'normal')).toBe(100);
      expect(calculateXPGain(100, 'hard')).toBe(150);
      expect(calculateXPGain(100, 'insane')).toBe(200);
    });

    it('addXP adds XP without leveling up', () => {
      const state = createBaseState();
      const result = addXP(state, 50);
      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
    });

    it('addXP triggers level up when enough XP', () => {
      const state = createBaseState();
      const result = addXP(state, 100);
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(result.statGains.str).toBeGreaterThan(0);
      expect(result.statGains.def).toBeGreaterThan(0);
      expect(result.statGains.maxHP).toBeGreaterThan(0);
    });

    it('addXP carries over excess XP', () => {
      const state = createBaseState();
      const result = addXP(state, 150);
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      const stats = getCharacterStats(result.state);
      expect(stats.xp).toBe(50);
    });
  });

  describe('Character Stats', () => {
    it('getCharacterStats returns defaults for empty state', () => {
      const state = createBaseState();
      const stats = getCharacterStats(state);
      expect(stats.level).toBe(1);
      expect(stats.xp).toBe(0);
      expect(stats.maxHP).toBe(100);
      expect(stats.strength).toBe(10);
      expect(stats.defense).toBe(5);
    });

    it('getCharacterStats returns stored stats', () => {
      const stats: CharacterStats = {
        level: 5, xp: 200, xpToLevel: 1200, maxHP: 150,
        strength: 20, defense: 10, speed: 12, criticalChance: 10, criticalDamage: 2.0,
      };
      const state = createBaseState({ variables: { characterStats: stats } });
      expect(getCharacterStats(state)).toEqual(stats);
    });

    it('setCharacterStat updates a stat', () => {
      const state = createBaseState();
      const newState = setCharacterStat(state, 'strength', 25);
      expect(getCharacterStats(newState).strength).toBe(25);
    });
  });

  describe('Damage Calculation', () => {
    it('calculates base damage', () => {
      const stats: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 10, defense: 5, speed: 8, criticalChance: 0, criticalDamage: 1.5,
      };
      const { damage } = calculateDamage(stats, 10, 0);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('applies strength bonus', () => {
      const lowStr: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 0, defense: 0, speed: 8, criticalChance: 0, criticalDamage: 1.5,
      };
      const highStr: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 50, defense: 0, speed: 8, criticalChance: 0, criticalDamage: 1.5,
      };
      const lowDmg = calculateDamage(lowStr, 10, 0);
      const highDmg = calculateDamage(highStr, 10, 0);
      expect(highDmg.damage).toBeGreaterThanOrEqual(lowDmg.damage);
    });

    it('applies defense reduction', () => {
      const stats: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 10, defense: 0, speed: 8, criticalChance: 0, criticalDamage: 1.5,
      };
      const noDef = calculateDamage(stats, 10, 0);
      const highDef = calculateDamage(stats, 10, 100);
      expect(highDef.damage).toBeLessThanOrEqual(noDef.damage);
    });

    it('applies shield reduction', () => {
      const stats: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 10, defense: 0, speed: 8, criticalChance: 0, criticalDamage: 1.5,
      };
      const noShield = calculateDamage(stats, 10, 0, 0);
      const shield = calculateDamage(stats, 10, 0, 50);
      expect(shield.damage).toBeLessThanOrEqual(noShield.damage);
    });

    it('minimum damage is 1', () => {
      const stats: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 1, defense: 0, speed: 8, criticalChance: 0, criticalDamage: 1.0,
      };
      const { damage } = calculateDamage(stats, 1, 200);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('total reduction caps at 90%', () => {
      const stats: CharacterStats = {
        level: 1, xp: 0, xpToLevel: 100, maxHP: 100,
        strength: 0, defense: 0, speed: 8, criticalChance: 0, criticalDamage: 1.0,
      };
      const { damage } = calculateDamage(stats, 100, 500, 100);
      expect(damage).toBeGreaterThanOrEqual(9);
      expect(damage).toBeLessThanOrEqual(15);
    });
  });

  describe('Status Effects', () => {
    it('createStatusEffect creates effect with unique id', () => {
      const effect = createStatusEffect('poison', 5, 2, 'enemy');
      expect(effect.type).toBe('poison');
      expect(effect.duration).toBe(5);
      expect(effect.value).toBe(2);
      expect(effect.source).toBe('enemy');
      expect(effect.id).toBeTruthy();
    });

    it('getStatusEffects returns empty array for empty state', () => {
      expect(getStatusEffects(createBaseState())).toEqual([]);
    });

    it('hasStatusEffect checks for effect type', () => {
      const state = createBaseState();
      expect(hasStatusEffect(state, 'poison')).toBe(false);
      const effect = createStatusEffect('poison', 3, 1);
      const newState = applyStatusEffect(state, effect);
      expect(hasStatusEffect(newState, 'poison')).toBe(true);
    });

    it('applyStatusEffect adds effect', () => {
      const state = createBaseState();
      const effect = createStatusEffect('burn', 3, 5);
      const newState = applyStatusEffect(state, effect);
      expect(getStatusEffects(newState)).toHaveLength(1);
      expect(getStatusEffects(newState)[0].type).toBe('burn');
    });

    it('applyStatusEffect refreshes existing effect of same type', () => {
      const state = createBaseState();
      const effect1 = createStatusEffect('poison', 3, 1);
      const effect2 = createStatusEffect('poison', 5, 2);
      let newState = applyStatusEffect(state, effect1);
      newState = applyStatusEffect(newState, effect2);
      expect(getStatusEffects(newState)).toHaveLength(1);
      expect(getStatusEffects(newState)[0].duration).toBe(5);
    });

    it('removeStatusEffect removes by id', () => {
      const state = createBaseState();
      const effect = createStatusEffect('freeze', 3, 0);
      let newState = applyStatusEffect(state, effect);
      newState = removeStatusEffect(newState, effect.id);
      expect(getStatusEffects(newState)).toHaveLength(0);
    });

    it('removeStatusEffectByType removes by type', () => {
      const state = createBaseState();
      const effect1 = createStatusEffect('poison', 3, 1);
      const effect2 = createStatusEffect('burn', 3, 1);
      let newState = applyStatusEffect(state, effect1);
      newState = applyStatusEffect(newState, effect2);
      newState = removeStatusEffectByType(newState, 'poison');
      const effects = getStatusEffects(newState);
      expect(effects).toHaveLength(1);
      expect(effects[0].type).toBe('burn');
    });

    it('processStatusEffects reduces poison health', () => {
      const state = createBaseState({ health: 100 });
      const effect = createStatusEffect('poison', 5, 3);
      const newState = applyStatusEffect(state, effect);
      const processed = processStatusEffects(newState);
      expect(processed.health).toBe(97);
    });

    it('processStatusEffects reduces burn health', () => {
      const state = createBaseState({ health: 100 });
      const effect = createStatusEffect('burn', 5, 5);
      const newState = applyStatusEffect(state, effect);
      const processed = processStatusEffects(newState);
      expect(processed.health).toBe(95);
    });

    it('processStatusEffects increases regen health', () => {
      const state = createBaseState({ health: 80, maxHealth: 100 });
      const effect = createStatusEffect('regen', 5, 10);
      const newState = applyStatusEffect(state, effect);
      const processed = processStatusEffects(newState);
      expect(processed.health).toBe(90);
    });

    it('processStatusEffects clamps health at max', () => {
      const state = createBaseState({ health: 95, maxHealth: 100 });
      const effect = createStatusEffect('regen', 5, 10);
      const newState = applyStatusEffect(state, effect);
      const processed = processStatusEffects(newState);
      expect(processed.health).toBe(100);
    });

    it('processStatusEffects decrements duration', () => {
      const state = createBaseState({ health: 100 });
      const effect = createStatusEffect('poison', 3, 1);
      const newState = applyStatusEffect(state, effect);
      const processed = processStatusEffects(newState);
      expect(getStatusEffects(processed)[0].duration).toBe(2);
    });

    it('processStatusEffects removes expired effects', () => {
      const state = createBaseState({ health: 100 });
      const effect = createStatusEffect('poison', 1, 1);
      const newState = applyStatusEffect(state, effect);
      const processed = processStatusEffects(newState);
      expect(getStatusEffects(processed)).toHaveLength(0);
    });
  });

  describe('Difficulty', () => {
    it('getDifficulty returns default normal', () => {
      expect(getDifficulty(createBaseState())).toBe('normal');
    });

    it('setDifficulty sets difficulty', () => {
      const state = createBaseState();
      const newState = setDifficulty(state, 'hard');
      expect(getDifficulty(newState)).toBe('hard');
      expect(newState.variables.difficultyMultipliers).toEqual(DIFFICULTY_MULTIPLIERS.hard);
    });

    it('all difficulty multipliers are defined', () => {
      expect(DIFFICULTY_MULTIPLIERS.easy).toBeDefined();
      expect(DIFFICULTY_MULTIPLIERS.normal).toBeDefined();
      expect(DIFFICULTY_MULTIPLIERS.hard).toBeDefined();
      expect(DIFFICULTY_MULTIPLIERS.insane).toBeDefined();
    });
  });

  describe('Wave System', () => {
    it('getWaveConfigs returns empty for default state', () => {
      expect(getWaveConfigs(createBaseState())).toEqual([]);
    });

    it('setWaveConfigs stores configs', () => {
      const configs: WaveConfig[] = [
        { waveNumber: 1, enemies: [{ type: '👾', count: 5, spawnDelay: 1000 }], bossWave: false },
      ];
      const state = createBaseState();
      const newState = setWaveConfigs(state, configs);
      expect(getWaveConfigs(newState)).toHaveLength(1);
      expect(newState.variables.totalWaves).toBe(1);
    });

    it('getCurrentWave returns 1 by default', () => {
      expect(getCurrentWave(createBaseState())).toBe(1);
    });

    it('nextWave advances wave', () => {
      const configs: WaveConfig[] = [
        { waveNumber: 1, enemies: [{ type: '👾', count: 3, spawnDelay: 1000 }], bossWave: false },
        { waveNumber: 2, enemies: [{ type: '🦇', count: 5, spawnDelay: 800 }], bossWave: false },
      ];
      let state = setWaveConfigs(createBaseState(), configs);
      const result = nextWave(state);
      expect(result.wave).not.toBeNull();
      expect(result.wave?.waveNumber).toBe(2);
    });

    it('nextWave returns null when all waves complete', () => {
      const configs: WaveConfig[] = [
        { waveNumber: 1, enemies: [{ type: '👾', count: 3, spawnDelay: 1000 }], bossWave: false },
      ];
      const state = setWaveConfigs(createBaseState(), configs);
      const result = nextWave(state);
      expect(result.wave).toBeNull();
    });
  });

  describe('Loot System', () => {
    it('rollLoot returns drops based on chance', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.05);
      const lootTable: LootDrop[] = [
        { itemId: 'sword', name: 'Sword', icon: '⚔️', type: 'weapon', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
      ];
      const drops = rollLoot(lootTable, 'normal');
      expect(drops.length).toBe(1);
      expect(drops[0].item.itemId).toBe('sword');
      vi.mocked(Math.random).mockRestore();
    });

    it('rollLoot returns empty for low chance', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const lootTable: LootDrop[] = [
        { itemId: 'rare', name: 'Rare', icon: '💎', type: 'material', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
      ];
      const drops = rollLoot(lootTable, 'normal');
      expect(drops.length).toBe(0);
      vi.mocked(Math.random).mockRestore();
    });

    it('addLootToInventory adds item', () => {
      const state = createBaseState();
      const drops: { item: LootDrop; quantity: number }[] = [{ item: { itemId: 'sword', name: 'Sword', icon: '⚔️', type: 'weapon', chance: 1, minQuantity: 1, maxQuantity: 1 }, quantity: 1 }];
      const newState = addLootToInventory(state, drops);
      expect(newState.inventory.length).toBe(1);
    });
  });

  describe('Quest System', () => {
    it('getActiveQuests returns empty for default state', () => {
      expect(getActiveQuests(createBaseState())).toEqual([]);
    });

    it('acceptQuest adds quest', () => {
      const quest: RPGQuest = {
        id: 'q1',
        name: 'Kill Goblins',
        description: 'Kill 5 goblins',
        objectives: [{ id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 0, description: 'Kill goblins' }],
        xpReward: 100,
        goldReward: 50,
        requiredLevel: 1,
        isActive: false,
        isCompleted: false,
        isTurnedIn: false,
      };
      const state = acceptQuest(createBaseState(), quest);
      expect(getActiveQuests(state)).toHaveLength(1);
    });

    it('acceptQuest does not duplicate', () => {
      const quest: RPGQuest = {
        id: 'q1', name: 'Kill Goblins', description: 'Kill 5 goblins',
        objectives: [{ id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 0, description: 'Kill goblins' }],
        xpReward: 100, goldReward: 50, requiredLevel: 1, isActive: false, isCompleted: false, isTurnedIn: false,
      };
      let state = acceptQuest(createBaseState(), quest);
      state = acceptQuest(state, quest);
      expect(getActiveQuests(state)).toHaveLength(1);
    });

    it('updateQuestObjective increments progress', () => {
      const quest: RPGQuest = {
        id: 'q1', name: 'Kill Goblins', description: 'Kill 5 goblins',
        objectives: [{ id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 0, description: 'Kill goblins' }],
        xpReward: 100, goldReward: 50, requiredLevel: 1, isActive: true, isCompleted: false, isTurnedIn: false,
      };
      let state = acceptQuest(createBaseState(), quest);
      state = updateQuestObjective(state, 'q1', 'o1', 3);
      const quests = getActiveQuests(state);
      expect(quests[0].objectives[0].current).toBe(3);
      expect(quests[0].isCompleted).toBe(false);
    });

    it('updateQuestObjective completes quest when all objectives done', () => {
      const quest: RPGQuest = {
        id: 'q1', name: 'Kill Goblins', description: 'Kill 5 goblins',
        objectives: [{ id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 3, description: 'Kill goblins' }],
        xpReward: 100, goldReward: 50, requiredLevel: 1, isActive: true, isCompleted: false, isTurnedIn: false,
      };
      let state = acceptQuest(createBaseState(), quest);
      state = updateQuestObjective(state, 'q1', 'o1', 2);
      expect(getActiveQuests(state)[0].isCompleted).toBe(true);
    });

    it('completeQuest returns rewards', () => {
      const quest: RPGQuest = {
        id: 'q1', name: 'Kill Goblins', description: 'Kill 5 goblins',
        objectives: [{ id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 5, description: 'Kill goblins' }],
        xpReward: 100, goldReward: 50, requiredLevel: 1, isActive: true, isCompleted: false, isTurnedIn: false,
      };
      let state = acceptQuest(createBaseState(), quest);
      state = updateQuestObjective(state, 'q1', 'o1', 5);
      const result = completeQuest(state, 'q1');
      expect(result.xpReward).toBe(100);
      expect(result.goldReward).toBe(50);
    });
  });

  describe('Boss Phase System', () => {
    it('getBossPhaseConfig returns correct phase', () => {
      const phases: BossPhaseConfig[] = [
        { phase: 0, healthThreshold: 100, isInvulnerable: false, attackPatterns: ['melee'], speed: 1 },
        { phase: 1, healthThreshold: 66, isInvulnerable: false, attackPatterns: ['ranged'], speed: 1.5 },
        { phase: 2, healthThreshold: 33, isInvulnerable: false, attackPatterns: ['aoe'], speed: 2 },
      ];
      expect(getBossPhaseConfig(80, phases)?.phase).toBe(0);
      expect(getBossPhaseConfig(50, phases)?.phase).toBe(1);
      expect(getBossPhaseConfig(20, phases)?.phase).toBe(2);
    });

    it('getBossPhaseConfig returns null for empty phases', () => {
      expect(getBossPhaseConfig(50, [])).toBeNull();
    });

    it('processBossPhases updates boss phase on health change', () => {
      const state = createBaseState({
        activeBoss: {
          id: 'boss1',
          x: 100, y: 100,
          emoji: '🐲',
          health: 200,
          maxHealth: 200,
          phase: 0,
          isInvulnerable: false,
          attackPattern: 'melee',
          type: 'enemy',
        },
      } as any);
      const phases: BossPhaseConfig[] = [
        { phase: 0, healthThreshold: 100, isInvulnerable: false, attackPatterns: ['melee'], speed: 1 },
        { phase: 1, healthThreshold: 50, isInvulnerable: false, attackPatterns: ['ranged'], speed: 1.5 },
      ];
      const newState = processBossPhases(state, phases);
      expect(newState.activeBoss?.phase).toBe(0);
    });

    it('processBossPhases returns state if no boss', () => {
      const state = createBaseState();
      expect(processBossPhases(state, [])).toEqual(state);
    });
  });

  describe('Gold & Economy', () => {
    it('addGold adds gold', () => {
      const state = createBaseState();
      const newState = addGold(state, 100);
      expect((newState.variables.gold as number)).toBe(100);
    });

    it('addGold scales with difficulty', () => {
      const easyState = setDifficulty(createBaseState(), 'easy');
      const hardState = setDifficulty(createBaseState(), 'hard');
      const easy = addGold(easyState, 100);
      const hard = addGold(hardState, 100);
      expect((easy.variables.gold as number)).toBe(80);
      expect((hard.variables.gold as number)).toBe(150);
    });

    it('spendGold succeeds when enough gold', () => {
      const state = createBaseState({ variables: { gold: 100 } } as any);
      const result = spendGold(state, 50);
      expect(result.success).toBe(true);
      expect((result.state.variables.gold as number)).toBe(50);
    });

    it('spendGold fails when not enough gold', () => {
      const state = createBaseState({ variables: { gold: 30 } } as any);
      const result = spendGold(state, 50);
      expect(result.success).toBe(false);
      expect((result.state.variables.gold as number)).toBe(30);
    });
  });

  describe('Minimap Data', () => {
    it('generateMinimapData generates tile data', () => {
      const state = createBaseState({
        tilemap: [
          { x: 0, y: 0, type: 'brick' },
          { x: 1, y: 0, type: 'lava' },
        ],
        enemies: [{ id: 'e1', x: 50, y: 50 } as any],
        items: [{ id: 'i1', x: 100, y: 100 } as any],
      } as any);
      const minimap = generateMinimapData(state);
      expect(minimap.length).toBeGreaterThan(0);
      expect(minimap.some(t => t.type === 'ground')).toBe(true);
      expect(minimap.some(t => t.type === 'hazard')).toBe(true);
      expect(minimap.some(t => t.type === 'enemy')).toBe(true);
      expect(minimap.some(t => t.type === 'item')).toBe(true);
      expect(minimap.some(t => t.type === 'player')).toBe(true);
    });

    it('generateMinimapData includes boss', () => {
      const state = createBaseState({
        activeBoss: { x: 200, y: 200 } as any,
      });
      const minimap = generateMinimapData(state);
      expect(minimap.some(t => t.type === 'boss')).toBe(true);
    });
  });
});
