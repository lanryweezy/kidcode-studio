import { RPGQuest, RPGQuestObjective } from '../types/game';

export interface QuestChain {
  id: string;
  questIds: string[];
  prerequisiteQuestId?: string;
}

export interface QuestNotification {
  id: string;
  questId: string;
  type: 'accepted' | 'updated' | 'completed' | 'turned_in' | 'chain_unlocked';
  message: string;
  timestamp: number;
}

export interface QuestServiceState {
  activeQuests: RPGQuest[];
  completedQuestIds: string[];
  questChains: QuestChain[];
  notifications: QuestNotification[];
  trackingQuestId: string | null;
  objectiveCounts: Record<string, Record<string, number>>;
}

let questState: QuestServiceState = {
  activeQuests: [],
  completedQuestIds: [],
  questChains: [],
  notifications: [],
  trackingQuestId: null,
  objectiveCounts: {},
};

export function getQuestServiceState(): QuestServiceState {
  return {
    ...questState,
    activeQuests: questState.activeQuests.map(q => ({ ...q, objectives: q.objectives.map(o => ({ ...o })) })),
    notifications: [...questState.notifications],
  };
}

export function setQuestServiceState(state: QuestServiceState): void {
  questState = { ...state };
}

export function resetQuestServiceState(): void {
  questState = {
    activeQuests: [],
    completedQuestIds: [],
    questChains: [],
    notifications: [],
    trackingQuestId: null,
    objectiveCounts: {},
  };
}

export function acceptQuest(quest: RPGQuest): { success: boolean; state: QuestServiceState } {
  if (questState.activeQuests.some(q => q.id === quest.id)) {
    return { success: false, state: questState };
  }
  if (questState.completedQuestIds.includes(quest.id)) {
    return { success: false, state: questState };
  }

  const newQuest: RPGQuest = {
    ...quest,
    isActive: true,
    isCompleted: false,
    isTurnedIn: false,
    objectives: quest.objectives.map(o => ({ ...o, current: 0 })),
  };

  const newState = {
    ...questState,
    activeQuests: [...questState.activeQuests, newQuest],
  };

  newState.notifications.push({
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    questId: quest.id,
    type: 'accepted',
    message: `Quest accepted: ${quest.name}`,
    timestamp: Date.now(),
  });

  questState = newState;
  return { success: true, state: newState };
}

export function updateObjective(questId: string, objectiveId: string, amount: number): { success: boolean; state: QuestServiceState } {
  const questIdx = questState.activeQuests.findIndex(q => q.id === questId);
  if (questIdx === -1) return { success: false, state: questState };

  const quest = { ...questState.activeQuests[questIdx], objectives: [...questState.activeQuests[questIdx].objectives.map(o => ({ ...o }))] };
  const objIdx = quest.objectives.findIndex(o => o.id === objectiveId);
  if (objIdx === -1) return { success: false, state: questState };

  quest.objectives[objIdx].current = Math.min(
    quest.objectives[objIdx].current + amount,
    quest.objectives[objIdx].required
  );

  const allComplete = quest.objectives.every(o => o.current >= o.required);
  if (allComplete) {
    quest.isCompleted = true;
  }

  const newState = { ...questState, activeQuests: [...questState.activeQuests] };
  newState.activeQuests[questIdx] = quest;

  newState.notifications.push({
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    questId,
    type: 'updated',
    message: `Objective updated: ${quest.objectives[objIdx].description} (${quest.objectives[objIdx].current}/${quest.objectives[objIdx].required})`,
    timestamp: Date.now(),
  });

  if (allComplete) {
    newState.notifications.push({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      questId,
      type: 'completed',
      message: `Quest completed: ${quest.name}`,
      timestamp: Date.now(),
    });
  }

  questState = newState;
  return { success: true, state: newState };
}

export function turnInQuest(questId: string): { success: boolean; xpReward: number; goldReward: number; itemRewards: { itemId: string; quantity: number }[]; state: QuestServiceState } {
  const questIdx = questState.activeQuests.findIndex(q => q.id === questId);
  if (questIdx === -1) return { success: false, xpReward: 0, goldReward: 0, itemRewards: [], state: questState };

  const quest = questState.activeQuests[questIdx];
  if (!quest.isCompleted) return { success: false, xpReward: 0, goldReward: 0, itemRewards: [], state: questState };

  const xpReward = quest.xpReward;
  const goldReward = quest.goldReward;
  const itemRewards = quest.itemRewards || [];

  const newState: QuestServiceState = {
    ...questState,
    activeQuests: questState.activeQuests.filter(q => q.id !== questId),
    completedQuestIds: [...questState.completedQuestIds, questId],
    notifications: [...questState.notifications],
  };

  newState.notifications.push({
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    questId,
    type: 'turned_in',
    message: `Quest turned in: ${quest.name} (+${xpReward} XP, +${goldReward} Gold)`,
    timestamp: Date.now(),
  });

  checkQuestChainUnlocks(newState);

  questState = newState;
  return { success: true, xpReward, goldReward, itemRewards, state: newState };
}

export function addQuestChain(chain: QuestChain): void {
  questState.questChains.push(chain);
}

export function checkQuestChainUnlocks(state?: QuestServiceState): RPGQuest[] {
  const target = state || questState;
  const unlockedQuests: RPGQuest[] = [];

  for (const chain of target.questChains) {
    if (chain.prerequisiteQuestId && !target.completedQuestIds.includes(chain.prerequisiteQuestId)) {
      continue;
    }

    const firstIncompleteIdx = chain.questIds.findIndex(
      qid => !target.completedQuestIds.includes(qid) && !target.activeQuests.some(aq => aq.id === qid)
    );

    if (firstIncompleteIdx > 0) {
      const prevQuestId = chain.questIds[firstIncompleteIdx - 1];
      if (target.completedQuestIds.includes(prevQuestId)) {
        target.notifications.push({
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          questId: chain.questIds[firstIncompleteIdx],
          type: 'chain_unlocked',
          message: `New quest unlocked in chain!`,
          timestamp: Date.now(),
        });
      }
    }
  }

  return unlockedQuests;
}

export function getTrackedQuest(): RPGQuest | null {
  if (!questState.trackingQuestId) return null;
  return questState.activeQuests.find(q => q.id === questState.trackingQuestId) || null;
}

export function setTrackingQuest(questId: string | null): void {
  questState.trackingQuestId = questId;
}

export function getActiveQuests(): RPGQuest[] {
  return [...questState.activeQuests];
}

export function getCompletedQuestIds(): string[] {
  return [...questState.completedQuestIds];
}

export function isQuestCompleted(questId: string): boolean {
  return questState.completedQuestIds.includes(questId);
}

export function isQuestActive(questId: string): boolean {
  return questState.activeQuests.some(q => q.id === questId);
}

export function getNotifications(): QuestNotification[] {
  return [...questState.notifications];
}

export function clearNotifications(): void {
  questState.notifications = [];
}

export function removeNotification(notifId: string): void {
  questState.notifications = questState.notifications.filter(n => n.id !== notifId);
}

export function getQuestProgress(questId: string): { total: number; completed: number; percentage: number } | null {
  const quest = questState.activeQuests.find(q => q.id === questId);
  if (!quest) return null;

  const total = quest.objectives.reduce((sum, o) => sum + o.required, 0);
  const completed = quest.objectives.reduce((sum, o) => sum + o.current, 0);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}
