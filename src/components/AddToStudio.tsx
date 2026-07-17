import React, { useState, useEffect } from 'react';
import { FolderPlus, X, Check } from 'lucide-react';
import { useToast } from './ui/Toast';
import { useStore } from '../store/useStore';
import { getStudios, addProjectToStudio } from '../services/studioService';
import { Studio } from '../types/studio';

interface AddToStudioProps {
  projectId: string;
  onClose: () => void;
}

const AddToStudio: React.FC<AddToStudioProps> = ({ projectId, onClose }) => {
  const { toast } = useToast();
  const { userProfile } = useStore();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await getStudios();
      setStudios(all);
      setLoading(false);
    })();
  }, []);

  const handleAdd = async (studio: Studio) => {
    const result = await addProjectToStudio(studio.id, projectId);
    if (result) {
      toast('success', `Added to "${studio.name}"`);
    } else {
      toast('warning', 'Already in this studio');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full max-h-[60vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FolderPlus size={18} className="text-violet-500" />
            Add to Studio
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-3 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
            </div>
          ) : studios.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No studios yet. Create one first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {studios.map(studio => (
                <button
                  key={studio.id}
                  onClick={() => handleAdd(studio)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                    <FolderPlus size={18} className="text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{studio.name}</p>
                    <p className="text-[10px] text-slate-400">{studio.projects.length} project{studio.projects.length !== 1 ? 's' : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToStudio;
