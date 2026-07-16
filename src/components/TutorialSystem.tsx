
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
    title: "Welcome to the Future! 🚀",
    content: "I'm your KidCode AI guide. We're about to build a 3D Parkour game in under a minute. Ready to level up?",
    position: 'center'
  },
  {
    title: "Choose Your Mode 🎮",
    content: "We're starting in Game Builder today, but you can always design Apps or build real Circuits too!",
    targetId: 'dashboard-modes',
    position: 'bottom'
  },
  {
    title: "The Block Library 📦",
    content: "This is your toolbox. Drag blocks like 'Move' or 'Jump' to make your player come to life!",
    targetId: 'sidebar-content',
    position: 'right'
  },
  {
    title: "The 3D Stage 🌍",
    content: "Your world is rendering in real-time. Drag to rotate and see your creation from every angle!",
    targetId: 'workspace-area',
    position: 'left'
  },
  {
    title: "Launch Sequence ▶️",
    content: "Click the green 'RUN CODE' button to jump into your game and start parkouring!",
    targetId: 'run-button',
    position: 'bottom'
  }
];

const TutorialSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setProject, setShowHome, setMode } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep === 1) { // When they move from "Welcome" to "Choose Your Mode"
      // Load the 3D Parkour template for the tutorial
      import('../constants/templates').then(({ EXAMPLE_TEMPLATES }) => {
        import('../services/storageService').then(({ createNewProject }) => {
          const tpl = EXAMPLE_TEMPLATES.find(t => t.id === 'hero_parkour_3d') || EXAMPLE_TEMPLATES[0];
          const newProj = createNewProject(tpl.mode);
          newProj.name = "My First 3D Game";
          newProj.data.commands = tpl.commands.map(c => ({ ...c, id: Math.random().toString(36).substring(2, 11) }));
          setProject(newProj);
          setShowHome(false);
          setMode(tpl.mode);
          playSoundEffect('powerup');
        });
      });
    }

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
        w-80 bg-white rounded-3xl shadow-2xl border-4 border-violet-500 overflow-hidden
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
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={18} /></button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-5 pt-3">
          <div className="flex gap-1.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx < currentStep
                    ? 'bg-green-400'
                    : idx === currentStep
                    ? 'bg-violet-400'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{step.title}</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
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
