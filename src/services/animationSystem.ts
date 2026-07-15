// KidCode Studio — Enhanced Animation System
// 1000% improvement: Professional-grade animation for kids' games

// === 21. SPRITE ANIMATION (Enhanced) ===
export interface SpriteFrame {
  emoji: string;
  duration: number;
}

export interface SpriteAnimation {
  name: string;
  frames: SpriteFrame[];
  loop: boolean;
  speed: number;
  onComplete?: () => void;
}

export class SpriteAnimator {
  private animations: Map<string, SpriteAnimation> = new Map();
  private currentAnimation: string | null = null;
  private currentFrame: number = 0;
  private frameTimer: number = 0;
  private isPlaying: boolean = false;
  private onCompleteCallback?: () => void;

  addAnimation(name: string, frames: SpriteFrame[], loop: boolean = true, speed: number = 1) {
    this.animations.set(name, { name, frames, loop, speed });
  }

  play(animationName: string, onComplete?: () => void) {
    this.currentAnimation = animationName;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.isPlaying = true;
    this.onCompleteCallback = onComplete;
  }

  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
  }

  update(dt: number): string | null {
    if (!this.isPlaying || !this.currentAnimation) return null;

    const anim = this.animations.get(this.currentAnimation);
    if (!anim) return null;

    this.frameTimer += dt * 1000 * anim.speed;
    const frameDuration = anim.frames[this.currentFrame]?.duration || 100;

    if (this.frameTimer >= frameDuration) {
      this.frameTimer = 0;
      this.currentFrame++;

      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          this.isPlaying = false;
          this.onCompleteCallback?.();
          return null;
        }
      }
    }

    return anim.frames[this.currentFrame]?.emoji || null;
  }

  getCurrentEmoji(): string | null {
    if (!this.currentAnimation) return null;
    const anim = this.animations.get(this.currentAnimation);
    return anim?.frames[this.currentFrame]?.emoji || null;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  static createDefaultAnimations(): SpriteAnimator {
    const animator = new SpriteAnimator();

    animator.addAnimation('idle', [
      { emoji: '🧑', duration: 500 },
      { emoji: '🧑', duration: 500 },
    ], true, 1);

    animator.addAnimation('walk', [
      { emoji: '🚶', duration: 200 },
      { emoji: '🏃', duration: 200 },
    ], true, 1.5);

    animator.addAnimation('jump', [
      { emoji: '🦘', duration: 300 },
      { emoji: '🧑', duration: 300 },
    ], false, 1);

    animator.addAnimation('attack', [
      { emoji: '⚔️', duration: 150 },
      { emoji: '💥', duration: 150 },
      { emoji: '🧑', duration: 150 },
    ], false, 1.5);

    animator.addAnimation('hurt', [
      { emoji: '😵', duration: 200 },
      { emoji: '🤕', duration: 200 },
    ], false, 1);

    animator.addAnimation('victory', [
      { emoji: '🎉', duration: 300 },
      { emoji: '🏆', duration: 300 },
      { emoji: '✨', duration: 300 },
    ], true, 1);

    return animator;
  }
}

// === 22. TWEEN SYSTEM (Enhanced) ===
export interface Tween {
  id: string;
  target: Record<string, number>;
  property: string;
  from: number;
  to: number;
  duration: number;
  elapsed: number;
  easing: (t: number) => number;
  onComplete?: () => void;
}

export class TweenSystem {
  private tweens: Map<string, Tween> = new Map();

  static easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  static easeOut = (t: number) => t * (2 - t);
  static easeIn = (t: number) => t * t;
  static bounce = (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  };
  static elastic = (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  };

