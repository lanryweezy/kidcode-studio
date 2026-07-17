import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  hint?: string;
  highlightSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  media?: { type: 'emoji' | 'image'; value: string };
  requiredAction?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
}

interface GameTutorialProps {
  tutorial: Tutorial;
  open: boolean;
  onClose: () => void;
  onComplete?: (tutorialId: string) => void;
}

const STORAGE_KEY = 'kidcode_tutorial_progress';

function getCompletedTutorials(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return new Set(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set();
  }
}

function saveCompletedTutorial(tutorialId: string): void {
  try {
    const completed = getCompletedTutorials();
    completed.add(tutorialId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)));
  } catch { void 0; }
}

export function isTutorialCompleted(tutorialId: string): boolean {
  return getCompletedTutorials().has(tutorialId);
}

export const GameTutorial: React.FC<GameTutorialProps> = ({
  tutorial,
  open,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const step = tutorial.steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tutorial.steps.length - 1;
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setCompleted(false);
    }
  }, [open, tutorial.id]);

  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.focus();
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setCompleted(true);
      saveCompletedTutorial(tutorial.id);
      onComplete?.(tutorial.id);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLast, tutorial.id, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirst]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleNext, handlePrev, onClose]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setCompleted(false);
  }, []);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={tutorial.title} size="lg">
      <div
        ref={stepRef}
        tabIndex={-1}
        className="outline-none"
        onKeyDown={handleKeyDown}
        role="region"
        aria-label={`Tutorial: ${tutorial.title}`}
        aria-roledescription="carousel"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-slate-500">
            Step {currentStep + 1} of {tutorial.steps.length}
          </span>
          <div className="flex items-center gap-2">
            {completed && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={14} /> Complete
              </span>
            )}
            <button
              onClick={handleRestart}
              className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Restart tutorial"
              title="Restart tutorial"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={tutorial.steps.length}
            aria-label={`Tutorial progress: step ${currentStep + 1} of ${tutorial.steps.length}`}
          />
        </div>

        <div
          className="min-h-[180px] flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl mb-6"
          aria-live="polite"
        >
          {step.media && (
            <div className="text-5xl mb-4" aria-hidden="true">
              {step.media.value}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-slate-600 max-w-md">
            {step.description}
          </p>
          {step.hint && (
            <p className="mt-3 text-xs text-indigo-600 italic">
              💡 {step.hint}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex gap-1.5" aria-hidden="true">
            {tutorial.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'bg-indigo-600 w-6'
                    : i < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-slate-300'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isLast ? 'Finish' : 'Next'}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const BASIC_PLATFORMER_TUTORIAL: Tutorial = {
  id: 'basic-platformer',
  title: 'Platformer Basics',
  description: 'Learn how to build a platformer game',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to KidCode Studio!',
      description: 'This tutorial will help you create your first platformer game. Follow the steps to learn the basics.',
      media: { type: 'emoji', value: '🎮' },
    },
    {
      id: 'drag-blocks',
      title: 'Drag & Drop Blocks',
      description: 'Use the block palette on the left to drag code blocks into the scripting area. Each block represents an action.',
      media: { type: 'emoji', value: '🧩' },
      hint: 'Try dragging a "Move Right" block first!',
    },
    {
      id: 'connect-blocks',
      title: 'Connect Blocks',
      description: 'Connect blocks together to create a sequence of actions. The game will execute them top to bottom.',
      media: { type: 'emoji', value: '🔗' },
    },
    {
      id: 'run-game',
      title: 'Run Your Game',
      description: 'Click the green "Play" button to run your code. Watch your character come to life!',
      media: { type: 'emoji', value: '▶️' },
    },
    {
      id: 'level-editor',
      title: 'Level Editor',
      description: 'Use the tile palette to paint your game world. Click tiles on the canvas to place them.',
      media: { type: 'emoji', value: '🏗️' },
      hint: 'Add platforms, coins, and hazards to make your level interesting!',
    },
    {
      id: 'share',
      title: 'Share Your Game',
      description: 'When you\'re happy with your game, export it or share it with friends. Have fun!',
      media: { type: 'emoji', value: '🎉' },
    },
  ],
};
