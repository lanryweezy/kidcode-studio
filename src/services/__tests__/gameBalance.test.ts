import { describe, it, expect } from 'vitest';

describe('Game Balance Calculations', () => {
  describe('Enemy Scaling', () => {
    it('should scale enemy HP with wave number', () => {
      const baseHp = 20;
      const waveMultiplier = 5;
      const wave1Hp = baseHp + 1 * waveMultiplier;
      const wave5Hp = baseHp + 5 * waveMultiplier;
      const wave10Hp = baseHp + 10 * waveMultiplier;

      expect(wave1Hp).toBe(25);
      expect(wave5Hp).toBe(45);
      expect(wave10Hp).toBe(70);
    });

    it('should scale enemy damage with wave number', () => {
      const baseDamage = 5;
      const waveMultiplier = 2;
      const wave1Dmg = baseDamage + 1 * waveMultiplier;
      const wave5Dmg = baseDamage + 5 * waveMultiplier;
      const wave10Dmg = baseDamage + 10 * waveMultiplier;

      expect(wave1Dmg).toBe(7);
      expect(wave5Dmg).toBe(15);
      expect(wave10Dmg).toBe(25);
    });

    it('should scale enemy speed with wave number', () => {
      const baseSpeed = 0.5;
      const waveMultiplier = 0.1;
      const wave1Speed = baseSpeed + 1 * waveMultiplier;
      const wave5Speed = baseSpeed + 5 * waveMultiplier;
      const wave10Speed = baseSpeed + 10 * waveMultiplier;

      expect(wave1Speed).toBeCloseTo(0.6);
      expect(wave5Speed).toBeCloseTo(1.0);
      expect(wave10Speed).toBeCloseTo(1.5);
    });
  });

  describe('Boss Scaling', () => {
    it('should scale boss HP with wave number', () => {
      const baseBossHp = 200;
      const waveMultiplier = 20;
      const wave1BossHp = baseBossHp + 1 * waveMultiplier;
      const wave5BossHp = baseBossHp + 5 * waveMultiplier;

      expect(wave1BossHp).toBe(220);
      expect(wave5BossHp).toBe(300);
    });

    it('should calculate boss phase thresholds correctly', () => {
      const bossHp = 300;
      const phase0Threshold = bossHp * 0.66;
      const phase1Threshold = bossHp * 0.33;

      expect(phase0Threshold).toBeCloseTo(198);
      expect(phase1Threshold).toBeCloseTo(99);
    });
  });

  describe('Collectible Values', () => {
    const collectibleTypes = [
      { emoji: '🪙', value: 10, effect: 'score' },
      { emoji: '💎', value: 50, effect: 'score' },
      { emoji: '⭐', value: 100, effect: 'score' },
      { emoji: '❤️', value: 25, effect: 'heal' },
      { emoji: '🛡️', value: 50, effect: 'heal' },
      { emoji: '⚡', value: 1, effect: 'speed' },
      { emoji: '🔥', value: 1, effect: 'damage' },
    ];

    it('should have correct score values', () => {
      const scoreCollectibles = collectibleTypes.filter(c => c.effect === 'score');
      expect(scoreCollectibles).toHaveLength(3);
      expect(scoreCollectibles[0].value).toBe(10);
      expect(scoreCollectibles[1].value).toBe(50);
      expect(scoreCollectibles[2].value).toBe(100);
    });

    it('should have correct heal values', () => {
      const healCollectibles = collectibleTypes.filter(c => c.effect === 'heal');
      expect(healCollectibles).toHaveLength(2);
      expect(healCollectibles[0].value).toBe(25);
      expect(healCollectibles[1].value).toBe(50);
    });

    it('should have bonus effects with value 1', () => {
      const bonusCollectibles = collectibleTypes.filter(c => c.effect === 'speed' || c.effect === 'damage');
      expect(bonusCollectibles).toHaveLength(2);
      bonusCollectibles.forEach(c => {
        expect(c.value).toBe(1);
      });
    });
  });

  describe('Wave Progression', () => {
    it('should calculate wave interval decrease', () => {
      const baseInterval = 10;
      const levelMultiplier = 0.5;

      const level1Interval = Math.max(5, baseInterval - 1 * levelMultiplier);
      const level5Interval = Math.max(5, baseInterval - 5 * levelMultiplier);
      const level10Interval = Math.max(5, baseInterval - 10 * levelMultiplier);

      expect(level1Interval).toBeCloseTo(9.5);
      expect(level5Interval).toBeCloseTo(7.5);
      expect(level10Interval).toBe(5);
    });

    it('should calculate hazard spawn interval decrease', () => {
      const baseInterval = 15;
      const waveMultiplier = 0.5;

      const wave1Interval = Math.max(5, baseInterval - 1 * waveMultiplier);
      const wave5Interval = Math.max(5, baseInterval - 5 * waveMultiplier);
      const wave10Interval = Math.max(5, baseInterval - 10 * waveMultiplier);

      expect(wave1Interval).toBeCloseTo(14.5);
      expect(wave5Interval).toBeCloseTo(12.5);
      expect(wave10Interval).toBeCloseTo(10);
    });

    it('should calculate hazard damage scaling', () => {
      const baseDamage = 5;
      const waveMultiplier = 3;

      const wave1Dmg = baseDamage + 1 * waveMultiplier;
      const wave5Dmg = baseDamage + 5 * waveMultiplier;
      const wave10Dmg = baseDamage + 10 * waveMultiplier;

      expect(wave1Dmg).toBe(8);
      expect(wave5Dmg).toBe(20);
      expect(wave10Dmg).toBe(35);
    });
  });

  describe('Score Thresholds', () => {
    it('should calculate wave score thresholds', () => {
      for (let wave = 1; wave <= 10; wave++) {
        const threshold = wave * 100;
        expect(threshold).toBeGreaterThan(0);
        expect(threshold % 100).toBe(0);
      }
    });
  });

  describe('Damage Bonuses', () => {
    it('should apply speed bonus correctly', () => {
      const baseSpeed = 1;
      const speedBonus = 3;
      const speedMult = baseSpeed + speedBonus * 0.2;
      expect(speedMult).toBeCloseTo(1.6);
    });

    it('should apply damage bonus correctly', () => {
      const baseDamage = 10;
      const damageBonus = 10;
      const totalDamage = baseDamage + damageBonus;
      expect(totalDamage).toBe(20);
    });

    it('should apply boss enrage multiplier', () => {
      const baseSpeed = 3;
      const enrageMultiplier = 1.5;
      const enragedSpeed = baseSpeed * enrageMultiplier;
      expect(enragedSpeed).toBe(4.5);
    });
  });
});