  addTween(target: Record<string, number>, property: string, from: number, to: number, duration: number, easing: (t: number) => number = TweenSystem.easeInOut, onComplete?: () => void): string {
    const id = `tween_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.tweens.set(id, { id, target, property, from, to, duration, elapsed: 0, easing, onComplete });
    return id;
  }

  removeTween(id: string) { this.tweens.delete(id); }

  update(dt: number) {
    this.tweens.forEach((tween, id) => {
      tween.elapsed += dt;
      const progress = Math.min(tween.elapsed / tween.duration, 1);
      tween.target[tween.property] = tween.from + (tween.to - tween.from) * tween.easing(progress);
      if (progress >= 1) {
        tween.onComplete?.();
        this.tweens.delete(id);
      }
    });
  }

  fadeIn(target: Record<string, number>, property: string, duration: number = 0.3): string {
    target[property] = 0;
    return this.addTween(target, property, 0, 1, duration);
  }

  fadeOut(target: Record<string, number>, property: string, duration: number = 0.3): string {
    return this.addTween(target, property, target[property], 0, duration);
  }

  slideIn(target: Record<string, number>, property: string, from: number, duration: number = 0.5): string {
    target[property] = from;
    return this.addTween(target, property, from, 0, duration, TweenSystem.easeOut);
  }

  scaleUp(target: Record<string, number>, property: string, duration: number = 0.3): string {
    target[property] = 0;
    return this.addTween(target, property, 0, 1, duration, TweenSystem.bounce);
  }
}

// === 23. ADVANCED PARTICLE SYSTEM (Enhanced) ===
export interface ParticleConfig {
  emoji: string;
  count: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  gravity: number;
  lifetime: number;
  fadeOut: boolean;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  spread: number;
}

export class AdvancedParticleSystem {
  private particles: Array<ParticleConfig & { elapsed: number; currentX: number; currentY: number; currentRotation: number; currentScale: number }> = [];

  emit(config: ParticleConfig) {
    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = config.spread || 20;
      this.particles.push({
        ...config,
        x: config.x + Math.cos(angle) * Math.random() * spread,
        y: config.y + Math.sin(angle) * Math.random() * spread,
        currentX: config.x,
        currentY: config.y,
        currentRotation: config.rotation + (Math.random() - 0.5) * 30,
        currentScale: config.scale,
        elapsed: 0,
      });
    }
  }

  update(dt: number) {
    this.particles = this.particles.filter(p => {
      p.elapsed += dt;
      p.currentX += p.speedX * dt * 60;
      p.currentY += p.speedY * dt * 60;
      p.speedY += p.gravity * dt * 60;
      p.currentRotation += p.rotationSpeed * dt * 60;
      p.currentScale = p.scale * (1 - (p.elapsed / p.lifetime) * 0.5);
      return p.elapsed < p.lifetime;
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      const progress = p.elapsed / p.lifetime;
      const alpha = p.fadeOut ? 1 - progress : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.currentX, p.currentY);
      ctx.rotate((p.currentRotation * Math.PI) / 180);
      ctx.scale(p.currentScale, p.currentScale);
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    });
  }

  static explosion(x: number, y: number): ParticleConfig {
    return { emoji: '💥', count: 10, x, y, speedX: 0, speedY: 0, gravity: 0.2, lifetime: 0.5, fadeOut: true, scale: 1, rotation: 0, rotationSpeed: 5, spread: 20 };
  }

  static sparkles(x: number, y: number): ParticleConfig {
    return { emoji: '✨', count: 8, x, y, speedX: 0, speedY: -2, gravity: 0, lifetime: 0.8, fadeOut: true, scale: 0.8, rotation: 0, rotationSpeed: 3, spread: 15 };
  }

  static hearts(x: number, y: number): ParticleConfig {
    return { emoji: '❤️', count: 5, x, y, speedX: 0, speedY: -1.5, gravity: 0, lifetime: 1, fadeOut: true, scale: 0.6, rotation: 0, rotationSpeed: 2, spread: 10 };
  }

  static coins(x: number, y: number): ParticleConfig {
    return { emoji: '🪙', count: 6, x, y, speedX: 0, speedY: -2, gravity: 0.1, lifetime: 0.8, fadeOut: true, scale: 0.7, rotation: 0, rotationSpeed: 8, spread: 12 };
  }

  static fire(x: number, y: number): ParticleConfig {
    return { emoji: '🔥', count: 8, x, y, speedX: 0, speedY: -3, gravity: -0.1, lifetime: 0.6, fadeOut: true, scale: 0.9, rotation: 0, rotationSpeed: 4, spread: 8 };
  }

  static magic(x: number, y: number): ParticleConfig {
    return { emoji: '🪄', count: 6, x, y, speedX: 0, speedY: -1, gravity: 0, lifetime: 1, fadeOut: true, scale: 1, rotation: 0, rotationSpeed: 6, spread: 15 };
  }

  static smoke(x: number, y: number): ParticleConfig {
    return { emoji: '💨', count: 5, x, y, speedX: 0.5, speedY: -1, gravity: -0.05, lifetime: 1.2, fadeOut: true, scale: 1.2, rotation: 0, rotationSpeed: 1, spread: 10 };
  }
}

// === 24. SCREEN TRANSITIONS (Enhanced) ===
export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'wipe' | 'zoom' | 'dissolve';

export class ScreenTransition {
  private isActive: boolean = false;
  private progress: number = 0;
  private type: TransitionType = 'fade';
  private duration: number = 0.5;
  private onComplete?: () => void;
  private phase: 'in' | 'out' = 'in';

  start(type: TransitionType, duration: number = 0.5, onComplete?: () => void) {
    this.isActive = true;
    this.progress = 0;
    this.type = type;
    this.duration = duration / 2;
    this.phase = 'in';
    this.onComplete = onComplete;
  }

  update(dt: number) {
    if (!this.isActive) return;
    this.progress += dt / this.duration;
    if (this.progress >= 1 && this.phase === 'in') {
      this.phase = 'out';
      this.progress = 0;
      this.onComplete?.();
    } else if (this.progress >= 1 && this.phase === 'out') {
      this.isActive = false;
      this.progress = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.isActive) return;
    const alpha = this.phase === 'in' ? this.progress : 1 - this.progress;

    switch (this.type) {
      case 'fade':
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, width, height);
        break;
      case 'slide-left':
        ctx.fillStyle = '#000';
        ctx.fillRect(-width + width * alpha, 0, width, height);
        break;
      case 'slide-right':
        ctx.fillStyle = '#000';
        ctx.fillRect(width - width * alpha, 0, width, height);
        break;
      case 'slide-up':
        ctx.fillStyle = '#000';
        ctx.fillRect(0, -height + height * alpha, width, height);
        break;
      case 'slide-down':
        ctx.fillStyle = '#000';
        ctx.fillRect(0, height - height * alpha, width, height);
        break;
      case 'zoom':
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(alpha, alpha);
        ctx.fillStyle = '#000';
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
        break;
      case 'dissolve':
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
        ctx.fillRect(0, 0, width, height);
        // Add noise effect
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          ctx.fillStyle = `rgba(0, 0, 0, ${alpha * Math.random()})`;
          ctx.fillRect(x, y, 2, 2);
        }
        break;
    }
  }

  isTransitioning(): boolean { return this.isActive; }
}

// === 25. CAMERA SHAKE (Enhanced) ===
export class CameraShake {
  private currentShake: { x: number; y: number; intensity: number; elapsed: number; duration: number } | null = null;

  trigger(intensity: number, duration: number) {
    this.currentShake = { x: 0, y: 0, intensity, elapsed: 0, duration };
  }

  update(dt: number): { x: number; y: number } {
    if (!this.currentShake) return { x: 0, y: 0 };
    this.currentShake.elapsed += dt;
    if (this.currentShake.elapsed >= this.currentShake.duration) {
      this.currentShake = null;
      return { x: 0, y: 0 };
    }
    const decay = Math.pow(0.85, this.currentShake.elapsed * 60);
    return {
      x: (Math.random() - 0.5) * this.currentShake.intensity * decay,
      y: (Math.random() - 0.5) * this.currentShake.intensity * decay,
    };
  }
}

// === 26. FLOATING TEXT (Enhanced) ===
export interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
  vx: number;
}

export class FloatingTextSystem {
  private texts: FloatingText[] = [];

  add(text: string, x: number, y: number, color: string = '#fff', size: number = 16, vx: number = 0) {
    this.texts.push({ text, x, y, color, size, life: 1.5, maxLife: 1.5, vy: -1, vx });
  }

  addDamage(x: number, y: number, amount: number) { this.add(`-${amount}`, x, y, '#ef4444', 20); }
  addHeal(x: number, y: number, amount: number) { this.add(`+${amount}`, x, y, '#22c55e', 20); }
  addScore(x: number, y: number, score: number) { this.add(`+${score}`, x, y, '#fbbf24', 18); }
  addCombo(x: number, y: number, combo: number) { this.add(`x${combo} COMBO!`, x, y, '#f97316', 24); }

  update(dt: number) {
    this.texts = this.texts.filter(t => {
      t.life -= dt;
      t.y += t.vy;
      t.x += t.vx;
      return t.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.texts.forEach(t => {
      const alpha = Math.min(1, t.life / (t.maxLife * 0.3));
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${t.size}px system-ui`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
    });
    ctx.globalAlpha = 1;
  }
}

