/**
 * Fixed-Timestep Game Loop Engine
 * Improvements: #14 Fixed timestep, #8 Camera smoothing, #11 Parallax
 */

export interface GameLoopConfig {
  physicsFPS: number;      
  maxFrameSkip: number;    
  maxDeltaMs: number;      
  cameraSmooth: number;    
  cameraLookAhead: number; 
}

export const DEFAULT_LOOP_CONFIG: GameLoopConfig = {
  physicsFPS: 60,
  maxFrameSkip: 5,
  maxDeltaMs: 250,
  cameraSmooth: 0.1,
  cameraLookAhead: 50,
};

export interface CameraState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  shakeX: number;
  shakeY: number;
  shakeIntensity: number;
  shakeDuration: number;
  zoom: number;
  // Constraints
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function createCamera(canvasW: number, canvasH: number): CameraState {
  return {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    shakeX: 0, shakeY: 0,
    shakeIntensity: 0, shakeDuration: 0,
    zoom: 1,
    minX: -Infinity, maxX: Infinity,
    minY: 0, maxY: Infinity,
  };
}

export function updateCamera(
  camera: CameraState,
  playerX: number,
  playerY: number,
  playerVX: number,
  canvasW: number,
  canvasH: number,
  config: GameLoopConfig
): CameraState {
  const lookAheadX = playerVX > 0 ? config.cameraLookAhead : playerVX < 0 ? -config.cameraLookAhead : 0;

  let targetX = playerX - canvasW / 2 + lookAheadX;
  let targetY = playerY - canvasH / 2;

  // Clamp to bounds
  targetX = Math.max(camera.minX, Math.min(camera.maxX - canvasW, targetX));
  targetY = Math.max(camera.minY, Math.min(camera.maxY - canvasH, targetY));

  // Smooth lerp
  const newX = camera.x + (targetX - camera.x) * config.cameraSmooth;
  const newY = camera.y + (targetY - camera.y) * config.cameraSmooth;

  // Screen shake
  let shakeX = 0;
  let shakeY = 0;
  if (camera.shakeDuration > 0) {
    shakeX = (Math.random() - 0.5) * camera.shakeIntensity * 2;
    shakeY = (Math.random() - 0.5) * camera.shakeIntensity * 2;
  }

  return {
    ...camera,
    x: Math.round(newX * 10) / 10,
    y: Math.round(newY * 10) / 10,
    targetX, targetY,
    shakeX, shakeY,
    shakeDuration: Math.max(0, camera.shakeDuration - 1),
  };
}

export function triggerShake(camera: CameraState, intensity: number, duration: number): CameraState {
  return {
    ...camera,
    shakeIntensity: Math.max(camera.shakeIntensity, intensity),
    shakeDuration: Math.max(camera.shakeDuration, duration),
  };
}

// ─── Coyote Time & Jump Buffer ───

// ─── Invincibility Frames ───

export interface IFrameState {
  active: boolean;
  framesRemaining: number;
  maxFrames: number;
  flickerRate: number;
}

// ─── Coyote Time & Jump Buffer ───

export interface JumpState {
  coyoteFrames: number;      // Frames since leaving ground
  jumpBufferFrames: number;  // Frames since jump pressed
  wasOnGround: boolean;
  jumpHeld: boolean;         // Is jump button currently held
  maxCoyoteFrames: number;   // How many frames of coyote time
  maxJumpBuffer: number;     // How many frames of jump buffer
}

export function createJumpState(): JumpState {
  return {
    coyoteFrames: 0,
    jumpBufferFrames: 0,
    wasOnGround: true,
    jumpHeld: false,
    maxCoyoteFrames: 6,
    maxJumpBuffer: 8,
  };
}

export function updateJumpState(
  jumpState: JumpState,
  isOnGround: boolean,
  jumpPressed: boolean
): JumpState {
  let { coyoteFrames, jumpBufferFrames } = jumpState;
  const { wasOnGround, jumpHeld } = jumpState;

  // Coyote time: count frames since leaving ground
  if (isOnGround) {
    coyoteFrames = 0;
  } else if (wasOnGround) {
    coyoteFrames = 1;
  } else if (coyoteFrames < jumpState.maxCoyoteFrames) {
    coyoteFrames++;
  }

  // Jump buffer: count frames since jump was pressed
  if (jumpPressed && !jumpHeld) {
    jumpBufferFrames = 0;
  } else if (jumpBufferFrames < jumpState.maxJumpBuffer) {
    jumpBufferFrames++;
  }

  return {
    ...jumpState,
    coyoteFrames,
    jumpBufferFrames,
    wasOnGround: isOnGround,
    jumpHeld: jumpPressed,
  };
}

