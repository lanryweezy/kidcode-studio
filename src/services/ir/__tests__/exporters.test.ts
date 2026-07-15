import { describe, it, expect } from 'vitest';
import { exportToGodot, generateGDScriptFromIR } from '../exporters/godotExporter';
import { exportToReactNative, generateReactNativeComponent } from '../exporters/reactNativeExporter';
import { IRNode } from '../types';
import { CommandBlock, CommandType } from '../../../types';

describe('Godot Exporter', () => {
  describe('generateGDScriptFromIR', () => {
    it('generates valid GDScript header', () => {
      const code = generateGDScriptFromIR([], 'TestGame');
      expect(code).toContain('extends CharacterBody2D');
      expect(code).toContain('TestGame');
      expect(code).toContain('var speed = 200.0');
    });

    it('generates move_x as position.x', () => {
      const nodes: IRNode[] = [{ kind: 'move_x', entityId: 'player', dx: 10 }];
      const code = generateGDScriptFromIR(nodes);
      expect(code).toContain('position.x += 10');
    });

    it('generates move_y as position.y', () => {
      const nodes: IRNode[] = [{ kind: 'move_y', entityId: 'player', dy: 5 }];
      const code = generateGDScriptFromIR(nodes);
      expect(code).toContain('position.y -= 5');
    });

    it('generates jump with is_on_floor check', () => {
      const nodes: IRNode[] = [{ kind: 'jump', entityId: 'player', force: 15 }];
      const code = generateGDScriptFromIR(nodes);
      expect(code).toContain('is_on_floor()');
      expect(code).toContain('velocity.y = -15');
    });

    it('generates game_over as scene reload', () => {
      const nodes: IRNode[] = [{ kind: 'game_over' }];
      const code = generateGDScriptFromIR(nodes);
      expect(code).toContain('reload_current_scene');
    });

    it('generates win_game as scene change', () => {
      const nodes: IRNode[] = [{ kind: 'win_game' }];
      const code = generateGDScriptFromIR(nodes);
      expect(code).toContain('change_scene_to_file');
    });

    it('includes physics process', () => {
      const code = generateGDScriptFromIR([]);
      expect(code).toContain('_physics_process');
      expect(code).toContain('move_and_slide');
    });

    it('includes input handling', () => {
      const code = generateGDScriptFromIR([]);
      expect(code).toContain('_unhandled_input');
      expect(code).toContain('ui_up');
      expect(code).toContain('ui_left');
      expect(code).toContain('ui_right');
    });
  });

  describe('exportToGodot', () => {
    it('converts blocks to IR and generates GDScript', () => {
      const commands: CommandBlock[] = [
        { id: '1', type: CommandType.MOVE_X, params: { value: 10 } },
        { id: '2', type: CommandType.JUMP, params: { value: 15 } },
      ];
      const result = exportToGodot(commands, 'FootballGame');
      expect(result.script).toContain('FootballGame');
      expect(result.script).toContain('position.x += 10');
      expect(result.script).toContain('velocity.y = -15');
    });
  });
});

describe('React Native Exporter', () => {
  describe('generateReactNativeComponent', () => {
    it('generates valid React Native component', () => {
      const code = generateReactNativeComponent([], 'TestGame');
      expect(code).toContain('import React');
      expect(code).toContain('import { View');
      expect(code).toContain('export default function TestGame()');
    });

    it('generates move_x as setPosition', () => {
      const nodes: IRNode[] = [{ kind: 'move_x', entityId: 'player', dx: 10 }];
      const code = generateReactNativeComponent(nodes, 'TestGame');
      expect(code).toContain('setPosition');
      expect(code).toContain('x: p.x + 10');
    });

    it('generates change_score as setScore', () => {
      const nodes: IRNode[] = [{ kind: 'change_score', delta: 10 }];
      const code = generateReactNativeComponent(nodes, 'TestGame');
      expect(code).toContain('setScore');
      expect(code).toContain('s + 10');
    });

    it('generates game_over comment', () => {
      const nodes: IRNode[] = [{ kind: 'game_over' }];
      const code = generateReactNativeComponent(nodes, 'TestGame');
      expect(code).toContain('Game Over');
    });

    it('includes StyleSheet', () => {
      const code = generateReactNativeComponent([], 'TestGame');
      expect(code).toContain('StyleSheet.create');
      expect(code).toContain('container');
      expect(code).toContain('player');
    });
  });

  describe('exportToReactNative', () => {
    it('converts blocks to IR and generates component', () => {
      const commands: CommandBlock[] = [
        { id: '1', type: CommandType.MOVE_X, params: { value: 10 } },
        { id: '2', type: CommandType.CHANGE_SCORE, params: { value: 5 } },
      ];
      const result = exportToReactNative(commands, 'MyGame');
      expect(result.component).toContain('MyGame');
      expect(result.component).toContain('p.x + 10');
      expect(result.appFile).toContain('import MyGame');
    });
  });
});
