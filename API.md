# KidCode Studio API Reference

## Game Engine API

### GameEngine Class

The main game runtime class that manages the game loop, physics, and rendering.

#### Constructor

```typescript
new GameEngine(canvas: HTMLCanvasElement, callbacks: GameCallbacks)
```

- `canvas`: HTML canvas element for rendering
- `callbacks`: Object with event handlers

#### GameCallbacks Interface

```typescript
interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
  onVictory: () => void;
  onWaveComplete: (wave: number) => void;
  onEnemyDefeated: (enemy: EngineEntity) => void;
  onItemCollected: (item: EngineEntity) => void;
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `start()` | Start the game loop |
| `stop()` | Stop the game loop and clean up |
| `pause()` | Pause the game |
| `resume()` | Resume the game |
| `restart()` | Reset game to initial state |
| `getState()` | Get current game state (copy) |
| `saveState()` | Save current state for persistence |
| `loadState(saved)` | Restore from saved state |
| `processCommands(commands)` | Execute command blocks |
| `setTimeScale(scale)` | Set game speed (0.1-3.0) |
| `getTimeScale()` | Get current time scale |
| `enableCamera(follow, width, height)` | Enable camera system |
| `setCameraZoom(zoom, instant)` | Set camera zoom level |
| `shakeCamera(intensity)` | Trigger screen shake |
| `getPerformanceStats()` | Get FPS, entity count, memory |
| `getErrors()` | Get error log |
| `clearErrors()` | Clear error log |

### GameState Interface

```typescript
interface GameState {
  player: EngineEntity;
  enemies: EngineEntity[];
  items: EngineEntity[];
  projectiles: EngineEntity[];
  particles: EngineEntity[];
  tiles: EngineTile[];
  variables: Record<string, number>;
  score: number;
  health: number;
  maxHealth: number;
  wave: number;
  combo: number;
  maxCombo: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
  weather: string;
  dayTime: number;
  cutsceneActive: boolean;
  scene?: string;
  camera?: CameraState;
  floatingTexts?: FloatingText[];
  wrapWorld?: boolean;
  particlePool: EngineEntity[];
  activeParticles: number;
}
```

### EngineEntity Interface

```typescript
interface EngineEntity {
  id: string;
  type: 'player' | 'enemy' | 'item' | 'projectile' | 'particle';
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  behavior: string;
  alive: boolean;
  data?: Record<string, unknown>;
}
```

## Sound Service API

### Functions

| Function | Description |
|----------|-------------|
| `playSoundEffect(type, panX?)` | Play a sound effect |
| `setSfxVolume(vol)` | Set SFX volume (0-1) |
| `getSfxVolume()` | Get current SFX volume |
| `setMusicVolume(vol)` | Set music volume (0-1) |
| `getMusicVolume()` | Get current music volume |
| `toggleMute()` | Toggle mute state |
| `setMuted(muted)` | Set mute state directly |
| `getMuted()` | Get current mute state |

### Sound Types

Available sound types: `move`, `turn`, `ui`, `click`, `coin`, `camera`, `powerup`, `laser`, `explosion`, `hurt`, `jump`, `dash`, `death`, `victory`, `attack`, `kick`, `shoot`, `pass`, `whistle`, `swish`, `hit`, `punch`, `splash`, `crack`

## Achievement Tracker API

### AchievementTracker Class

```typescript
class AchievementTracker {
  checkAchievements(): void;
  getPendingNotification(): AchievementNotification | null;
  getStats(): GameStats;
  getUnlockedAchievements(): string[];
  reset(): void;
  destroy(): void;
}
```

### GameStats Interface

```typescript
interface GameStats {
  totalKills: number;
  totalDeaths: number;
  totalScore: number;
  highestWave: number;
  highestCombo: number;
  totalPlayTime: number;
  itemsCollected: number;
  bossesDefeated: number;
  gamesPlayed: number;
  victories: number;
  fuelCollected: number;
  shieldCollected: number;
}
```

## Command Types

### Common Commands

| Command | Description |
|---------|-------------|
| `SET_SCENE` | Set background scene |
| `SET_EMOJI` | Set player emoji |
| `SET_VAR` | Set variable value |
| `CHANGE_VAR` | Modify variable value |
| `FOREVER` / `END_FOREVER` | Loop block |
| `IF` / `END_IF` | Conditional block |
| `WAIT` | Wait for duration |
| `PLAY_SOUND` | Play sound effect |
| `WIN_GAME` | Trigger victory |
| `GAME_OVER` | Trigger game over |

### Game Commands

| Command | Description |
|---------|-------------|
| `MOVE_X` / `MOVE_Y` | Move player |
| `JUMP` | Make player jump |
| `SHOOT` | Fire projectile |
| `SWING_WEAPON` | Melee attack |
| `SPAWN_ENEMY` | Create enemy |
| `SPAWN_ITEM` | Create collectible |
| `SCREEN_SHAKE` | Trigger screen shake |
| `SPECIAL_MOVE` | Area damage ability |
| `BLOCK_ATTACK` | Activate shield |
| `DODGE_ROLL` | Dash movement |

### Weather Commands

| Command | Description |
|---------|-------------|
| `SET_WEATHER` | Set weather (none, rain, snow, storm, sand) |

## Electronics API

### Circuit Simulation

```typescript
import { simulateCircuit, ELECTRICAL_PROPS, getComponentProperties, formatValue } from './services/circuitSimulator';

