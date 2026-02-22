
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, ArrowRight, X, BookOpen, Trophy } from 'lucide-react';
import { playSoundEffect } from '../services/soundService';

interface TutorialStep {
  title: string;
  content: string;
  targetId?: string; // DOM ID to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to KidCode Studio! 🚀",
    content: "I'm your AI guide. Let's learn how to build your first game! Ready?",
    position: 'center'
  },
  {
    title: "The Block Library 📦",
    content: "This is where all your coding blocks live. You can find movement, physics, and world blocks here.",
    targetId: 'sidebar-content',
    position: 'right'
  },
  {
    title: "Coding Area 🧠",
    content: "Drag blocks from the library into this workspace to write your game's instructions.",
    targetId: 'workspace-area',
    position: 'right'
  },
  {
    title: "The Stage 📺",
    content: "This is where your game comes to life! You'll see your characters move and react here.",
    targetId: 'stage-area',
    position: 'left'
  },
  {
    title: "Run Your Code! ▶️",
    content: "Click this green button to start your game and see your code in action!",
    targetId: 'run-button',
    position: 'bottom'
  }
];

const TutorialSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      playSoundEffect('click');
    } else {
      playSoundEffect('powerup');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {/* Background Dim */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-500" />

      {/* Tutorial Card */}
      <div className={`
        absolute z-[310] pointer-events-auto
        w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-violet-500 overflow-hidden
        animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
        ${step.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        ${step.position === 'right' ? 'top-1/4 left-80 ml-8' : ''}
        ${step.position === 'left' ? 'top-1/4 right-80 mr-8' : ''}
        ${step.position === 'bottom' ? 'bottom-20 left-1/2 -translate-x-1/2' : ''}
      `}>
        <div className="p-5 bg-violet-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles size={20} fill="currentColor" />
                <span className="font-black text-xs uppercase tracking-widest">Step {currentStep + 1} of {TUTORIAL_STEPS.length}</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={18}/></button>
        </div>

        <div className="p-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight">{step.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-6">
                {step.content}
            </p>

            <button 
                onClick={handleNext}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'START CREATING!' : 'NEXT STEP'} <ArrowRight size={18} />
            </button>
        </div>
      </div>

      {/* Highlight Effect (Simulated) */}
      {step.targetId && (
          <div className="absolute inset-0 pointer-events-none ring-[100vmax] ring-slate-950/60" />
      )}
    </div>
  );
};

export default TutorialSystem;
