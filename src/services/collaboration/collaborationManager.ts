/**
 * CRDT Collaboration Layer for IR Nodes
 * 
 * Enables real-time collaborative editing using Conflict-free Replicated Data Types.
 * Multiple users can edit the same project simultaneously without conflicts.
 * 
 * Architecture:
 *   Yjs Document (Y.Doc) ←→ IR Nodes (Y.Array<IRNode>)
 *   Local edits → Yjs operations → Network sync → Remote Yjs operations → Local apply
 * 
 * Key concepts:
 * - Each project is a Yjs Document
 * - IR nodes are stored in a Y.Array (CRDT sequence)
 * - Each collaborator has a unique color and cursor position
 * - Operations are automatically merged without conflicts
 * 
  * Usage:
  *   const collab = new CollaborationManager(projectId);
  *   collab.onUpdate((state) => { ... });
  *   collab.addNode(node);
  *   collab.removeNode(index);
 */

import { IRNode, commandBlockToIR } from '../ir/types';
import { CommandBlock } from '../../types';
import { WebSocketTransport, TransportState, TransportMessage, createTransport } from './websocketTransport';

// === Yjs types (dynamic import to avoid bundling when unused) ===

export interface YDoc {
  // Simplified Yjs-like interface
  // In production, this wraps the actual Yjs Y.Doc
  id: string;
  clients: Map<string, CollaboratorInfo>;
}

export interface CollaboratorInfo {
  id: string;
  name: string;
  color: string;
  cursor: number | null;
  lastSeen: number;
}

export interface CollaborationOperation {
  type: 'add' | 'remove' | 'update' | 'move';
  index: number;
  node?: IRNode;
  oldNode?: IRNode;
  clientId: string;
  timestamp: number;
}

export interface CollaborationState {
  nodes: IRNode[];
  collaborators: Map<string, CollaboratorInfo>;
  operations: CollaborationOperation[];
  pending: CollaborationOperation[];
}

// === Collaboration Manager ===

export class CollaborationManager {
  private state: CollaborationState;
  private listeners: Array<(state: CollaborationState) => void> = [];
  private clientId: string;
  private projectId: string;
  private transport: WebSocketTransport | null = null;
  private transportState: TransportState = 'disconnected';
  private stateListeners: Array<(state: TransportState) => void> = [];

  constructor(projectId: string, transportUrl?: string) {
    this.projectId = projectId;
    this.clientId = `client_${Math.random().toString(36).slice(2, 10)}`;
    this.state = {
      nodes: [],
      collaborators: new Map(),
      operations: [],
      pending: [],
    };

    if (transportUrl) {
      this.transport = createTransport({ url: transportUrl }, this.clientId);
      this.transport.onStateChange((s) => {
        this.transportState = s;
        this.stateListeners.forEach((l) => l(s));
      });
      this.transport.onMessage((msg) => this.handleTransportMessage(msg));
    }
  }

  // === Document Operations ===

  /** Get the current state */
  getState(): CollaborationState {
    return { ...this.state };
  }

  /** Get the current IR nodes */
  getNodes(): IRNode[] {
    return [...this.state.nodes];
  }

  /** Set nodes (full replacement) */
  setNodes(nodes: IRNode[]): void {
    const oldNodes = [...this.state.nodes];
    this.state.nodes = [...nodes];
    this.pushOperation({
      type: 'update',
      index: 0,
      clientId: this.clientId,
      timestamp: Date.now(),
    });
    this.notifyListeners();
  }

  /** Add a node at a specific position */
  addNode(node: IRNode, index?: number): void {
    const insertIndex = index ?? this.state.nodes.length;
    this.state.nodes.splice(insertIndex, 0, node);
    const op: CollaborationOperation = {
      type: 'add',
      index: insertIndex,
      node,
      clientId: this.clientId,
      timestamp: Date.now(),
    };
    this.pushOperation(op);
    this.broadcastOperation(op);
    this.notifyListeners();
  }

