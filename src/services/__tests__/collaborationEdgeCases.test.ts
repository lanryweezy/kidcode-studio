import { describe, it, expect, vi } from 'vitest';
import { CollaborationManager, PresenceManager, CursorRenderer, OfflineManager, resolveConflict, applyConflictResolution } from '../collaboration/collaborationManager';
import { IRNode } from '../ir/types';

const makeNode = (kind: string, extra: Record<string, any> = {}): IRNode => ({
  kind: kind as any,
  entityId: 'player',
  ...extra,
});

describe('CollaborationManager edge cases', () => {
  describe('document operations edge cases', () => {
    it('addNode at index 0', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('move_x'));
      collab.addNode(makeNode('say'), 0);
      expect(collab.getNodes()[0].kind).toBe('say');
    });

    it('addNode beyond length appends', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('move_x'));
      collab.addNode(makeNode('say'), 100);
      expect(collab.getNodes()).toHaveLength(2);
      expect(collab.getNodes()[1].kind).toBe('say');
    });

    it('removeNode at boundary', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      expect(collab.removeNode(0)).not.toBeNull();
      expect(collab.getNodes()).toHaveLength(0);
    });

    it('removeNode at negative index', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      expect(collab.removeNode(-1)).toBeNull();
    });

    it('updateNode beyond bounds', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.updateNode(99, makeNode('b'));
      expect(collab.getNodes()[0].kind).toBe('a');
    });

    it('moveNode same index is no-op', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.moveNode(0, 0);
      expect(collab.getNodes()[0].kind).toBe('a');
    });

    it('moveNode from invalid index', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.moveNode(-1, 0);
      expect(collab.getNodes()).toHaveLength(1);
    });

    it('moveNode to invalid index', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.moveNode(0, -1);
      expect(collab.getNodes()).toHaveLength(1);
    });

    it('setNodes replaces all', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.setNodes([makeNode('b'), makeNode('c')]);
      expect(collab.getNodes()).toHaveLength(2);
    });
  });

  describe('collaborator management edge cases', () => {
    it('removeCollaborator for unknown user', () => {
      const collab = new CollaborationManager('p1');
      collab.removeCollaborator('unknown');
      expect(collab.getCollaborators()).toHaveLength(0);
    });

    it('updateCursor for unknown user', () => {
      const collab = new CollaborationManager('p1');
      collab.updateCursor('unknown', 5);
      expect(collab.getCollaborators()).toHaveLength(0);
    });

    it('multiple collaborators', () => {
      const collab = new CollaborationManager('p1');
      collab.addCollaborator({ id: 'u1', name: 'A', color: '#f00', cursor: null, lastSeen: 1 });
      collab.addCollaborator({ id: 'u2', name: 'B', color: '#0f0', cursor: null, lastSeen: 2 });
      expect(collab.getCollaborators()).toHaveLength(2);
    });

    it('updateCursor updates lastSeen', () => {
      const collab = new CollaborationManager('p1');
      collab.addCollaborator({ id: 'u1', name: 'A', color: '#f00', cursor: null, lastSeen: 1 });
      collab.updateCursor('u1', 5);
      expect(collab.getCollaborators()[0].lastSeen).toBeGreaterThan(1);
    });
  });

  describe('remote operations edge cases', () => {
    it('remote add beyond bounds', () => {
      const collab = new CollaborationManager('p1');
      collab.applyRemoteOperation({
        type: 'add', index: 0, node: makeNode('a'), clientId: 'r1', timestamp: 1000,
      });
      expect(collab.getNodes()).toHaveLength(1);
    });

    it('remote remove from empty', () => {
      const collab = new CollaborationManager('p1');
      collab.applyRemoteOperation({
        type: 'remove', index: 0, clientId: 'r1', timestamp: 1000,
      });
      expect(collab.getNodes()).toHaveLength(0);
    });

    it('remote move without node', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.applyRemoteOperation({
        type: 'move', index: 0, clientId: 'r1', timestamp: 1000,
      });
      expect(collab.getNodes()).toHaveLength(1);
    });

    it('remote update beyond bounds', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a'));
      collab.applyRemoteOperation({
        type: 'update', index: 99, node: makeNode('b'), clientId: 'r1', timestamp: 1000,
      });
      expect(collab.getNodes()[0].kind).toBe('a');
    });

    it('duplicate operations are ignored', () => {
      const collab = new CollaborationManager('p1');
      const op = { type: 'add' as const, index: 0, node: makeNode('a'), clientId: 'r1', timestamp: 1000 };
      collab.applyRemoteOperation(op);
      collab.applyRemoteOperation(op);
      expect(collab.getNodes()).toHaveLength(1);
    });
  });

  describe('serialization edge cases', () => {
    it('deserialize invalid JSON', () => {
      const collab = new CollaborationManager('p1');
      expect(collab.deserialize('invalid')).toBe(false);
    });

    it('deserialize empty object', () => {
      const collab = new CollaborationManager('p1');
      expect(collab.deserialize('{}')).toBe(true);
      expect(collab.getNodes()).toHaveLength(0);
    });

    it('round-trip preserves data', () => {
      const collab = new CollaborationManager('p1');
      collab.addNode(makeNode('a', { dx: 10 }));
      const data = collab.serialize();
      const collab2 = new CollaborationManager('p2');
      collab2.deserialize(data);
      expect(collab2.getNodes()).toHaveLength(1);
      expect((collab2.getNodes()[0] as any).dx).toBe(10);
    });
  });

  describe('listeners', () => {
    it('multiple listeners', () => {
      const collab = new CollaborationManager('p1');
      const l1 = vi.fn();
      const l2 = vi.fn();
      collab.onUpdate(l1);
      collab.onUpdate(l2);
      collab.addNode(makeNode('a'));
      expect(l1).toHaveBeenCalledTimes(1);
      expect(l2).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe one listener', () => {
      const collab = new CollaborationManager('p1');
      const l1 = vi.fn();
      const l2 = vi.fn();
      const unsub1 = collab.onUpdate(l1);
      collab.onUpdate(l2);
      unsub1();
      collab.addNode(makeNode('a'));
      expect(l1).not.toHaveBeenCalled();
      expect(l2).toHaveBeenCalledTimes(1);
    });
  });
});

