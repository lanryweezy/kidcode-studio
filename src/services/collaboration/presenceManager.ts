export interface PresenceUser {
  userId: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  cursor: CursorPosition | null;
  editingNodeId: string | null;
  lastSeen: number;
  color: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  nodeId?: string;
  selection?: { start: number; end: number };
}

export interface PresenceUpdate {
  type: 'join' | 'leave' | 'cursor' | 'status' | 'edit';
  userId: string;
  data: Partial<PresenceUser>;
  timestamp: number;
}

type PresenceCallback = (users: PresenceUser[]) => void;

const PRESENCE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C', '#1ABC9C'];

export class PresenceManager {
  private users: Map<string, PresenceUser> = new Map();
  private localUserId: string;
  private callbacks: PresenceCallback[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private staleThreshold = 30000;

  constructor(localUserId: string) {
    this.localUserId = localUserId;
  }

  start(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkStaleUsers();
      this.updateLocalPresence({ lastSeen: Date.now() });
    }, 5000);
  }

  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  updateLocalPresence(updates: Partial<PresenceUser>): void {
    const current = this.getLocalPresence();
    const updated: PresenceUser = {
      ...current,
      ...updates,
      userId: this.localUserId,
      lastSeen: Date.now(),
    };
    this.users.set(this.localUserId, updated);
    this.notifyCallbacks();
  }

  handleRemoteUpdate(update: PresenceUpdate): void {
    const existing = this.users.get(update.userId);
    const merged: PresenceUser = {
      userId: update.userId,
      displayName: existing?.displayName || 'Unknown',
      status: 'online',
      cursor: null,
      editingNodeId: null,
      lastSeen: Date.now(),
      color: existing?.color || this.generateColor(),
      ...existing,
      ...update.data,
    };

    if (update.type === 'leave') {
      merged.status = 'offline';
    }

    this.users.set(update.userId, merged);
    this.notifyCallbacks();
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
    this.notifyCallbacks();
  }

  getOnlineUsers(): PresenceUser[] {
    return Array.from(this.users.values())
      .filter((u) => u.status !== 'offline' && u.userId !== this.localUserId)
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  getAllUsers(): PresenceUser[] {
    return Array.from(this.users.values()).sort((a, b) => {
      if (a.userId === this.localUserId) return -1;
      if (b.userId === this.localUserId) return 1;
      return b.lastSeen - a.lastSeen;
    });
  }

  getUser(userId: string): PresenceUser | undefined {
    return this.users.get(userId);
  }

  updateCursorPosition(userId: string, cursor: CursorPosition | null): void {
    const user = this.users.get(userId);
    if (user) {
      user.cursor = cursor;
      user.lastSeen = Date.now();
      this.notifyCallbacks();
    }
  }

  updateEditingNode(userId: string, nodeId: string | null): void {
    const user = this.users.get(userId);
    if (user) {
      user.editingNodeId = nodeId;
      user.lastSeen = Date.now();
      this.notifyCallbacks();
    }
  }

  onUpdate(callback: PresenceCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== callback);
    };
  }

  private getLocalPresence(): PresenceUser {
    return this.users.get(this.localUserId) || {
      userId: this.localUserId,
      displayName: 'You',
      status: 'online',
      cursor: null,
      editingNodeId: null,
      lastSeen: Date.now(),
      color: this.generateColor(),
    };
  }

  private checkStaleUsers(): void {
    const now = Date.now();
    let changed = false;
    this.users.forEach((user, id) => {
      if (id === this.localUserId) return;
      if (user.status !== 'offline' && now - user.lastSeen > this.staleThreshold) {
        user.status = 'offline';
        changed = true;
      }
    });
    if (changed) this.notifyCallbacks();
  }

  private generateColor(): string {
    return PRESENCE_COLORS[this.users.size % PRESENCE_COLORS.length];
  }

  private notifyCallbacks(): void {
    const allUsers = this.getAllUsers();
    this.callbacks.forEach((cb) => cb(allUsers));
  }
}
