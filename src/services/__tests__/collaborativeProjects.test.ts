import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProject,
  getProject,
  deleteProject,
  getProjectsByUser,
  inviteCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
  hasPermission,
  applyChanges,
  getBlocks,
  updateBlocks,
  addActivity,
  getActivity,
  resolveConflicts,
  getCollaborators,
  renameProject,
  findByShareLink,
  subscribeToChanges,
  resetAllProjects,
  type CollaborativeProject,
  type SyncPayload,
  type ConflictResolution,
} from '../collaborativeProjects';
import { CommandBlock, CommandType } from '../../types';

function makeBlock(type: CommandType, params: Record<string, unknown> = {}): CommandBlock {
  return {
    id: `b_${Math.random().toString(36).slice(2, 8)}`,
    type,
    params,
  };
}

describe('collaborativeProjects', () => {
  beforeEach(() => {
    resetAllProjects();
  });

  describe('createProject', () => {
    it('creates a project with owner', () => {
      const project = createProject('My Game', 'user1', 'Alice');
      expect(project.name).toBe('My Game');
      expect(project.ownerId).toBe('user1');
      expect(project.collaborators).toHaveLength(1);
      expect(project.collaborators[0].role).toBe('owner');
      expect(project.version).toBe(1);
    });

    it('creates a project with initial blocks', () => {
      const blocks = [makeBlock(CommandType.MOVE_X), makeBlock(CommandType.SHOOT)];
      const project = createProject('Game', 'user1', 'Alice', blocks);
      expect(project.blocks).toHaveLength(2);
    });

    it('generates a share link', () => {
      const project = createProject('Game', 'user1', 'Alice');
      expect(project.shareLink).toBeTruthy();
      expect(project.shareLink.length).toBe(10);
    });

    it('adds initial activity entry', () => {
      const project = createProject('Game', 'user1', 'Alice');
      expect(project.activity).toHaveLength(1);
      expect(project.activity[0].action).toBe('join');
    });
  });

  describe('getProject', () => {
    it('returns undefined for nonexistent project', () => {
      expect(getProject('nonexistent')).toBeUndefined();
    });

    it('returns the correct project', () => {
      const created = createProject('Game', 'user1', 'Alice');
      const fetched = getProject(created.id);
      expect(fetched?.id).toBe(created.id);
    });
  });

  describe('deleteProject', () => {
    it('deletes project as owner', () => {
      const project = createProject('Game', 'user1', 'Alice');
      expect(deleteProject(project.id, 'user1')).toBe(true);
      expect(getProject(project.id)).toBeUndefined();
    });

    it('rejects delete from non-owner', () => {
      const project = createProject('Game', 'user1', 'Alice');
      expect(deleteProject(project.id, 'user2')).toBe(false);
      expect(getProject(project.id)).toBeDefined();
    });
  });

  describe('getProjectsByUser', () => {
    it('returns projects user is part of', () => {
      const p1 = createProject('Game1', 'user1', 'Alice');
      const p2 = createProject('Game2', 'user2', 'Bob');
      inviteCollaborator(p2.id, 'user1', 'Alice', 'editor', 'user2');

      const projects = getProjectsByUser('user1');
      expect(projects).toHaveLength(2);
    });

    it('returns empty for user with no projects', () => {
      expect(getProjectsByUser('nobody')).toHaveLength(0);
    });
  });

  describe('inviteCollaborator', () => {
    it('invites a new collaborator', () => {
      const project = createProject('Game', 'user1', 'Alice');
      const result = inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      expect(result.success).toBe(true);
      expect(project.collaborators).toHaveLength(2);
    });

    it('updates role for existing collaborator', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      expect(project.collaborators.filter(c => c.userId === 'user2')).toHaveLength(1);
      const bob = project.collaborators.find(c => c.userId === 'user2');
      expect(bob?.role).toBe('editor');
    });

    it('rejects invite from viewer', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      const result = inviteCollaborator(project.id, 'user3', 'Charlie', 'editor', 'user2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No permission');
    });

    it('returns error for nonexistent project', () => {
      const result = inviteCollaborator('none', 'user2', 'Bob', 'editor', 'user1');
      expect(result.success).toBe(false);
    });

    it('adds activity entry', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      expect(project.activity.some(a => a.details.includes('Invited Bob'))).toBe(true);
    });
  });

  describe('removeCollaborator', () => {
    it('removes a collaborator', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      const result = removeCollaborator(project.id, 'user2', 'user1');
      expect(result.success).toBe(true);
      expect(project.collaborators).toHaveLength(1);
    });

    it('prevents removing the owner', () => {
      const project = createProject('Game', 'user1', 'Alice');
      const result = removeCollaborator(project.id, 'user1', 'user1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('owner');
    });

    it('prevents viewer from removing', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      const result = removeCollaborator(project.id, 'user1', 'user2');
      expect(result.success).toBe(false);
    });
  });

  describe('updateCollaboratorRole', () => {
    it('owner can change roles', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      const result = updateCollaboratorRole(project.id, 'user2', 'editor', 'user1');
      expect(result.success).toBe(true);
      const bob = project.collaborators.find(c => c.userId === 'user2');
      expect(bob?.role).toBe('editor');
    });

    it('non-owner cannot change roles', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      const result = updateCollaboratorRole(project.id, 'user1', 'viewer', 'user2');
      expect(result.success).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('owner has all permissions', () => {
      const project = createProject('Game', 'user1', 'Alice');
      expect(hasPermission(project, 'user1', 'read')).toBe(true);
      expect(hasPermission(project, 'user1', 'write')).toBe(true);
      expect(hasPermission(project, 'user1', 'admin')).toBe(true);
    });

    it('editor can read and write', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      expect(hasPermission(project, 'user2', 'read')).toBe(true);
      expect(hasPermission(project, 'user2', 'write')).toBe(true);
      expect(hasPermission(project, 'user2', 'admin')).toBe(false);
    });

    it('viewer can only read', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      expect(hasPermission(project, 'user2', 'read')).toBe(true);
      expect(hasPermission(project, 'user2', 'write')).toBe(false);
      expect(hasPermission(project, 'user2', 'admin')).toBe(false);
    });

    it('non-collaborator has no permissions', () => {
      const project = createProject('Game', 'user1', 'Alice');
      expect(hasPermission(project, 'nobody', 'read')).toBe(false);
    });
  });

  describe('applyChanges', () => {
    it('adds blocks', () => {
      const project = createProject('Game', 'user1', 'Alice');
      const block = makeBlock(CommandType.MOVE_X);
      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'add', blockId: block.id, block }],
        userId: 'user1',
        timestamp: Date.now(),
      };
      const result = applyChanges(project.id, payload);
      expect(result.success).toBe(true);
      expect(project.blocks).toHaveLength(1);
      expect(project.version).toBe(2);
    });

    it('removes blocks', () => {
      const project = createProject('Game', 'user1', 'Alice', [
        makeBlock(CommandType.MOVE_X),
        makeBlock(CommandType.SHOOT),
      ]);
      const blockId = project.blocks[0].id;
      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'remove', blockId }],
        userId: 'user1',
        timestamp: Date.now(),
      };
      applyChanges(project.id, payload);
      expect(project.blocks).toHaveLength(1);
    });

    it('updates blocks', () => {
      const project = createProject('Game', 'user1', 'Alice', [
        makeBlock(CommandType.MOVE_X),
      ]);
      const blockId = project.blocks[0].id;
      const updatedBlock = makeBlock(CommandType.MOVE_Y);
      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'update', blockId, block: updatedBlock }],
        userId: 'user1',
        timestamp: Date.now(),
      };
      applyChanges(project.id, payload);
      expect(project.blocks[0].type).toBe(CommandType.MOVE_Y);
    });

    it('moves blocks', () => {
      const b1 = makeBlock(CommandType.MOVE_X);
      const b2 = makeBlock(CommandType.SHOOT);
      const project = createProject('Game', 'user1', 'Alice', [b1, b2]);
      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'move', blockId: b2.id, position: 0 }],
        userId: 'user1',
        timestamp: Date.now(),
      };
      applyChanges(project.id, payload);
      expect(project.blocks[0].id).toBe(b2.id);
    });

    it('rejects changes from viewers', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'add', blockId: 'b1', block: makeBlock(CommandType.MOVE_X) }],
        userId: 'user2',
        timestamp: Date.now(),
      };
      const result = applyChanges(project.id, payload);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No write permission');
    });

    it('adds activity entries for each change', () => {
      const project = createProject('Game', 'user1', 'Alice');
      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'add', blockId: 'b1', block: makeBlock(CommandType.MOVE_X) }],
        userId: 'user1',
        timestamp: Date.now(),
      };
      applyChanges(project.id, payload);
      expect(project.activity.some(a => a.action === 'add_block')).toBe(true);
    });

    it('returns error for nonexistent project', () => {
      const payload: SyncPayload = {
        projectId: 'none',
        version: 1,
        changes: [],
        userId: 'user1',
        timestamp: Date.now(),
      };
      const result = applyChanges('none', payload);
      expect(result.success).toBe(false);
    });
  });

  describe('getBlocks', () => {
    it('returns blocks for existing project', () => {
      const project = createProject('Game', 'user1', 'Alice', [
        makeBlock(CommandType.MOVE_X),
      ]);
      expect(getBlocks(project.id)).toHaveLength(1);
    });

    it('returns undefined for nonexistent project', () => {
      expect(getBlocks('none')).toBeUndefined();
    });
  });

  describe('updateBlocks', () => {
    it('updates blocks as editor', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      const newBlocks = [makeBlock(CommandType.MOVE_X), makeBlock(CommandType.SHOOT)];
      const result = updateBlocks(project.id, newBlocks, 'user2');
      expect(result.success).toBe(true);
      expect(project.blocks).toHaveLength(2);
    });

    it('rejects update from viewer', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      const result = updateBlocks(project.id, [], 'user2');
      expect(result.success).toBe(false);
    });
  });

  describe('activity', () => {
    it('tracks activity', () => {
      const project = createProject('Game', 'user1', 'Alice');
      addActivity(project.id, 'user1', 'add_block', 'Added MOVE_X', 'b1');
      const activities = getActivity(project.id);
      expect(activities).toHaveLength(2);
      expect(activities[0].action).toBe('add_block');
    });

    it('limits activity results', () => {
      const project = createProject('Game', 'user1', 'Alice');
      for (let i = 0; i < 60; i++) {
        addActivity(project.id, 'user1', 'edit_block', `Edit ${i}`);
      }
      const activities = getActivity(project.id, 10);
      expect(activities).toHaveLength(10);
    });
  });

  describe('resolveConflicts', () => {
    it('merges conflicting changes', () => {
      const blockA = makeBlock(CommandType.MOVE_X);
      const blockB = makeBlock(CommandType.MOVE_Y);
      const conflicts: ConflictResolution[] = [
        {
          changeA: { type: 'update', blockId: 'b1', block: blockA },
          changeB: { type: 'update', blockId: 'b1', block: blockB },
          resolution: 'merge',
        },
      ];
      const resolved = resolveConflicts(conflicts);
      expect(resolved[0].mergedBlock).toBeDefined();
      expect(resolved[0].mergedBlock!.type).toBe(CommandType.MOVE_X);
    });

    it('passes through non-merge resolutions', () => {
      const blockA = makeBlock(CommandType.MOVE_X);
      const blockB = makeBlock(CommandType.MOVE_Y);
      const conflicts: ConflictResolution[] = [
        {
          changeA: { type: 'update', blockId: 'b1', block: blockA },
          changeB: { type: 'update', blockId: 'b1', block: blockB },
          resolution: 'keep_a',
        },
      ];
      const resolved = resolveConflicts(conflicts);
      expect(resolved[0].mergedBlock).toBeUndefined();
      expect(resolved[0].resolution).toBe('keep_a');
    });
  });

  describe('getCollaborators', () => {
    it('returns all collaborators', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'editor', 'user1');
      const collabs = getCollaborators(project.id);
      expect(collabs).toHaveLength(2);
    });

    it('returns empty for nonexistent project', () => {
      expect(getCollaborators('none')).toHaveLength(0);
    });
  });

  describe('renameProject', () => {
    it('renames as owner', () => {
      const project = createProject('Game', 'user1', 'Alice');
      const result = renameProject(project.id, 'New Name', 'user1');
      expect(result.success).toBe(true);
      expect(project.name).toBe('New Name');
    });

    it('rejects rename from viewer', () => {
      const project = createProject('Game', 'user1', 'Alice');
      inviteCollaborator(project.id, 'user2', 'Bob', 'viewer', 'user1');
      const result = renameProject(project.id, 'Hacked', 'user2');
      expect(result.success).toBe(false);
    });
  });

  describe('findByShareLink', () => {
    it('finds project by share link', () => {
      const project = createProject('Game', 'user1', 'Alice');
      const found = findByShareLink(project.shareLink);
      expect(found?.id).toBe(project.id);
    });

    it('returns undefined for invalid link', () => {
      expect(findByShareLink('invalid')).toBeUndefined();
    });
  });

  describe('subscribeToChanges', () => {
    it('notifies subscribers on changes', () => {
      const project = createProject('Game', 'user1', 'Alice');
      let notified = false;
      subscribeToChanges(project.id, () => { notified = true; });

      const payload: SyncPayload = {
        projectId: project.id,
        version: 1,
        changes: [{ type: 'add', blockId: 'b1', block: makeBlock(CommandType.MOVE_X) }],
        userId: 'user1',
        timestamp: Date.now(),
      };
      applyChanges(project.id, payload);
      expect(notified).toBe(true);
    });

    it('can unsubscribe', () => {
      const project = createProject('Game', 'user1', 'Alice');
      let count = 0;
      const unsub = subscribeToChanges(project.id, () => { count++; });

      const makePayload = (version: number): SyncPayload => ({
        projectId: project.id,
        version,
        changes: [{ type: 'add', blockId: `b${version}`, block: makeBlock(CommandType.MOVE_X) }],
        userId: 'user1',
        timestamp: Date.now(),
      });

      applyChanges(project.id, makePayload(1));
      expect(count).toBe(1);

      unsub();
      applyChanges(project.id, makePayload(2));
      expect(count).toBe(1);
    });
  });
});
