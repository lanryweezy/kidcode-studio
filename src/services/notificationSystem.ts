export interface Notification {
  id: string;
  text: string;
  emoji: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'achievement';
  duration: number;
  timestamp: number;
}

export interface NotificationState {
  queue: Notification[];
  active: Notification | null;
  maxVisible: number;
}

export function createNotificationState(maxVisible: number = 1): NotificationState {
  return { queue: [], active: null, maxVisible };
}

export function addNotification(
  state: NotificationState,
  text: string,
  emoji: string = '📢',
  type: Notification['type'] = 'info',
  duration: number = 3000
): NotificationState {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    emoji,
    type,
    duration,
    timestamp: Date.now(),
  };

  if (!state.active) {
    return { ...state, active: notification };
  }

  return { ...state, queue: [...state.queue, notification] };
}

export function dismissNotification(state: NotificationState): NotificationState {
  if (state.queue.length === 0) {
    return { ...state, active: null };
  }

  const [next, ...rest] = state.queue;
  return { ...state, active: next, queue: rest };
}

export function isNotificationExpired(notification: Notification): boolean {
  return Date.now() - notification.timestamp > notification.duration;
}

export function getNotificationColor(type: Notification['type']): string {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    achievement: 'bg-purple-500',
  };
  return colors[type];
}

export const NOTIFICATION_PRESETS = {
  sale: (amount: number) => ({ text: `Sale! +$${amount}`, emoji: '💰', type: 'success' as const }),
  purchase: (item: string) => ({ text: `Purchased ${item}`, emoji: '🛒', type: 'info' as const }),
  hire: (name: string) => ({ text: `Hired ${name}`, emoji: '👥', type: 'success' as const }),
  fire: (name: string) => ({ text: `Fired ${name}`, emoji: '👋', type: 'warning' as const }),
  upgrade: (name: string) => ({ text: `Upgraded ${name}`, emoji: '⬆️', type: 'success' as const }),
  achievement: (name: string) => ({ text: `Achievement: ${name}`, emoji: '🏆', type: 'achievement' as const }),
  event: (text: string) => ({ text, emoji: '📰', type: 'info' as const }),
  error: (text: string) => ({ text, emoji: '❌', type: 'error' as const }),
  warning: (text: string) => ({ text, emoji: '⚠️', type: 'warning' as const }),
};