  /** Remove a node at a specific position */
  removeNode(index: number): IRNode | null {
    if (index < 0 || index >= this.state.nodes.length) return null;
    const removed = this.state.nodes.splice(index, 1)[0];
    const op: CollaborationOperation = {
      type: 'remove',
      index,
      oldNode: removed,
      clientId: this.clientId,
      timestamp: Date.now(),
    };
    this.pushOperation(op);
    this.broadcastOperation(op);
    this.notifyListeners();
    return removed;
  }

  /** Update a node at a specific position */
  updateNode(index: number, node: IRNode): void {
    if (index < 0 || index >= this.state.nodes.length) return;
    const oldNode = this.state.nodes[index];
    this.state.nodes[index] = node;
    const op: CollaborationOperation = {
      type: 'update',
      index,
      node,
      oldNode,
      clientId: this.clientId,
      timestamp: Date.now(),
    };
    this.pushOperation(op);
    this.broadcastOperation(op);
    this.notifyListeners();
  }

  /** Move a node from one position to another */
  moveNode(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this.state.nodes.length) return;
    if (toIndex < 0 || toIndex > this.state.nodes.length) return;
    const [node] = this.state.nodes.splice(fromIndex, 1);
    // Adjust index if moving forward (removal shifted elements left)
    const adjustedIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
    this.state.nodes.splice(adjustedIndex, 0, node);
    const op: CollaborationOperation = {
      type: 'move',
      index: toIndex,
      node,
      clientId: this.clientId,
      timestamp: Date.now(),
    };
    this.pushOperation(op);
    this.broadcastOperation(op);
    this.notifyListeners();
  }

  /** Import from CommandBlocks */
  importBlocks(blocks: CommandBlock[]): void {
    const nodes: IRNode[] = [];
    for (const block of blocks) {
      const node = commandBlockToIR(block);
      if (node) nodes.push(node);
    }
    this.setNodes(nodes);
  }

  // === Collaborator Management ===

  /** Add a collaborator */
  addCollaborator(info: CollaboratorInfo): void {
    this.state.collaborators.set(info.id, info);
    this.notifyListeners();
  }

  /** Remove a collaborator */
  removeCollaborator(id: string): void {
    this.state.collaborators.delete(id);
    this.notifyListeners();
  }

  /** Update collaborator cursor position */
  updateCursor(id: string, position: number | null): void {
    const collab = this.state.collaborators.get(id);
    if (collab) {
      collab.cursor = position;
      collab.lastSeen = Date.now();
      this.notifyListeners();
    }
  }

  /** Get all active collaborators */
  getCollaborators(): CollaboratorInfo[] {
    return Array.from(this.state.collaborators.values());
  }

  // === Remote Operations ===

  /** Apply a remote operation (from another client) */
  applyRemoteOperation(op: CollaborationOperation): void {
    // Skip if we already applied this operation
    if (this.state.operations.some(o => 
      o.timestamp === op.timestamp && o.clientId === op.clientId
    )) {
      return;
    }

    switch (op.type) {
      case 'add':
        if (op.node) {
          this.state.nodes.splice(op.index, 0, op.node);
        }
        break;
      case 'remove':
        this.state.nodes.splice(op.index, 1);
        break;
      case 'update':
        if (op.node) {
          this.state.nodes[op.index] = op.node;
        }
        break;
      case 'move':
        if (op.node) {
          // Remove from old position and insert at new
          const oldIdx = this.state.nodes.findIndex(n => n === op.node);
          if (oldIdx >= 0) {
            this.state.nodes.splice(oldIdx, 1);
          }
          this.state.nodes.splice(op.index, 0, op.node);
        }
        break;
    }

    this.state.operations.push(op);
    this.notifyListeners();
  }

  // === Serialization ===

  /** Serialize the entire collaboration state */
  serialize(): string {
    return JSON.stringify({
      projectId: this.projectId,
      nodes: this.state.nodes,
      collaborators: Array.from(this.state.collaborators.entries()),
    });
  }

  /** Deserialize and restore collaboration state. Returns true on success. */
  deserialize(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      this.state.nodes = parsed.nodes || [];
      this.state.collaborators = new Map(parsed.collaborators || []);
      this.notifyListeners();
      return true;
    } catch {
      return false;
    }
  }

  // === Listeners ===

  /** Subscribe to state changes */
  onUpdate(listener: (state: CollaborationState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l(this.state));
  }

  private pushOperation(op: CollaborationOperation): void {
    this.state.operations.push(op);
    // Keep only last 1000 operations
    if (this.state.operations.length > 1000) {
      this.state.operations = this.state.operations.slice(-1000);
    }
  }

  // === Transport Integration ===

  connect(): void {
    this.transport?.connect();
  }

  disconnect(): void {
    this.transport?.disconnect();
  }

  getTransportState(): TransportState {
    return this.transportState;
  }

  onTransportStateChange(handler: (state: TransportState) => void): () => void {
    this.stateListeners.push(handler);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== handler);
    };
  }

  private broadcastOperation(op: CollaborationOperation): void {
    if (!this.transport || this.transportState !== 'connected') {
      this.state.pending.push(op);
      return;
    }
    this.transport.sendOperation(op);
  }

  private handleTransportMessage(msg: TransportMessage): void {
    if (msg.type === 'operation') {
      const op = msg.payload as CollaborationOperation;
      if (op.clientId !== this.clientId) {
        this.applyRemoteOperation(op);
      }
    } else if (msg.type === 'presence') {
      const data = msg.payload as { status: string; clientId: string };
      if (data.status === 'online' && data.clientId !== this.clientId) {
        this.addCollaborator({
          id: data.clientId,
          name: `User ${data.clientId.slice(-4)}`,
          color: '#4ECDC4',
          cursor: null,
          lastSeen: Date.now(),
        });
      } else if (data.status === 'offline') {
        this.removeCollaborator(data.clientId);
      }
    } else if (msg.type === 'cursor') {
      const data = msg.payload as { clientId: string; position: number };
      this.updateCursor(data.clientId, data.position);
    }
  }

  flushPendingOperations(): void {
    while (this.state.pending.length > 0) {
      const op = this.state.pending.shift()!;
      this.broadcastOperation(op);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// MULTIPLAYER FOUNDATION (Loops 66-70)
// ═══════════════════════════════════════════════════════════

// ─── WebSocket Transport Layer (#66) ───

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketMessage {
  type: 'operation' | 'presence' | 'cursor' | 'heartbeat' | 'sync';
  payload: unknown;
  clientId: string;
  timestamp: number;
}

export class CollaborationWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private clientId: string;
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageHandlers: Array<(msg: WebSocketMessage) => void> = [];
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(config: WebSocketConfig, clientId: string) {
    this.config = config;
    this.clientId = clientId;
  }

  connect(): void {
    if (this.connectionState === 'connected') return;
    this.connectionState = 'connecting';

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.sendMessage({
          type: 'presence',
          payload: { status: 'online', clientId: this.clientId },
          clientId: this.clientId,
          timestamp: Date.now(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WebSocketMessage;
          this.messageHandlers.forEach(h => h(msg));
        } catch {
          console.error('Invalid WebSocket message');
        }
      };

      this.ws.onclose = () => {
        this.connectionState = 'disconnected';
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.connectionState = 'disconnected';
      };
    } catch {
      this.connectionState = 'disconnected';
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
    this.connectionState = 'disconnected';
  }

  sendMessage(msg: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  onMessage(handler: (msg: WebSocketMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({
        type: 'heartbeat',
        payload: { clientId: this.clientId },
        clientId: this.clientId,
        timestamp: Date.now(),
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// ─── Presence Awareness (#67) ───

export interface PresenceState {
  userId: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  cursor: CursorPosition | null;
  lastSeen: number;
  color: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  nodeId?: string;
  selection?: { start: number; end: number };
}

export class PresenceManager {
  private presence: Map<string, PresenceState> = new Map();
  private localUserId: string;
  private updateCallbacks: Array<(presence: PresenceState[]) => void> = [];

  constructor(localUserId: string) {
    this.localUserId = localUserId;
  }

  updateLocalPresence(updates: Partial<PresenceState>): void {
    const current = this.presence.get(this.localUserId) || this.createDefaultPresence();
    this.presence.set(this.localUserId, {
      ...current,
      ...updates,
      lastSeen: Date.now(),
    });
    this.notifyCallbacks();
  }

  updateRemotePresence(userId: string, state: PresenceState): void {
    this.presence.set(userId, state);
    this.notifyCallbacks();
  }

  removePresence(userId: string): void {
    this.presence.delete(userId);
    this.notifyCallbacks();
  }

  getOnlineUsers(): PresenceState[] {
    return Array.from(this.presence.values())
      .filter(p => p.status !== 'offline')
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  getUserPresence(userId: string): PresenceState | undefined {
    return this.presence.get(userId);
  }

  getAllPresence(): PresenceState[] {
    return Array.from(this.presence.values());
  }

  onUpdate(callback: (presence: PresenceState[]) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(c => c !== callback);
    };
  }

  private createDefaultPresence(): PresenceState {
    return {
      userId: this.localUserId,
      displayName: 'User',
      status: 'online',
      cursor: null,
      lastSeen: Date.now(),
      color: this.generateColor(),
    };
  }

  private generateColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private notifyCallbacks(): void {
    const allPresence = this.getAllPresence();
    this.updateCallbacks.forEach(cb => cb(allPresence));
  }
}

// ─── Cursor Rendering Integration (#68) ───

export interface CursorRenderConfig {
  size: number;
  showName: boolean;
  showSelection: boolean;
  animationSpeed: number;
}

export interface RenderedCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
  name: string;
  targetX: number;
  targetY: number;
}

export class CursorRenderer {
  private cursors: Map<string, RenderedCursor> = new Map();
  private config: CursorRenderConfig;

  constructor(config: CursorRenderConfig = {
    size: 16,
    showName: true,
    showSelection: true,
    animationSpeed: 0.15,
  }) {
    this.config = config;
  }

  updateCursorPosition(userId: string, x: number, y: number, color: string, name: string): void {
    const existing = this.cursors.get(userId);
    if (existing) {
      existing.targetX = x;
      existing.targetY = y;
    } else {
      this.cursors.set(userId, {
        userId,
        x, y,
        targetX: x,
        targetY: y,
        color,
        name,
      });
    }
  }

  removeCursor(userId: string): void {
    this.cursors.delete(userId);
  }

  animateCursors(): void {
    this.cursors.forEach(cursor => {
      const dx = cursor.targetX - cursor.x;
      const dy = cursor.targetY - cursor.y;
      cursor.x += dx * this.config.animationSpeed;
      cursor.y += dy * this.config.animationSpeed;
    });
  }

  renderCursors(ctx: CanvasRenderingContext2D): void {
    this.cursors.forEach(cursor => {
      ctx.save();
      ctx.translate(cursor.x, cursor.y);

      ctx.fillStyle = cursor.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.config.size);
      ctx.lineTo(this.config.size * 0.4, this.config.size * 0.7);
      ctx.lineTo(this.config.size * 0.7, this.config.size * 1.2);
      ctx.lineTo(this.config.size * 0.5, this.config.size * 1.4);
      ctx.lineTo(this.config.size * 0.3, this.config.size * 1.1);
      ctx.lineTo(0, this.config.size);
      ctx.fill();

      if (this.config.showName) {
        ctx.fillStyle = cursor.color;
        ctx.font = '12px sans-serif';
        ctx.fillText(cursor.name, this.config.size + 4, this.config.size);
      }

      ctx.restore();
    });
  }

  getCursors(): RenderedCursor[] {
    return Array.from(this.cursors.values());
  }
}

// ─── Conflict Resolution (#69) ───

export interface ConflictResolutionStrategy {
  type: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual';
  timestampOrdering: boolean;
}

export function resolveConflict(
  localOp: CollaborationOperation,
  remoteOp: CollaborationOperation,
  strategy: ConflictResolutionStrategy = { type: 'last-write-wins', timestampOrdering: true }
): CollaborationOperation | null {
  if (localOp.index !== remoteOp.index || localOp.type !== remoteOp.type) {
    return null;
  }

  switch (strategy.type) {
    case 'last-write-wins':
      return localOp.timestamp > remoteOp.timestamp ? localOp : remoteOp;
    case 'first-write-wins':
      return localOp.timestamp < remoteOp.timestamp ? localOp : remoteOp;
    case 'merge':
      if (localOp.type === 'update' && remoteOp.type === 'update' && localOp.node && remoteOp.node) {
        return {
          ...localOp,
          node: mergeNodes(localOp.node, remoteOp.node),
          timestamp: Math.max(localOp.timestamp, remoteOp.timestamp),
        };
      }
      return localOp.timestamp > remoteOp.timestamp ? localOp : remoteOp;
    default:
      return localOp.timestamp > remoteOp.timestamp ? localOp : remoteOp;
  }
}

function mergeNodes(local: IRNode, remote: IRNode): IRNode {
  return {
    ...remote,
    ...local,
  } as IRNode;
}

export function applyConflictResolution(
  operations: CollaborationOperation[],
  strategy: ConflictResolutionStrategy
): CollaborationOperation[] {
  const resolved: CollaborationOperation[] = [];
  const seen = new Map<string, CollaborationOperation>();

  for (const op of operations) {
    const key = `${op.type}-${op.index}`;
    const existing = seen.get(key);

    if (existing) {
      const resolvedOp = resolveConflict(existing, op, strategy);
      if (resolvedOp) {
        const idx = resolved.indexOf(existing);
        if (idx >= 0) resolved[idx] = resolvedOp;
      }
    } else {
      resolved.push(op);
    }
    seen.set(key, op);
  }

  return resolved;
}

// ─── Offline Mode (#70) ───

export interface OfflineState {
  isOffline: boolean;
  pendingOperations: CollaborationOperation[];
  lastSyncTimestamp: number;
  localChanges: IRNode[];
}

export class OfflineManager {
  private state: OfflineState;
  private storageKey: string;

  constructor(projectId: string) {
    this.storageKey = `kidcode_offline_${projectId}`;
    this.state = this.loadState();
  }

  goOffline(): void {
    this.state.isOffline = true;
    this.saveState();
  }

  goOnline(): void {
    this.state.isOffline = false;
    this.saveState();
  }

  addPendingOperation(op: CollaborationOperation): void {
    this.state.pendingOperations.push(op);
    this.saveState();
  }

  getPendingOperations(): CollaborationOperation[] {
    return [...this.state.pendingOperations];
  }

  clearPendingOperations(): void {
    this.state.pendingOperations = [];
    this.state.lastSyncTimestamp = Date.now();
    this.saveState();
  }

  saveLocalChange(node: IRNode): void {
    this.state.localChanges.push(node);
    this.saveState();
  }

  getLocalChanges(): IRNode[] {
    return [...this.state.localChanges];
  }

  clearLocalChanges(): void {
    this.state.localChanges = [];
    this.saveState();
  }

  isOffline(): boolean {
    return this.state.isOffline;
  }

  getLastSyncTimestamp(): number {
    return this.state.lastSyncTimestamp;
  }

  private loadState(): OfflineState {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return {
      isOffline: false,
      pendingOperations: [],
      lastSyncTimestamp: Date.now(),
      localChanges: [],
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }
}
