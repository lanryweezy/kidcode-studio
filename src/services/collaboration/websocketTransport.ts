import { CollaborationOperation } from './collaborationManager';

export interface TransportConfig {
  url: string;
  reconnectBaseInterval: number;
  reconnectMaxInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageTimeout: number;
}

export interface TransportMessage {
  type: 'operation' | 'presence' | 'cursor' | 'heartbeat' | 'sync' | 'join' | 'leave';
  payload: unknown;
  clientId: string;
  timestamp: number;
}

export type TransportState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

type MessageHandler = (msg: TransportMessage) => void;
type StateHandler = (state: TransportState) => void;

export class WebSocketTransport {
  private ws: WebSocket | null = null;
  private config: TransportConfig;
  private clientId: string;
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageHandlers: MessageHandler[] = [];
  private stateHandlers: StateHandler[] = [];
  private state: TransportState = 'disconnected';
  private messageQueue: TransportMessage[] = [];
  private pendingAcks: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: TransportConfig, clientId: string) {
    this.config = config;
    this.clientId = clientId;
  }

  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') return;
    this.setState('connecting');

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.setState('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
        this.send({
          type: 'join',
          payload: { clientId: this.clientId },
          clientId: this.clientId,
          timestamp: Date.now(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as TransportMessage;
          this.handleIncomingMessage(msg);
        } catch {
          console.error('Invalid WebSocket message format');
        }
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (event.code === 1000) {
          this.setState('disconnected');
        } else {
          this.setState('reconnecting');
          this.attemptReconnect();
        }
      };

      this.ws.onerror = () => {
        this.setState('disconnected');
      };
    } catch {
      this.setState('disconnected');
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.pendingAcks.forEach((timer) => clearTimeout(timer));
    this.pendingAcks.clear();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.setState('disconnected');
    this.reconnectAttempts = 0;
  }

  send(msg: TransportMessage): void {
    if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch {
        this.queueMessage(msg);
      }
    } else {
      this.queueMessage(msg);
    }
  }

  sendOperation(op: CollaborationOperation): string {
    const messageId = `${this.clientId}_${op.timestamp}_${Math.random().toString(36).slice(2, 6)}`;
    this.send({
      type: 'operation',
      payload: { ...op, messageId },
      clientId: this.clientId,
      timestamp: Date.now(),
    });
    return messageId;
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onStateChange(handler: StateHandler): () => void {
    this.stateHandlers.push(handler);
    return () => {
      this.stateHandlers = this.stateHandlers.filter((h) => h !== handler);
    };
  }

  getState(): TransportState {
    return this.state;
  }

  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  private setState(newState: TransportState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.stateHandlers.forEach((h) => h(newState));
  }

  private handleIncomingMessage(msg: TransportMessage): void {
    switch (msg.type) {
      case 'heartbeat':
        break;
      case 'sync':
        this.send({
          type: 'heartbeat',
          payload: { clientId: this.clientId },
          clientId: this.clientId,
          timestamp: Date.now(),
        });
        break;
      default:
        this.messageHandlers.forEach((h) => h(msg));
        break;
    }
  }

  private queueMessage(msg: TransportMessage): void {
    if (this.config.messageTimeout > 0) {
      const key = `${msg.type}_${msg.timestamp}`;
      const existingTimer = this.pendingAcks.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(() => {
        this.pendingAcks.delete(key);
        this.messageQueue = this.messageQueue.filter(
          (m) => `${m.type}_${m.timestamp}` !== key
        );
      }, this.config.messageTimeout);

      this.pendingAcks.set(key, timer);
    }

    this.messageQueue.push(msg);
    if (this.messageQueue.length > 500) {
      this.messageQueue = this.messageQueue.slice(-500);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(msg));
        } catch {
          this.messageQueue.unshift(msg);
          break;
        }
      } else {
        this.messageQueue.unshift(msg);
        break;
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setState('disconnected');
      return;
    }

    const delay = Math.min(
      this.config.reconnectBaseInterval * Math.pow(2, this.reconnectAttempts),
      this.config.reconnectMaxInterval
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({
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

export function createTransport(config: Partial<TransportConfig> & { url: string }, clientId: string): WebSocketTransport {
  return new WebSocketTransport(
    {
      reconnectBaseInterval: 1000,
      reconnectMaxInterval: 30000,
      maxReconnectAttempts: 20,
      heartbeatInterval: 15000,
      messageTimeout: 10000,
      ...config,
    },
    clientId
  );
}
