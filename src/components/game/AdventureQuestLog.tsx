import React, { useState } from 'react';
import { Flag, MapPin, CheckCircle, ChevronRight } from 'lucide-react';

interface Quest {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  objectives: string[];
}

interface AdventureQuestLogProps {
  quests: Quest[];
  discoveredLocations?: string[];
}

export const AdventureQuestLog: React.FC<AdventureQuestLogProps> = ({ quests, discoveredLocations = [] }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (quests.length === 0 && discoveredLocations.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-indigo-900/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-indigo-500/50 flex items-center gap-2 pointer-events-auto"
      >
        <Flag size={14} className="text-indigo-400" />
        <span className="text-xs font-bold text-white">Quests ({quests.filter(q => !q.completed).length})</span>
      </button>
      
      {expanded && (
        <div className="mt-2 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl max-w-xs pointer-events-auto">
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {quests.map(q => (
              <div key={q.id} className={`p-2 rounded-lg ${q.completed ? 'bg-green-900/30 border border-green-700/50' : 'bg-slate-800 border border-slate-700'}`}>
                <div className="flex items-center gap-2">
                  {q.completed ? <CheckCircle size={12} className="text-green-400" /> : <Flag size={12} className="text-amber-400" />}
                  <span className={`text-xs font-bold ${q.completed ? 'text-green-400 line-through' : 'text-white'}`}>{q.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 ml-5">{q.description}</div>
              </div>
            ))}
            {discoveredLocations.length > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 mb-1">Locations</div>
                {discoveredLocations.map(loc => (
                  <div key={loc} className="flex items-center gap-1 text-[10px] text-blue-400">
                    <MapPin size={10} /> {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
