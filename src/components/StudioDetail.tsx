import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, FolderOpen, Share2, Edit3, Eye, EyeOff, GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { useStore } from '../store/useStore';
import {
  getStudio,
  updateStudio,
  removeProjectFromStudio,
  reorderProjectsInStudio,
} from '../services/studioService';
import { getProjects, SavedProject } from '../services/storageService';
import { Studio } from '../types/studio';
import { MODE_CONFIG } from '../constants';

interface StudioDetailProps {
  studioId: string;
  onClose: () => void;
}

const StudioDetail: React.FC<StudioDetailProps> = ({ studioId, onClose }) => {
  const { toast } = useToast();
  const { userProfile, setProject } = useStore();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const s = await getStudio(studioId);
    setStudio(s);
    setProjects(getProjects());
    setLoading(false);
  }, [studioId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveProject = async (projectId: string) => {
    if (!studio) return;
    await removeProjectFromStudio(studio.id, projectId);
    toast('info', 'Project removed');
    loadData();
  };

  const handleReorder = async (fromIdx: number, direction: 'up' | 'down') => {
    if (!studio) return;
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= studio.projects.length) return;
    await reorderProjectsInStudio(studio.id, fromIdx, toIdx);
    loadData();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast('success', 'Link copied to clipboard!');
  };

  const handleOpenProject = (proj: SavedProject) => {
    setProject(proj);
  };

  const handlePlayAll = () => {
    if (!studio || studio.projects.length === 0) return;
    const firstProjId = studio.projects[0];
    const proj = projects.find(p => p.id === firstProjId);
    if (proj) {
      setProject(proj);
    }
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  const handleTogglePublic = async () => {
    if (!studio) return;
    await updateStudio(studio.id, { isPublic: !studio.isPublic });
    toast('info', studio.isPublic ? 'Now private' : 'Now public');
    loadData();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm animate-scale-in">
          <p className="font-bold text-slate-700 mb-2">Studio not found</p>
          <p className="text-sm text-slate-400 mb-4">This studio may have been deleted.</p>
          <Button variant="primary" size="sm" onClick={onClose}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isOwner = userProfile?.id === studio.createdBy;
  const projectDetails = studio.projects.map(id => getProject(id)).filter(Boolean) as SavedProject[];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-800 truncate">{studio.name}</h1>
            {studio.description && (
              <p className="text-sm text-slate-500 truncate">{studio.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <button
                onClick={handleTogglePublic}
                className="p-2 rounded-xl transition-colors"
                title={studio.isPublic ? 'Public' : 'Private'}
              >
                {studio.isPublic ? (
                  <Eye size={18} className="text-emerald-500" />
                ) : (
                  <EyeOff size={18} className="text-slate-400" />
                )}
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-violet-500 hover:bg-white transition-all"
              title="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-bold">{studio.projects.length}</span> project{studio.projects.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-bold">{studio.likes}</span> likes
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-bold">{studio.views}</span> views
          </div>
          {studio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-auto">
              {studio.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {projectDetails.length > 0 && (
          <div className="mb-6">
            <Button
              variant="primary"
              size="sm"
              icon={<Play size={14} />}
              onClick={handlePlayAll}
            >
              Play First Project
            </Button>
          </div>
        )}

        {projectDetails.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <FolderOpen size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-600 mb-1">No projects yet</p>
            <p className="text-sm text-slate-400">Add projects to this studio from the project editor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectDetails.map((proj, idx) => (
              <div
                key={proj.id}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="text-slate-300 shrink-0">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                </div>
                {proj.thumbnail && (
                  <img src={proj.thumbnail} alt="" className="w-16 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{proj.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${MODE_CONFIG[proj.mode]?.color || 'bg-slate-500'}`}>
                      {MODE_CONFIG[proj.mode]?.label || proj.mode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(proj.lastEdited).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => handleReorder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleReorder(idx, 'down')}
                        disabled={idx === projectDetails.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveProject(proj.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleOpenProject(proj)}
                    className="p-2 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-600 hover:text-white transition-all"
                  >
                    <FolderOpen size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioDetail;
