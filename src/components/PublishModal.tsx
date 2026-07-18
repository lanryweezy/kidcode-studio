import React, { useState, useCallback } from 'react';
import { AppMode } from '../types';
import { MODE_CONFIG } from '../constants';
import { publishProject } from '../services/galleryService';
import { playSoundEffect } from '../services/soundService';
import { updateCreatorScore, addXP } from '../services/gamificationService';
import { X, Upload, Sparkles, Tag, CheckCircle, Loader2 } from 'lucide-react';

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  currentProject: any;
  mode: AppMode;
  thumbnail?: string;
  onPublished?: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  open,
  onClose,
  currentProject,
  mode,
  thumbnail,
  onPublished,
}) => {
  const [name, setName] = useState(currentProject?.name || '');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handlePublish = useCallback(async () => {
    if (!name.trim()) return;
    setIsPublishing(true);

    try {
      await publishProject(
        currentProject,
        name.trim(),
        description.trim(),
        mode,
        tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnail
      );

      updateCreatorScore('publish');
      addXP(100);
      playSoundEffect('powerup');
      setIsPublished(true);
      setStep(3);
      onPublished?.();
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [name, description, tags, currentProject, mode, thumbnail, onPublished]);

  if (!open) return null;

  const modeConfig = MODE_CONFIG[mode];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${modeConfig.color}`}>
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Publish to Gallery</h2>
              <p className="text-sm text-slate-500">Share your creation with the community</p>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className={`text-xs font-black uppercase tracking-widest ${modeConfig.color.replace('bg-', 'text-')}`}>
                    {modeConfig.label}
                  </span>
                </div>
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="Project preview"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                ) : (
                  <div className={`w-full h-40 rounded-xl ${modeConfig.color} flex items-center justify-center text-white/30`}>
                    <Sparkles size={48} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Give your project a cool name!"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your project do? What makes it special?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-all"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Add Details
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  <Tag size={14} className="inline mr-1" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. platformer, multiplayer, retro"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">Tags help others find your project</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Preview</h4>
                <div className="flex items-center gap-3">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className={`w-16 h-16 rounded-xl ${modeConfig.color} flex items-center justify-center text-white/30`}>
                      <Sparkles size={24} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{description || 'No description'}</p>
                    {tags.trim() && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {tags.split(',').slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Publish to Gallery
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && isPublished && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Published!</h3>
              <p className="text-slate-500 mb-6">
                Your project is now live in the Community Gallery!
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all active:scale-[0.98]"
              >
                View in Gallery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
