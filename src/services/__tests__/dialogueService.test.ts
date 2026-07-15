import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDialogueState,
  resetDialogueState,
  startDialogue,
  advanceTypewriter,
  getDisplayedText,
  tickTypewriter,
  selectChoice,
  advanceDialogue,
  setCondition,
  getCondition,
  checkCondition,
  getAvailableChoices,
  getNPCNameTag,
  getHistory,
  clearHistory,
  endDialogue,
} from '../dialogueService';
import { DialogueNode } from '../../types/game';

const dialogueTree: Record<string, DialogueNode> = {
  start: {
    id: 'start',
    speaker: 'Guard',
    speakerEmoji: '🛡️',
    text: 'Halt! Who goes there?',
    choices: [
      { text: 'I am a hero!', nextId: 'hero_path' },
      { text: 'Just a traveler.', nextId: 'traveler_path', condition: 'hasItem:pass' },
    ],
  },
  hero_path: {
    id: 'hero_path',
    speaker: 'Guard',
    speakerEmoji: '🛡️',
    text: 'A hero! You may pass.',
    nextId: 'end',
  },
  traveler_path: {
    id: 'traveler_path',
    speaker: 'Guard',
    speakerEmoji: '🛡️',
    text: 'Travelers need a pass.',
    nextId: 'end',
  },
  linear: {
    id: 'linear',
    speaker: 'NPC',
    speakerEmoji: '🧙',
    text: 'Hello there!',
    nextId: 'linear2',
  },
  linear2: {
    id: 'linear2',
    speaker: 'NPC',
    speakerEmoji: '🧙',
    text: 'Goodbye!',
  },
  end: {
    id: 'end',
    speaker: 'Guard',
    speakerEmoji: '🛡️',
    text: 'Good luck!',
  },
};