export function shouldJump(jumpState: JumpState): boolean {
  // Can jump if within coyote time OR within jump buffer window
  return jumpState.coyoteFrames < jumpState.maxCoyoteFrames ||
         jumpState.jumpBufferFrames < jumpState.maxJumpBuffer;
}

// ─── Variable Jump Height ───

export function calculateJumpVelocity(
  baseJumpForce: number,
  jumpHeld: boolean,
  vy: number,
  cutMultiplier: number = 0.4
): number {
  // If jump released early, cut velocity
  if (!jumpHeld && vy < 0) {
    return vy * cutMultiplier;
  }
  return vy;
}

// ─── Viewport Culling ───

export function isInViewport(
  x: number, y: number,
  camX: number, camY: number,
  viewW: number, viewH: number,
  margin: number = 40
): boolean {
  return (
    x + margin > camX &&
    x - margin < camX + viewW &&
    y + margin > camY &&
    y - margin < camY + viewH
  );
}

// ─── Parallax Scrolling ───

export interface ParallaxLayer {
  id: string;
  speed: number; // 0 = static, 1 = moves with camera
  elements: { x: number; y: number; width: number; height: number; color: string; type: string }[];
}

export function createParallaxLayers(): ParallaxLayer[] {
  return [
    {
      id: 'sky',
      speed: 0.1,
      elements: [
        { x: 0, y: 0, width: 2000, height: 300, color: '#87ceeb', type: 'gradient' },
      ],
    },
    {
      id: 'mountains',
      speed: 0.3,
      elements: Array.from({ length: 8 }, (_, i) => ({
        x: i * 300,
        y: 100 + Math.sin(i * 1.5) * 50,
        width: 250,
        height: 200,
        color: `hsl(220, 20%, ${30 + i * 3}%)`,
        type: 'mountain',
      })),
    },
    {
      id: 'trees',
      speed: 0.6,
      elements: Array.from({ length: 12 }, (_, i) => ({
        x: i * 150 + Math.sin(i) * 30,
        y: 200 + Math.cos(i * 2) * 20,
        width: 60,
        height: 80,
        color: `hsl(120, ${40 + i * 5}%, ${25 + i * 2}%)`,
        type: 'tree',
      })),
    },
  ];
}

// ─── Sprite Flip Direction ───

export function getSpriteFlip(vx: number, lastDirection: number): { scaleX: number; direction: number } {
  if (Math.abs(vx) > 0.5) {
    return { scaleX: vx > 0 ? 1 : -1, direction: vx > 0 ? 1 : -1 };
  }
  return { scaleX: lastDirection, direction: lastDirection };
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 8 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Time Scale System ───

export interface TimeState {
  scale: number; // 1.0 = normal, 0.5 = slow-mo, 2.0 = fast-forward
  isFrozen: boolean;
  freezeDuration: number;
  slowMotionDuration: number;
  slowMotionScale: number;
}

export function createTimeState(): TimeState {
  return {
    scale: 1.0,
    isFrozen: false,
    freezeDuration: 0,
    slowMotionDuration: 0,
    slowMotionScale: 0.5,
  };
}

export function slowMotion(state: TimeState, duration: number, scale: number = 0.5): TimeState {
  return {
    ...state,
    slowMotionDuration: duration,
    slowMotionScale: scale,
  };
}

export function freezeFrame(state: TimeState, duration: number): TimeState {
  return {
    ...state,
    isFrozen: true,
    freezeDuration: duration,
  };
}

export function updateTimeScale(state: TimeState): TimeState {
  if (state.isFrozen) {
    const newDuration = state.freezeDuration - 1;
    if (newDuration <= 0) {
      return { ...state, isFrozen: false, freezeDuration: 0 };
    }
    return { ...state, freezeDuration: newDuration };
  }

  if (state.slowMotionDuration > 0) {
    const newDuration = state.slowMotionDuration - 1;
    if (newDuration <= 0) {
      return { ...state, scale: 1.0, slowMotionDuration: 0 };
    }
    return { ...state, scale: state.slowMotionScale, slowMotionDuration: newDuration };
  }

  return { ...state, scale: 1.0 };
}

// ─── Screen Transition System ───

export interface TransitionState {
  isActive: boolean;
  type: 'fade' | 'slide' | 'zoom' | 'pixelate';
  progress: number; // 0-1
  duration: number;
  direction: 'in' | 'out';
  callback?: () => void;
}

export function createTransitionState(): TransitionState {
  return {
    isActive: false,
    type: 'fade',
    progress: 0,
    duration: 30,
    direction: 'out',
  };
}

export function startTransition(
  state: TransitionState,
  type: TransitionState['type'] = 'fade',
  duration: number = 30,
  callback?: () => void
): TransitionState {
  return {
    ...state,
    isActive: true,
    type,
    progress: 0,
    duration,
    direction: 'out',
    callback,
  };
}

export function updateTransition(state: TransitionState): TransitionState {
  if (!state.isActive) return state;

  const newProgress = state.progress + (1 / state.duration);

  if (newProgress >= 1) {
    // Transition complete
    if (state.direction === 'out') {
      // Switch to fade in
      return {
        ...state,
        progress: 0,
        direction: 'in',
      };
    } 
      // Fully faded in
      state.callback?.();
      return {
        ...state,
        isActive: false,
        progress: 0,
        callback: undefined,
      };
    
  }

  return { ...state, progress: newProgress };
}

// ─── Particle System Integration ───

export interface ParticleConfig {
  count: number;
  speed: { min: number; max: number };
  life: { min: number; max: number };
  size: { min: number; max: number };
  colors: string[];
  gravity: number;
  spread: number; // radians
  direction: number; // radians
}

export function createParticleConfig(overrides: Partial<ParticleConfig> = {}): ParticleConfig {
  return {
    count: 10,
    speed: { min: 1, max: 5 },
    life: { min: 20, max: 60 },
    size: { min: 2, max: 6 },
    colors: ['#ffffff', '#ffcc00', '#ff6600'],
    gravity: 0.1,
    spread: Math.PI * 2,
    direction: -Math.PI / 2, // Up
    ...overrides,
  };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export function emitParticles(
  x: number,
  y: number,
  config: ParticleConfig
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < config.count; i++) {
    const angle = config.direction + (Math.random() - 0.5) * config.spread;
    const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
    const life = config.life.min + Math.random() * (config.life.max - config.life.min);
    const size = config.size.min + Math.random() * (config.size.max - config.size.min);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size,
      color,
      alpha: 1,
    });
  }

  return particles;
}

