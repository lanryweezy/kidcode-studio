
import React from 'react';
import { TableProperties, X } from 'lucide-react';

interface VariableMonitorProps {
  variables: Record<string, any>;
  isVisible: boolean;
  onClose: () => void;
}

const VariableMonitor: React.FC<VariableMonitorProps> = ({ variables, isVisible, onClose }) => {
  if (!isVisible) return null;

  const entries = Object.entries(variables);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl shadow-2xl overflow-hidden w-64">
        <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white">
            <TableProperties size={16} className="text-orange-400" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider">Memory</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-0 max-h-48 overflow-y-auto custom-scrollbar">
          {entries.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 italic">No variables set</div>
          ) : (
            <table className="w-full text-xs font-mono">
              <tbody>
                {entries.map(([key, value], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/30'}>
                    <td className="p-2 text-orange-300 font-bold border-r border-slate-800 truncate max-w-[100px]" title={key}>{key}</td>
                    <td className="p-2 text-emerald-300 truncate max-w-[140px]" title={JSON.stringify(value)}>
                      {Array.isArray(value) ? `List[${value.length}]` : typeof value === 'object' ? '{...}' : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariableMonitor;
