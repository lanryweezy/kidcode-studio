
import React from 'react';
import { useStore } from '../store/useStore';
import { X, PieChart, BarChart2, Layers, Cpu, Box, Hash } from 'lucide-react';
import { AppMode } from '../types';

const ProjectStatsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { commands, hardwareState, spriteState, appState, mode, circuitComponents } = useStore();

  const totalBlocks = commands.length;
  const variableCount = Object.keys(mode === AppMode.APP ? appState.variables : mode === AppMode.GAME ? spriteState.variables : hardwareState.variables).length;
  
  const blockTypes = commands.reduce((acc, cmd) => {
      acc[cmd.type] = (acc[cmd.type] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const topBlocks = Object.entries(blockTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const complexityScore = totalBlocks * 10 + variableCount * 50;
  const projectLevel = Math.floor(complexityScore / 500) + 1;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-indigo-500 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-indigo-500 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
                <BarChart2 size={32} fill="currentColor" />
                <div>
                    <h2 className="text-2xl font-black tracking-tight">PROJECT STATS</h2>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Level {projectLevel} Project</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/50">
            {/* Main Stats */}
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <Box size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Blocks</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{totalBlocks}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <Hash size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Variables</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{variableCount}</p>
                    </div>
                </div>

                {mode === AppMode.HARDWARE && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Components</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{circuitComponents.length}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Blocks Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-500" /> Most Used Blocks
                </h3>
                <div className="space-y-3">
                    {topBlocks.map(([type, count], i) => (
                        <div key={type}>
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>{type}</span>
                                <span>{count}</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-emerald-500'][i % 5]}`} 
                                    style={{ width: `${(count / totalBlocks) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {topBlocks.length === 0 && <p className="text-sm text-slate-400 italic">No blocks used yet.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatsModal;
