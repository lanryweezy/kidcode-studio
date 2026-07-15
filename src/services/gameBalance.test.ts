import { describe, it, expect, vi } from 'vitest';
import {
  getScaledEnemyStats,
  getDifficultyModifier,
  getXPForLevel,
  getLevelFromXP,
  getStatBonusesForLevel,
  calculateDropChance,
  rollDrops,
  getDropChanceByRarity,
  calculateDamage,
  calculateHealAmount,
  calculateDOTDamage,
  getGoldForKill,
  getShopPrice,
  getSellPrice,
  calculateItemValue,
  getQuestReward,
  getBalanceSummary,
  DIFFICULTY_PRESETS,
  XP_CURVE_CONFIG,
  RARITY_COLORS,
  ECONOMY_PRESETS,
} from './gameBalance';

describe('gameBalance', () => {
  describe('getScaledEnemyStats', () => {
    it('returns base stats for wave 1 normal difficulty', () => {
      const stats = getScaledEnemyStats('normal', 1, 1);
      expect(stats.hp).toBe(50);
      expect(stats.damage).toBe(10);
      expect(stats.speed).toBeCloseTo(1.0);
    });

    it('scales stats with wave number', () => {
      const wave1 = getScaledEnemyStats('normal', 1, 1);
      const wave5 = getScaledEnemyStats('normal', 5, 1);
      expect(wave5.hp).toBeGreaterThan(wave1.hp);
      expect(wave5.damage).toBeGreaterThan(wave1.damage);
    });

    it('scales stats with player level', () => {
      const lvl1 = getScaledEnemyStats('normal', 1, 1);
      const lvl10 = getScaledEnemyStats('normal', 1, 10);
      expect(lvl10.hp).toBeGreaterThan(lvl1.hp);
    });

    it('applies boss multiplier', () => {
      const normal = getScaledEnemyStats('normal', 1, 1, false);
      const boss = getScaledEnemyStats('normal', 1, 1, true);
      expect(boss.hp).toBe(normal.hp * 2);
      expect(boss.damage).toBe(normal.damage * 2);
    });

    it('falls back to normal for unknown difficulty', () => {
      const stats = getScaledEnemyStats('unknown', 1, 1);
      const normal = getScaledEnemyStats('normal', 1, 1);
      expect(stats.hp).toBe(normal.hp);
    });

    it('easy difficulty has lower base stats', () => {
      const easy = getScaledEnemyStats('easy', 1, 1);
      const normal = getScaledEnemyStats('normal', 1, 1);
      expect(easy.hp).toBeLessThan(normal.hp);
    });

    it('hard difficulty has higher base stats', () => {
      const hard = getScaledEnemyStats('hard', 1, 1);
      const normal = getScaledEnemyStats('normal', 1, 1);
      expect(hard.hp).toBeGreaterThan(normal.hp);
    });
  });

  describe('getDifficultyModifier', () => {
    it('returns 1.0 for normal', () => {
      expect(getDifficultyModifier('normal')).toBe(1.0);
    });

    it('returns 0.7 for easy', () => {
      expect(getDifficultyModifier('easy')).toBe(0.7);
    });

    it('returns 1.4 for hard', () => {
      expect(getDifficultyModifier('hard')).toBe(1.4);
    });

    it('returns 1.0 for unknown difficulty', () => {
      expect(getDifficultyModifier('unknown')).toBe(1.0);
    });
  });

  describe('getXPForLevel', () => {
    it('returns 0 for level 1', () => {
      expect(getXPForLevel(1)).toBe(0);
    });

    it('returns positive XP for level 2+', () => {
      expect(getXPForLevel(2)).toBeGreaterThan(0);
    });

    it('XP increases with level', () => {
      const xp2 = getXPForLevel(2);
      const xp5 = getXPForLevel(5);
      expect(xp5).toBeGreaterThan(xp2);
    });

    it('soft cap increases XP requirement', () => {
      const config = { ...XP_CURVE_CONFIG, softCap: 2, softCapPenalty: 2.0 };
      const belowCap = getXPForLevel(3, config);
      const aboveCap = getXPForLevel(5, config);
      expect(aboveCap).toBeGreaterThan(belowCap);
    });
  });

  describe('getLevelFromXP', () => {
    it('returns level 1 with 0 XP', () => {
      const result = getLevelFromXP(0);
      expect(result.level).toBe(1);
    });

    it('returns correct level for accumulated XP', () => {
      const xpForLevel2 = getXPForLevel(2);
      const result = getLevelFromXP(xpForLevel2);
      expect(result.level).toBe(2);
    });

    it('progress is between 0 and 1', () => {
      const result = getLevelFromXP(500);
      expect(result.progress).toBeGreaterThanOrEqual(0);
      expect(result.progress).toBeLessThanOrEqual(1);
    });
  });

  describe('getStatBonusesForLevel', () => {
    it('returns correct level 1 stats', () => {
      const stats = getStatBonusesForLevel(1);
      expect(stats.maxHP).toBe(100);
      expect(stats.damage).toBe(10);
      expect(stats.defense).toBe(5);
    });

    it('stats increase with level', () => {
      const lvl1 = getStatBonusesForLevel(1);
      const lvl10 = getStatBonusesForLevel(10);
      expect(lvl10.maxHP).toBeGreaterThan(lvl1.maxHP);
      expect(lvl10.damage).toBeGreaterThan(lvl1.damage);
    });
  });

  describe('DIFFICULTY_PRESETS', () => {
    it('has easy, normal, hard, insane presets', () => {
      expect(DIFFICULTY_PRESETS.easy).toBeDefined();
      expect(DIFFICULTY_PRESETS.normal).toBeDefined();
      expect(DIFFICULTY_PRESETS.hard).toBeDefined();
      expect(DIFFICULTY_PRESETS.insane).toBeDefined();
    });

    it('easy has lower values than hard', () => {
      expect(DIFFICULTY_PRESETS.easy.baseEnemyHP).toBeLessThan(DIFFICULTY_PRESETS.hard.baseEnemyHP);
    });
  });

  describe('calculateDropChance', () => {
    it('applies luck bonus', () => {
      const base = 0.1;
      const withLuck = calculateDropChance(base, { luckBonus: 50, playerLevel: 1, enemyLevel: 1, comboMultiplier: 1 });
      expect(withLuck).toBeGreaterThan(base);
    });

    it('applies level bonus when player higher', () => {
      const base = 0.1;
      const result = calculateDropChance(base, { luckBonus: 0, playerLevel: 10, enemyLevel: 1, comboMultiplier: 1 });
      expect(result).toBeGreaterThan(base);
    });

    it('does not penalize when player lower level', () => {
      const base = 0.1;
      const result = calculateDropChance(base, { luckBonus: 0, playerLevel: 1, enemyLevel: 10, comboMultiplier: 1 });
      expect(result).toBe(base);
    });

    it('applies combo multiplier', () => {
      const base = 0.1;
      const result = calculateDropChance(base, { luckBonus: 0, playerLevel: 1, enemyLevel: 1, comboMultiplier: 2 });
      expect(result).toBeCloseTo(0.2);
    });

    it('caps at 1.0', () => {
      const base = 0.9;
      const result = calculateDropChance(base, { luckBonus: 200, playerLevel: 1, enemyLevel: 1, comboMultiplier: 3 });
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('rollDrops', () => {
    it('returns empty when no drops', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const drops = rollDrops(
        [{ itemId: 'sword', baseChance: 0.1, rarity: 'rare', minQuantity: 1, maxQuantity: 1 }],
        { luckBonus: 0, playerLevel: 1, enemyLevel: 1, comboMultiplier: 1 }
      );
      expect(drops).toHaveLength(0);
      vi.restoreAllMocks();
    });

    it('rolls drops with correct quantity range', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)
        .mockReturnValueOnce(0);
      const drops = rollDrops(
        [{ itemId: 'coin', baseChance: 1.0, rarity: 'common', minQuantity: 2, maxQuantity: 5 }],
        { luckBonus: 0, playerLevel: 1, enemyLevel: 1, comboMultiplier: 1 }
      );
      expect(drops.length).toBe(1);
      expect(drops[0].itemId).toBe('coin');
      expect(drops[0].quantity).toBeGreaterThanOrEqual(2);
      expect(drops[0].quantity).toBeLessThanOrEqual(5);
      vi.restoreAllMocks();
    });

    it('skips drops with level requirement not met', () => {
      const drops = rollDrops(
        [{ itemId: 'epic', baseChance: 1.0, rarity: 'legendary', minQuantity: 1, maxQuantity: 1, levelRequirement: 50 }],
        { luckBonus: 0, playerLevel: 10, enemyLevel: 1, comboMultiplier: 1 }
      );
      expect(drops).toHaveLength(0);
    });

    it('allows drops with level requirement met', () => {
      const drops = rollDrops(
        [{ itemId: 'epic', baseChance: 1.0, rarity: 'legendary', minQuantity: 1, maxQuantity: 1, levelRequirement: 10 }],
        { luckBonus: 0, playerLevel: 10, enemyLevel: 1, comboMultiplier: 1 }
      );
      expect(drops).toHaveLength(1);
    });
  });

  describe('getDropChanceByRarity', () => {
    it('returns 0.5 for common', () => {
      expect(getDropChanceByRarity('common')).toBe(0.5);
    });

    it('returns 0.01 for legendary', () => {
      expect(getDropChanceByRarity('legendary')).toBe(0.01);
    });

    it('returns 0.5 for unknown rarity', () => {
      expect(getDropChanceByRarity('unknown')).toBe(0.5);
    });
  });

  describe('calculateDamage', () => {
    it('applies defense reduction', () => {
      const result = calculateDamage(
        { attack: 100, defense: 0, critChance: 0, critDamage: 2 },
        { attack: 0, defense: 50, critChance: 0, critDamage: 1 },
        { isCritical: false }
      );
      expect(result.baseDamage).toBe(100);
      expect(result.mitigatedDamage).toBeLessThan(100);
      expect(result.wasCritical).toBe(false);
    });

    it('applies critical hit multiplier', () => {
      const result = calculateDamage(
        { attack: 100, defense: 0, critChance: 1, critDamage: 2 },
        { attack: 0, defense: 0, critChance: 0, critDamage: 1 },
        { isCritical: true }
      );
      expect(result.finalDamage).toBe(200);
      expect(result.wasCritical).toBe(true);
    });

    it('adds elemental damage', () => {
      const result = calculateDamage(
        { attack: 50, defense: 0, critChance: 0, critDamage: 1, elementalDamage: 30 },
        { attack: 0, defense: 0, critChance: 0, critDamage: 1 },
        { isElemental: true, isCritical: false }
      );
      expect(result.finalDamage).toBe(80);
    });

    it('applies combo bonus', () => {
      const result = calculateDamage(
        { attack: 100, defense: 0, critChance: 0, critDamage: 1 },
        { attack: 0, defense: 0, critChance: 0, critDamage: 1 },
        { comboBonus: 1.5 }
      );
      expect(result.baseDamage).toBe(150);
    });

    it('minimum damage is 1', () => {
      const result = calculateDamage(
        { attack: 1, defense: 0, critChance: 0, critDamage: 1 },
        { attack: 0, defense: 999, critChance: 0, critDamage: 1 },
        { isCritical: false }
      );
      expect(result.finalDamage).toBeGreaterThanOrEqual(1);
    });

    it('calculates elemental resist reduction', () => {
      const result = calculateDamage(
        { attack: 50, defense: 0, critChance: 0, critDamage: 1, elementalDamage: 100 },
        { attack: 0, defense: 0, critChance: 0, critDamage: 1, elementalResist: 50 },
        { isElemental: true, isCritical: false }
      );
      expect(result.finalDamage).toBeLessThan(150);
    });
  });

  describe('calculateHealAmount', () => {
    it('returns heal power when no bonuses', () => {
      expect(calculateHealAmount(50)).toBe(50);
    });

    it('adds bonus healing', () => {
      expect(calculateHealAmount(50, 20)).toBe(70);
    });

    it('applies multiplier', () => {
      expect(calculateHealAmount(50, 0, 2)).toBe(100);
    });
  });

  describe('calculateDOTDamage', () => {
    it('calculates damage per tick', () => {
      const result = calculateDOTDamage(100, 10, 1);
      expect(result.damagePerTick).toBe(10);
      expect(result.totalDamage).toBe(100);
      expect(result.ticks).toBe(10);
    });

    it('handles fractional tick rates', () => {
      const result = calculateDOTDamage(60, 5, 0.5);
      expect(result.ticks).toBe(10);
      expect(result.damagePerTick).toBe(6);
    });
  });

  describe('getGoldForKill', () => {
    it('scales with enemy level', () => {
      const low = getGoldForKill(1);
      const high = getGoldForKill(10);
      expect(high).toBeGreaterThan(low);
    });

    it('uses economy config', () => {
      const config = { ...ECONOMY_PRESETS.normal, goldPerKill: 100 };
      const gold = getGoldForKill(1, config);
      expect(gold).toBe(110);
    });
  });

  describe('getShopPrice', () => {
    it('applies markup', () => {
      const price = getShopPrice(100, 1);
      expect(price).toBeGreaterThan(100);
    });

    it('scales with player level', () => {
      const price1 = getShopPrice(100, 1);
      const price10 = getShopPrice(100, 10);
      expect(price10).toBeGreaterThan(price1);
    });
  });

  describe('getSellPrice', () => {
    it('returns discounted price', () => {
      const sellPrice = getSellPrice(100);
      expect(sellPrice).toBeLessThan(100);
    });

    it('uses config discount', () => {
      const config = { ...ECONOMY_PRESETS.normal, sellDiscount: 0.8 };
      expect(getSellPrice(100, config)).toBe(80);
    });
  });

  describe('calculateItemValue', () => {
    it('scales by rarity', () => {
      const common = calculateItemValue('common', 1, 10);
      const legendary = calculateItemValue('legendary', 1, 10);
      expect(legendary).toBeGreaterThan(common);
    });

    it('scales by level', () => {
      const lvl1 = calculateItemValue('rare', 1, 100);
      const lvl10 = calculateItemValue('rare', 10, 100);
      expect(lvl10).toBeGreaterThan(lvl1);
    });
  });

  describe('getQuestReward', () => {
    it('scales with difficulty', () => {
      const easy = getQuestReward('easy', 1);
      const hard = getQuestReward('hard', 1);
      expect(hard.gold).toBeGreaterThan(easy.gold);
    });

    it('scales with player level', () => {
      const low = getQuestReward('normal', 1);
      const high = getQuestReward('normal', 10);
      expect(high.gold).toBeGreaterThan(low.gold);
    });
  });

  describe('getBalanceSummary', () => {
    it('returns complete summary', () => {
      const summary = getBalanceSummary('normal', 5, 10);
      expect(summary.enemyHP).toBeGreaterThan(0);
      expect(summary.enemyDamage).toBeGreaterThan(0);
      expect(summary.xpToNextLevel).toBeGreaterThan(0);
      expect(summary.goldPerKill).toBeGreaterThan(0);
      expect(summary.playerMaxHP).toBeGreaterThan(0);
      expect(summary.playerDamage).toBeGreaterThan(0);
    });
  });

  describe('RARITY_COLORS', () => {
    it('has colors for common, rare, epic, legendary', () => {
      expect(RARITY_COLORS.common).toBeDefined();
      expect(RARITY_COLORS.uncommon).toBeDefined();
      expect(RARITY_COLORS.rare).toBeDefined();
      expect(RARITY_COLORS.epic).toBeDefined();
      expect(RARITY_COLORS.legendary).toBeDefined();
    });
  });
});
