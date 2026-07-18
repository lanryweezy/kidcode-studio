import React, { useState, useEffect, useCallback } from 'react';
import { GalleryProject, GalleryComment } from '../types/gallery';
import {
  getProjectById,
  likeProject,
  unlikeProject,
  isProjectLiked,
  incrementViews,
  addComment,
  getComments,
  remixProject,
} from '../services/galleryService';
import { useStore } from '../store/useStore';
import { MODE_CONFIG } from '../constants';
import { AppMode } from '../types';
import { playSoundEffect } from '../services/soundService';
import { updateCreatorScore, addXP } from '../services/gamificationService';
import { trackFeatureUse } from '../services/kidcodeAnalytics';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  Eye,
  MessageCircle,
  GitFork,
  Share2,
  Play,
  Copy,
  CheckCircle,
  Send,
  Clock,
} from 'lucide-react';

interface ProjectDetailModalProps {
  projectId: string;
  onClose: () => void;
  onRemix?: (project: GalleryProject) => void;
  onPlay?: (project: GalleryProject) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  projectId,
  onClose,
  onRemix,
  onPlay,
}) => {
  const [project, setProject] = useState<GalleryProject | null>(null);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setProject: loadProject, setShowGallery } = useStore();

  useEffect(() => {
    const load = async () => {
      const proj = await getProjectById(projectId);
      if (proj) {
        setProject(proj);
        setLikeCount(proj.likes);
        await incrementViews(projectId);
        const isLiked = await isProjectLiked(projectId);
        setLiked(isLiked);
        const cmts = await getComments(projectId);
        setComments(cmts);
      }
      setIsLoading(false);
    };
    load();
  }, [projectId]);

  const handleLike = useCallback(async () => {
    if (!project) return;
    if (liked) {
      await unlikeProject(project.id);
      setLikeCount((c) => Math.max(0, c - 1));
      setLiked(false);
    } else {
      await likeProject(project.id);
      setLikeCount((c) => c + 1);
      setLiked(true);
      updateCreatorScore('like');
      addXP(5);
      playSoundEffect('coin');

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0.7 },
        colors: ['#f43f5e', '#ec4899', '#d946ef'],
      });
    }
  }, [project, liked]);

  const handleRemix = useCallback(async () => {
    if (!project) return;
    const remixed = await remixProject(project.id);
    if (remixed) {
      if (remixed.projectData) {
        loadProject({
          id: remixed.id,
          name: remixed.name,
          mode: remixed.mode,
          lastEdited: Date.now(),
          data: remixed.projectData,
        });
      }
      onRemix?.(remixed);
      setShowGallery(false);
    }
  }, [project, loadProject, onRemix, setShowGallery]);

  const handlePlay = useCallback(() => {
    if (!project) return;
    if (project.projectData) {
      loadProject({
        id: crypto.randomUUID(),
        name: project.name,
        mode: project.mode,
        lastEdited: Date.now(),
        data: project.projectData,
      });
      setShowGallery(false);
    }
    onPlay?.(project);
  }, [project, loadProject, onPlay, setShowGallery]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}?gallery=${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      playSoundEffect('coin');
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [projectId]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !project) return;
    const comment = await addComment(project.id, newComment.trim());
    setComments((prev) => [comment, ...prev]);
    setNewComment('');
    playSoundEffect('click');
  }, [newComment, project]);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!open) return null;
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-12 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const modeConfig = MODE_CONFIG[project.mode];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10 shadow-md"
        >
          <X size={20} />
        </button>

        {project.thumbnail ? (
          <div className="relative h-56 overflow-hidden rounded-t-3xl">
            <img
              src={project.thumbnail}
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className={`relative h-56 rounded-t-3xl ${modeConfig.color} flex items-center justify-center`}>
            <div className="text-white/20">
              {React.createElement(modeConfig.icon, { size: 80 })}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest ${modeConfig.color}`}>
                  {modeConfig.label}
                </span>
                {project.isRemix && (
                  <span className="text-[10px] font-black px-3 py-1 rounded-full text-white bg-amber-500 uppercase tracking-widest">
                    Remix
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-800 mt-2">{project.name}</h2>
              <p className="text-slate-500 text-sm mt-1">{project.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm">
                {project.authorAvatar}
              </div>
              <span className="text-sm font-medium text-slate-600">
                by <span className="text-violet-600 font-bold">{project.author}</span>
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Heart size={14} className={liked ? 'text-rose-500 fill-current' : ''} />
                {likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {project.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {comments.length}
              </span>
            </div>
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.tags.map((tag, i) => (
                <span key={i} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={handlePlay}
              className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" /> Play
            </button>
            <button
              onClick={handleRemix}
              className="flex-1 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <GitFork size={18} /> Remix
            </button>
            <button
              onClick={handleShare}
              className="py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              {isCopied ? <CheckCircle size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            </button>
            <button
              onClick={handleLike}
              className={`py-3 px-4 font-bold rounded-xl transition-all active:scale-[0.98] ${
                liked
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart size={18} className={liked ? 'fill-current' : ''} />
            </button>
          </div>

          {isCopied && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm text-emerald-700 font-medium text-center animate-in fade-in slide-in-from-top-2">
              Link copied to clipboard!
            </div>
          )}

          <div className="border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageCircle size={16} /> Comments ({comments.length})
            </h3>

            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Send size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white text-xs shrink-0">
                      {comment.authorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-700">{comment.author}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock size={10} />
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
