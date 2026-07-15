import { describe, it, expect, vi } from 'vitest';
import { SpriteAnimator, TweenSystem } from './animationSystem';

describe('SpriteAnimator', () => {
  it('creates with addAnimation', () => {
    const animator = new SpriteAnimator();
    animator.addAnimation('idle', [
      { emoji: '🧑', duration: 500 },
    ], true, 1);
    expect(animator.isCurrentlyPlaying()).toBe(false);
  });

  it('plays animation and returns emoji', () => {
    const animator = new SpriteAnimator();
    animator.addAnimation('walk', [
      { emoji: '🚶', duration: 200 },
      { emoji: '🏃', duration: 200 },
    ], true, 1);

    animator.play('walk');
    expect(animator.isCurrentlyPlaying()).toBe(true);
    expect(animator.getCurrentEmoji()).toBe('🚶');
  });

  it('stops animation', () => {
    const animator = new SpriteAnimator();
    animator.addAnimation('walk', [
      { emoji: '🚶', duration: 200 },
      { emoji: '🏃', duration: 200 },
    ], true, 1);
    animator.play('walk');
    animator.update(100);
    animator.stop();
    expect(animator.isCurrentlyPlaying()).toBe(false);
    expect(animator.getCurrentEmoji()).toBe('🚶');
  });

  it('loops animation', () => {
    const animator = new SpriteAnimator();
    animator.addAnimation('loop', [
      { emoji: 'A', duration: 100 },
      { emoji: 'B', duration: 100 },
    ], true, 1);

    animator.play('loop');
    // Advance past first frame
    animator.update(0.15);
    expect(animator.getCurrentEmoji()).toBe('B');
    // Advance past second frame — should loop back
    animator.update(0.15);
    expect(animator.getCurrentEmoji()).toBe('A');
  });

  it('does not loop when loop=false', () => {
    const animator = new SpriteAnimator();
    const onComplete = vi.fn();
    animator.addAnimation('jump', [
      { emoji: '🦘', duration: 100 },
    ], false, 1);

    animator.play('jump', onComplete);
    animator.update(0.15);
    expect(animator.isCurrentlyPlaying()).toBe(false);
    expect(onComplete).toHaveBeenCalled();
  });

  it('returns null for unknown animation', () => {
    const animator = new SpriteAnimator();
    animator.play('nonexistent');
    expect(animator.getCurrentEmoji()).toBeNull();
    expect(animator.update(0.1)).toBeNull();
  });

  it('createDefaultAnimations creates common animations', () => {
    const animator = SpriteAnimator.createDefaultAnimations();
    animator.play('idle');
    expect(animator.getCurrentEmoji()).toBeTruthy();
    animator.play('walk');
    expect(animator.getCurrentEmoji()).toBeTruthy();
  });
});

describe('TweenSystem', () => {
  it('creates and updates tweens', () => {
    const system = new TweenSystem();
    const target = { x: 0 };
    system.addTween(target, 'x', 0, 100, 1);
    system.update(0.5);
    expect(target.x).toBeGreaterThan(0);
    expect(target.x).toBeLessThan(100);
  });

  it('completes tween at duration', () => {
    const system = new TweenSystem();
    const onComplete = vi.fn();
    const target = { x: 0 };
    system.addTween(target, 'x', 0, 100, 1, TweenSystem.easeInOut, onComplete);
    system.update(1.5);
    expect(target.x).toBe(100);
    expect(onComplete).toHaveBeenCalled();
  });

  it('removeTween stops a tween', () => {
    const system = new TweenSystem();
    const target = { x: 0 };
    const id = system.addTween(target, 'x', 0, 100, 1);
    system.removeTween(id);
    system.update(1);
    expect(target.x).toBe(0);
  });

  it('fadeIn tweens from 0 to 1', () => {
    const system = new TweenSystem();
    const target = { alpha: 5 };
    system.fadeIn(target, 'alpha', 1);
    system.update(1.5);
    expect(target.alpha).toBe(1);
  });

  it('fadeOut tweens from current to 0', () => {
    const system = new TweenSystem();
    const target = { alpha: 1 };
    system.fadeOut(target, 'alpha', 1);
    system.update(1.5);
    expect(target.alpha).toBe(0);
  });

  it('slideIn tweens from offset', () => {
    const system = new TweenSystem();
    const target = { x: 0 };
    system.slideIn(target, 'x', -200, 1);
    system.update(1.5);
    expect(target.x).toBe(0);
  });

  it('easing functions return correct values', () => {
    expect(TweenSystem.easeInOut(0)).toBe(0);
    expect(TweenSystem.easeInOut(1)).toBe(1);
    expect(TweenSystem.easeOut(0)).toBe(0);
    expect(TweenSystem.easeOut(1)).toBe(1);
    expect(TweenSystem.easeIn(0)).toBe(0);
    expect(TweenSystem.easeIn(1)).toBe(1);
  });

  it('bounce easing returns valid values', () => {
    expect(TweenSystem.bounce(0)).toBe(0);
    expect(TweenSystem.bounce(1)).toBeCloseTo(1, 0);
    expect(TweenSystem.bounce(0.5)).toBeGreaterThan(0);
  });
});
