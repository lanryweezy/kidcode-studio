import { describe, it, expect, vi } from 'vitest';
import { CollaborationManager } from '../collaborationManager';
import { IRNode } from '../../ir/types';

const makeNode = (kind: string, extra: Record<string, any> = {}): IRNode => ({
  kind: kind as any,
  entityId: 'player',
  ...extra,
});

describe('CollaborationManager', () => {
  describe('document operations', () => {
    it('starts with empty state', () => {
      const collab = new CollaborationManager('project1');
      expect(collab.getNodes()).toHaveLength(0);
      expect(collab.getCollaborators()).toHaveLength(0);
    });

    it('adds a node', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x', { dx: 10 }));
      expect(collab.getNodes()).toHaveLength(1);
      expect(collab.getNodes()[0].kind).toBe('move_x');
    });

    it('adds a node at specific position', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x'));
      collab.addNode(makeNode('move_y'));
      collab.addNode(makeNode('say'), 1);
      expect(collab.getNodes()).toHaveLength(3);
      expect(collab.getNodes()[1].kind).toBe('say');
    });

    it('removes a node', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x'));
      collab.addNode(makeNode('move_y'));
      const removed = collab.removeNode(0);
      expect(removed?.kind).toBe('move_x');
      expect(collab.getNodes()).toHaveLength(1);
    });

    it('returns null when removing out of bounds', () => {
      const collab = new CollaborationManager('project1');
      expect(collab.removeNode(5)).toBeNull();
    });

    it('updates a node', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x', { dx: 5 }));
      collab.updateNode(0, makeNode('move_x', { dx: 15 }));
      expect((collab.getNodes()[0] as any).dx).toBe(15);
    });

    it('moves a node', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x'));
      collab.addNode(makeNode('say'));
      collab.addNode(makeNode('move_y'));
      collab.moveNode(0, 2);
      expect(collab.getNodes().map(n => n.kind)).toEqual(['say', 'move_x', 'move_y']);
    });

    it('sets nodes (full replacement)', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x'));
      collab.setNodes([makeNode('say'), makeNode('move_y')]);
      expect(collab.getNodes()).toHaveLength(2);
    });
  });

  describe('collaborator management', () => {
    it('adds a collaborator', () => {
      const collab = new CollaborationManager('project1');
      collab.addCollaborator({ id: 'user1', name: 'Alice', color: '#ff0000', cursor: null, lastSeen: Date.now() });
      expect(collab.getCollaborators()).toHaveLength(1);
      expect(collab.getCollaborators()[0].name).toBe('Alice');
    });

    it('removes a collaborator', () => {
      const collab = new CollaborationManager('project1');
      collab.addCollaborator({ id: 'user1', name: 'Alice', color: '#ff0000', cursor: null, lastSeen: Date.now() });
      collab.removeCollaborator('user1');
      expect(collab.getCollaborators()).toHaveLength(0);
    });

    it('updates cursor position', () => {
      const collab = new CollaborationManager('project1');
      collab.addCollaborator({ id: 'user1', name: 'Alice', color: '#ff0000', cursor: null, lastSeen: Date.now() });
      collab.updateCursor('user1', 5);
      expect(collab.getCollaborators()[0].cursor).toBe(5);
    });
  });

  describe('remote operations', () => {
    it('applies remote add', () => {
      const collab = new CollaborationManager('project1');
      collab.applyRemoteOperation({
        type: 'add',
        index: 0,
        node: makeNode('move_x'),
        clientId: 'remote1',
        timestamp: 1000,
      });
      expect(collab.getNodes()).toHaveLength(1);
    });

    it('applies remote remove', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x'));
      collab.addNode(makeNode('move_y'));
      collab.applyRemoteOperation({
        type: 'remove',
        index: 0,
        clientId: 'remote1',
        timestamp: 1000,
      });
      expect(collab.getNodes()).toHaveLength(1);
      expect(collab.getNodes()[0].kind).toBe('move_y');
    });

    it('applies remote update', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x', { dx: 5 }));
      collab.applyRemoteOperation({
        type: 'update',
        index: 0,
        node: makeNode('move_x', { dx: 20 }),
        clientId: 'remote1',
        timestamp: 1000,
      });
      expect((collab.getNodes()[0] as any).dx).toBe(20);
    });

    it('ignores duplicate operations', () => {
      const collab = new CollaborationManager('project1');
      const op = { type: 'add' as const, index: 0, node: makeNode('move_x'), clientId: 'remote1', timestamp: 1000 };
      collab.applyRemoteOperation(op);
      collab.applyRemoteOperation(op); // duplicate
      expect(collab.getNodes()).toHaveLength(1);
    });
  });

  describe('listeners', () => {
    it('notifies listeners on changes', () => {
      const collab = new CollaborationManager('project1');
      const listener = vi.fn();
      collab.onUpdate(listener);
      collab.addNode(makeNode('move_x'));
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes listener', () => {
      const collab = new CollaborationManager('project1');
      const listener = vi.fn();
      const unsub = collab.onUpdate(listener);
      collab.addNode(makeNode('move_x'));
      expect(listener).toHaveBeenCalledTimes(1);
      unsub();
      collab.addNode(makeNode('move_y'));
      expect(listener).toHaveBeenCalledTimes(1); // not called again
    });
  });

  describe('serialization', () => {
    it('serializes and deserializes', () => {
      const collab = new CollaborationManager('project1');
      collab.addNode(makeNode('move_x', { dx: 10 }));
      collab.addNode(makeNode('move_y', { dy: 5 }));
      const data = collab.serialize();
      
      const collab2 = new CollaborationManager('project1');
      collab2.deserialize(data);
      expect(collab2.getNodes()).toHaveLength(2);
      expect((collab2.getNodes()[0] as any).dx).toBe(10);
    });
  });
});
