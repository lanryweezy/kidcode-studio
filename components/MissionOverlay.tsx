
import React, { useEffect } from 'react';
import { Mission, AppMode } from '../types';
import { Trophy, CheckCircle2, Circle, X, Play, Award } from 'lucide-react';
import { AVAILABLE_MISSIONS } from '../constants';

interface MissionOverlayProps {
  activeMission: Mission | null;
  mode: AppMode;
  onSelectMission: (mission: Mission) => void;
  onClose: () => void;
}

const MissionOverlay: React.FC<MissionOverlayProps> = ({ activeMission, mode, onSelectMission, onClose }) => {
  const missions = AVAILABLE_MISSIONS.filter(m => m.mode === mode);
  
  // If no active mission, show selection list
  if (!activeMission) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 flex justify-between items-center text-white">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-xl"><Trophy size={28} /></div>
               <div>
                 <h2 className="text-2xl font-black tracking-tight">Mission Hub</h2>
                 <p className="text-yellow-100 font-medium">Select a challenge to start!</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50">
             {missions.length === 0 ? (
               <div className="col-span-2 text-center py-10 text-slate-400 italic">No missions available for this mode yet. Check back soon!</div>
             ) : (
               missions.map(m => (
                 <button 
                   key={m.id} 
                   onClick={() => onSelectMission(m)}
                   className="group text-left bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-yellow-400 hover:shadow-md transition-all relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Award size={80} className="text-yellow-500" /></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-yellow-600 transition-colors">{m.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{m.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-yellow-600 font-bold text-sm bg-yellow-50 px-3 py-1.5 rounded-lg w-fit group-hover:bg-yellow-100 transition-colors">
                      <Play size={14} fill="currentColor" /> Start Mission
                    </div>
                 </button>
               ))
             )}
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round((activeMission.steps.filter(s => s.isCompleted).length / activeMission.steps.length) * 100);
  const isAllComplete = progress === 100;

  return (
    <div className="fixed top-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in slide-in-from-right-10 duration-500">
       <div className={`p-4 ${isAllComplete ? 'bg-green-500' : 'bg-slate-800'} text-white transition-colors duration-500`}>
          <div className="flex justify-between items-start mb-1">
             <h3 className="font-bold text-lg flex items-center gap-2">
               {isAllComplete ? <Award className="animate-bounce" /> : <Trophy size={18} className="text-yellow-400" />}
               {activeMission.title}
             </h3>
             <button onClick={onClose} className="text-white/60 hover:text-white"><X size={16} /></button>
          </div>
          <p className="text-xs opacity-80 leading-snug">{activeMission.description}</p>
          
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden">
             <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
       </div>

       <div className="p-4 bg-slate-50 max-h-[300px] overflow-y-auto">
          <div className="space-y-3">
             {activeMission.steps.map(step => (
               <div key={step.id} className={`flex gap-3 text-sm transition-all duration-300 ${step.isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                  <div className={`mt-0.5 shrink-0 transition-transform duration-300 ${step.isCompleted ? 'scale-110 text-green-500' : 'text-slate-300'}`}>
                     {step.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <span className={`${step.isCompleted ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {step.text}
                  </span>
               </div>
             ))}
          </div>
          
          {isAllComplete && (
            <div className="mt-6 text-center animate-in zoom-in duration-300">
               <div className="inline-block p-3 bg-green-100 text-green-600 rounded-full mb-2"><Award size={32} /></div>
               <h4 className="font-bold text-green-600 text-lg">Mission Complete!</h4>
               <p className="text-xs text-slate-500">Great job, engineer!</p>
               <button onClick={onClose} className="mt-4 w-full py-2 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all">Close</button>
            </div>
          )}
       </div>
    </div>
  );
};

export default MissionOverlay;
