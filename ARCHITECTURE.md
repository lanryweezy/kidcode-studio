# KidCode Studio Architecture

## Overview
KidCode Studio is a block-based coding platform for kids ages 8-16. It supports three modes: Game Builder, App Studio, and Hardware Simulator.

## Directory Structure

```
src/
├── components/          # React UI components
│   ├── game/           # Game-specific components (HUD, editors)
│   ├── hardware/       # Hardware simulator components
│   ├── editor/         # Editor layout components
│   └── ui/             # Shared UI primitives (Button, Modal, Toast)
├── hooks/              # Custom React hooks
│   ├── handlers/       # Domain-specific command handlers
│   │   ├── sportsHandlers.ts
│   │   ├── actionHandlers.ts
│   │   ├── adventureHandlers.ts
│   │   ├── shooterHandlers.ts
│   │   ├── survivalHandlers.ts
│   │   ├── puzzleHandlers.ts
│   │   ├── racingHandlers.ts
│   │   └── coreHandlers.ts
│   ├── useCodeInterpreter.ts  # Main command dispatcher
│   ├── useGamePhysics.ts      # Game physics engine
│   └── useEditorController.ts # Editor state management
├── services/           # Business logic services
│   ├── engine/         # Game engine modules
│   │   ├── types.ts    # Core engine types
│   │   ├── physicsEngine.ts  # Physics simulation
│   │   ├── renderEngine.ts   # Canvas rendering
│   │   ├── inputEngine.ts    # Input handling
│   │   └── audioEngine.ts    # Sound effects
│   ├── gameEngine.ts   # Main game runtime
│   ├── soundService.ts # Procedural audio generation
│   ├── achievementTracker.ts # Achievement tracking
│   ├── gamificationService.ts # XP, badges, quests
│   ├── rpgEngine.ts    # RPG system
│   └── ...             # Other services
├── store/              # Zustand state management
│   └── slices/         # Store slices (project, UI, user)
├── types/              # TypeScript type definitions
│   ├── enums.ts        # AppMode, PlanType
│   ├── commandTypes.ts # 200+ command types
│   ├── game.ts         # Game-related types
│   ├── hardware.ts     # Hardware types
│   ├── app.ts          # App types
│   └── ui.ts           # UI/gamification types
├── constants/          # Configuration and templates
│   ├── templates/      # Game templates by genre (150+)
│   ├── blocks.ts       # Block definitions
│   └── missions.ts     # Tutorial missions
└── utils/              # Utility functions
```

## Command System

Commands are defined in `types/commandTypes.ts` (200+ types) and executed by `hooks/useCodeInterpreter.ts`. The interpreter dispatches to domain-specific handlers in `hooks/handlers/`.

Each handler receives a `HandlerContext` with:
- `spriteState` - current game state
- `cmd` - the command to execute
- `playSound` - sound effect callback
- `setNpcChat` - dialogue callback

Handlers return `true` if they handled the command, `false` to pass to the next handler.

## Game Engine

The game engine (`services/gameEngine.ts`) runs the game loop:
1. Process input (keyboard/gamepad)
2. Update physics (gravity, collision)
3. Update entities (enemies, items, projectiles)
4. Spawn environmental hazards
5. Spawn collectibles
6. Update boss phases (including rage mode)
7. Render frame (tiles, entities, HUD)

### Engine Modules

| Module | Purpose |
|--------|---------|
| `types.ts` | Core types: BlockCommand, EngineEntity, GameState, GameCallbacks |
| `physicsEngine.ts` | Box collision, enemy AI behavior |
| `renderEngine.ts` | Canvas rendering for all entity types |
| `inputEngine.ts` | Keyboard/gamepad input with buffering |
| `audioEngine.ts` | Sound effect playback bridge |

### Key Features

- **Wave System**: Enemies spawn in waves with increasing difficulty
- **Boss Phases**: Bosses have 3 phases (normal, enrage, rage) based on HP thresholds
- **Environmental Hazards**: Lava, spikes, pits that damage the player
- **Collectible System**: Coins, gems, health, speed/damage bonuses
- **Achievement System**: 15+ achievements tracked across sessions
- **Particle System**: Pooled particles for performance
- **Camera System**: Smooth following, zoom, screen shake

## State Management

Zustand store with 3 slices:
- `projectSlice` - current project, commands, history
- `uiSlice` - modal visibility, editor state
- `userSlice` - user profile, XP, badges

## Template System

Templates are defined in `src/constants/templates/` organized by genre:
- `action.ts` - Fighting, combat, rhythm games
- `adventure.ts` - RPG, exploration, story games
- `battle.ts` - Shadow fight, robot wars, pirate ship, etc.
- `shooter.ts` - Space, FPS, battle royale
- `survival.ts` - Zombie, island, space survival
- `puzzle.ts` - Match-3, sliding, memory
- `racing.ts` - Kart, formula, drift
- `platformer.ts` - Jumping, running, climbing
- `sports.ts` - Football, basketball, tennis
- `classic.ts` - Pacman, snake, breakout
- `genres.ts` - Tower defense, card battle, etc.

Each template contains:
- `id`: Unique identifier
- `mode`: GAME, APP, or HARDWARE
- `name`: Display name
- `description`: Short description
- `icon`: Lucide icon component
- `color`: Tailwind gradient class
- `commands`: Array of CommandBlock objects

## Testing

Tests use Vitest with jsdom environment. Run `npx vitest run` to execute.

### Test Organization

- `src/services/__tests__/` - Service tests
- `src/components/__tests__/` - Component tests
- `src/constants/templates/__tests__/` - Template tests
- Co-located `*.test.ts` files for specific modules

