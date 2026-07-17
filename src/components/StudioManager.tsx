import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, GripVertical, Eye, EyeOff, Edit3, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';
import { useStore } from '../store/useStore';
import {
  createStudio,
  saveStudio,
  getStudios,
  deleteStudio,
  updateStudio,
  addProjectToStudio,
  removeProjectFromStudio,
  reorderProjectsInStudio,
} from '../services/studioService';
import { getProjects, SavedProject } from '../services/storageService';
import { Studio } from '../types/studio';

interface StudioManagerProps {
  onClose: () => void;
  onSelectStudio?: (studio: Studio) => void;
}

const StudioManager: React.FC<StudioManagerProps> = ({ onClose, onSelectStudio }) => {
  const { toast } = useToast();
  const { userProfile } = useStore();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [expandedStudio, setExpandedStudio] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');

  const loadData = useCallback(async () => {
    const [s, p] = await Promise.all([getStudios(), Promise.resolve(getProjects())]);
    setStudios(s);
    setProjects(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast('warning', 'Please enter a studio name');
      return;
    }
    const studio = createStudio(
      formName.trim(),
      formDesc.trim(),
      userProfile?.id || 'local',
      formTags.split(',').map(t => t.trim()).filter(Boolean)
    );
    await saveStudio(studio);
    toast('success', 'Studio created!');
    setFormName('');
    setFormDesc('');
    setFormTags('');
    setShowCreate(false);
    loadData();
  };

  const handleEdit = async () => {
    if (!editingStudio || !formName.trim()) return;
    await updateStudio(editingStudio.id, {
      name: formName.trim(),
      description: formDesc.trim(),
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
    });
    toast('success', 'Studio updated!');
    setEditingStudio(null);
    setFormName('');
    setFormDesc('');
    setFormTags('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteStudio(id);
    toast('success', 'Studio deleted');
    if (expandedStudio === id) setExpandedStudio(null);
    loadData();
  };

  const handleTogglePublic = async (studio: Studio) => {
    await updateStudio(studio.id, { isPublic: !studio.isPublic });
    toast('info', studio.isPublic ? 'Studio is now private' : 'Studio is now public');
    loadData();
  };

  const startEdit = (studio: Studio) => {
    setEditingStudio(studio);
    setFormName(studio.name);
    setFormDesc(studio.description);
    setFormTags(studio.tags.join(', '));
    setShowCreate(true);
  };

  const handleRemoveProject = async (studioId: string, projectId: string) => {
    await removeProjectFromStudio(studioId, projectId);
    toast('info', 'Project removed from studio');
    loadData();
  };

  const handleMoveProject = async (studioId: string, fromIdx: number, direction: 'up' | 'down') => {
    const studio = studios.find(s => s.id === studioId);
    if (!studio) return;
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= studio.projects.length) return;
    await reorderProjectsInStudio(studioId, fromIdx, toIdx);
    loadData();
  };

  const getProjectName = (id: string) => {
    const p = projects.find(proj => proj.id === id);
    return p?.name || 'Unknown Project';
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormTags('');
    setEditingStudio(null);
    setShowCreate(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">My Studios</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => { resetForm(); setShowCreate(true); }}
            >
              New Studio
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
            </div>
          ) : studios.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-2xl flex items-center justify-center">
                <FolderOpen size={28} className="text-violet-500" />
              </div>
              <p className="font-bold text-slate-700 mb-1">No studios yet</p>
              <p className="text-sm text-slate-400 mb-4">Create a studio to organize your projects</p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => { resetForm(); setShowCreate(true); }}
              >
                Create First Studio
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {studios.map(studio => (
                <div
                  key={studio.id}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => setExpandedStudio(expandedStudio === studio.id ? null : studio.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {expandedStudio === studio.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectStudio?.(studio)}>
                      <h3 className="font-bold text-slate-800 truncate">{studio.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{studio.description || 'No description'}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full shrink-0">
                      {studio.projects.length} project{studio.projects.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => handleTogglePublic(studio)}
                      className="p-1.5 rounded-lg transition-colors"
                      title={studio.isPublic ? 'Public' : 'Private'}
                    >
                      {studio.isPublic ? (
                        <Eye size={16} className="text-emerald-500" />
                      ) : (
                        <EyeOff size={16} className="text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(studio)}
                      className="p-1.5 text-slate-400 hover:text-violet-500 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(studio.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {expandedStudio === studio.id && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      {studio.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {studio.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {studio.projects.length === 0 ? (
                        <p className="text-sm text-slate-400 py-2">No projects in this studio yet.</p>
                      ) : (
                        <div className="space-y-1">
                          {studio.projects.map((pid, idx) => (
                            <div key={pid} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-slate-50">
                              <GripVertical size={14} className="text-slate-300 shrink-0" />
                              <span className="text-sm text-slate-700 flex-1 truncate">{getProjectName(pid)}</span>
                              <button
                                onClick={() => handleMoveProject(studio.id, idx, 'up')}
                                disabled={idx === 0}
                                className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                onClick={() => handleMoveProject(studio.id, idx, 'down')}
                                disabled={idx === studio.projects.length - 1}
                                className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                              >
                                <ChevronDown size={12} />
                              </button>
                              <button
                                onClick={() => handleRemoveProject(studio.id, pid)}
                                className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal open={showCreate} onClose={resetForm} title={editingStudio ? 'Edit Studio' : 'Create Studio'} size="md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="My Awesome Studio"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="What's this studio about?"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="games, tutorials, favorites"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={editingStudio ? handleEdit : handleCreate}>
                {editingStudio ? 'Save Changes' : 'Create Studio'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default StudioManager;