// Simulate a circuit
const result = simulateCircuit(components, wires, hardwareState);
// result.componentStates - Map<string, ComponentState>
// result.totalCurrent, result.totalVoltage, result.totalResistance
// result.isShortCircuit, result.isOpenCircuit
// result.errors, result.warnings
// result.propagationDelay

// Get electrical properties for a component type
const props = getComponentProperties('LED_RED');
// { resistance: 90, forwardVoltage: 1.8, forwardCurrent: 0.02, maxCurrent: 0.03 }

// Format values with SI units
formatValue(1500, 'Ω');     // "1.5kΩ"
formatValue(0.015, 'A');    // "15.0mA"
formatValue(0.000001, 'F'); // "1.0µF"
```

### Sensor Simulation

```typescript
import { simulateSensor, simulateAllSensors, DEFAULT_ENVIRONMENT, celsiusToFahrenheit } from './services/sensorSimulation';

// Simulate a single sensor
const state = simulateSensor('TEMP_SENSOR', DEFAULT_ENVIRONMENT);
// state.value, state.unit, state.calibration, state.responseModel

// Simulate multiple sensors with cross-talk
const results = simulateAllSensors(['LIGHT_SENSOR', 'TEMP_SENSOR', 'GAS_SENSOR'], env);

// Helper functions
celsiusToFahrenheit(25);   // 77
getLuxFromRaw(512);        // ~5000 lux
isDangerousGas(800);       // true
headingToDirection(45);    // "NE"
```

### Waveform Generation

```typescript
import { generateWaveform, computeFFT, analyzeSignal, generateFMWave } from './services/waveformGenerator';

// Generate a waveform
const samples = generateWaveform(
  { type: 'sine', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 },
  44100,  // sample rate
  0.1     // duration in seconds
);

// FFT analysis
const fft = computeFFT(samples, 44100);
// fft.peakFrequency, fft.magnitudes, fft.frequencies

// Signal analysis
const analysis = analyzeSignal(samples);
// analysis.rms, analysis.amplitude, analysis.frequency, analysis.dutyCycle

// FM modulation
const fm = generateFMWave({
  carrierFrequency: 1000,
  modulatorFrequency: 5,
  modulationIndex: 2,
  amplitude: 0.5,
  offset: 0.5,
  sampleRate: 44100,
  duration: 0.1,
});
```

### Hardware Communication

```typescript
import { HardwareService, BOARD_INFO } from './services/hardwareService';

