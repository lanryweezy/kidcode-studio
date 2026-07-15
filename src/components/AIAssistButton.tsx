import React, { useState, useCallback } from 'react';
import { Sparkles, X } from 'lucide-react';
import { generateCodeFromPrompt } from '../services/geminiService';
import { AppMode, CommandBlock } from '../types';

interface AIAssistButtonProps {
    currentMode: AppMode;
    onAppendCode: (commands: CommandBlock[]) => void;
}

const AIAssistButton: React.FC<AIAssistButtonProps> = ({ currentMode, onAppendCode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim() || isGenerating) return;
        setIsGenerating(true);
        try {
            const result = await generateCodeFromPrompt(prompt, currentMode);
            if (result.commands) {
                const blocks: CommandBlock[] = result.commands.map((cmd) => ({
                    ...cmd,
                    id: crypto.randomUUID(),
                } as CommandBlock));
                onAppendCode(blocks);
            }
            setPrompt('');
            setIsOpen(false);
        } catch (err) {
            console.error('AI Assist error:', err);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, isGenerating, currentMode, onAppendCode]);

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                aria-label="AI Assist"
            >
                <Sparkles size={14} />
                AI Assist
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 w-80 animate-pop-in">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles size={16} className="text-violet-500" />
                            AI Code Generator
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close AI assist">
                            <X size={14} />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3">
                        Describe what you want to build and the AI will generate code blocks for you.
                    </p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Make a character jump over obstacles and collect coins..."
                        className="w-full h-20 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 outline-none focus:border-violet-400 resize-none"
                        autoFocus
                        disabled={isGenerating}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-lg text-xs font-bold hover:from-violet-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Code'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIAssistButton;
