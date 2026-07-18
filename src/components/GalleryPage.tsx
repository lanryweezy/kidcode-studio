
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { AppMode } from '../types';
import { GalleryProject, GallerySortBy, GalleryFilter } from '../types/gallery';
import {
  MODE_CONFIG,
} from '../constants';
import {
  getGalleryProjects,
  likeProject,
  unlikeProject,
  isProjectLiked,
  remixProject,
  initGalleryWithSamples,
} from '../services/galleryService';
import { getSampleProjects } from '../constants/sampleProjects';
import { generateModePlaceholder } from '../services/thumbnailGenerator';
import { playSoundEffect } from '../services/soundService';
import { updateCreatorScore, addXP } from '../services/gamificationService';
import { trackFeatureUse } from '../services/kidcodeAnalytics';
import {
  Search,
  ArrowLeft,
  Heart,
  GitFork,
  Sparkles,
  Eye,
  MessageCircle,
  TrendingUp,
  Clock,
  ThumbsUp,
  Filter,
  Gamepad2,
  Smartphone,
  Cpu,
  Pickaxe,
  Loader2,
  Plus,
  X,
  Send,
  Play,
  Share2,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const GalleryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { setProject, setShowGallery } = useStore();
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<GallerySortBy>('trending');
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        const samples = getSampleProjects();
        await initGalleryWithSamples(samples);
        setInitialized(true);
      }
      const loaded = await getGalleryProjects(sortBy, filter, search);
      setProjects(loaded);

      const likedSet = new Set<string>();
      for (const p of loaded) {
        if (await isProjectLiked(p.id)) {
          likedSet.add(p.id);
        }
      }
      setLikedProjects(likedSet);
      setIsLoading(false);
    };
    init();
  }, [initialized, sortBy, filter, search]);

  const handleLike = useCallback(
    async (projId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const isLiked = likedProjects.has(projId);

      if (isLiked) {
        await unlikeProject(projId);
        setLikedProjects((prev) => {
          const next = new Set(prev);
          next.delete(projId);
          return next;
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === projId ? { ...p, likes: Math.max(0, p.likes - 1) } : p))
        );
      } else {
        await likeProject(projId);
        setLikedProjects((prev) => new Set(prev).add(projId));
        setProjects((prev) =>
          prev.map((p) => (p.id === projId ? { ...p, likes: p.likes + 1 } : p))
        );
        updateCreatorScore('like');
        addXP(5);
        playSoundEffect('coin');
      }
    },
    [likedProjects]
  );

  const handleRemix = useCallback(
    async (proj: GalleryProject, e: React.MouseEvent) => {
      e.stopPropagation();
      const remixed = await remixProject(proj.id);
      if (remixed && remixed.projectData) {
        setProject({
          id: remixed.id,
          name: remixed.name,
          mode: remixed.mode,
          lastEdited: Date.now(),
          data: remixed.projectData,
        });
        playSoundEffect('powerup');
        setShowGallery(false);
      }
    },
    [setProject, setShowGallery]
  );

  const handleCardClick = useCallback((projId: string) => {
    setSelectedProject(projId);
  }, []);

  const getModeIcon = (mode: AppMode) => {
    switch (mode) {
      case AppMode.GAME:
        return <Gamepad2 size={20} />;
      case AppMode.APP:
        return <Smartphone size={20} />;
      case AppMode.HARDWARE:
        return <Cpu size={20} />;
      case AppMode.MINECRAFT:
        return <Pickaxe size={20} />;
      default:
        return <Gamepad2 size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                Community Gallery <Sparkles className="text-yellow-500" />
              </h1>
              <p className="text-slate-500 font-medium">
                Explore, learn, and remix projects from other kids!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPublishModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Publish Project</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for games, apps, or gadgets..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-violet-400 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl">
              <button
                onClick={() => setSortBy('trending')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  sortBy === 'trending'
                    ? 'bg-violet-500 text-white shadow-lg'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <TrendingUp size={14} /> Trending
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  sortBy === 'recent'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Clock size={14} /> Recent
              </button>
              <button
                onClick={() => setSortBy('most_liked')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  sortBy === 'most_liked'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp size={14} /> Most Liked
              </button>
            </div>
          </div>
        </div>

        {/* Mode Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-lg'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter size={14} className="inline mr-1.5" />
            All
          </button>
          {Object.values(AppMode).map((m) => {
            const config = MODE_CONFIG[m];
            return (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  filter === m
                    ? `${config.color} text-white shadow-lg`
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getModeIcon(m)}
                {config.label.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-violet-500">{projects.length}</div>
            <div className="text-xs text-slate-500 font-bold">Projects</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-rose-500">
              {projects.reduce((sum, p) => sum + p.likes, 0)}
            </div>
            <div className="text-xs text-slate-500 font-bold">Total Likes</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-blue-500">
              {projects.reduce((sum, p) => sum + p.views, 0)}
            </div>
            <div className="text-xs text-slate-500 font-bold">Total Views</div>
          </div>
        </div>

        {/* Project Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-full w-2/3" />
                  <div className="h-3 bg-slate-200 rounded-full w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-3 bg-slate-200 rounded-full w-12" />
                    <div className="h-3 bg-slate-200 rounded-full w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((proj) => {
              const config = MODE_CONFIG[proj.mode];
              return (
                <div
                  key={proj.id}
                  onClick={() => handleCardClick(proj.id)}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {proj.thumbnail ? (
                      <img
                        src={proj.thumbnail}
                        alt={proj.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${config.color} flex items-center justify-center`}
                      >
                        <div className="text-white/20 group-hover:scale-125 transition-transform duration-700">
                          {React.createElement(config.icon, { size: 64 })}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Mode Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full text-white uppercase tracking-widest ${config.color} shadow-md`}
                      >
                        {config.label.split(' ')[0]}
                      </span>
                    </div>

                    {/* Remix Badge */}
                    {proj.isRemix && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-full text-white bg-amber-500 uppercase tracking-widest shadow-md">
                          Remix
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4 z-10">
                      <div className="text-white text-center">
                        <div className="font-bold text-lg">{proj.name}</div>
                        <div className="text-sm opacity-80 line-clamp-2">{proj.description}</div>
                      </div>
                      <button
                        onClick={(e) => handleRemix(proj, e)}
                        className="px-6 py-2.5 bg-white text-slate-900 font-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center gap-2"
                      >
                        <GitFork size={16} /> REMIX
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mb-3 line-clamp-2">
                      {proj.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs">
                          {proj.authorAvatar}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {proj.author}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                        <button
                          onClick={(e) => handleLike(proj.id, e)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedProjects.has(proj.id)
                              ? 'text-rose-500'
                              : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart
                            size={14}
                            className={likedProjects.has(proj.id) ? 'fill-current' : ''}
                          />
                          {proj.likes}
                        </button>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {proj.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={36} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-700 mb-2">No projects yet!</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Be the first to share your creation with the community. Your project could inspire
              thousands of other kids!
            </p>
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Plus size={18} /> Publish Now
            </button>
          </div>
        )}

        {/* Publish CTA (only show when there are projects) */}
        {projects.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white text-center shadow-2xl">
            <Sparkles size={48} className="mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-black mb-2">Share Your Creation!</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Publish your projects to the community gallery and inspire other kids to learn coding.
              Get likes, comments, and remixes!
            </p>
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-8 py-4 bg-white text-violet-600 font-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-2"
            >
              <ThumbsUp size={20} /> Publish Your Project
            </button>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModalInline
          projectId={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Publish Modal Inline */}
      {showPublishModal && (
        <PublishModalInline onClose={() => setShowPublishModal(false)} />
      )}
    </div>
  );
};

const ProjectDetailModalInline: React.FC<{
  projectId: string;
  onClose: () => void;
}> = ({ projectId, onClose }) => {
  const [project, setProject] = useState<GalleryProject | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const store = useStore();

  useEffect(() => {
    const load = async () => {
      const { getProjectById, incrementViews, isProjectLiked, getComments } = await import(
        '../services/galleryService'
      );
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
    };
    load();
  }, [projectId]);

  const handleLike = useCallback(async () => {
    if (!project) return;
    const { likeProject, unlikeProject } = await import('../services/galleryService');
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
    const { remixProject } = await import('../services/galleryService');
    const remixed = await remixProject(project.id);
    if (remixed && remixed.projectData) {
      store.setProject({
        id: remixed.id,
        name: remixed.name,
        mode: remixed.mode,
        lastEdited: Date.now(),
        data: remixed.projectData,
      });
      playSoundEffect('powerup');
      store.setShowGallery(false);
    }
  }, [project, store]);

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
    const { addComment } = await import('../services/galleryService');
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

  if (!project) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-12 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

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
            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
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
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest ${modeConfig.color}`}>
              {modeConfig.label}
            </span>
            {project.isRemix && (
              <span className="text-[10px] font-black px-3 py-1 rounded-full text-white bg-amber-500 uppercase tracking-widest">
                Remix
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-1">{project.name}</h2>
          <p className="text-slate-500 text-sm mb-4">{project.description}</p>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm">
              {project.authorAvatar}
            </div>
            <span className="text-sm font-medium text-slate-600">
              by <span className="text-violet-600 font-bold">{project.author}</span>
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Heart size={14} className={liked ? 'text-rose-500 fill-current' : ''} /> {likeCount}</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {project.views}</span>
              <span className="flex items-center gap-1"><MessageCircle size={14} /> {comments.length}</span>
            </div>
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {project.tags.map((tag, i) => (
                <span key={i} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => {
                if (project.projectData) {
                  store.setProject({
                    id: crypto.randomUUID(),
                    name: project.name,
                    mode: project.mode,
                    lastEdited: Date.now(),
                    data: project.projectData,
                  });
                  store.setShowGallery(false);
                }
              }}
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
                liked ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart size={18} className={liked ? 'fill-current' : ''} />
            </button>
          </div>

          {isCopied && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm text-emerald-700 font-medium text-center">
              Link copied to clipboard!
            </div>
          )}

          <div className="border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageCircle size={16} /> Comments ({comments.length})
            </h3>

            <div className="flex gap-2 mb-4">
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
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white text-xs shrink-0">
                      {comment.authorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-700">{comment.author}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock size={10} /> {formatTimeAgo(comment.createdAt)}
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

const PublishModalInline: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const store = useStore();
  const [name, setName] = useState(store.currentProject?.name || '');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = useCallback(async () => {
    if (!name.trim()) return;
    setIsPublishing(true);
    try {
      const { publishProject } = await import('../services/galleryService');
      await publishProject(
        store.currentProject,
        name.trim(),
        description.trim(),
        store.mode,
        tags.split(',').map((t) => t.trim()).filter(Boolean),
        store.currentProject?.thumbnail
      );
      updateCreatorScore('publish');
      addXP(100);
      playSoundEffect('powerup');
      setIsPublished(true);
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [name, description, tags, store]);

  const modeConfig = MODE_CONFIG[store.mode];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {!isPublished ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${modeConfig.color}`}>
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Publish to Gallery</h2>
                  <p className="text-sm text-slate-500">Share your creation with the community</p>
                </div>
              </div>

              <div className="space-y-5">
                {store.currentProject?.thumbnail && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <img src={store.currentProject.thumbnail} alt="" className="w-full h-40 object-cover rounded-xl" />
                  </div>
                )}

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
                    placeholder="What does your project do?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. platformer, retro, multiplayer"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>

                <button
                  onClick={handlePublish}
                  disabled={!name.trim() || isPublishing}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Publish to Gallery
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Published!</h3>
              <p className="text-slate-500 mb-6">Your project is now live in the Community Gallery!</p>
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

export default GalleryPage;