const service = new HardwareService({ baudRate: 115200, autoReconnect: true });
await service.connect();
await service.digitalWrite(13, true);
await service.analogWrite(9, 128);
const temp = await service.readDHT('DHT22', 2);
await service.uploadCode(arduinoCode);
await service.disconnect();
```

### Component Registry

```typescript
import { registerComponent, searchComponents, addFavorite, createCustomComponent } from './services/componentRegistry';

// Search components
const results = searchComponents('button');

// Custom components
createCustomComponent('MyWidget', '🎯', 'Custom', MyComponent);

// Favorites
addFavorite('button');
```

## Template API

### Template Structure

```typescript
interface GameTemplate {
  id: string;
  mode: AppMode;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  commands: CommandBlock[];
  circuitComponents?: CircuitComponent[];
}
```

### Available Templates

150+ templates across genres:
- Action (20+)
- Adventure (17+)
- Battle (10)
- Classic (16+)
- Genres (15+)
- Other (5)
- Platformer (14+)
- Puzzle (13+)
- Racing (20+)
- Shooter (10+)
- Sports (13+)
- Survival (10)

## Performance API

### ObjectPool

```typescript
import { ObjectPool } from './services/objectPool';

const pool = new ObjectPool(
  () => ({ x: 0, y: 0, vx: 0, vy: 0 }),
  (obj) => { obj.x = 0; obj.y = 0; obj.vx = 0; obj.vy = 0; },
  100,  // initial size
  1000  // max size
);

const particle = pool.acquire();
pool.release(particle);

const batch = pool.acquireBatch(50);
pool.releaseBatch(batch);

pool.prewarm(200);
pool.getStats(); // { active, free, peak, maxSize }
```

### VirtualScroller

```typescript
import { VirtualScroller } from './services/virtualScroll';

const scroller = new VirtualScroller();

const visible = scroller.getVisibleItems(
  items,
  { x: 0, y: 0, width: 800, height: 600 },
  30,  // item height
  5    // buffer
);

const range = scroller.getVisibleRange(
  itemCount, viewportY, viewportHeight, itemHeight, buffer
);

const gridItems = scroller.getVisibleGridItems(
  items, viewport, itemWidth, itemHeight, columns, buffer
);
```

### CanvasOptimizer

```typescript
import { CanvasOptimizer } from './services/renderOptimizer';

const optimizer = new CanvasOptimizer(canvas);

const visible = optimizer.filterVisible(entities, camera, defaultSize);

optimizer.markDirty(x, y, w, h);
const merged = optimizer.mergeDirtyRegions();

optimizer.updateFPS();
optimizer.getFPS();
```

### SpatialHash

```typescript
import { SpatialHash } from './services/spatialHash';

const spatial = new SpatialHash(40);

spatial.buildTilemap(tiles);
spatial.buildEntityList(entities);

const nearby = spatial.query(x, y, width, height);
const radius = spatial.queryRadius(x, y, radius);
const neighbors = spatial.queryNeighbors(entity, radius);

spatial.getStats();
```

### LazyLoader

```typescript
import { lazyLoad } from './services/lazyLoader';

const heavyModule = lazyLoad(() => import('./heavyModule'));
const module = await heavyModule.load();
const isLoaded = heavyModule.isLoaded();
const instance = heavyModule.get();
```

## Accessibility API

### ScreenReaderAnnouncer

```typescript
import { useAnnouncer } from './components/ui/ScreenReaderAnnouncer';

function MyComponent() {
  const { announce } = useAnnouncer();
  announce('Game started');
  announce('Game over!', 'assertive');
}
```

### AriaLiveRegion

```typescript
import { AriaLiveRegion, useGameAnnouncer } from './components/ui/AriaLiveRegion';

const { announceGameEvent, announceBlockChange, announceGameState } = useGameAnnouncer();

announceGameEvent('Wave 5 started!');
announceBlockChange('added', 'Move', 3);
announceGameState({ score: 1000, health: 80, level: 5 });

<AriaLiveRegion message="Score: 1000" priority="polite" />
```
