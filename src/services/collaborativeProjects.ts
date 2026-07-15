import { CommandBlock } from '../types';

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

export interface Collaborator {
  userId: string;
  name: string;
  avatar: string;
  role: CollaboratorRole;
  joinedAt: number;
  lastActive: number;
  cursor?: { blockId: string; position: number };
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: 'add_block' | 'remove_block' | 'move_block' | 'edit_block' | 'join' | 'leave' | 'rename' | 'comment';
  timestamp: number;
  details: string;
  blockId?: string;
  previousState?: string;
}

export interface CollaborativeProject {
  id: string;
  name: string;
  ownerId: string;
  blocks: CommandBlock[];
  collaborators: Collaborator[];
  activity: ActivityEntry[];
  shareLink: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface SyncPayload {
  projectId: string;
  version: number;
  changes: SyncChange[];
  userId: string;
  timestamp: number;
}

export interface SyncChange {
  type: 'add' | 'remove' | 'update' | 'move';
  blockId: string;
  block?: CommandBlock;
  position?: number;
  previousState?: CommandBlock;
}

export interface ConflictResolution {
  changeA: SyncChange;
  changeB: SyncChange;
  resolution: 'keep_a' | 'keep_b' | 'merge';
  mergedBlock?: CommandBlock;
}

const projects = new Map<string, CollaborativeProject>();
const listeners = new Map<string, Set<(payload: SyncPayload) => void>>();

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateShareLink(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createProject(
  name: string,
  ownerId: string,
  ownerName: string,
  initialBlocks: CommandBlock[] = []
): CollaborativeProject {
  const project: CollaborativeProject = {
    id: generateId(),
    name,
    ownerId,
    blocks: [...initialBlocks],
    collaborators: [
      {
        userId: ownerId,
        name: ownerName,
        avatar: '👤',
        role: 'owner',
        joinedAt: Date.now(),
        lastActive: Date.now(),
      },
    ],
    activity: [
      {
        id: generateId(),
        userId: ownerId,
        userName: ownerName,
        action: 'join',
        timestamp: Date.now(),
        details: 'Created the project',
      },
    ],
    shareLink: generateShareLink(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };

  projects.set(project.id, project);
  return project;
}

export function getProject(projectId: string): CollaborativeProject | undefined {
  return projects.get(projectId);
}

export function deleteProject(projectId: string, userId: string): boolean {
  const project = projects.get(projectId);
  if (!project) return false;
  if (project.ownerId !== userId) return false;
  projects.delete(projectId);
  listeners.delete(projectId);
  return true;
}

export function getProjectsByUser(userId: string): CollaborativeProject[] {
  const result: CollaborativeProject[] = [];
  for (const project of projects.values()) {
    if (project.collaborators.some(c => c.userId === userId)) {
      result.push(project);
    }
  }
  return result;
}

export function inviteCollaborator(
  projectId: string,
  userId: string,
  name: string,
  role: CollaboratorRole,
  invitedBy: string
): { success: boolean; error?: string } {
  const project = projects.get(projectId);
  if (!project) return { success: false, error: 'Project not found' };

  const inviter = project.collaborators.find(c => c.userId === invitedBy);
  if (!inviter || inviter.role === 'viewer') {
    return { success: false, error: 'No permission to invite' };
  }

  const existing = project.collaborators.find(c => c.userId === userId);
  if (existing) {
    existing.role = role;
    existing.lastActive = Date.now();
  } else {
    project.collaborators.push({
      userId,
      name,
      avatar: '👤',
      role,
      joinedAt: Date.now(),
      lastActive: Date.now(),
    });
  }

  project.activity.push({
    id: generateId(),
    userId: invitedBy,
    userName: inviter.name,
    action: 'join',
    timestamp: Date.now(),
    details: `Invited ${name} as ${role}`,
  });

  project.updatedAt = Date.now();
  project.version++;

  notifyListeners(projectId, {
    projectId,
    version: project.version,
    changes: [],
    userId: invitedBy,
    timestamp: Date.now(),
  });

  return { success: true };
}

export function removeCollaborator(
  projectId: string,
  userId: string,
  removedBy: string
): { success: boolean; error?: string } {
  const project = projects.get(projectId);
  if (!project) return { success: false, error: 'Project not found' };

  if (userId === project.ownerId) {
    return { success: false, error: 'Cannot remove the owner' };
  }

  const remover = project.collaborators.find(c => c.userId === removedBy);
  if (!remover || remover.role === 'viewer') {
    return { success: false, error: 'No permission to remove' };
  }

  const index = project.collaborators.findIndex(c => c.userId === userId);
  if (index === -1) return { success: false, error: 'User not found' };

  const removed = project.collaborators.splice(index, 1)[0];

  project.activity.push({
    id: generateId(),
    userId: removedBy,
    userName: remover.name,
    action: 'leave',
    timestamp: Date.now(),
    details: `Removed ${removed.name}`,
  });

  project.updatedAt = Date.now();
  project.version++;

  return { success: true };
}

export function updateCollaboratorRole(
  projectId: string,
  userId: string,
  newRole: CollaboratorRole,
  updatedBy: string
): { success: boolean; error?: string } {
  const project = projects.get(projectId);
  if (!project) return { success: false, error: 'Project not found' };

  if (updatedBy !== project.ownerId) {
    return { success: false, error: 'Only the owner can change roles' };
  }

  const collab = project.collaborators.find(c => c.userId === userId);
  if (!collab) return { success: false, error: 'User not found' };

  collab.role = newRole;
  project.updatedAt = Date.now();
  project.version++;

  return { success: true };
}

export function hasPermission(
  project: CollaborativeProject,
  userId: string,
  action: 'read' | 'write' | 'admin'
): boolean {
  const collab = project.collaborators.find(c => c.userId === userId);
  if (!collab) return false;

  switch (action) {
    case 'read':
      return true;
    case 'write':
      return collab.role === 'owner' || collab.role === 'editor';
    case 'admin':
      return collab.role === 'owner';
  }
}

export function applyChanges(
  projectId: string,
  payload: SyncPayload
): { success: boolean; conflicts: ConflictResolution[]; error?: string } {
  const project = projects.get(projectId);
  if (!project) return { success: false, conflicts: [], error: 'Project not found' };

  const collab = project.collaborators.find(c => c.userId === payload.userId);
  if (!collab || collab.role === 'viewer') {
    return { success: false, conflicts: [], error: 'No write permission' };
  }

  const conflicts: ConflictResolution[] = [];

  for (const change of payload.changes) {
    switch (change.type) {
      case 'add':
        if (change.block) {
          project.blocks.push(change.block);
          project.activity.push({
            id: generateId(),
            userId: payload.userId,
            userName: collab.name,
            action: 'add_block',
            timestamp: payload.timestamp,
            details: `Added ${change.block.type} block`,
            blockId: change.blockId,
          });
        }
        break;

      case 'remove': {
        const removeIndex = project.blocks.findIndex(b => b.id === change.blockId);
        if (removeIndex !== -1) {
          const removed = project.blocks.splice(removeIndex, 1)[0];
          project.activity.push({
            id: generateId(),
            userId: payload.userId,
            userName: collab.name,
            action: 'remove_block',
            timestamp: payload.timestamp,
            details: `Removed ${removed.type} block`,
            blockId: change.blockId,
          });
        }
        break;
      }

      case 'update': {
        const updateIndex = project.blocks.findIndex(b => b.id === change.blockId);
        if (updateIndex !== -1) {
          const existing = project.blocks[updateIndex];
          if (change.previousState && existing.type !== change.previousState.type) {
            conflicts.push({
              changeA: change,
              changeB: {
                type: 'update',
                blockId: change.blockId,
                block: existing,
              },
              resolution: 'keep_a',
              mergedBlock: change.block,
            });
          }
          if (change.block) {
            project.blocks[updateIndex] = change.block;
          }
          project.activity.push({
            id: generateId(),
            userId: payload.userId,
            userName: collab.name,
            action: 'edit_block',
            timestamp: payload.timestamp,
            details: `Updated ${change.block?.type || 'block'}`,
            blockId: change.blockId,
          });
        }
        break;
      }

      case 'move': {
        const moveIndex = project.blocks.findIndex(b => b.id === change.blockId);
        if (moveIndex !== -1 && change.position !== undefined) {
          const [moved] = project.blocks.splice(moveIndex, 1);
          const insertAt = Math.min(change.position, project.blocks.length);
          project.blocks.splice(insertAt, 0, moved);
          project.activity.push({
            id: generateId(),
            userId: payload.userId,
            userName: collab.name,
            action: 'move_block',
            timestamp: payload.timestamp,
            details: `Moved block to position ${insertAt}`,
            blockId: change.blockId,
          });
        }
        break;
      }
    }
  }

  project.version++;
  project.updatedAt = Date.now();
  collab.lastActive = Date.now();

  notifyListeners(projectId, payload);

  return { success: true, conflicts };
}

export function getBlocks(projectId: string): CommandBlock[] | undefined {
  return projects.get(projectId)?.blocks;
}

export function updateBlocks(
  projectId: string,
  blocks: CommandBlock[],
  userId: string
): { success: boolean; error?: string } {
  const project = projects.get(projectId);
  if (!project) return { success: false, error: 'Project not found' };

  const collab = project.collaborators.find(c => c.userId === userId);
  if (!collab || collab.role === 'viewer') {
    return { success: false, error: 'No write permission' };
  }

  project.blocks = blocks;
  project.version++;
  project.updatedAt = Date.now();
  collab.lastActive = Date.now();

  return { success: true };
}

export function addActivity(
  projectId: string,
  userId: string,
  action: ActivityEntry['action'],
  details: string,
  blockId?: string
): void {
  const project = projects.get(projectId);
  if (!project) return;

  const collab = project.collaborators.find(c => c.userId === userId);
  if (!collab) return;

  project.activity.push({
    id: generateId(),
    userId,
    userName: collab.name,
    action,
    timestamp: Date.now(),
    details,
    blockId,
  });

  collab.lastActive = Date.now();
}

export function getActivity(projectId: string, limit = 50): ActivityEntry[] {
  const project = projects.get(projectId);
  if (!project) return [];
  return project.activity.slice(-limit).reverse();
}

export function resolveConflicts(
  conflicts: ConflictResolution[]
): ConflictResolution[] {
  return conflicts.map(c => {
    if (c.resolution === 'merge' && c.changeA.block && c.changeB.block) {
      return {
        ...c,
        mergedBlock: {
          ...c.changeA.block,
          params: {
            ...c.changeB.block.params,
            ...c.changeA.block.params,
          },
        },
      };
    }
    return c;
  });
}

export function getCollaborators(projectId: string): Collaborator[] {
  return projects.get(projectId)?.collaborators || [];
}

export function renameProject(
  projectId: string,
  newName: string,
  userId: string
): { success: boolean; error?: string } {
  const project = projects.get(projectId);
  if (!project) return { success: false, error: 'Project not found' };

  const collab = project.collaborators.find(c => c.userId === userId);
  if (!collab || collab.role === 'viewer') {
    return { success: false, error: 'No permission to rename' };
  }

  project.name = newName;
  project.updatedAt = Date.now();
  project.version++;

  project.activity.push({
    id: generateId(),
    userId,
    userName: collab.name,
    action: 'rename',
    timestamp: Date.now(),
    details: `Renamed to "${newName}"`,
  });

  return { success: true };
}

export function findByShareLink(
  shareLink: string
): CollaborativeProject | undefined {
  for (const project of projects.values()) {
    if (project.shareLink === shareLink) return project;
  }
  return undefined;
}

export function subscribeToChanges(
  projectId: string,
  callback: (payload: SyncPayload) => void
): () => void {
  if (!listeners.has(projectId)) {
    listeners.set(projectId, new Set());
  }
  listeners.get(projectId)!.add(callback);

  return () => {
    listeners.get(projectId)?.delete(callback);
  };
}

function notifyListeners(projectId: string, payload: SyncPayload): void {
  const subs = listeners.get(projectId);
  if (subs) {
    for (const cb of subs) {
      try { cb(payload); } catch { /* ignore listener errors */ }
    }
  }
}

export function resetAllProjects(): void {
  projects.clear();
  listeners.clear();
}
