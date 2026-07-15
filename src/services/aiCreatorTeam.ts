/**
 * AI Creator Team - Autonomous Agent System
 * Each agent is specialized for a creative domain.
 * Agents can collaborate and communicate with each other.
 */

export type AgentType =
  | 'art-agent'
  | 'level-agent'
  | 'character-agent'
  | 'story-agent'
  | 'programming-agent'
  | 'testing-agent'
  | 'audio-agent'
  | 'cinematography-agent'
  | 'performance-agent'
  | 'environment-agent'
  | 'graph-agent';

export interface AIAgent {
  type: AgentType;
  name: string;
  emoji: string;
  description: string;
  capabilities: string[];
  isBusy: boolean;
  currentTask: string | null;
  taskQueue: AgentTask[];
  history: AgentAction[];
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  params: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface AgentAction {
  id: string;
  agentType: AgentType;
  action: string;
  description: string;
  timestamp: number;
  result: 'success' | 'failure';
  details?: string;
}

export interface AgentMessage {
  from: AgentType;
  to: AgentType | 'user' | 'all';
  type: 'suggestion' | 'warning' | 'request' | 'report' | 'collaboration';
  content: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

// Agent definitions
const AGENT_DEFINITIONS: Record<AgentType, Omit<AIAgent, 'isBusy' | 'currentTask' | 'taskQueue' | 'history'>> = {
  'art-agent': {
    type: 'art-agent',
    name: 'Art Director',
    emoji: '🎨',
    description: 'Creates sprites, tiles, and visual assets. Suggests art improvements.',
    capabilities: ['generateSprite', 'generateTile', 'suggestColorPalette', 'createAnimations', 'optimizeAssets'],
  },
  'level-agent': {
    type: 'level-agent',
    name: 'Level Designer',
    emoji: '🗺️',
    description: 'Designs levels, places objects, and creates terrain. Auto-generates layouts.',
    capabilities: ['generateLevel', 'placeObjects', 'createTerrain', 'balanceDifficulty', 'suggestLayout'],
  },
  'character-agent': {
    type: 'character-agent',
    name: 'Character Designer',
    emoji: '👤',
    description: 'Creates characters with personalities, stats, and behaviors.',
    capabilities: ['designCharacter', 'createBehavior', 'balanceStats', 'suggestPersonality', 'createDialogue'],
  },
  'story-agent': {
    type: 'story-agent',
    name: 'Story Writer',
    emoji: '📖',
    description: 'Writes narratives, quests, and dialogue. Creates branching storylines.',
    capabilities: ['writeStory', 'createQuest', 'writeDialogue', 'suggestPlot', 'createBranches'],
  },
  'programming-agent': {
    type: 'programming-agent',
    name: 'Code Wizard',
    emoji: '🧙',
    description: 'Writes game logic, debugs code, and optimizes performance.',
    capabilities: ['writeCode', 'debugCode', 'optimizeCode', 'suggestLogic', 'createSystem'],
  },
  'testing-agent': {
    type: 'testing-agent',
    name: 'QA Tester',
    emoji: '🐛',
    description: 'Plays the game repeatedly, finds bugs, and suggests fixes.',
    capabilities: ['playtest', 'findBugs', 'reportIssues', 'suggestFixes', 'balanceTest'],
  },
  'audio-agent': {
    type: 'audio-agent',
    name: 'Sound Designer',
    emoji: '🎵',
    description: 'Creates sound effects and music. Suggests audio improvements.',
    capabilities: ['createSoundEffect', 'composeMusic', 'suggestAmbience', 'mixAudio', 'masterTrack'],
  },
  'cinematography-agent': {
    type: 'cinematography-agent',
    name: 'Director',
    emoji: '🎬',
    description: 'Creates cutscenes, camera movements, and cinematic sequences.',
    capabilities: ['createCutscene', 'suggestCamera', 'createTransition', 'directScene', 'addEffects'],
  },
  'performance-agent': {
    type: 'performance-agent',
    name: 'Performance Engineer',
    emoji: '⚡',
    description: 'Monitors FPS, optimizes rendering, and suggests performance improvements.',
    capabilities: ['monitorFPS', 'optimizeRendering', 'reduceMemory', 'suggestOptimizations', 'profileGame'],
  },
  'environment-agent': {
    type: 'environment-agent',
    name: 'Environment Artist',
    emoji: '🌿',
    description: 'Creates weather, lighting, and atmospheric effects.',
    capabilities: ['createWeather', 'setupLighting', 'addAtmosphere', 'suggestMood', 'createParticles'],
  },
  'graph-agent': {
    type: 'graph-agent',
    name: 'Systems Architect',
    emoji: '🕸️',
    description: 'Manages relationships between game objects. Suggests connections.',
    capabilities: ['analyzeConnections', 'suggestRelationships', 'optimizeGraph', 'findOrphans', 'createLinks'],
  },
};

export class AICreatorTeam {
  private agents: Map<AgentType, AIAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private listeners: Set<(msg: AgentMessage) => void> = new Set();
  private actionListeners: Set<(action: AgentAction) => void> = new Set();

  constructor() {
    Object.values(AGENT_DEFINITIONS).forEach(def => {
      this.agents.set(def.type, { ...def, isBusy: false, currentTask: null, taskQueue: [], history: [] });
    });
  }

  getAgent(type: AgentType): AIAgent | undefined {
    return this.agents.get(type);
  }

  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  getAvailableAgents(): AIAgent[] {
    return this.getAllAgents().filter(a => !a.isBusy);
  }