describe('PresenceManager edge cases', () => {
  it('starts with empty presence', () => {
    const pm = new PresenceManager('local');
    expect(pm.getOnlineUsers()).toHaveLength(0);
  });

  it('adds local presence', () => {
    const pm = new PresenceManager('local');
    pm.updateLocalPresence({ displayName: 'Alice' });
    expect(pm.getOnlineUsers()).toHaveLength(1);
  });

  it('removes presence', () => {
    const pm = new PresenceManager('local');
    pm.updateRemotePresence('r1', { userId: 'r1', displayName: 'Bob', status: 'online', cursor: null, lastSeen: Date.now(), color: '#f00' });
    pm.removePresence('r1');
    expect(pm.getOnlineUsers()).toHaveLength(0);
  });

  it('filters offline users', () => {
    const pm = new PresenceManager('local');
    pm.updateRemotePresence('r1', { userId: 'r1', displayName: 'Bob', status: 'offline', cursor: null, lastSeen: Date.now(), color: '#f00' });
    expect(pm.getOnlineUsers()).toHaveLength(0);
  });

  it('getUserPresence returns undefined for unknown', () => {
    const pm = new PresenceManager('local');
    expect(pm.getUserPresence('nope')).toBeUndefined();
  });

  it('getAllPresence includes offline', () => {
    const pm = new PresenceManager('local');
    pm.updateRemotePresence('r1', { userId: 'r1', displayName: 'Bob', status: 'offline', cursor: null, lastSeen: Date.now(), color: '#f00' });
    expect(pm.getAllPresence()).toHaveLength(1);
  });

  it('onUpdate callback fires', () => {
    const pm = new PresenceManager('local');
    const cb = vi.fn();
    pm.onUpdate(cb);
    pm.updateLocalPresence({ displayName: 'Alice' });
    expect(cb).toHaveBeenCalled();
  });

  it('unsubscribe callback', () => {
    const pm = new PresenceManager('local');
    const cb = vi.fn();
    const unsub = pm.onUpdate(cb);
    unsub();
    pm.updateLocalPresence({ displayName: 'Alice' });
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('CursorRenderer edge cases', () => {
  it('creates and renders cursors', () => {
    const cr = new CursorRenderer();
    cr.updateCursorPosition('u1', 10, 20, '#f00', 'Alice');
    expect(cr.getCursors()).toHaveLength(1);
  });

  it('removes cursor', () => {
    const cr = new CursorRenderer();
    cr.updateCursorPosition('u1', 10, 20, '#f00', 'Alice');
    cr.removeCursor('u1');
    expect(cr.getCursors()).toHaveLength(0);
  });

  it('animates cursors', () => {
    const cr = new CursorRenderer();
    cr.updateCursorPosition('u1', 10, 20, '#f00', 'Alice');
    cr.animateCursors();
    expect(cr.getCursors()).toHaveLength(1);
  });

  it('renders to canvas', () => {
    const cr = new CursorRenderer();
    cr.updateCursorPosition('u1', 10, 20, '#f00', 'Alice');
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillStyle: '',
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fill: vi.fn(),
      font: '',
      fillText: vi.fn(),
    } as any;
    cr.renderCursors(mockCtx);
    expect(mockCtx.save).toHaveBeenCalled();
  });

  it('updates existing cursor target', () => {
    const cr = new CursorRenderer();
    cr.updateCursorPosition('u1', 10, 20, '#f00', 'Alice');
    cr.updateCursorPosition('u1', 50, 60, '#f00', 'Alice');
    const cursor = cr.getCursors()[0];
    expect(cursor.targetX).toBe(50);
    expect(cursor.targetY).toBe(60);
  });
});

describe('OfflineManager edge cases', () => {
  it('starts online', () => {
    const om = new OfflineManager('p1');
    expect(om.isOffline()).toBe(false);
  });

  it('goes offline and back online', () => {
    const om = new OfflineManager('p1');
    om.goOffline();
    expect(om.isOffline()).toBe(true);
    om.goOnline();
    expect(om.isOffline()).toBe(false);
  });

  it('pending operations persist', () => {
    const om = new OfflineManager('p1');
    om.addPendingOperation({ type: 'add', index: 0, node: makeNode('a'), clientId: 'r1', timestamp: 1000 });
    expect(om.getPendingOperations()).toHaveLength(1);
  });

  it('clearPendingOperations clears list', () => {
    const om = new OfflineManager('p1');
    om.addPendingOperation({ type: 'add', index: 0, node: makeNode('a'), clientId: 'r1', timestamp: 1000 });
    om.clearPendingOperations();
    expect(om.getPendingOperations()).toHaveLength(0);
  });

  it('local changes persist', () => {
    const om = new OfflineManager('p1');
    om.saveLocalChange(makeNode('a'));
    expect(om.getLocalChanges()).toHaveLength(1);
  });

  it('clearLocalChanges clears list', () => {
    const om = new OfflineManager('p1');
    om.saveLocalChange(makeNode('a'));
    om.clearLocalChanges();
    expect(om.getLocalChanges()).toHaveLength(0);
  });

  it('getLastSyncTimestamp returns a number', () => {
    const om = new OfflineManager('p1');
    expect(typeof om.getLastSyncTimestamp()).toBe('number');
  });
});

describe('conflict resolution', () => {
  it('last-write-wins picks later timestamp', () => {
    const local = { type: 'update' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') };
    const remote = { type: 'update' as const, index: 0, clientId: 'b', timestamp: 200, node: makeNode('b') };
    const result = resolveConflict(local, remote, { type: 'last-write-wins', timestampOrdering: true });
    expect(result?.clientId).toBe('b');
  });

  it('first-write-wins picks earlier timestamp', () => {
    const local = { type: 'update' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') };
    const remote = { type: 'update' as const, index: 0, clientId: 'b', timestamp: 200, node: makeNode('b') };
    const result = resolveConflict(local, remote, { type: 'first-write-wins', timestampOrdering: true });
    expect(result?.clientId).toBe('a');
  });

  it('returns null for different indices', () => {
    const local = { type: 'add' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') };
    const remote = { type: 'add' as const, index: 1, clientId: 'b', timestamp: 100, node: makeNode('b') };
    expect(resolveConflict(local, remote)).toBeNull();
  });

  it('returns null for different types', () => {
    const local = { type: 'add' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') };
    const remote = { type: 'remove' as const, index: 0, clientId: 'b', timestamp: 100 };
    expect(resolveConflict(local, remote)).toBeNull();
  });

  it('applyConflictResolution resolves duplicates', () => {
    const ops = [
      { type: 'update' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') },
      { type: 'update' as const, index: 0, clientId: 'b', timestamp: 200, node: makeNode('b') },
    ];
    const resolved = applyConflictResolution(ops, { type: 'last-write-wins', timestampOrdering: true });
    expect(resolved).toHaveLength(1);
    expect(resolved[0].clientId).toBe('b');
  });

  it('applyConflictResolution with empty ops returns empty', () => {
    const resolved = applyConflictResolution([], { type: 'last-write-wins', timestampOrdering: true });
    expect(resolved).toHaveLength(0);
  });

  it('applyConflictResolution with single op returns it', () => {
    const ops = [
      { type: 'add' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') },
    ];
    const resolved = applyConflictResolution(ops, { type: 'last-write-wins', timestampOrdering: true });
    expect(resolved).toHaveLength(1);
  });

  it('resolveConflict returns local for add vs add', () => {
    const local = { type: 'add' as const, index: 0, clientId: 'a', timestamp: 100, node: makeNode('a') };
    const remote = { type: 'add' as const, index: 0, clientId: 'b', timestamp: 200, node: makeNode('b') };
    const result = resolveConflict(local, remote);
    expect(result).not.toBeNull();
  });
});
