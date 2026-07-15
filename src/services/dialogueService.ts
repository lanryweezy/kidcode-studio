import { DialogueNode, DialogueChoice } from '../types/game';

export interface DialogueState {
  activeNode: DialogueNode | null;
  history: DialogueHistoryEntry[];
  isActive: boolean;
  currentNodeId: string | null;
  typewriterIndex: number;
  typewriterComplete: boolean;
  conditions: Record<string, string | number | boolean>;
}

export interface DialogueHistoryEntry {
  speaker: string;
  speakerEmoji: string;
  text: string;
  timestamp: number;
  choiceText?: string;
}

let dialogueState: DialogueState = {
  activeNode: null,
  history: [],
  isActive: false,
  currentNodeId: null,
  typewriterIndex: 0,
  typewriterComplete: false,
  conditions: {},
};

export function getDialogueState(): DialogueState {
  return { ...dialogueState, history: [...dialogueState.history] };
}

export function setDialogueState(state: DialogueState): void {
  dialogueState = { ...state, history: [...state.history] };
}

export function resetDialogueState(): void {
  dialogueState = {
    activeNode: null,
    history: [],
    isActive: false,
    currentNodeId: null,
    typewriterIndex: 0,
    typewriterComplete: false,
    conditions: {},
  };
}

export function startDialogue(node: DialogueNode): DialogueState {
  const newState: DialogueState = {
    ...dialogueState,
    activeNode: { ...node },
    isActive: true,
    currentNodeId: node.id,
    typewriterIndex: 0,
    typewriterComplete: false,
  };
  dialogueState = newState;
  return newState;
}

export function advanceTypewriter(): DialogueState {
  if (!dialogueState.activeNode) return dialogueState;

  if (dialogueState.typewriterComplete) return dialogueState;

  const fullLength = dialogueState.activeNode.text.length;
  const newState = { ...dialogueState, typewriterIndex: fullLength, typewriterComplete: true };
  dialogueState = newState;
  return newState;
}

export function getDisplayedText(): string {
  if (!dialogueState.activeNode) return '';
  if (dialogueState.typewriterComplete) return dialogueState.activeNode.text;
  return dialogueState.activeNode.text.slice(0, dialogueState.typewriterIndex);
}

export function tickTypewriter(charsPerTick: number = 1): DialogueState {
  if (!dialogueState.activeNode || dialogueState.typewriterComplete) return dialogueState;

  const newIdx = Math.min(dialogueState.typewriterIndex + charsPerTick, dialogueState.activeNode.text.length);
  const complete = newIdx >= dialogueState.activeNode.text.length;
  const newState = { ...dialogueState, typewriterIndex: newIdx, typewriterComplete: complete };
  dialogueState = newState;
  return newState;
}

export function selectChoice(choiceIndex: number, dialogueTree: Record<string, DialogueNode>): { nextNode: DialogueNode | null; state: DialogueState } {
  if (!dialogueState.activeNode || !dialogueState.activeNode.choices) {
    return { nextNode: null, state: dialogueState };
  }

  const validChoices = getAvailableChoices(dialogueState, dialogueTree);
  if (choiceIndex < 0 || choiceIndex >= validChoices.length) {
    return { nextNode: null, state: dialogueState };
  }

  const choice = validChoices[choiceIndex];

  const historyEntry: DialogueHistoryEntry = {
    speaker: dialogueState.activeNode.speaker,
    speakerEmoji: dialogueState.activeNode.speakerEmoji,
    text: dialogueState.activeNode.text,
    timestamp: Date.now(),
    choiceText: choice.text,
  };

  const nextNode = dialogueTree[choice.nextId] || null;

  const newState: DialogueState = {
    ...dialogueState,
    activeNode: nextNode ? { ...nextNode } : null,
    currentNodeId: choice.nextId,
    history: [...dialogueState.history, historyEntry],
    typewriterIndex: 0,
    typewriterComplete: false,
  };

  dialogueState = newState;
  return { nextNode, state: newState };
}

export function advanceDialogue(dialogueTree: Record<string, DialogueNode>): DialogueState {
  if (!dialogueState.activeNode) return dialogueState;

  const historyEntry: DialogueHistoryEntry = {
    speaker: dialogueState.activeNode.speaker,
    speakerEmoji: dialogueState.activeNode.speakerEmoji,
    text: dialogueState.activeNode.text,
    timestamp: Date.now(),
  };

  if (!dialogueState.activeNode.nextId) {
    const newState: DialogueState = {
      ...dialogueState,
      activeNode: null,
      isActive: false,
      currentNodeId: null,
      history: [...dialogueState.history, historyEntry],
    };
    dialogueState = newState;
    return newState;
  }

  const nextNode = dialogueTree[dialogueState.activeNode.nextId] || null;
  const newState: DialogueState = {
    ...dialogueState,
    activeNode: nextNode ? { ...nextNode } : null,
    currentNodeId: dialogueState.activeNode.nextId,
    history: [...dialogueState.history, historyEntry],
    typewriterIndex: 0,
    typewriterComplete: false,
  };
  dialogueState = newState;
  return newState;
}

export function setCondition(key: string, value: string | number | boolean): void {
  dialogueState.conditions[key] = value;
}

export function getCondition(key: string): string | number | boolean | undefined {
  return dialogueState.conditions[key];
}

export function checkCondition(condition: string): boolean {
  const parts = condition.split(':');
  if (parts.length < 2) return false;
  const [op, ...rest] = parts;
  const value = rest.join(':');

  if (op === 'hasItem') return dialogueState.conditions[`hasItem:${value}`] === true;
  if (op === 'hasGold') return (dialogueState.conditions['gold'] as number) >= Number(value);
  if (op === 'questCompleted') return dialogueState.conditions[`questCompleted:${value}`] === true;
  if (op === 'level') return (dialogueState.conditions['level'] as number) >= Number(value);
  if (op === 'variable') {
    const [varName, varOp, varVal] = value.split(',');
    const current = dialogueState.conditions[`var:${varName}`] as number;
    if (varOp === '>') return current > Number(varVal);
    if (varOp === '<') return current < Number(varVal);
    if (varOp === '=') return current === Number(varVal);
  }
  return false;
}

export function getAvailableChoices(state: DialogueState, dialogueTree: Record<string, DialogueNode>): DialogueChoice[] {
  if (!state.activeNode?.choices) return [];
  return state.activeNode.choices.filter(choice => {
    if (!choice.condition) return true;
    return checkCondition(choice.condition);
  });
}

export function getNPCNameTag(node: DialogueNode): string {
  return `${node.speakerEmoji} ${node.speaker}`;
}

export function getHistory(): DialogueHistoryEntry[] {
  return [...dialogueState.history];
}

export function clearHistory(): void {
  dialogueState.history = [];
}

export function endDialogue(): DialogueState {
  const newState: DialogueState = {
    ...dialogueState,
    activeNode: null,
    isActive: false,
    currentNodeId: null,
    typewriterIndex: 0,
    typewriterComplete: false,
  };
  dialogueState = newState;
  return newState;
}