// === 27. PARALLAX (Enhanced) ===
export interface ParallaxLayer {
  emoji: string;
  speed: number;
  count: number;
  y: number;
  size: number;
}

export class ParallaxSystem {
  private layers: ParallaxLayer[] = [];

  addLayer(emoji: string, speed: number, count: number, y: number, size: number) {
    this.layers.push({ emoji, speed, count, y, size });
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, width: number, height: number) {
    this.layers.forEach(layer => {
      ctx.font = `${layer.size}px serif`;
      ctx.textAlign = 'center';
      for (let i = 0; i < layer.count; i++) {
        const baseX = (i * (width / layer.count) + 50);
        const parallaxX = (baseX - cameraX * layer.speed) % (width + 100);
        ctx.fillText(layer.emoji, parallaxX, layer.y);
      }
    });
  }

  static createSpaceParallax(): ParallaxSystem {
    const system = new ParallaxSystem();
    system.addLayer('⭐', 0.1, 20, 50, 8);
    system.addLayer('✨', 0.2, 15, 100, 12);
    system.addLayer('🌟', 0.3, 10, 150, 16);
    return system;
  }

  static createForestParallax(): ParallaxSystem {
    const system = new ParallaxSystem();
    system.addLayer('🌲', 0.2, 8, 500, 32);
    system.addLayer('🌳', 0.4, 6, 480, 40);
    system.addLayer('🌿', 0.6, 12, 540, 20);
    return system;
  }
}

