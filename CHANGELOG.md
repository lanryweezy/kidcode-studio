# Changelog

All notable changes to KidCode Studio will be documented in this file.

## [Unreleased]

### Added
- 10 new battle templates (Shadow Fight, Robot Wars, Pirate Ship, Zombie Apocalypse, Ninja Stealth, Samurai Duel, Alien Invasion, Dragon Rider, Wizard Tower, Vampire Hunter)
- Environmental hazards system (lava, spikes, pits)
- Collectible system with 7 types (coins, gems, stars, health, speed, damage bonuses)
- Boss rage mode (enrage at 20% HP)
- Enhanced achievement tracking (15+ achievements)
- Comprehensive game balance calculations
- Improved error handling and recovery
- Electronics: HardwareStage UI interaction tests (drag-drop, wire, zoom, undo/redo)
- Electronics: Component registry advanced tests (custom components, search, favorites, dependencies)
- Electronics: Circuit simulation edge case tests (empty, single component, 200 components, mixed types)
- Electronics: Sensor simulation edge case tests (extreme values, calibration, boundary helpers)
- Electronics: Waveform generation edge case tests (zero frequency, infinite amplitude, FFT, FM/AM)
- Performance: Object pooling with batch operations and prewarm
- Performance: Virtual scrolling with grid layout support
- Performance: Canvas viewport culling and dirty region tracking
- Performance: Spatial hashing for O(1) collision detection
- Performance: Lazy loading for heavy game components
- Accessibility: ARIA labels on all interactive buttons and controls
- Accessibility: Focus-visible ring styles on all focusable elements
- Accessibility: Keyboard shortcuts overlay (press ?)
- Accessibility: Screen reader announcements for game events
- Accessibility: Live regions for score, health, level changes
- Accessibility: Role attributes on modals, tabs, toolbars
- Accessibility: Tab trapping in modal dialogs
- Testing: Performance benchmark tests for object pool and spatial hash
- Testing: Accessibility attribute tests for ARIA compliance
- Testing: Keyboard navigation tests for modal interactions
- ARCHITECTURE.md: Electronics section with full architecture overview
- ARCHITECTURE.md: Performance optimization section
- ARCHITECTURE.md: Accessibility section
- ELECTRONICS.md: Component documentation and usage guide
- API.md: Electronics API examples for circuit simulation, sensors, waveforms, hardware communication
- API.md: Performance API documentation (ObjectPool, VirtualScroller, CanvasOptimizer, SpatialHash, LazyLoader)
- API.md: Accessibility API documentation (ScreenReaderAnnouncer, AriaLiveRegion)
- TESTING.md: Performance testing examples and benchmarks
- TESTING.md: Accessibility testing examples
- CONTRIBUTING.md: Performance guidelines
- CONTRIBUTING.md: Accessibility guidelines

### Changed
- Game engine now tracks total kills and collectibles
- Boss phases include rage mode with increased stats
- Collectibles have varied effects (score, heal, speed, damage)
- Environmental hazards spawn with increasing frequency per wave
- Sidebar design tabs now use ARIA tablist/tab/tabpanel pattern
- TopBar toolbar uses role="toolbar" with aria-label
- All buttons across the app have aria-label attributes
- Save status indicator uses aria-live="polite"
- HomeScreen mode buttons have descriptive aria-labels

### Fixed
- Console.log statements removed from production code
- Consistent naming conventions across codebase
- Barrel exports verified for all modules
- Missing aria-labels on interactive elements
- Missing focus-visible styles on buttons
- Missing role attributes on tab interfaces

## [Previous Versions]

### Template System
- 150+ game templates across 12 genres
- Template validation and quality reporting
- Helper functions for common patterns

### Game Engine
- Wave-based enemy spawning
- Boss phase system
- Particle pooling for performance
- Camera system with smooth following
- Screen shake effects
- Time scale control

### Sound System
- 25 procedural sound effects
- Spatial audio with panning
- Volume controls for SFX and music
- Ambient sound generation

### Achievement System
- 15 achievements with XP rewards
- Persistent stats tracking
- Event-driven updates

### Testing
- Vitest with jsdom environment
- 57+ test files
- Edge case coverage
- Performance testing
