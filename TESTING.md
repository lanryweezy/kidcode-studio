# Testing Guide

## Overview

KidCode Studio uses Vitest for testing with jsdom environment. Tests are organized in `__tests__/` directories or co-located with source files.

## Running Tests

```bash
# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest

# Run specific test file
npx vitest run src/services/__tests__/gameEngine.test.ts

# Run tests with coverage
npx vitest run --coverage
```

## Test Structure

### Basic Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEngine } from '../gameEngine';

describe('GameEngine', () => {
  let canvas: HTMLCanvasElement;
  let callbacks: ReturnType<typeof createCallbacks>;

  beforeEach(() => {
    canvas = createMockCanvas();
    callbacks = createCallbacks();
    vi.useFakeTimers();
  });

  it('should create engine', () => {
    const engine = new GameEngine(canvas, callbacks);
    expect(engine).toBeDefined();
  });
});
```

### Mock Canvas

```typescript
function createMockCanvas() {
  return {
    width: 800,
    height: 600,
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      fillText: vi.fn(),
      // ... other context methods
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
  } as unknown as HTMLCanvasElement;
}
```

### Mock Callbacks

```typescript
function createCallbacks() {
  return {
    onStateChange: vi.fn(),
    onGameOver: vi.fn(),
    onVictory: vi.fn(),
    onWaveComplete: vi.fn(),
    onEnemyDefeated: vi.fn(),
    onItemCollected: vi.fn(),
    onDamage: vi.fn(),
    onHeal: vi.fn(),
  };
}
```

## Testing Patterns

### Testing State Changes

```typescript
it('should update score', () => {
  vi.useFakeTimers();
  const engine = new GameEngine(canvas, callbacks);
  engine.processCommands([
    { type: 'SET_VAR', params: { varName: 'score', value: 100 } },
  ]);
  const state = engine.getState();
  expect(state.score).toBe(100);
  vi.useRealTimers();
});
```

### Testing Error Handling

```typescript
it('should handle missing context', () => {
  const badCanvas = {
    getContext: vi.fn(() => null),
  } as unknown as HTMLCanvasElement;

  expect(() => new GameEngine(badCanvas, callbacks)).toThrow();
});
```

### Testing Edge Cases

```typescript
it('should handle empty commands', () => {
  const engine = new GameEngine(canvas, callbacks);
  expect(() => engine.processCommands([])).not.toThrow();
});

it('should handle undefined params', () => {
  const engine = new GameEngine(canvas, callbacks);
  expect(() => engine.processCommands([
    { type: 'SET_VAR', params: {} }
  ])).not.toThrow();
});
```

### Testing Templates

```typescript
describe('Templates', () => {
  it('should have unique IDs', () => {
    const ids = templates.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('should have FOREVER loops', () => {
    for (const template of templates) {
      const hasForever = template.commands.some(c => c.type === 'FOREVER');
      expect(hasForever).toBe(true);
    }
  });
});
```

## Test Categories

### Unit Tests
- Individual functions and classes
- Mock external dependencies
- Fast execution

### Integration Tests
- Multiple components working together
- Real dependencies where possible
- Test data flow

### Edge Case Tests
- Empty inputs
- Undefined values
- Boundary conditions
- Error paths

## Writing New Tests

1. Create test file adjacent to source or in `__tests__/`
2. Import test utilities from vitest
3. Mock external dependencies (canvas, localStorage, etc.)
4. Use `beforeEach` for setup
5. Test both success and error paths
6. Use descriptive test names
7. Keep tests focused (one assertion per test when possible)

## Coverage Goals

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Common Assertions

```typescript
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(array).toHaveLength(n);
expect(array).toContain(item);
expect(fn).toThrow();
expect(fn).not.toThrow();
```

## Vitest Configuration

See `vitest.config.ts` for project configuration:
- Environment: jsdom
- Globals: true
- Setup files: as configured

## Performance Testing

### Object Pool Benchmarks

```typescript
describe('ObjectPool Performance', () => {
  it('should handle 10000 acquire/release cycles', () => {
    const pool = new ObjectPool(
      () => ({ x: 0, y: 0 }),
      (obj) => { obj.x = 0; obj.y = 0; },
      1000
    );
    
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      const obj = pool.acquire();
      pool.release(obj);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

### Spatial Hash Benchmarks

```typescript
describe('SpatialHash Performance', () => {
  it('should query 1000 entities in <10ms', () => {
    const spatial = new SpatialHash(40);
    const entities = Array.from({ length: 1000 }, (_, i) => ({
      id: `e${i}`, type: 'enemy', x: Math.random() * 800, y: Math.random() * 600,
      width: 40, height: 40
    }));
    spatial.buildEntityList(entities);
    
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      spatial.query(400, 300, 200, 200);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

## Accessibility Testing

### ARIA Attribute Testing

```typescript
describe('Accessibility', () => {
  it('should have aria-labels on all buttons', () => {
    const { container } = render(<TopBar {...props} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('should have role attributes on modals', () => {
    const { getByRole } = render(<Modal open={true} onClose={vi.fn()} title="Test" />);
    expect(getByRole('dialog')).toBeTruthy();
  });
});
```

### Keyboard Navigation Testing

```typescript
describe('Keyboard Navigation', () => {
  it('should close modal on Escape', async () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('should trap focus in modal', async () => {
    render(<Modal open={true} onClose={vi.fn()}>
      <button>First</button>
      <button>Last</button>
    </Modal>);
    await userEvent.tab();
    await userEvent.tab();
  });
});
```