describe('dialogueService', () => {
  beforeEach(() => {
    resetDialogueState();
  });

  describe('state management', () => {
    it('starts with inactive dialogue', () => {
      const state = getDialogueState();
      expect(state.isActive).toBe(false);
      expect(state.activeNode).toBeNull();
      expect(state.history).toHaveLength(0);
    });

    it('resetDialogueState clears everything', () => {
      startDialogue(dialogueTree.start);
      resetDialogueState();
      const state = getDialogueState();
      expect(state.isActive).toBe(false);
      expect(state.history).toHaveLength(0);
    });
  });

  describe('startDialogue', () => {
    it('activates dialogue', () => {
      const state = startDialogue(dialogueTree.start);
      expect(state.isActive).toBe(true);
      expect(state.activeNode?.id).toBe('start');
      expect(state.typewriterIndex).toBe(0);
      expect(state.typewriterComplete).toBe(false);
    });
  });

  describe('typewriter effect', () => {
    it('starts with empty displayed text', () => {
      startDialogue(dialogueTree.start);
      expect(getDisplayedText()).toBe('');
    });

    it('ticks typewriter character by character', () => {
      startDialogue(dialogueTree.start);
      tickTypewriter(5);
      expect(getDisplayedText().length).toBe(5);
    });

    it('completes when text fully displayed', () => {
      startDialogue(dialogueTree.start);
      const fullLen = dialogueTree.start.text.length;
      tickTypewriter(fullLen + 10);
      expect(getDisplayedText()).toBe(dialogueTree.start.text);
    });

    it('advanceTypewriter shows full text', () => {
      startDialogue(dialogueTree.start);
      advanceTypewriter();
      expect(getDisplayedText()).toBe(dialogueTree.start.text);
      expect(getDialogueState().typewriterComplete).toBe(true);
    });

    it('returns same state if already complete', () => {
      startDialogue(dialogueTree.start);
      advanceTypewriter();
      const state = advanceTypewriter();
      expect(state.typewriterComplete).toBe(true);
    });

    it('does not tick beyond text length', () => {
      startDialogue(dialogueTree.start);
      const len = dialogueTree.start.text.length;
      tickTypewriter(len);
      tickTypewriter(5);
      expect(getDisplayedText().length).toBe(len);
    });
  });

  describe('selectChoice', () => {
    it('selects choice and advances', () => {
      startDialogue(dialogueTree.start);
      advanceTypewriter();
      const { nextNode } = selectChoice(0, dialogueTree);
      expect(nextNode?.id).toBe('hero_path');
      expect(getDialogueState().activeNode?.id).toBe('hero_path');
    });

    it('adds choice text to history', () => {
      startDialogue(dialogueTree.start);
      advanceTypewriter();
      selectChoice(0, dialogueTree);
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].choiceText).toBe('I am a hero!');
      expect(history[0].text).toBe(dialogueTree.start.text);
    });

    it('filters choices by condition', () => {
      startDialogue(dialogueTree.start);
      const choices = getAvailableChoices(getDialogueState(), dialogueTree);
      expect(choices).toHaveLength(1);
      expect(choices[0].text).toBe('I am a hero!');
    });

    it('shows conditioned choice when condition met', () => {
      startDialogue(dialogueTree.start);
      setCondition('hasItem:pass', true);
      const choices = getAvailableChoices(getDialogueState(), dialogueTree);
      expect(choices).toHaveLength(2);
    });

    it('returns null for out of bounds choice', () => {
      startDialogue(dialogueTree.start);
      const { nextNode } = selectChoice(99, dialogueTree);
      expect(nextNode).toBeNull();
    });

    it('returns null when no choices', () => {
      startDialogue(dialogueTree.linear);
      const { nextNode } = selectChoice(0, dialogueTree);
      expect(nextNode).toBeNull();
    });
  });

  describe('advanceDialogue (linear)', () => {
    it('advances to next node', () => {
      startDialogue(dialogueTree.linear);
      advanceTypewriter();
      const state = advanceDialogue(dialogueTree);
      expect(state.activeNode?.id).toBe('linear2');
    });

    it('adds to history', () => {
      startDialogue(dialogueTree.linear);
      advanceTypewriter();
      advanceDialogue(dialogueTree);
      expect(getHistory()).toHaveLength(1);
      expect(getHistory()[0].speaker).toBe('NPC');
    });

    it('ends dialogue at terminal node', () => {
      startDialogue(dialogueTree.linear2);
      advanceTypewriter();
      const state = advanceDialogue(dialogueTree);
      expect(state.isActive).toBe(false);
      expect(state.activeNode).toBeNull();
    });

    it('does nothing when not active', () => {
      const state = advanceDialogue(dialogueTree);
      expect(state.isActive).toBe(false);
    });
  });

  describe('conditions', () => {
    it('set and get condition', () => {
      setCondition('level', 5);
      expect(getCondition('level')).toBe(5);
    });

    it('checkCondition for hasItem', () => {
      setCondition('hasItem:sword', true);
      expect(checkCondition('hasItem:sword')).toBe(true);
      expect(checkCondition('hasItem:axe')).toBe(false);
    });

    it('checkCondition for hasGold', () => {
      setCondition('gold', 100);
      expect(checkCondition('hasGold:50')).toBe(true);
      expect(checkCondition('hasGold:150')).toBe(false);
    });

    it('checkCondition for level', () => {
      setCondition('level', 5);
      expect(checkCondition('level:3')).toBe(true);
      expect(checkCondition('level:7')).toBe(false);
    });

    it('checkCondition for variable comparisons', () => {
      setCondition('var:score', 50);
      expect(checkCondition('variable:score,>,10')).toBe(true);
      expect(checkCondition('variable:score,<,10')).toBe(false);
      expect(checkCondition('variable:score,=,50')).toBe(true);
    });

    it('checkCondition returns false for unknown op', () => {
      expect(checkCondition('unknown:value')).toBe(false);
    });

    it('checkCondition returns false for malformed condition', () => {
      expect(checkCondition('no_colon')).toBe(false);
    });
  });

  describe('getNPCNameTag', () => {
    it('formats name tag', () => {
      const tag = getNPCNameTag(dialogueTree.start);
      expect(tag).toBe('🛡️ Guard');
    });
  });

  describe('clearHistory', () => {
    it('clears all history', () => {
      startDialogue(dialogueTree.start);
      advanceTypewriter();
      selectChoice(0, dialogueTree);
      expect(getHistory().length).toBeGreaterThan(0);
      clearHistory();
      expect(getHistory()).toHaveLength(0);
    });
  });

  describe('endDialogue', () => {
    it('deactivates and clears active node', () => {
      startDialogue(dialogueTree.start);
      const state = endDialogue();
      expect(state.isActive).toBe(false);
      expect(state.activeNode).toBeNull();
    });

    it('returns same state when not active', () => {
      resetDialogueState();
      const state = endDialogue();
      expect(state.isActive).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('tickTypewriter with 0 charsPerTick does nothing', () => {
      startDialogue(dialogueTree.start);
      const stateBefore = getDialogueState();
      tickTypewriter(0);
      expect(getDialogueState().typewriterIndex).toBe(stateBefore.typewriterIndex);
    });

    it('selectChoice with negative index returns null', () => {
      const result = selectChoice(-1, dialogueTree);
      expect(result.nextNode).toBeNull();
    });

    it('getAvailableChoices returns empty for inactive state', () => {
      resetDialogueState();
      const choices = getAvailableChoices(getDialogueState(), dialogueTree);
      expect(choices).toHaveLength(0);
    });

    it('clearHistory after endDialogue clears the history', () => {
      startDialogue(dialogueTree.start);
      advanceDialogue(dialogueTree);
      endDialogue();
      clearHistory();
      expect(getHistory()).toHaveLength(0);
    });

    it('setCondition then checkCondition works with hasItem', () => {
      setCondition('hasItem:sword', true);
      expect(checkCondition('hasItem:sword')).toBe(true);
      expect(checkCondition('hasItem:axe')).toBe(false);
    });

    it('setCondition then checkCondition works with hasGold', () => {
      setCondition('gold', 500);
      expect(checkCondition('hasGold:100')).toBe(true);
      expect(checkCondition('hasGold:1000')).toBe(false);
    });

    it('getNPCNameTag returns fallback for unknown node', () => {
      const nameTag = getNPCNameTag({ id: 'unknown', text: 'Hi', speaker: '???', speakerEmoji: '❓', choices: [] });
      expect(nameTag).toBeTruthy();
    });
  });
});
