import { describe, it, expect } from 'vitest';
import { commandBlockToIR, executeIRNode, generateCodeFromIR } from '..';
import { CommandType } from '../../../types';
import { INITIAL_SPRITE_STATE } from '../../../constants';

describe('IR Pipeline — 5 movement commands', () => {
  const makeState = () => ({ ...INITIAL_SPRITE_STATE });

  describe('commandBlockToIR', () => {
    it('converts MOVE_X block to IR node', () => {
      const block = { id: '1', type: CommandType.MOVE_X, params: { value: 10 } };
      const node = commandBlockToIR(block);
      expect(node).toEqual({ kind: 'move_x', entityId: 'player', dx: 10 });
    });

    it('converts MOVE_Y block to IR node', () => {
      const block = { id: '1', type: CommandType.MOVE_Y, params: { value: 5 } };
      const node = commandBlockToIR(block);
      expect(node).toEqual({ kind: 'move_y', entityId: 'player', dy: 5 });
    });

    it('converts SET_VELOCITY_X block to IR node', () => {
      const block = { id: '1', type: CommandType.SET_VELOCITY_X, params: { value: 8 } };
      const node = commandBlockToIR(block);
      expect(node).toEqual({ kind: 'set_velocity_x', entityId: 'player', vx: 8 });
    });

    it('converts SET_VELOCITY_Y block to IR node', () => {
      const block = { id: '1', type: CommandType.SET_VELOCITY_Y, params: { value: -3 } };
      const node = commandBlockToIR(block);
      expect(node).toEqual({ kind: 'set_velocity_y', entityId: 'player', vy: -3 });
    });

    it('converts SET_GRAVITY block to IR node', () => {
      const block = { id: '1', type: CommandType.SET_GRAVITY, params: { condition: 'true' } };
      const node = commandBlockToIR(block);
      expect(node).toEqual({ kind: 'set_gravity', entityId: 'player', enabled: true });
    });

    it('converts JUMP block to IR node', () => {
      const block = { id: '1', type: CommandType.JUMP, params: { value: 15 } };
      const node = commandBlockToIR(block);
      expect(node).toEqual({ kind: 'jump', entityId: 'player', force: 15 });
    });

    it('returns null for unhandled commands', () => {
      const block = { id: '1', type: CommandType.SET_TITLE, params: { text: 'My Game' } };
      const node = commandBlockToIR(block);
      expect(node).toBeNull();
    });
  });

  describe('executeIRNode', () => {
    it('MOVE_X increases x by dx', () => {
      const state = makeState();
      state.x = 100;
      executeIRNode({ kind: 'move_x', entityId: 'player', dx: 10 }, { spriteState: state });
      expect(state.x).toBe(110);
    });

    it('MOVE_Y decreases y by dy (canvas coordinates)', () => {
      const state = makeState();
      state.y = 200;
      executeIRNode({ kind: 'move_y', entityId: 'player', dy: 10 }, { spriteState: state });
      expect(state.y).toBe(190);
    });

    it('SET_VELOCITY_X sets vx', () => {
      const state = makeState();
      executeIRNode({ kind: 'set_velocity_x', entityId: 'player', vx: 8 }, { spriteState: state });
      expect(state.vx).toBe(8);
    });

    it('SET_VELOCITY_Y sets vy', () => {
      const state = makeState();
      executeIRNode({ kind: 'set_velocity_y', entityId: 'player', vy: -5 }, { spriteState: state });
      expect(state.vy).toBe(-5);
    });

    it('SET_GRAVITY enables gravity', () => {
      const state = makeState();
      state.gravity = false;
      executeIRNode({ kind: 'set_gravity', entityId: 'player', enabled: true }, { spriteState: state });
      expect(state.gravity).toBe(true);
    });

    it('SET_FRICTION sets friction', () => {
      const state = makeState();
      executeIRNode({ kind: 'set_friction', entityId: 'player', value: 0.5 }, { spriteState: state });
      expect(state.friction).toBe(0.5);
    });

    it('SET_BOUNCINESS sets restitution', () => {
      const state = makeState();
      executeIRNode({ kind: 'set_bounciness', entityId: 'player', value: 0.9 }, { spriteState: state });
      expect(state.restitution).toBe(0.9);
    });

    it('JUMP sets vy and isJumping when not already jumping', () => {
      const state = makeState();
      state.isJumping = false;
      executeIRNode({ kind: 'jump', entityId: 'player', force: 15 }, { spriteState: state });
      expect(state.vy).toBe(-15);
      expect(state.isJumping).toBe(true);
    });

    it('JUMP does nothing when already jumping', () => {
      const state = makeState();
      state.isJumping = true;
      state.vy = -10;
      executeIRNode({ kind: 'jump', entityId: 'player', force: 15 }, { spriteState: state });
      expect(state.vy).toBe(-10); // unchanged
    });
  });

  describe('generateCodeFromIR', () => {
    it('generates TypeScript for move_x', () => {
      const code = generateCodeFromIR({ kind: 'move_x', entityId: 'player', dx: 10 });
      expect(code).toBe('sprite.x += 10;\n');
    });

    it('generates TypeScript for move_y', () => {
      const code = generateCodeFromIR({ kind: 'move_y', entityId: 'player', dy: 5 });
      expect(code).toBe('sprite.y -= 5;\n');
    });

    it('generates TypeScript for set_velocity_x', () => {
      const code = generateCodeFromIR({ kind: 'set_velocity_x', entityId: 'player', vx: 8 });
      expect(code).toBe('sprite.vx = 8;\n');
    });

    it('generates TypeScript for set_gravity', () => {
      const code = generateCodeFromIR({ kind: 'set_gravity', entityId: 'player', enabled: true });
      expect(code).toBe('sprite.gravity = true;\n');
    });

    it('generates TypeScript for jump', () => {
      const code = generateCodeFromIR({ kind: 'jump', entityId: 'player', force: 15 });
      expect(code).toContain('sprite.vy = -15');
      expect(code).toContain('sprite.isJumping = true');
    });

    it('returns null for unhandled node types', () => {
      // @ts-expect-error testing invalid kind
      const code = generateCodeFromIR({ kind: 'unknown', entityId: 'player' });
      expect(code).toBeNull();
    });
  });

  describe('End-to-end: Block → IR → Execute + CodeGen produce identical results', () => {
    it('MOVE_X: interpreter and codegen agree', () => {
      const block = { id: '1', type: CommandType.MOVE_X, params: { value: 10 } };
      const node = commandBlockToIR(block)!;
      
      // Interpreter: applies to state
      const state = makeState();
      state.x = 100;
      executeIRNode(node, { spriteState: state });
      expect(state.x).toBe(110);
      
      // Codegen: produces equivalent code
      const code = generateCodeFromIR(node);
      expect(code).toBe('sprite.x += 10;\n');
      // If you ran this code on a state with x=100, you'd get x=110
    });

    it('MOVE_Y: interpreter and codegen agree', () => {
      const block = { id: '1', type: CommandType.MOVE_Y, params: { value: 10 } };
      const node = commandBlockToIR(block)!;
      
      const state = makeState();
      state.y = 200;
      executeIRNode(node, { spriteState: state });
      expect(state.y).toBe(190); // canvas Y increases downward
      
      const code = generateCodeFromIR(node);
      expect(code).toBe('sprite.y -= 10;\n');
    });

    it('SET_GRAVITY: interpreter and codegen agree', () => {
      const block = { id: '1', type: CommandType.SET_GRAVITY, params: { condition: 'true' } };
      const node = commandBlockToIR(block)!;
      
      const state = makeState();
      state.gravity = false;
      executeIRNode(node, { spriteState: state });
      expect(state.gravity).toBe(true);
      
      const code = generateCodeFromIR(node);
      expect(code).toBe('sprite.gravity = true;\n');
    });

    it('JUMP: interpreter and codegen agree', () => {
      const block = { id: '1', type: CommandType.JUMP, params: { value: 15 } };
      const node = commandBlockToIR(block)!;
      
      const state = makeState();
      state.isJumping = false;
      executeIRNode(node, { spriteState: state });
      expect(state.vy).toBe(-15);
      expect(state.isJumping).toBe(true);
      
      const code = generateCodeFromIR(node);
      expect(code).toContain('sprite.vy = -15');
    });
  });
});
