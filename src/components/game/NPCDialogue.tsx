import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ChevronRight, ShoppingBag, Scroll, Info } from 'lucide-react';
import { NPC } from '../../services/rpgSystemsExtended';
import { Button } from '../ui/Button';

interface NPCDialogueProps {
  npc: NPC;
  dialogueIndex: number;
  onChoice?: (choice: string) => void;
  onClose: () => void;
  onShop?: () => void;
  onQuest?: () => void;
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 30, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  const handleClick = () => {
    if (!isComplete) {
      setDisplayed(text);
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {displayed}
      {!isComplete && <span className="animate-pulse">|</span>}
    </div>
  );
};

const NPC_DIALOGUES: Record<string, { text: string; choices?: { text: string; action: string }[] }[]> = {
  quest_giver: [
    {
      text: "Greetings, adventurer! I have a task that requires a brave soul.",
      choices: [
        { text: "Tell me more", action: "quest_info" },
        { text: "Not now", action: "close" },
      ],
    },
    {
      text: "The creatures in the forest have been growing more aggressive. Would you help clear them out?",
      choices: [
        { text: "I'll do it!", action: "accept_quest" },
        { text: "What's the reward?", action: "quest_reward" },
        { text: "Maybe later", action: "close" },
      ],
    },
  ],
  shopkeeper: [
    {
      text: "Welcome to my shop! Take a look at what I've got.",
      choices: [
        { text: "Browse items", action: "open_shop" },
        { text: "What's new?", action: "new_items" },
        { text: "Just browsing", action: "close" },
      ],
    },
  ],
  info: [
    {
      text: "Did you know? You can combine materials at a forge to create powerful weapons!",
      choices: [
        { text: "Tell me more", action: "more_info" },
        { text: "Thanks!", action: "close" },
      ],
    },
    {
      text: "The dragon's lair is to the east. Be prepared - it's extremely dangerous!",
      choices: [
        { text: "I'm ready!", action: "close" },
        { text: "Where can I gear up?", action: "gear_info" },
      ],
    },
  ],
  companion: [
    {
      text: "I'll follow you into battle! Just say the word.",
      choices: [
        { text: "Let's go!", action: "start_companion" },
        { text: "Wait here", action: "close" },
      ],
    },
  ],
};

export const NPCDialogue: React.FC<NPCDialogueProps> = ({
  npc, dialogueIndex, onChoice, onClose, onShop, onQuest
}) => {
  const [currentNode, setCurrentNode] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const dialogues = NPC_DIALOGUES[npc.type] || NPC_DIALOGUES.info;
  const dialogue = dialogues[Math.min(currentNode, dialogues.length - 1)];

  const handleChoice = (action: string) => {
    switch (action) {
      case 'close':
        setIsExiting(true);
        setTimeout(onClose, 300);
        break;
      case 'open_shop':
        onShop?.();
        setIsExiting(true);
        setTimeout(onClose, 300);
        break;
      case 'accept_quest':
        onQuest?.();
        setIsExiting(true);
        setTimeout(onClose, 300);
        break;
      case 'quest_info':
      case 'quest_reward':
      case 'new_items':
      case 'more_info':
      case 'gear_info':
        if (currentNode < dialogues.length - 1) {
          setTextComplete(false);
          setCurrentNode(prev => prev + 1);
        } else {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }
        break;
      default:
        onChoice?.(action);
        setIsExiting(true);
        setTimeout(onClose, 300);
    }
  };

  const handleAdvance = () => {
    if (!textComplete) return;
    if (dialogue.choices && dialogue.choices.length > 0) return; // Wait for choice
    if (currentNode < dialogues.length - 1) {
      setTextComplete(false);
      setCurrentNode(prev => prev + 1);
    } else {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
      isExiting ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      <div className="mx-4 mb-4 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* NPC Info Bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            {npc.emoji}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{npc.name}</div>
            <div className="text-[10px] text-white/70 capitalize">{npc.type.replace('_', ' ')}</div>
          </div>
          <button
            onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dialogue Content */}
        <div className="p-4" onClick={handleAdvance}>
          <div className="text-sm text-slate-700 leading-relaxed min-h-[3rem]">
            <TypewriterText
              text={dialogue.text}
              speed={25}
              onComplete={() => setTextComplete(true)}
            />
          </div>
        </div>

        {/* Choices */}
        {textComplete && dialogue.choices && (
          <div className="px-4 pb-4 space-y-2">
            {dialogue.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice.action)}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-violet-50 rounded-xl text-left transition-all group border border-slate-200 hover:border-violet-300"
              >
                <ChevronRight size={14} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                <span className="text-sm font-medium text-slate-700">
                  {choice.text}
                </span>
                {choice.action === 'open_shop' && <ShoppingBag size={12} className="ml-auto text-amber-500" />}
                {choice.action === 'accept_quest' && <Scroll size={12} className="ml-auto text-green-500" />}
                {choice.action === 'quest_info' && <Info size={12} className="ml-auto text-blue-500" />}
              </button>
            ))}
          </div>
        )}

        {/* Advance indicator */}
        {textComplete && (!dialogue.choices || dialogue.choices.length === 0) && (
          <div className="px-4 pb-3 text-center">
            <span className="text-xs text-slate-400 animate-pulse">Click to continue...</span>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1 pb-3">
          {dialogues.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentNode ? 'bg-violet-500 w-3' : i < currentNode ? 'bg-violet-300' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NPCDialogue;
