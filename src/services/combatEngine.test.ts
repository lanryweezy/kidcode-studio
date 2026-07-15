import { describe, it, expect } from 'vitest';
import {
  createMeleeHitbox,
  checkHitboxCollision,
  createIFrames,
  updateIFrames,
  getIFrameAlpha,
  calculateDamageWithVariance,
  calculateElementalDamage,
  applyKnockback,
  createComboChain,
  advanceCombo,
  updateCombo,
  createDodgeState,
  startDodge,
  updateDodge,
  createParryState,
  startParry,
  updateParry,
  isParryActive,
} from './combatEngine';

describe('combatEngine', () => {
  describe('createMeleeHitbox', () => {
    it('creates hitbox facing right', () => {
      const hb = createMeleeHitbox(100, 200, 1, 50, 40, 15);
      expect(hb.x).toBe(120);
      expect(hb.width).toBe(50);
      expect(hb.damage).toBe(15);
      expect(hb.type).toBe('melee');
    });

    it('creates hitbox facing left', () => {
      const hb = createMeleeHitbox(100, 200, -1, 50, 40, 15);
      expect(hb.x).toBe(100 - 50 - 20);
    });
  });

  describe('checkHitboxCollision', () => {
    it('detects hit', () => {
      const hb = createMeleeHitbox(100, 100, 1, 50, 40, 10);
      const enemy = { x: 160, y: 100, width: 32, height: 32 } as any;
      expect(checkHitboxCollision(hb, enemy)).toBe(true);
    });

    it('detects miss', () => {
      const hb = createMeleeHitbox(100, 100, 1, 50, 40, 10);
      const enemy = { x: 500, y: 100, width: 32, height: 32 } as any;
      expect(checkHitboxCollision(hb, enemy)).toBe(false);
    });
  });

  describe('IFrames', () => {
    it('creates active iframes', () => {
      const state = createIFrames(60);
      expect(state.active).toBe(true);
      expect(state.framesRemaining).toBe(60);
    });

    it('counts down frames', () => {
      let state = createIFrames(5);
      state = updateIFrames(state);
      expect(state.framesRemaining).toBe(4);
      expect(state.active).toBe(true);
    });

    it('deactivates when frames expire', () => {
      let state = createIFrames(1);
      state = updateIFrames(state);
      expect(state.active).toBe(false);
    });

    it('getIFrameAlpha returns correct values', () => {
      const active = createIFrames(60);
      expect(getIFrameAlpha(active)).toBe(1);
      const inactive = createIFrames(1);
      expect(getIFrameAlpha(inactive)).toBe(1);
    });

    it('flickers alpha during active iframes', () => {
      const state = { active: true, framesRemaining: 2, maxFrames: 60, flickerRate: 3 };
      expect(getIFrameAlpha(state)).toBe(1);
      const state2 = { active: true, framesRemaining: 4, maxFrames: 60, flickerRate: 3 };
      expect(getIFrameAlpha(state2)).toBe(0.3);
    });
  });

  describe('calculateDamageWithVariance', () => {
    it('returns a number near base damage', () => {
      for (let i = 0; i < 50; i++) {
        const dmg = calculateDamageWithVariance(100, 0.2);
        expect(dmg).toBeGreaterThanOrEqual(80);
        expect(dmg).toBeLessThanOrEqual(120);
      }
    });
  });

  describe('calculateElementalDamage', () => {
    it('fire beats ice', () => {
      const result = calculateElementalDamage(10, 'fire', 'ice');
      expect(result.damage).toBe(20);
      expect(result.effectiveness).toBe('super');
    });

    it('fire weak vs water', () => {
      const result = calculateElementalDamage(10, 'fire', 'water');
      expect(result.damage).toBe(5);
      expect(result.effectiveness).toBe('weak');
    });

    it('neutral matchup', () => {
      const result = calculateElementalDamage(10, 'fire', 'grass');
      expect(result.effectiveness).toBe('super');
      expect(result.damage).toBe(15);
    });

    it('unknown element defaults to 1x', () => {
      const result = calculateElementalDamage(10, 'wind', 'earth');
      expect(result.damage).toBe(10);
      expect(result.effectiveness).toBe('normal');
    });
  });

  describe('applyKnockback', () => {
    it('knocks right when target is to the right', () => {
      const kb = applyKnockback(200, 100, 100, 100);
      expect(kb.vx).toBe(8);
      expect(kb.vy).toBe(-3);
    });

    it('knocks left when target is to the left', () => {
      const kb = applyKnockback(50, 100, 100, 100);
      expect(kb.vx).toBe(-8);
    });
  });

  describe('ComboChain', () => {
    it('creates chain with multipliers', () => {
      const chain = createComboChain(3);
      expect(chain.maxHits).toBe(3);
      expect(chain.damageMultipliers).toEqual([1, 1.25, 1.5]);
    });

    it('advances combo', () => {
      const chain = createComboChain(3);
      const result = advanceCombo(chain);
      expect(result.chain.currentHit).toBe(1);
      expect(result.damageMultiplier).toBe(1.25);
    });

    it('resets combo at max hits', () => {
      let chain = createComboChain(2);
      chain = advanceCombo(chain).chain;
      const result = advanceCombo(chain);
      expect(result.chain.currentHit).toBe(0);
    });

    it('drops combo when timer expires', () => {
      const chain = { ...createComboChain(3), currentHit: 2, timer: 1 };
      const result = updateCombo(chain);
      expect(result.currentHit).toBe(0);
      expect(result.timer).toBe(0);
    });

    it('decrements timer', () => {
      const chain = { ...createComboChain(3), currentHit: 1, timer: 5 };
      const result = updateCombo(chain);
      expect(result.timer).toBe(4);
    });
  });

  describe('DodgeState', () => {
    it('creates non-dodging state', () => {
      const state = createDodgeState();
      expect(state.isDodging).toBe(false);
      expect(state.cooldown).toBe(0);
    });

    it('starts dodge', () => {
      const state = createDodgeState();
      const dodging = startDodge(state, 1);
      expect(dodging.isDodging).toBe(true);
      expect(dodging.direction).toBe(1);
      expect(dodging.cooldown).toBe(30);
    });

    it('cannot start dodge during cooldown', () => {
      const state = { ...createDodgeState(), cooldown: 10 };
      const result = startDodge(state, 1);
      expect(result.isDodging).toBe(false);
    });

    it('cannot start dodge while already dodging', () => {
      const state = { ...createDodgeState(), isDodging: true };
      const result = startDodge(state, 1);
      expect(result.isDodging).toBe(true);
    });

    it('updates dodge frames', () => {
      const state = { ...createDodgeState(), isDodging: true, framesRemaining: 5, cooldown: 30 };
      const result = updateDodge(state);
      expect(result.framesRemaining).toBe(4);
      expect(result.cooldown).toBe(29);
    });
  });

  describe('ParryState', () => {
    it('creates non-parrying state', () => {
      const state = createParryState();
      expect(state.isParrying).toBe(false);
    });

    it('starts parry', () => {
      const state = createParryState();
      const result = startParry(state);
      expect(result.isParrying).toBe(true);
      expect(result.framesRemaining).toBe(6);
      expect(result.cooldown).toBe(45);
    });

    it('cannot start parry during cooldown', () => {
      const state = { ...createParryState(), cooldown: 10 };
      const result = startParry(state);
      expect(result.isParrying).toBe(false);
    });

    it('updates parry frames', () => {
      const state = { ...createParryState(), isParrying: true, framesRemaining: 3, cooldown: 45 };
      const result = updateParry(state);
      expect(result.framesRemaining).toBe(2);
    });

    it('isParryActive returns true when parrying', () => {
      const state = { ...createParryState(), isParrying: true, framesRemaining: 3 };
      expect(isParryActive(state)).toBe(true);
    });

    it('isParryActive returns false when not parrying', () => {
      expect(isParryActive(createParryState())).toBe(false);
    });
  });
});
