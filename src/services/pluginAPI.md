# KidCode Studio Plugin API

## Overview

KidCode Studio supports plugins that extend the editor with custom blocks, renderers, exporters, and UI panels. Plugins are loaded through the `PluginSystem` singleton and can be managed via the Plugin Manager UI.

## Creating a Plugin

A plugin is an object implementing the `Plugin` interface:

```typescript
import { Plugin, PluginContext } from './pluginSystem';

const myPlugin: Plugin = {
  metadata: {
    id: 'my-custom-plugin',
    name: 'My Custom Plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: 'A short description of what this plugin does',
    icon: '🎯',
    category: 'block',       // 'block' | 'theme' | 'engine' | 'ui' | 'ai' | 'export'
    minAppVersion: '1.0.0',  // Minimum KidCode Studio version required
    maxAppVersion: '2.0.0',  // Optional maximum version
    dependencies: [],        // Optional plugin IDs that must be installed first
  },
  onLifecycle: (event, ctx) => {
    // Handle lifecycle events
  },
};
```

## Plugin Lifecycle

Plugins go through four lifecycle events:

| Event | When | Use Case |
|-------|------|----------|
| `init` | Plugin is registered | Register blocks, renderers, exporters |
| `destroy` | Plugin is unregistered | Clean up resources |
| `enable` | Plugin is re-enabled | Resume functionality |
| `disable` | Plugin is disabled | Pause functionality |

```typescript
onLifecycle: (event, ctx) => {
  switch (event) {
    case 'init':
      registerMyBlocks(ctx);
      break;
    case 'destroy':
      cleanup();
      break;
    case 'enable':
      startListening();
      break;
    case 'disable':
      stopListening();
      break;
  }
}
```

## Plugin Context API

The `PluginContext` provides these methods:

### registerBlock(type, config)

Register a custom block type that appears in the block palette.

```typescript
ctx.registerBlock('my_custom_block', {
  label: 'My Custom Block',
  color: 'bg-blue-500',     // Tailwind color class
  category: 'My Plugin',    // Category name in the block palette
  params: [
    { name: 'speed', type: 'number', default: 5 },
    { name: 'direction', type: 'string', default: 'right' },
    { name: 'visible', type: 'boolean', default: true },
  ],
  execute: (params, ctx) => {
    // Execute the block's logic
    console.log(`Speed: ${params.speed}, Direction: ${params.direction}`);
    ctx.emit('block:executed', { type: 'my_custom_block', params });
  },
});
```

### registerRenderer(type, renderer)

Register a custom game renderer.

```typescript
ctx.registerRenderer('my_renderer', {
  render: (canvasCtx, state) => {
    // Draw custom visuals on the canvas
    canvasCtx.fillStyle = '#ff0000';
    canvasCtx.fillRect(10, 10, 100, 100);
  },
  resize: (width, height) => {
    // Handle canvas resize
  },
  destroy: () => {
    // Clean up resources
  },
});
```

### registerExporter(format, exporter)

Register a custom code exporter.

```typescript
ctx.registerExporter('my_format', {
  export: async (project) => {
    const code = generateMyFormat(project);
    return new Blob([code], { type: 'text/plain' });
  },
  extension: 'myformat',
  mimeType: 'text/plain',
});
```

### Event System

```typescript
// Listen to events
ctx.on('game:start', () => { /* ... */ });
ctx.on('game:stop', () => { /* ... */ });

// Emit events
ctx.emit('custom:event', { data: 'hello' });

// Stop listening
ctx.off('game:start', handler);
```

### Storage

Per-plugin localStorage with automatic prefixing:

```typescript
// Store data
ctx.storage.set('highScore', 1000);
ctx.storage.set('settings', { volume: 80, effects: true });

// Retrieve data
const score = ctx.storage.get('highScore');

// Remove data
ctx.storage.remove('highScore');

// Clear all plugin data
ctx.storage.clear();
```

### Game State

Access and modify the game state:

```typescript
const state = ctx.getGameState();
ctx.setGameState({ score: state.score + 10 });
```

### UI

```typescript
ctx.ui.showToast('Plugin activated!', 'success');
```

## Plugin Categories

| Category | Description | What It Registers |
|----------|-------------|-------------------|
| `block` | Custom blocks for the block palette | Blocks |
| `theme` | Visual themes and styles | Renderers |
| `engine` | Game engine extensions | Renderers, engine hooks |
| `ui` | UI panels and overlays | UI components |
| `ai` | AI-powered tools | AI integrations |
| `export` | Code export formats | Exporters |

## Registering a Plugin

```typescript
import { pluginSystem } from './pluginSystem';

// Register the plugin
const result = await pluginSystem.register(myPlugin);

if (result.success) {
  console.log('Plugin installed successfully');
} else {
  console.error('Failed to install:', result.error);
}

// Enable/disable
await pluginSystem.enable('my-custom-plugin');
await pluginSystem.disable('my-custom-plugin');

// Uninstall
await pluginSystem.unregister('my-custom-plugin');
```

## Conflict Detection

Only one `block` category plugin can be active at a time. The system automatically detects conflicts and prevents registration of conflicting plugins.

## Dependency Management

Plugins can declare dependencies on other plugins:

```typescript
metadata: {
  id: 'advanced-ai',
  dependencies: ['base-ai', 'data-manager'],
}
```

If a dependency is not installed or enabled, the plugin registration will fail with a clear error message.

## Complete Example: Sound Effect Plugin

```typescript
import { Plugin, PluginContext } from './pluginSystem';

const soundEffectPlugin: Plugin = {
  metadata: {
    id: 'sound-effects-pack',
    name: 'Sound Effects Pack',
    version: '1.0.0',
    author: 'KidCode Labs',
    description: '20+ new sound effects for your games',
    category: 'block',
    minAppVersion: '1.0.0',
  },
  onLifecycle: (event, ctx) => {
    if (event === 'init') {
      ctx.registerBlock('play_thunder', {
        label: 'Play Thunder',
        color: 'bg-gray-600',
        category: 'Sound Effects',
        params: [],
        execute: () => {
          // Play thunder sound effect
          console.log('THUNDER!');
        },
      });

      ctx.registerBlock('play_rain', {
        label: 'Play Rain',
        color: 'bg-blue-400',
        category: 'Sound Effects',
        params: [
          { name: 'intensity', type: 'number', default: 50 },
        ],
        execute: (params) => {
          console.log(`Rain intensity: ${params.intensity}`);
        },
      });

      ctx.registerBlock('play_wind', {
        label: 'Play Wind',
        color: 'bg-cyan-400',
        category: 'Sound Effects',
        params: [],
        execute: () => {
          console.log('WHOOOOSH!');
        },
      });
    }

    if (event === 'destroy') {
      // Clean up any resources
    }
  },
};

// Register it
await pluginSystem.register(soundEffectPlugin);
```

## TypeScript Types

All plugin types are exported from `pluginSystem.ts`:

- `PluginMetadata` - Plugin identification and version info
- `PluginContext` - API available to plugins
- `BlockConfig` - Block registration configuration
- `GameRenderer` - Custom renderer interface
- `Exporter` - Custom exporter interface
- `PluginStorage` - Per-plugin storage API
- `PluginUI` - UI integration API
- `PluginLifecycle` - Lifecycle event types
- `Plugin` - Main plugin interface
