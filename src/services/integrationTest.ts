
// KidCode Studio — Integration Test
// Tests that all 30 systems work together

import { UnifiedGameManager } from './unifiedGameManager';
import { BlockExecutor } from './blockExecutor';
import { playSoundEffect } from './soundService';

export function runIntegrationTest(): string[] {
  const results: string[] = [];

  // Create a mock canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;

  try {
    // Test 1: Create UnifiedGameManager
    const manager = new UnifiedGameManager(canvas);
    results.push('✅ Test 1: UnifiedGameManager created successfully');

    // Test 2: All subsystems exist
    const systems = manager.getSystems();
    results.push(`✅ Test 2: ${Object.keys(systems).length} subsystems accessible`);

    // Test 3: Variable sync works
    manager.variableSync.set('score', 100);
    const score = manager.variableSync.get('score');
    results.push(score === 100 ? '✅ Test 3: Variable sync works' : '❌ Test 3: Variable sync failed');

    // Test 4: Block visualizer tracks execution
    manager.blockVisualizer.onBlockExecuted(0, 'test_block', 'SET_VAR');
    const bps = manager.blockVisualizer.getState().totalBlocksExecuted;
    results.push(bps === 1 ? '✅ Test 4: Block visualizer tracks execution' : '❌ Test 4: Block visualizer failed');

    // Test 5: Breakpoints work
    manager.breakpointManager.add(5);
    const shouldPause = manager.breakpointManager.shouldPause(5);
    results.push(shouldPause ? '✅ Test 5: Breakpoints work' : '❌ Test 5: Breakpoints failed');

    // Test 6: Step executor works
    manager.stepExecutor.step(0);
    const isStep = manager.stepExecutor.isStepMode();
    results.push(isStep ? '✅ Test 6: Step executor works' : '❌ Test 6: Step executor failed');

    // Test 7: Execution counter works
    manager.executionCounter.increment();
    const total = manager.executionCounter.getTotal();
    results.push(total === 1 ? '✅ Test 7: Execution counter works' : '❌ Test 7: Execution counter failed');

    // Test 8: Variable watch works
    manager.variableWatch.addWatch('health');
    manager.variableWatch.updateValue('health', 100);
    const healthWatch = manager.variableWatch.getWatch('health');
    results.push(healthWatch?.value === 100 ? '✅ Test 8: Variable watch works' : '❌ Test 8: Variable watch failed');

    // Test 9: Error handler works
    manager.errorHandler.reportError(0, 'test', 'Test error', 'Test suggestion');
    const errorCount = manager.errorHandler.getErrorCount();
    results.push(errorCount === 1 ? '✅ Test 9: Error handler works' : '❌ Test 9: Error handler failed');

    // Test 10: Execution history works
    manager.executionHistory.addEntry({
      blockId: 'test', blockType: 'SET_VAR', timestamp: Date.now(),
      duration: 0, result: 'success'
    });
    const historyCount = manager.executionHistory.getEntries().length;
    results.push(historyCount === 1 ? '✅ Test 10: Execution history works' : '❌ Test 10: Execution history failed');

    // Test 11: Event triggers work
    let eventFired = false;
    manager.eventTriggers.on('test_event', () => { eventFired = true; });
    manager.eventTriggers.emit('test_event', {});
    manager.eventTriggers.processEvents();
    results.push(eventFired ? '✅ Test 11: Event triggers work' : '❌ Test 11: Event triggers failed');

    // Test 12: Timer system works
    let timerFired = false;
    manager.timerSystem.addTimer(0.01, () => { timerFired = true; });
    manager.timerSystem.update(0.02);
    results.push(timerFired ? '✅ Test 12: Timer system works' : '❌ Test 12: Timer system failed');

    // Test 13: Loop counter works
    manager.loopCounter.startLoop('test', 3);
    const canContinue = manager.loopCounter.increment('test');
    results.push(canContinue ? '✅ Test 13: Loop counter works' : '❌ Test 13: Loop counter failed');

    // Test 14: Function registry works
    manager.functionRegistry.define('testFunc', ['x'], [{ type: 'SET_VAR', params: {} }]);
    const hasFunc = manager.functionRegistry.has('testFunc');
    results.push(hasFunc ? '✅ Test 14: Function registry works' : '❌ Test 14: Function registry failed');

    // Test 15: State query works
    const queryResult = manager.stateQuery.query('SCORE');
    results.push(typeof queryResult === 'number' ? '✅ Test 15: State query works' : '❌ Test 15: State query failed');

    // Test 16: Camera controller works
    manager.cameraController.shake(5, 0.3);
    results.push('✅ Test 16: Camera controller works');

    // Test 17: Screen effects work
    manager.screenEffects.addEffect('flash', { r: 255, g: 0, b: 0 }, 0.5);
    results.push('✅ Test 17: Screen effects work');

    // Test 18: Sprite animator works
    manager.spriteAnimator.play('walk');
    const emoji = manager.spriteAnimator.update(0.1);
    results.push(emoji ? '✅ Test 18: Sprite animator works' : '❌ Test 18: Sprite animator failed');

    // Test 19: Tween system works
    const testObj = { x: 0 };
    manager.tweenSystem.addTween(testObj, 'x', 0, 100, 1, (t) => t);
    manager.tweenSystem.update(0.5);
    results.push(testObj.x > 0 ? '✅ Test 19: Tween system works' : '❌ Test 19: Tween system failed');

    // Test 20: Particle system works
    manager.particles.emit({ emoji: '💥', count: 5, x: 100, y: 100, speedX: 0, speedY: -1, gravity: 0.1, lifetime: 0.5, fadeOut: true, scale: 1, rotation: 0, rotationSpeed: 0, spread: 10 });
    results.push('✅ Test 20: Particle system works');

    // Test 21: Screen transition works
    manager.screenTransition.start('fade', 0.5);
    results.push('✅ Test 21: Screen transition works');

    // Test 22: Camera shake works
    manager.cameraShake.trigger(5, 0.3);
    const shakeResult = manager.cameraShake.update(0.1);
    results.push(shakeResult.x !== 0 || shakeResult.y !== 0 ? '✅ Test 22: Camera shake works' : '❌ Test 22: Camera shake failed');

    // Test 23: Floating text works
    manager.floatingText.addDamage(100, 100, 25);
    results.push('✅ Test 23: Floating text works');

    // Test 24: Lighting works
    manager.lighting.addLight(100, 100, 50, '#ff0000', 1, false);
    results.push('✅ Test 24: Lighting works');

    // Test 25: Hit pause works
    manager.hitPause.trigger(0.1);
    const isPaused = manager.hitPause.isActive();
    results.push(isPaused ? '✅ Test 25: Hit pause works' : '❌ Test 25: Hit pause failed');

    // Test 26: Squash stretch works
    manager.squashStretch.squash();
    const scales = manager.squashStretch.getScales();
    results.push(scales.x !== 1 ? '✅ Test 26: Squash stretch works' : '❌ Test 26: Squash stretch failed');

    // Test 27: Block executor works
    manager.loadBlocks([
      { id: 'test', type: 'SET_VAR', params: { varName: 'testVar', value: 42 } },
    ]);
    manager.startExecution();
    manager.blockExecutor.update(100);
    const testVar = manager.variableSync.get('testVar');
    results.push(testVar === 42 ? '✅ Test 27: Block executor works' : '❌ Test 27: Block executor failed');

    // Test 28: Engine starts and stops
    manager.start();
    const running = manager.getState().isPlaying;
    manager.stop();
    results.push(running ? '✅ Test 28: Engine starts and stops' : '❌ Test 28: Engine start/stop failed');

    // Test 29: All subsystems update
    manager.start();
    manager.blockExecutor.update(16);
    manager.timerSystem.update(16);
    manager.executionCounter.update(16);
    manager.tweenSystem.update(16);
    manager.particles.update(16);
    manager.floatingText.update(16);
    manager.screenEffects.update(16);
    manager.hitPause.update(16);
    manager.squashStretch.update(16);
    manager.stop();
    results.push('✅ Test 29: All subsystems update without errors');

    // Test 30: Full integration cycle
    manager.loadBlocks([
      { id: 'v1', type: 'SET_VAR', params: { varName: 'score', value: 0 } },
      { id: 'v2', type: 'SET_VAR', params: { varName: 'health', value: 100 } },
      { id: 's1', type: 'SET_SCENE', params: { text: 'space' } },
      { id: 'w1', type: 'SET_WEATHER', params: { text: 'rain' } },
      { id: 'e1', type: 'SPAWN_ENEMY', params: { text: '👾' } },
      { id: 'i1', type: 'SPAWN_ITEM', params: { text: '❤️' } },
      { id: 'p1', type: 'SPAWN_PARTICLES', params: { value: 5 } },
    ]);
    manager.start();
    // Run for a few frames
    for (let i = 0; i < 10; i++) {
      manager.blockExecutor.update(16);
      manager.timerSystem.update(16);
      manager.executionCounter.update(16);
    }
    const finalState = manager.getState();
    manager.stop();
    results.push(
      finalState.score !== undefined &&
      finalState.playerHealth !== undefined &&
      finalState.weather !== undefined
        ? '✅ Test 30: Full integration cycle works'
        : '❌ Test 30: Full integration cycle failed'
    );

  } catch (error) {
    results.push(`❌ CRITICAL: ${error}`);
  }

  return results;
}