export function updateParticles(particles: Particle[], gravity: number = 0.1): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy + gravity,
      vy: p.vy + gravity,
      life: p.life - 1,
      alpha: p.life / p.maxLife,
      size: p.size * (p.life / p.maxLife),
    }))
    .filter(p => p.life > 0);
}

// ─── Screen Shake Enhanced ───

export function createScreenShake(
  intensity: number,
  duration: number,
  frequency: number = 0.5
): { intensity: number; duration: number; frequency: number; offsetX: number; offsetY: number } {
  return {
    intensity,
    duration,
    frequency,
    offsetX: 0,
    offsetY: 0,
  };
}

export function updateScreenShake(shake: {
  intensity: number;
  duration: number;
  frequency: number;
  offsetX: number;
  offsetY: number;
}): { intensity: number; duration: number; frequency: number; offsetX: number; offsetY: number } {
  if (shake.duration <= 0) {
    return { ...shake, offsetX: 0, offsetY: 0 };
  }

  const decay = shake.duration / 30; // Decay over 30 frames
  const currentIntensity = shake.intensity * decay;
  const offsetX = (Math.random() - 0.5) * currentIntensity * 2;
  const offsetY = (Math.random() - 0.5) * currentIntensity * 2;

  return {
    ...shake,
    duration: shake.duration - 1,
    offsetX,
    offsetY,
  };
}

export interface FixedTimestepLoop {
  start: (onUpdate: (dt: number) => void, onRender: (alpha: number) => void) => void;
  stop: () => void;
  isRunning: () => boolean;
  getFPS: () => number;
  getPhysicsFPS: () => number;
}

export function createFixedTimestepLoop(config: GameLoopConfig = DEFAULT_LOOP_CONFIG): FixedTimestepLoop {
  let running = false;
  let rafId = 0;
  let lastTime = 0;
  let accumulator = 0;
  let fps = 0;
  let frameCount = 0;
  let fpsTimer = 0;
  const fixedDt = 1000 / config.physicsFPS;

  const start = (onUpdate: (dt: number) => void, onRender: (alpha: number) => void) => {
    if (running) return;
    running = true;
    lastTime = performance.now();
    accumulator = 0;

    const loop = (time: number) => {
      if (!running) return;

      let delta = time - lastTime;
      lastTime = time;

      if (delta > config.maxDeltaMs) {
        delta = config.maxDeltaMs;
      }

      accumulator += delta;
      frameCount++;
      fpsTimer += delta;

      if (fpsTimer >= 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsTimer -= 1000;
      }

      let steps = 0;
      while (accumulator >= fixedDt && steps < config.maxFrameSkip) {
        onUpdate(fixedDt);
        accumulator -= fixedDt;
        steps++;
      }

      const alpha = accumulator / fixedDt;
      onRender(alpha);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  return {
    start,
    stop,
    isRunning: () => running,
    getFPS: () => fps,
    getPhysicsFPS: () => config.physicsFPS,
  };
}