// === 28. LIGHTING (Enhanced) ===
export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  flicker: boolean;
}

export class LightingSystem {
  private lights: LightSource[] = [];

  addLight(x: number, y: number, radius: number, color: string, intensity: number = 1, flicker: boolean = false) {
    this.lights.push({ x, y, radius, color, intensity, flicker });
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.lights.forEach(light => {
      const x = light.x - cameraX;
      const y = light.y - cameraY;
      const flickerAlpha = light.flicker ? 0.8 + Math.sin(Date.now() * 0.01) * 0.2 : 1;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, light.radius);
      gradient.addColorStop(0, `${light.color}${Math.round(light.intensity * flickerAlpha * 40).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - light.radius, y - light.radius, light.radius * 2, light.radius * 2);
    });
  }

  static torch(x: number, y: number): LightSource {
    return { x, y, radius: 80, color: '#ff9500', intensity: 0.8, flicker: true };
  }

  static magicOrb(x: number, y: number): LightSource {
    return { x, y, radius: 60, color: '#8b5cf6', intensity: 0.6, flicker: true };
  }
}

// === 29. HIT PAUSE (Enhanced) ===
export class HitPause {
  private isPaused: boolean = false;
  private pauseDuration: number = 0;
  private pauseElapsed: number = 0;

  trigger(duration: number = 0.1) {
    this.isPaused = true;
    this.pauseDuration = duration;
    this.pauseElapsed = 0;
  }

  update(dt: number): boolean {
    if (!this.isPaused) return false;
    this.pauseElapsed += dt;
    if (this.pauseElapsed >= this.pauseDuration) {
      this.isPaused = false;
      return false;
    }
    return true;
  }

  isActive(): boolean { return this.isPaused; }
}

// === 30. SQUASH & STRETCH (Enhanced) ===
export class SquashStretch {
  private scaleX: number = 1;
  private scaleY: number = 1;
  private targetScaleX: number = 1;
  private targetScaleY: number = 1;
  private speed: number = 0.15;

  squash() { this.targetScaleX = 1.3; this.targetScaleY = 0.7; }
  stretch() { this.targetScaleX = 0.7; this.targetScaleY = 1.3; }
  reset() { this.targetScaleX = 1; this.targetScaleY = 1; }

  update(dt: number) {
    this.scaleX += (this.targetScaleX - this.scaleX) * this.speed;
    this.scaleY += (this.targetScaleY - this.scaleY) * this.speed;
    if (Math.abs(this.scaleX - 1) < 0.01) this.scaleX = 1;
    if (Math.abs(this.scaleY - 1) < 0.01) this.scaleY = 1;
  }

  apply(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-x, -y);
  }

  restore(ctx: CanvasRenderingContext2D) { ctx.restore(); }
  getScales() { return { x: this.scaleX, y: this.scaleY }; }
}
