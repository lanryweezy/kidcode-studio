# Contributing to KidCode Studio

## Development Setup
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev` to start development server
4. Run `npx vitest run` to run tests
5. Run `npx tsc --noEmit` to type-check

## Code Style
- Use TypeScript strict mode
- Follow existing code patterns
- Add tests for new handlers
- Use React.memo for frequently re-rendered components
- Keep functions under 50 lines
- Use descriptive variable names

## Project Structure
- `src/components/` - React UI components
- `src/services/` - Business logic services
- `src/hooks/` - Custom React hooks and command handlers
- `src/types/` - TypeScript type definitions
- `src/constants/` - Configuration and templates

## Adding New Commands
1. Add CommandType to `src/types/commandTypes.ts`
2. Add handler to appropriate file in `src/hooks/handlers/`
3. Add code generation in `src/services/codeGenerator.ts`
4. Add block definition in `src/constants/blocks.ts`
5. Add tests in `src/hooks/handlers/__tests__/`

## Adding New Game Templates
1. Create or update template file in `src/constants/templates/<genre>.ts`
2. Use helpers from `src/constants/templates/helpers.ts`
3. Test that all referenced CommandTypes exist
4. Add tests in `src/constants/templates/__tests__/`
5. Update `index.ts` to export new templates

### Template Structure
```typescript
{
  id: 'tpl_genre_name',
  mode: AppMode.GAME,
  name: 'Game Name',
  description: 'Short description',
  icon: LucideIcon,
  color: 'bg-gradient-to-r from-color1 to-color2',
  commands: [
    { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'grid' } },
    { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🚀' } },
    // ... more commands
  ]
}
```

## Adding New Services
1. Create service file in `src/services/`
2. Define interfaces for public API
3. Add error handling with try/catch
4. Export functions/classes
5. Add tests in `src/services/__tests__/`

## Adding New Game Engine Features
1. Add private properties to GameEngine class
2. Implement update methods
3. Add to the update loop in `update()` method
4. Add rendering if visual
5. Reset state in `restart()` method
6. Add tests

## Testing Guidelines
- Use Vitest with jsdom environment
- Mock canvas and DOM APIs
- Test edge cases (empty arrays, undefined values, etc.)
- Test error handling paths
- Aim for >80% coverage on new code

### Test File Naming
- `*.test.ts` for unit tests
- `*.test.tsx` for component tests
- Place in `__tests__/` directories or co-locate

## Git Workflow
1. Create feature branch from main
2. Make changes with tests
3. Run `npx vitest run` to verify
4. Run `npx tsc --noEmit` to type-check
5. Submit pull request with description

## Code Review Checklist
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] No console.log statements (use console.warn/error sparingly)
- [ ] No hardcoded values (use constants)
- [ ] Error handling is appropriate
- [ ] Public APIs have JSDoc comments
- [ ] Naming conventions are consistent
- [ ] All buttons have aria-labels
- [ ] Focus-visible styles on interactive elements
- [ ] ARIA attributes on modals, tabs, toolbars

## Performance Guidelines

### Object Pooling
- Use ObjectPool for frequently created/destroyed objects (particles, projectiles)
- Call prewarm() with expected count for initial allocation
- Use acquireBatch/releaseBatch for bulk operations

### Virtual Scrolling
- Use VirtualScroller for lists with 100+ items
- Set appropriate buffer size (5-10 items) for smooth scrolling
- Use grid variant for tile/entity palettes

### Render Optimization
- Use CanvasOptimizer.cullingCheck() before rendering entities
- Mark dirty regions instead of full redraws
- Use filterVisible() to cull off-screen entities

### Spatial Hashing
- Use SpatialHash for collision detection with 20+ entities
- Rebuild entity index each frame with buildEntityList()
- Use queryNeighbors() for local interactions

## Accessibility Guidelines

### ARIA Attributes
- Every button must have an aria-label
- Use role="dialog" for modals
- Use role="tablist"/"tab"/"tabpanel" for tab interfaces
- Use aria-live for dynamic content updates
- Use aria-selected for active tabs

### Keyboard Navigation
- All interactive elements must be focusable
- Use focus-visible ring styles (ring-2 ring-violet-500 ring-offset-2)
- Support Escape to close modals
- Implement keyboard shortcuts (document in ShortcutsOverlay)

### Screen Readers
- Use ScreenReaderAnnouncer for state changes
- Use AriaLiveRegion for game events
- Announce score, health, and level changes
- Provide text alternatives for visual feedback
