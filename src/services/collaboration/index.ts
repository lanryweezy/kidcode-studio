/**
 * Collaboration Module — Real-time collaborative editing for KidCode Studio
 * 
 * Uses CRDT principles for conflict-free multi-user editing.
 * Each project has a CollaborationManager that tracks:
 * - IR nodes (the project content)
 * - Collaborators (who's editing)
 * - Operations (what changed)
 * 
 * In production, this wraps Yjs for actual network sync.
 */

export { CollaborationManager } from './collaborationManager';
export type { CollaboratorInfo, CollaborationOperation, CollaborationState } from './collaborationManager';