  // Queue a task for an agent
  queueTask(agentType: AgentType, task: Omit<AgentTask, 'id' | 'status' | 'createdAt'>): AgentTask {
    const agent = this.agents.get(agentType);
    if (!agent) throw new Error(`Agent ${agentType} not found`);

    const fullTask: AgentTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
      createdAt: Date.now(),
    };

    agent.taskQueue.push(fullTask);
    agent.taskQueue.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });

    this.processQueue(agentType);
    return fullTask;
  }

  private async processQueue(agentType: AgentType) {
    const agent = this.agents.get(agentType);
    if (!agent || agent.isBusy) return;

    const task = agent.taskQueue.find(t => t.status === 'pending');
    if (!task) return;

    agent.isBusy = true;
    agent.currentTask = task.description;
    task.status = 'running';
    task.startedAt = Date.now();

    try {
      // Simulate AI processing (in real implementation, this would call an AI API)
      await this.executeTask(agent, task);
      task.status = 'completed';
      task.completedAt = Date.now();

      const action: AgentAction = {
        id: `action_${Date.now()}`,
        agentType,
        action: task.type,
        description: task.description,
        timestamp: Date.now(),
        result: 'success',
      };
      agent.history.push(action);
      this.actionListeners.forEach(fn => fn(action));

      // Agent might suggest collaboration
      this.suggestCollaboration(agentType, task);
    } catch (error) {
      task.status = 'failed';
      const action: AgentAction = {
        id: `action_${Date.now()}`,
        agentType,
        action: task.type,
        description: task.description,
        timestamp: Date.now(),
        result: 'failure',
        details: String(error),
      };
      agent.history.push(action);
      this.actionListeners.forEach(fn => fn(action));
    }

    agent.isBusy = false;
    agent.currentTask = null;
    this.processQueue(agentType);
  }

  private async executeTask(agent: AIAgent, task: AgentTask) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // In real implementation, this would call the appropriate AI API
    // For now, we simulate the task completion
    switch (task.type) {
      case 'generateSprite':
        task.result = { emoji: '👾', width: 32, height: 32 };
        break;
      case 'generateLevel':
        task.result = { tiles: [], enemies: [], items: [] };
        break;
      case 'writeStory':
        task.result = { nodes: [] };
        break;
      case 'findBugs':
        task.result = { bugs: [] };
        break;
      default:
        task.result = {};
    }
  }

  private suggestCollaboration(agentType: AgentType, completedTask: AgentTask) {
    const suggestions: Partial<Record<AgentType, AgentType[]>> = {
      'art-agent': ['character-agent', 'level-agent'],
      'level-agent': ['environment-agent', 'testing-agent'],
      'character-agent': ['story-agent', 'art-agent'],
      'story-agent': ['character-agent', 'cinematography-agent'],
      'programming-agent': ['testing-agent', 'performance-agent'],
      'testing-agent': ['programming-agent', 'performance-agent'],
      'audio-agent': ['cinematography-agent', 'environment-agent'],
      'cinematography-agent': ['story-agent', 'audio-agent'],
      'performance-agent': ['programming-agent'],
      'environment-agent': ['level-agent', 'audio-agent'],
      'graph-agent': ['programming-agent', 'level-agent'],
    };

    const collaborators = suggestions[agentType] || [];
    collaborators.forEach(collabType => {
      this.sendMessage(agentType, collabType, 'collaboration',
        `${agentType} finished "${completedTask.description}". You might want to review related work.`,
        { taskId: completedTask.id }
      );
    });
  }

  sendMessage(from: AgentType, to: AgentType | 'user' | 'all', type: AgentMessage['type'], content: string, data?: Record<string, unknown>) {
    const msg: AgentMessage = { from, to, type, content, data, timestamp: Date.now() };
    this.messageQueue.push(msg);
    this.listeners.forEach(fn => fn(msg));
  }

  getMessages(filter?: { to?: AgentType | 'user' | 'all'; type?: AgentMessage['type'] }): AgentMessage[] {
    let msgs = [...this.messageQueue];
    if (filter?.to) msgs = msgs.filter(m => m.to === filter.to || m.to === 'all');
    if (filter?.type) msgs = msgs.filter(m => m.type === filter.type);
    return msgs;
  }

  onMessage(listener: (msg: AgentMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onAction(listener: (action: AgentAction) => void): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  // Auto-suggest: scan the project and suggest improvements
  autoSuggest(projectState: { hasArt?: boolean; hasStory?: boolean; hasMusic?: boolean }): AgentMessage[] {
    const suggestions: AgentMessage[] = [];

    // Check if project has no art
    if (!projectState.hasArt) {
      suggestions.push({
        from: 'art-agent', to: 'user', type: 'suggestion',
        content: 'Your project has no sprites yet. Want me to generate some?',
        timestamp: Date.now(),
      });
    }

    // Check if project has no story
    if (!projectState.hasStory) {
      suggestions.push({
        from: 'story-agent', to: 'user', type: 'suggestion',
        content: 'No quests or dialogue found. Want me to create a story?',
        timestamp: Date.now(),
      });
    }

    // Check if project has no music
    if (!projectState.hasMusic) {
      suggestions.push({
        from: 'audio-agent', to: 'user', type: 'suggestion',
        content: 'No music or sound effects. Want me to compose something?',
        timestamp: Date.now(),
      });
    }

    return suggestions;
  }
}

let instance: AICreatorTeam | null = null;

export function getAICreatorTeam(): AICreatorTeam {
  if (!instance) instance = new AICreatorTeam();
  return instance;
}
