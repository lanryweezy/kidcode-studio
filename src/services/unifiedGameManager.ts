
// KidCode Studio — Unified Game Manager
// Connects ALL 30 systems into one cohesive architecture

import { UnifiedGameEngine, UnifiedGameState } from './unifiedGameEngine';
import { BlockExecutor } from './blockExecutor';
import { VariableSyncManager, BlockVisualizer, BreakpointManager, StepExecutor, ExecutionCounter, VariableWatchPanel, BlockErrorHandler, ExecutionHistory, ConditionalPreview, BlockHotReloader } from './blockSync';
import { EventTriggerSystem, CollisionCallbackSystem, TimerSystem, LoopCounter, FunctionRegistry, EventListenerSystem, StateQuerySystem, CameraController, ScreenEffectSystem, AudioTriggerSystem } from './gameEvents';
import { SpriteAnimator, TweenSystem, AdvancedParticleSystem, ScreenTransition, CameraShake, FloatingTextSystem, ParallaxSystem, LightingSystem, HitPause, SquashStretch, TransitionType } from './animationSystem';
import { playSoundEffect } from './soundService';

export interface GameSystemConfig {
  enableBlockSync: boolean;
  enableEvents: boolean;
  enableAnimation: boolean;
  enablePhysics: boolean;
  enableParticles: boolean;
  enableCamera: boolean;
  enableAudio: boolean;
}

const DEFAULT_CONFIG: GameSystemConfig = {
  enableBlockSync: true,
  enableEvents: true,
  enableAnimation: true,
  enablePhysics: true,
  enableParticles: true,
  enableCamera: true,
  enableAudio: true,
};

export class UnifiedGameManager {
  // Core
  engine: UnifiedGameEngine;
  blockExecutor: BlockExecutor;

  // Block Sync Systems (1-10)
  variableSync: VariableSyncManager;
  blockVisualizer: BlockVisualizer;
  breakpointManager: BreakpointManager;
  stepExecutor: StepExecutor;
  executionCounter: ExecutionCounter;
  variableWatch: VariableWatchPanel;
  errorHandler: BlockErrorHandler;
  executionHistory: ExecutionHistory;
  conditionalPreview: ConditionalPreview;
  hotReloader: BlockHotReloader;

  // Game Event Systems (11-20)
  eventTriggers: EventTriggerSystem;
  collisionCallbacks: CollisionCallbackSystem;
  timerSystem: TimerSystem;
  loopCounter: LoopCounter;
  functionRegistry: FunctionRegistry;
  eventListeners: EventListenerSystem;
  stateQuery: StateQuerySystem;
  cameraController: CameraController;
  screenEffects: ScreenEffectSystem;
  audioTriggers: AudioTriggerSystem;

  // Animation Systems (21-30)
  spriteAnimator: SpriteAnimator;
  tweenSystem: TweenSystem;
  particles: AdvancedParticleSystem;
  screenTransition: ScreenTransition;
  cameraShake: CameraShake;
  floatingText: FloatingTextSystem;
  parallax: ParallaxSystem;
  lighting: LightingSystem;
  hitPause: HitPause;
  squashStretch: SquashStretch;

  // State
  private config: GameSystemConfig;
  private isRunning: boolean = false;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, config: Partial<GameSystemConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize core
    this.engine = new UnifiedGameEngine(canvas);
    this.blockExecutor = new BlockExecutor(this.engine);

    // Initialize Block Sync Systems (1-10)
    this.variableSync = new VariableSyncManager(this.engine);
    this.blockVisualizer = new BlockVisualizer();
    this.breakpointManager = new BreakpointManager();
    this.stepExecutor = new StepExecutor();
    this.executionCounter = new ExecutionCounter();
    this.variableWatch = new VariableWatchPanel();
    this.errorHandler = new BlockErrorHandler();
    this.executionHistory = new ExecutionHistory();
    this.conditionalPreview = new ConditionalPreview();
    this.hotReloader = new BlockHotReloader();

    // Initialize Game Event Systems (11-20)
    this.eventTriggers = new EventTriggerSystem(this.engine, this.blockExecutor);
    this.collisionCallbacks = new CollisionCallbackSystem();
    this.timerSystem = new TimerSystem();
    this.loopCounter = new LoopCounter();
    this.functionRegistry = new FunctionRegistry();
    this.eventListeners = new EventListenerSystem();
    this.stateQuery = new StateQuerySystem(this.engine);
    this.cameraController = new CameraController(this.engine);
    this.screenEffects = new ScreenEffectSystem();
    this.audioTriggers = new AudioTriggerSystem();

