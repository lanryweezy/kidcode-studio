/**
 * Advanced Particle System for KidCode Studio
 * Supports fire, smoke, explosions, magic, weather effects
 */

export interface Particle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  friction: number;
  type: ParticleType;
}

export type ParticleType = 
  | 'fire'
  | 'smoke'
  | 'explosion'
  | 'sparkle'
  | 'magic'
  | 'rain'
  | 'snow'
  | 'leaves'
  | 'dust'
  | 'spark'
  | 'bubble'
  | 'heart'
  | 'star';

export interface ParticleEmitter {
  id: string;
  x: number;
  y: number;
  z: number;
  type: ParticleType;
  rate: number; // particles per second
  count: number;
  lifetime: number;
  speed: { min: number; max: number };
  angle: { min: number; max: number };
  size: { min: number; max: number };
  color: string[];
  gravity: number;
  friction: number;
  active: boolean;
  looping: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: Map<string, ParticleEmitter> = new Map();
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame?: number;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = canvas.width;
    this.canvas.height = canvas.height;
  }

  /**
   * Create particle emitter
   */
  createEmitter(config: Partial<ParticleEmitter>): string {
    const id = `emitter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const emitter: ParticleEmitter = {
      id,
      x: config.x || 0,
      y: config.y || 0,
      z: config.z || 0,
      type: config.type || 'sparkle',
      rate: config.rate || 10,
      count: config.count || 1,
      lifetime: config.lifetime || -1, // -1 = infinite
      speed: config.speed || { min: 1, max: 5 },
      angle: config.angle || { min: 0, max: 360 },
      size: config.size || { min: 2, max: 8 },
      color: config.color || ['#ffffff'],
      gravity: config.gravity ?? 0.1,
      friction: config.friction ?? 0.98,
      active: config.active ?? true,
      looping: config.looping ?? true
    };

    this.emitters.set(id, emitter);
    return id;
  }

  /**
   * Remove emitter
   */
  removeEmitter(id: string) {
    this.emitters.delete(id);
  }

  /**
   * Emit particles from emitter
   */
  private emitParticles(emitter: ParticleEmitter) {
    for (let i = 0; i < emitter.count; i++) {
      const angle = (emitter.angle.min + Math.random() * (emitter.angle.max - emitter.angle.min)) * Math.PI / 180;
      const speed = emitter.speed.min + Math.random() * (emitter.speed.max - emitter.speed.min);
      
      const particle: Particle = {
        id: `p_${Date.now()}_${i}`,
        x: emitter.x,
        y: emitter.y,
        z: emitter.z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 0,
        life: emitter.lifetime > 0 ? emitter.lifetime : 100 + Math.random() * 50,
        maxLife: 150,
        size: emitter.size.min + Math.random() * (emitter.size.max - emitter.size.min),
        color: emitter.color[Math.floor(Math.random() * emitter.color.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: emitter.gravity,
        friction: emitter.friction,
        type: emitter.type
      };

      this.particles.push(particle);
    }
  }

  /**
   * Update particles
   */
  update() {
    // Update emitters
    this.emitters.forEach((emitter) => {
      if (emitter.active) {
        this.emitParticles(emitter);
      }
    });

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Apply physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      
      // Update life
      p.life--;
      p.alpha = p.life / p.maxLife;
      
      // Update rotation
      p.rotation += p.rotationSpeed;
      
      // Remove dead particles
      if (p.life <= 0 || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles
   */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      
      // Draw based on type
      switch (p.type) {
        case 'fire':
          this.drawFire(p);
          break;
        case 'smoke':
          this.drawSmoke(p);
          break;
        case 'explosion':
          this.drawExplosion(p);
          break;
        case 'sparkle':
          this.drawSparkle(p);
          break;
        case 'magic':
          this.drawMagic(p);
          break;
        case 'rain':
          this.drawRain(p);
          break;
        case 'snow':
          this.drawSnow(p);
          break;
        case 'heart':
          this.drawHeart(p);
          break;
        case 'star':
          this.drawStar(p);
          break;
        default:
          this.drawDefault(p);
      }
      
      this.ctx.restore();
    });
  }

  /**
   * Draw particle shapes
   */
  private drawFire(p: Particle) {
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.5, '#ff8800');
    gradient.addColorStop(1, '#ff0000');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawSmoke(p: Particle) {
    this.ctx.fillStyle = `rgba(100, 100, 100, ${p.alpha * 0.5})`;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawExplosion(p: Particle) {
    this.ctx.fillStyle = p.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawSparkle(p: Particle) {
    this.ctx.fillStyle = p.color;
    this.ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      this.ctx.rotate(Math.PI / 2);
      this.ctx.ellipse(0, 0, p.size, p.size / 3, 0, 0, Math.PI * 2);
    }
    this.ctx.fill();
  }

  private drawMagic(p: Particle) {
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, p.color);
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawRain(p: Particle) {
    this.ctx.strokeStyle = '#4fc3f7';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size);
    this.ctx.lineTo(0, p.size);
    this.ctx.stroke();
  }

  private drawSnow(p: Particle) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawHeart(p: Particle) {
    this.ctx.fillStyle = p.color;
    this.ctx.beginPath();
    this.ctx.moveTo(0, p.size / 2);
    this.ctx.bezierCurveTo(-p.size, -p.size / 2, -p.size, -p.size, 0, -p.size / 2);
    this.ctx.bezierCurveTo(p.size, -p.size, p.size, -p.size / 2, 0, p.size / 2);
    this.ctx.fill();
  }

  private drawStar(p: Particle) {
    this.ctx.fillStyle = p.color;
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * p.size;
      const y = Math.sin(angle) * p.size;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawDefault(p: Particle) {
    this.ctx.fillStyle = p.color;
    this.ctx.globalAlpha = p.alpha;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Start particle system
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  /**
   * Stop particle system
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  /**
   * Animation loop
   */
  private animate() {
    if (!this.isRunning) return;
    
    this.update();
    this.render();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Preset effects
   */
  createFire(x: number, y: number) {
    return this.createEmitter({
      x, y,
      type: 'fire',
      rate: 20,
      count: 2,
      speed: { min: 1, max: 3 },
      angle: { min: 270, max: 90 },
      size: { min: 10, max: 30 },
      color: ['#ff0000', '#ff8800', '#ffff00'],
      gravity: -0.2
    });
  }

  createExplosion(x: number, y: number) {
    return this.createEmitter({
      x, y,
      type: 'explosion',
      rate: 1,
      count: 50,
      lifetime: 60,
      speed: { min: 2, max: 10 },
      angle: { min: 0, max: 360 },
      size: { min: 5, max: 15 },
      color: ['#ff0000', '#ff8800', '#ffff00', '#ffffff'],
      gravity: 0.1,
      looping: false
    });
  }

  createMagic(x: number, y: number) {
    return this.createEmitter({
      x, y,
      type: 'magic',
      rate: 10,
      count: 1,
      speed: { min: 1, max: 3 },
      angle: { min: 0, max: 360 },
      size: { min: 5, max: 15 },
      color: ['#ff00ff', '#00ffff', '#ffff00', '#ff00ff'],
      gravity: 0,
      friction: 0.95
    });
  }

  createRain() {
    return this.createEmitter({
      x: Math.random() * this.canvas.width,
      y: -10,
      type: 'rain',
      rate: 100,
      count: 1,
      speed: { min: 10, max: 15 },
      angle: { min: 260, max: 280 },
      size: { min: 10, max: 20 },
      color: ['#4fc3f7'],
      gravity: 0.5,
      looping: true
    });
  }

  createSnow() {
    return this.createEmitter({
      x: Math.random() * this.canvas.width,
      y: -10,
      type: 'snow',
      rate: 50,
      count: 1,
      speed: { min: 1, max: 3 },
      angle: { min: 260, max: 280 },
      size: { min: 5, max: 10 },
      color: ['#ffffff'],
      gravity: 0.1,
      friction: 0.99,
      looping: true
    });
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
    this.emitters.clear();
  }

  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Get emitter count
   */
  getEmitterCount(): number {
    return this.emitters.size;
  }
}

/**
 * Create particle system
 */
export const createParticleSystem = (canvas: HTMLCanvasElement): ParticleSystem => {
  return new ParticleSystem(canvas);
};
