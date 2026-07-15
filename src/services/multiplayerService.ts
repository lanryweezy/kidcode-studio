
import { eventBus } from './eventBus';

export interface RemoteUser {
  id: string;
  name: string;
  cursor: { x: number, y: number };
  color: string;
}

class MultiplayerService {
  private roomId: string | null = null;
  private participants: Map<string, RemoteUser> = new Map();
  private myId: string = Math.random().toString(36).substr(2, 9);

  joinRoom(id: string) {
    this.roomId = id;
    // In a real app, this would connect to a WebSocket server
    // For now, we'll use our internal event bus to simulate peer messages
    eventBus.on('peer_message', (msg) => this.handleMessage(msg as { senderId: string; type: string; data: unknown }));
  }

  broadcast(type: string, data: unknown) {
    if (!this.roomId) return;
    // Simulate network broadcast
    eventBus.emit('peer_message', {
      senderId: this.myId,
      type,
      data
    });
  }

  private handleMessage(msg: { senderId: string; type: string; data: unknown }) {
    if (msg.senderId === this.myId) return;

    switch (msg.type) {
      case 'cursor_move': {
        const cursorData = msg.data as { x: number; y: number };
        this.participants.set(msg.senderId, {
          ...this.participants.get(msg.senderId)!,
          id: msg.senderId,
          cursor: cursorData
        });
        eventBus.emit('multiplayer_update', Array.from(this.participants.values()));
        break;
      }
      case 'block_added':
        eventBus.emit('remote_block_added', msg.data);
        break;
    }
  }

  getParticipants() {
    return Array.from(this.participants.values());
  }

  getMyId() { return this.myId; }
}

export const multiplayerService = new MultiplayerService();