    // Initialize Animation Systems (21-30)
    this.spriteAnimator = SpriteAnimator.createDefaultAnimations();
    this.tweenSystem = new TweenSystem();
    this.particles = new AdvancedParticleSystem();
    this.screenTransition = new ScreenTransition();
    this.cameraShake = new CameraShake();
    this.floatingText = new FloatingTextSystem();
    this.parallax = ParallaxSystem.createSpaceParallax();
    this.lighting = new LightingSystem();
    this.hitPause = new HitPause();
    this.squashStretch = new SquashStretch();

    // Wire systems together
    this.wireSystems();
  }

  private wireSystems() {
    // Connect event triggers to animation systems
    this.eventTriggers.on('spawn_particles', (data) => {
      this.particles.emit(AdvancedParticleSystem.explosion(data.x as number, data.y as number));
    });

    this.eventTriggers.on('screen_shake', (data) => {
      this.cameraShake.trigger(data.intensity as number, (data.duration as number) / 1000);
    });

    this.eventTriggers.on('screen_flash', (data) => {
      this.screenEffects.addEffect('flash', { r: 255, g: 0, b: 0 }, 0.3);
    });

    this.eventTriggers.on('screen_transition', (data) => {
      this.screenTransition.start((data.type as TransitionType) || 'fade', (data.duration as number) || 0.5);
    });

    this.eventTriggers.on('play_sound', (data) => {
      playSoundEffect(data.sound as Parameters<typeof playSoundEffect>[0]);
    });

    // Connect block executor to variable sync
    this.hotReloader.setOnChangeCallback((blocks) => {
      this.blockExecutor.loadBlocks(blocks);
      this.blockExecutor.start();
    });
  }

  // === MAIN GAME LOOP ===
  start() {
    this.isRunning = true;
    this.engine.start();
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    this.engine.stop();
  }

  private loop = () => {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // Check hit pause
    if (this.hitPause.update(dt)) return;

    // Update all systems
    this.blockExecutor.update(dt);
    this.blockVisualizer.update(dt);
    this.executionCounter.update(dt);
    this.timerSystem.update(dt);
    this.eventTriggers.processEvents();
    this.tweenSystem.update(dt);
    this.particles.update(dt);
    this.screenTransition.update(dt);
    this.floatingText.update(dt);
    this.screenEffects.update(dt);

    // Camera
    if (this.config.enableCamera) {
      const shake = this.cameraShake.update(dt);
      this.engine.state.cameraX += shake.x;
      this.engine.state.cameraY += shake.y;
    }

    // Squash and stretch
    this.squashStretch.update(dt);

    // Track variables
    const state = this.engine.getState();
    this.variableWatch.updateValue('score', state.score);
    this.variableWatch.updateValue('health', state.playerHealth);
    this.variableWatch.updateValue('wave', state.wave);
    this.variableWatch.updateValue('combo', state.combo);
  }

  private render() {
    const ctx = (this.engine as unknown as { ctx: CanvasRenderingContext2D }).ctx;
    const width = (this.engine as unknown as { canvas: HTMLCanvasElement }).canvas.width;
    const height = (this.engine as unknown as { canvas: HTMLCanvasElement }).canvas.height;

    // Apply squash and stretch
    this.squashStretch.apply(ctx, width / 2, height / 2);

    // Render parallax background
    this.parallax.render(ctx, this.engine.state.cameraX, width, height);

    // Render lighting
    this.lighting.render(ctx, this.engine.state.cameraX, this.engine.state.cameraY);

    // Restore squash and stretch
    this.squashStretch.restore(ctx);

    // Render floating text
    this.floatingText.render(ctx);

    // Render screen effects
    this.screenEffects.render(ctx, width, height);

    // Render screen transition
    this.screenTransition.render(ctx, width, height);
  }

  // === PUBLIC API ===
  loadBlocks(blocks: Array<{ id: string; type: string; params: Record<string, string | number | boolean | undefined> }>) {
    this.blockExecutor.loadBlocks(blocks);
    this.hotReloader.checkForChanges(blocks);
  }

  startExecution() {
    this.blockExecutor.start();
  }

  stopExecution() {
    this.blockExecutor.stop();
  }

  setExecutionSpeed(speed: number) {
    this.blockExecutor.setSpeed(speed);
  }

  loadLevel(levelData: Partial<UnifiedGameState>) {
    this.engine.loadLevel(levelData);
  }

  getState() {
    return this.engine.getState();
  }

  getSystems() {
    return {
      variableSync: this.variableSync,
      blockVisualizer: this.blockVisualizer,
      breakpointManager: this.breakpointManager,
      executionCounter: this.executionCounter,
      variableWatch: this.variableWatch,
      errorHandler: this.errorHandler,
      executionHistory: this.executionHistory,
      eventTriggers: this.eventTriggers,
      timerSystem: this.timerSystem,
      spriteAnimator: this.spriteAnimator,
      particles: this.particles,
      floatingText: this.floatingText,
      cameraShake: this.cameraShake,
    };
  }

  destroy() {
    this.stop();
    this.engine.destroy();
  }
}
