import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { trackFeatureUse } from '../services/kidcodeAnalytics';

interface TourStep {
    title: string;
    text: string;
    targetId: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        title: 'Welcome to KidCode!',
        text: 'These are your blocks. They\'re how you build games, apps, and more!',
        targetId: 'block-workspace',
        position: 'right',
    },
    {
        title: 'Drag blocks here',
        text: 'Drag blocks from the library and snap them together to create your program.',
        targetId: 'sidebar-blocks',
        position: 'right',
    },
    {
        title: 'Click Run!',
        text: 'Click Run to see your creation come to life!',
        targetId: 'run-button',
        position: 'bottom',
    },
    {
        title: 'You did it!',
        text: 'Your first program is running! You\'re officially a coder!',
        targetId: 'block-workspace',
        position: 'center',
    },
];

interface FirstRunTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const FirstRunTour: React.FC<FirstRunTourProps> = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(0);
    const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [visible, setVisible] = useState(true);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateSpotlight = useCallback(() => {
        const currentStep = TOUR_STEPS[step];
        if (!currentStep) return;
        const el = document.getElementById(currentStep.targetId);
        if (el) {
            const rect = el.getBoundingClientRect();
            setSpotlight({ x: rect.left - 8, y: rect.top - 8, w: rect.width + 16, h: rect.height + 16 });
        } else {
            setSpotlight({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100, w: 200, h: 200 });
        }
    }, [step]);

    useEffect(() => {
        updateSpotlight();
        trackFeatureUse('first_run_tour_step');
        window.addEventListener('resize', updateSpotlight);
        return () => window.removeEventListener('resize', updateSpotlight);
    }, [updateSpotlight]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleNext();
            } else if (e.key === 'Escape') {
                handleSkip();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    });

    const handleNext = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            setVisible(false);
            setTimeout(onComplete, 300);
        }
    };

    const handleSkip = () => {
        setVisible(false);
        setTimeout(onSkip, 300);
    };

    const currentStep = TOUR_STEPS[step];
    if (!currentStep || !visible) return null;

    const isLastStep = step === TOUR_STEPS.length - 1;

    let tooltipX = spotlight.x + spotlight.w + 16;
    let tooltipY = spotlight.y;
    if (currentStep.position === 'left') {
        tooltipX = spotlight.x - 336;
    } else if (currentStep.position === 'bottom') {
        tooltipX = spotlight.x;
        tooltipY = spotlight.y + spotlight.h + 16;
    } else if (currentStep.position === 'center') {
        tooltipX = (window.innerWidth - 320) / 2;
        tooltipY = (window.innerHeight - 200) / 2;
    }

    if (tooltipX + 320 > window.innerWidth) tooltipX = spotlight.x - 336;
    if (tooltipY + 200 > window.innerHeight) tooltipY = spotlight.y - 200;

    return (
        <div className="tour-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleSkip(); }}>
            <div
                className="tour-spotlight"
                style={{
                    left: spotlight.x,
                    top: spotlight.y,
                    width: spotlight.w,
                    height: spotlight.h,
                }}
            />

            <button
                onClick={handleSkip}
                className="fixed top-4 right-4 z-[10001] bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                aria-label="Skip tour"
            >
                <X size={20} />
            </button>

            <div
                ref={tooltipRef}
                className="tour-tooltip animate-in fade-in zoom-in-95 duration-300"
                style={{ left: tooltipX, top: tooltipY }}
            >
                <h3 className="text-lg font-black text-slate-800 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{currentStep.text}</p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-violet-500' : 'bg-slate-200'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {isLastStep ? (
                            <button
                                onClick={handleNext}
                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-transform shadow-lg"
                            >
                                Start Building
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-4 py-2 bg-violet-100 text-violet-700 font-bold rounded-xl text-sm hover:bg-violet-200 transition-colors"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {currentStep.position !== 'center' && (
                <div
                    className="tour-arrow"
                    style={{
                        left: spotlight.x + spotlight.w / 2 - 20,
                        top: currentStep.position === 'bottom' ? spotlight.y - 30 : spotlight.y + spotlight.h / 2 - 20,
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default FirstRunTour;