## Electronics / Hardware Simulator

The electronics subsystem simulates real circuits with physics-based component behavior, sensor simulation, and waveform generation.

### Key Files

| File | Purpose |
|------|---------|
| `components/HardwareStage.tsx` | Main circuit editor canvas (SVG-based, drag-drop, wiring, zoom, undo/redo) |
| `components/hardware/HardwareComponents.tsx` | SVG rendering for all 80+ component types |
| `components/hardware/WireRouter.tsx` | Wire routing and rendering between components |
| `components/hardware/CircuitBoard.tsx` | PCB grid overlay (Arduino Uno board layout) |
| `components/hardware/ComponentPalette.tsx` | Toolbar, validation panel, templates, export, ohm's law calculator |
| `components/hardware/PinManager.tsx` | Wire colors, pin info, component labels |
| `services/circuitSimulator.ts` | Physics-based circuit simulation (Ohm's Law, Kirchhoff's) |
| `services/circuitValidator.ts` | Circuit validation (missing power, short circuits, LED without resistor) |
| `services/circuitExport.ts` | Export to SVG, PNG, Arduino code, Python code |
| `services/sensorSimulation.ts` | 20+ sensor types with noise, calibration, cross-talk |
| `services/waveformGenerator.ts` | Signal generation (sine, square, FM, AM, FFT analysis) |
| `services/hardwareService.ts` | WebSerial communication with real Arduino/ESP32 boards |
| `services/componentRegistry.tsx` | UI component registry for App Builder |
| `services/componentDatasheets.ts` | Component datasheet references |
| `constants/hardware.ts` | Hardware constants and configurations |
| `constants/circuitTemplates.ts` | Pre-built circuit templates |

### Circuit Simulation

The simulator uses Ohm's Law (V = IR) and series circuit analysis:
1. Build adjacency map from components and wires
2. Find connected groups via BFS
3. Identify power sources (battery, solar)
4. Calculate total resistance per group
5. Apply component-specific modifiers (LED forward voltage, capacitor impedance, transistor switching)
6. Compute per-component current, voltage, power, and state (active/inactive)
7. Detect short circuits, open circuits, and overcurrent warnings
8. Calculate signal propagation delay

### Sensor Types

20+ simulated sensors with physics-based behavior:
- **Light/Temp**: LDR, TMP36/LM35, thermistor, DHT11/DHT22
- **Distance/Motion**: HC-SR04 ultrasonic, PIR motion
- **Environmental**: Gas (MQ-2), flame, rain, soil moisture, pressure (BMP280)
- **Input**: Flex, tilt, hall effect, compass (HMC5883), gyro (MPU6050)
- **Advanced**: GPS (NEO-6M), heartbeat, color (TCS3200), RFID, fingerprint
- Features: Gaussian noise, calibration offsets, response time modeling, cross-talk between sensors

### Waveform Generation

Signal generation for oscilloscope and signal analyzer:
- **Basic**: Sine, square, triangle, sawtooth, pulse, DC
- **Noise**: White, pink (1/f), brownian (random walk)
- **Modulation**: FM, AM, combined modulated waveforms
- **Analysis**: FFT, signal RMS/amplitude/frequency/duty-cycle/THD/SNR
- **Arduino**: `analogWrite`, `tone`, PWM signal emulation

### Hardware Communication

WebSerial-based communication with real microcontrollers:
- Auto-detect board type (Arduino Uno/Nano/Mega, ESP32, ESP8266, micro:bit)
- Upload code via serial
- Digital/analog pin read/write
- DHT sensor reading, ultrasonic distance
- Command queue with priority and retry
- Auto-reconnect with configurable attempts

## Sound System

Procedural audio generation using Web Audio API:
- 25 sound effect types
- Spatial audio with stereo panning
- Sound pooling for efficiency
- Volume controls for SFX and music
- Ambient sound generation (forest, ocean, wind, cave)

## Performance Optimization

### Object Pooling
- `src/services/objectPool.ts` - Generic object pool with batch operations
- Supports acquire/release, batch acquire/release, prewarm, clear
- Tracks active, free, peak counts with configurable max size
- Used for particles, projectiles, and other frequently created/destroyed objects

### Virtual Scrolling
- `src/services/virtualScroll.ts` - Efficient list rendering for large datasets
- Supports linear and grid layouts with configurable buffer zones
- Returns only visible items based on viewport position
- Reduces DOM nodes for entity lists with 100+ items

### Render Optimization
- `src/services/renderOptimizer.ts` - Canvas rendering optimization
- Viewport culling (only render visible entities)
- Dirty region tracking for partial redraws
- FPS monitoring and frame skipping
- Region merging for batch operations

### Spatial Hashing
- `src/services/spatialHash.ts` - O(1) collision detection
- Divides world into cells for efficient neighbor queries
- Supports entity and tile indexing
- Radius and rectangle queries

### Lazy Loading
- `src/services/lazyLoader.ts` - On-demand module loading
- Singleton pattern with promise caching
- Used for heavy game components (3D, physics engines)

## Accessibility

### ARIA Attributes
- All interactive elements have aria-labels
- Modals use role="dialog" with aria-modal
- Tab interfaces use role="tablist", "tab", "tabpanel"
- Dynamic content uses aria-live regions
- Toolbars use role="toolbar"

### Keyboard Navigation
- Focus-visible ring styles on all focusable elements
- Keyboard shortcuts overlay (press ?)
- Escape closes modals and overlays
- Tab trapping in modal dialogs

### Screen Readers
- ScreenReaderAnnouncer for state changes
- AriaLiveRegion for game events
- Score, health, and level changes announced
- Text alternatives for visual feedback
