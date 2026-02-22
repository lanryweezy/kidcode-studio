/**
 * Quest & Dialogue System for KidCode Studio
 * RPG-style quest tracking and branching dialogue
 */

export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  giver?: string;
  level?: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'deliver' | 'talk' | 'reach' | 'custom';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'xp' | 'gold' | 'item' | 'unlock';
  value: number | string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerAvatar?: string;
  text: string;
  choices: DialogueChoice[];
  onEnter?: () => void;
  onExit?: () => void;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  condition?: () => boolean;
  onChoose?: () => void;
}

export class QuestManager {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();
  private onQuestUpdate?: (quest: Quest) => void;
  private onQuestComplete?: (quest: Quest) => void;

  /**
   * Create new quest
   */
  createQuest(config: Partial<Quest>): string {
    const id = `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const quest: Quest = {
      id,
      name: config.name || 'New Quest',
      description: config.description || '',
      objectives: config.objectives || [],
      rewards: config.rewards || [],
      status: 'available',
      giver: config.giver,
      level: config.level || 1
    };

    this.quests.set(id, quest);
    return id;
  }

  /**
   * Add objective to quest
   */
  addObjective(questId: string, objective: Partial<QuestObjective>): string {
    const quest = this.quests.get(questId);
    if (!quest) throw new Error('Quest not found');

    const id = `obj_${Date.now()}`;
    const obj: QuestObjective = {
      id,
      description: objective.description || '',
      type: objective.type || 'custom',
      target: objective.target || '',
      current: 0,
      required: objective.required || 1,
      completed: false
    };

    quest.objectives.push(obj);
    this.onQuestUpdate?.(quest);
    return id;
  }

  /**
   * Add reward to quest
   */
  addReward(questId: string, reward: QuestReward) {
    const quest = this.quests.get(questId);
    if (!quest) throw new Error('Quest not found');
    quest.rewards.push(reward);
  }

  /**
   * Accept quest
   */
  acceptQuest(questId: string) {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'available') return;

    quest.status = 'active';
    this.activeQuests.add(questId);
    this.onQuestUpdate?.(quest);
  }

  /**
   * Update objective progress
   */
  updateObjective(questId: string, objectiveId: string, progress: number) {
    const quest = this.quests.get(questId);
    if (!quest) return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    objective.current = Math.min(progress, objective.required);
    objective.completed = objective.current >= objective.required;

    // Check if all objectives complete
    if (quest.objectives.every(o => o.completed)) {
      this.completeQuest(questId);
    }

    this.onQuestUpdate?.(quest);
  }

  /**
   * Complete quest
   */
  completeQuest(questId: string) {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = 'completed';
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    // Grant rewards
    quest.rewards.forEach(reward => {
      this.grantReward(reward);
    });

    this.onQuestComplete?.(quest);
  }

  /**
   * Grant reward
   */
  private grantReward(reward: QuestReward) {
    console.log('Reward granted:', reward);
    // In production, apply to player stats/inventory
  }

  /**
   * Fail quest
   */
  failQuest(questId: string) {
    const quest = this.quests.get(questId);
    if (!quest) return;
    quest.status = 'failed';
    this.activeQuests.delete(questId);
    this.onQuestUpdate?.(quest);
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Get all active quests
   */
  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests)
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }

  /**
   * Get available quests
   */
  getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values())
      .filter(q => q.status === 'available');
  }

  /**
   * Get completed quests
   */
  getCompletedQuests(): Quest[] {
    return Array.from(this.completedQuests)
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onQuestUpdate?: (quest: Quest) => void;
    onQuestComplete?: (quest: Quest) => void;
  }) {
    this.onQuestUpdate = callbacks.onQuestUpdate;
    this.onQuestComplete = callbacks.onQuestComplete;
  }
}

export class DialogueSystem {
  private nodes: Map<string, DialogueNode> = new Map();
  private currentNode: DialogueNode | null = null;
  private history: string[] = [];
  private onDialogueStart?: () => void;
  private onDialogueEnd?: () => void;
  private onNodeEnter?: (node: DialogueNode) => void;
  private onChoice?: (choice: DialogueChoice) => void;

  /**
   * Create dialogue tree
   */
  createDialogue(nodes: DialogueNode[]): string {
    const rootId = nodes[0]?.id || `dialogue_${Date.now()}`;
    
    nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });

    return rootId;
  }

  /**
   * Start dialogue
   */
  startDialogue(rootNodeId: string) {
    const node = this.nodes.get(rootNodeId);
    if (!node) return;

    this.currentNode = node;
    this.history = [];
    this.onDialogueStart?.();
    this.onNodeEnter?.(node);

    // Call onEnter callback
    node.onEnter?.();
  }

  /**
   * Make choice
   */
  makeChoice(choiceId: string) {
    if (!this.currentNode) return;

    const choice = this.currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // Check condition
    if (choice.condition && !choice.condition()) {
      console.log('Choice condition not met');
      return;
    }

    // Call onChoose callback
    choice.onChoose?.();
    this.onChoice?.(choice);

    // Store in history
    this.history.push(this.currentNode.text);

    // Move to next node
    const nextNode = this.nodes.get(choice.nextNodeId);
    if (nextNode) {
      this.currentNode.onExit?.();
      this.currentNode = nextNode;
      this.onNodeEnter?.(nextNode);
      nextNode.onEnter?.();
    } else {
      this.endDialogue();
    }
  }

  /**
   * End dialogue
   */
  endDialogue() {
    if (this.currentNode) {
      this.currentNode.onExit?.();
    }
    this.currentNode = null;
    this.onDialogueEnd?.();
  }

  /**
   * Get current node
   */
  getCurrentNode(): DialogueNode | null {
    return this.currentNode;
  }

  /**
   * Get dialogue history
   */
  getHistory(): string[] {
    return this.history;
  }

  /**
   * Check if dialogue is active
   */
  isActive(): boolean {
    return this.currentNode !== null;
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onDialogueStart?: () => void;
    onDialogueEnd?: () => void;
    onNodeEnter?: (node: DialogueNode) => void;
    onChoice?: (choice: DialogueChoice) => void;
  }) {
    this.onDialogueStart = callbacks.onDialogueStart;
    this.onDialogueEnd = callbacks.onDialogueEnd;
    this.onNodeEnter = callbacks.onNodeEnter;
    this.onChoice = callbacks.onChoice;
  }
}

/**
 * Create quest manager
 */
export const createQuestManager = (): QuestManager => {
  return new QuestManager();
};

/**
 * Create dialogue system
 */
export const createDialogueSystem = (): DialogueSystem => {
  return new DialogueSystem();
};

/**
 * Quest blocks for KidCode
 */
export const QUEST_BLOCKS = {
  CREATE_QUEST: 'CREATE_QUEST',
  ADD_OBJECTIVE: 'ADD_OBJECTIVE',
  COMPLETE_OBJECTIVE: 'COMPLETE_OBJECTIVE',
  ACCEPT_QUEST: 'ACCEPT_QUEST',
  FAIL_QUEST: 'FAIL_QUEST',
  COMPLETE_QUEST: 'COMPLETE_QUEST',
  START_DIALOGUE: 'START_DIALOGUE',
  END_DIALOGUE: 'END_DIALOGUE',
  SHOW_CHOICE: 'SHOW_CHOICE',
  SET_SPEAKER: 'SET_SPEAKER'
};
