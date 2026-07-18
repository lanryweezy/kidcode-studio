import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GalleryProject, GalleryComment, GallerySortBy, GalleryFilter } from '../types/gallery';
import { AppMode } from '../types/enums';
import { trackFeatureUse } from './kidcodeAnalytics';

interface GalleryDB extends DBSchema {
  projects: {
    key: string;
    value: GalleryProject;
    indexes: {
      createdAt: number;
      likes: number;
      mode: string;
    };
  };
  comments: {
    key: string;
    value: GalleryComment;
    indexes: {
      projectId: string;
      createdAt: number;
    };
  };
  likes: {
    key: string;
    value: { projectId: string; timestamp: number };
  };
}

const DB_NAME = 'KidCodeGalleryDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<GalleryDB> | null = null;

const getDB = async (): Promise<IDBPDatabase<GalleryDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<GalleryDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const projectStore = database.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('createdAt', 'createdAt');
      projectStore.createIndex('likes', 'likes');
      projectStore.createIndex('mode', 'mode');

      const commentStore = database.createObjectStore('comments', { keyPath: 'id' });
      commentStore.createIndex('projectId', 'projectId');
      commentStore.createIndex('createdAt', 'createdAt');

      database.createObjectStore('likes', { keyPath: 'projectId' });
    },
  });

  return dbInstance;
};

const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐰', '🐻', '🐼', '🦄', '🐯'];
const AUTHOR_NAMES = ['CodyKid', 'CodeQueen', 'MakerMax', 'RobotBob', 'JuniorDev', 'SoundWave', 'PixelPro', 'GameWizard', 'TechTiger', 'BrainyBot'];

const AUTHOR_STORAGE_KEY = 'kidcode_gallery_author';

const getOrCreateAuthor = (): { name: string; avatar: string } => {
  const stored = localStorage.getItem(AUTHOR_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through
    }
  }
  const author = {
    name: AUTHOR_NAMES[Math.floor(Math.random() * AUTHOR_NAMES.length)],
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
  };
  localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify(author));
  return author;
};

const generateAuthor = (): { name: string; avatar: string } => getOrCreateAuthor();

export const publishProject = async (
  projectData: any,
  name: string,
  description: string,
  mode: AppMode,
  tags: string[] = [],
  thumbnail?: string,
  authorOverride?: { name: string; avatar: string }
): Promise<GalleryProject> => {
  const db = await getDB();
  const author = authorOverride || generateAuthor();
  const now = Date.now();

  const project: GalleryProject = {
    id: crypto.randomUUID(),
    name,
    description,
    mode,
    thumbnail,
    author: author.name,
    authorAvatar: author.avatar,
    likes: 0,
    views: 0,
    createdAt: now,
    updatedAt: now,
    tags,
    isRemix: false,
    projectData,
  };

  await db.put('projects', project);
  trackFeatureUse('project_published');
  return project;
};

export const getGalleryProjects = async (
  sortBy: GallerySortBy = 'trending',
  filter: GalleryFilter = 'all',
  searchQuery: string = ''
): Promise<GalleryProject[]> => {
  const db = await getDB();
  let projects: GalleryProject[];

  if (filter !== 'all') {
    projects = await db.getAllFromIndex('projects', 'mode', filter);
  } else {
    projects = await db.getAll('projects');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (sortBy) {
    case 'trending':
      projects.sort((a, b) => {
        const scoreA = a.likes * 2 + a.views + (Date.now() - a.createdAt < 86400000 ? 1000 : 0);
        const scoreB = b.likes * 2 + b.views + (Date.now() - b.createdAt < 86400000 ? 1000 : 0);
        return scoreB - scoreA;
      });
      break;
    case 'recent':
      projects.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'most_liked':
      projects.sort((a, b) => b.likes - a.likes);
      break;
  }

  return projects;
};

export const getProjectById = async (id: string): Promise<GalleryProject | null> => {
  const db = await getDB();
  return (await db.get('projects', id)) || null;
};

export const likeProject = async (id: string): Promise<void> => {
  const db = await getDB();
  const project = await db.get('projects', id);
  if (!project) return;

  const existingLike = await db.get('likes', id);
  if (!existingLike) {
    project.likes += 1;
    const tx = db.transaction(['projects', 'likes'], 'readwrite');
    await Promise.all([
      tx.objectStore('projects').put(project),
      tx.objectStore('likes').put({ projectId: id, timestamp: Date.now() }),
      tx.done,
    ]);
    trackFeatureUse('project_liked');
  }
};

export const unlikeProject = async (id: string): Promise<void> => {
  const db = await getDB();
  const project = await db.get('projects', id);
  if (!project) return;

  const existingLike = await db.get('likes', id);
  if (existingLike) {
    project.likes = Math.max(0, project.likes - 1);
    const tx = db.transaction(['projects', 'likes'], 'readwrite');
    await Promise.all([
      tx.objectStore('projects').put(project),
      tx.objectStore('likes').delete(id),
      tx.done,
    ]);
  }
};

export const isProjectLiked = async (id: string): Promise<boolean> => {
  const db = await getDB();
  const like = await db.get('likes', id);
  return !!like;
};

export const incrementViews = async (id: string): Promise<void> => {
  const db = await getDB();
  const project = await db.get('projects', id);
  if (!project) return;
  project.views += 1;
  await db.put('projects', project);
  trackFeatureUse('project_viewed');
};

export const addComment = async (
  projectId: string,
  text: string
): Promise<GalleryComment> => {
  const db = await getDB();
  const author = generateAuthor();

  const comment: GalleryComment = {
    id: crypto.randomUUID(),
    projectId,
    author: author.name,
    authorAvatar: author.avatar,
    text,
    createdAt: Date.now(),
    likes: 0,
  };

  await db.put('comments', comment);
  trackFeatureUse('comment_added');
  return comment;
};

export const getComments = async (projectId: string): Promise<GalleryComment[]> => {
  const db = await getDB();
  const comments = await db.getAllFromIndex('comments', 'projectId', projectId);
  return comments.sort((a, b) => b.createdAt - a.createdAt);
};

export const remixProject = async (id: string): Promise<GalleryProject | null> => {
  const db = await getDB();
  const original = await db.get('projects', id);
  if (!original) return null;

  const author = generateAuthor();
  const now = Date.now();

  const remix: GalleryProject = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Remix)`,
    author: author.name,
    authorAvatar: author.avatar,
    likes: 0,
    views: 0,
    createdAt: now,
    updatedAt: now,
    isRemix: true,
    remixOf: original.id,
    projectData: JSON.parse(JSON.stringify(original.projectData)),
  };

  await db.put('projects', remix);
  trackFeatureUse('project_remixed');
  return remix;
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await getDB();
  const comments = await db.getAllFromIndex('comments', 'projectId', id);
  const tx = db.transaction(['projects', 'comments'], 'readwrite');
  await Promise.all([
    tx.objectStore('projects').delete(id),
    ...comments.map(c => tx.objectStore('comments').delete(c.id)),
    tx.done,
  ]);
};

export const getMyProjects = async (): Promise<GalleryProject[]> => {
  const stored = localStorage.getItem(AUTHOR_STORAGE_KEY);
  if (!stored) return [];
  const author = JSON.parse(stored);
  const projects = await getGalleryProjects('recent');
  return projects.filter(p => p.author === author.name);
};

export const getTrendingProjects = async (limit = 8): Promise<GalleryProject[]> => {
  const projects = await getGalleryProjects('trending');
  return projects.slice(0, limit);
};

export const getRecentProjects = async (limit = 8): Promise<GalleryProject[]> => {
  const projects = await getGalleryProjects('recent');
  return projects.slice(0, limit);
};

export const searchProjects = async (query: string): Promise<GalleryProject[]> => {
  return getGalleryProjects('trending', 'all', query);
};

export const initGalleryWithSamples = async (samples: any[]): Promise<void> => {
  const db = await getDB();
  const count = await db.count('projects');
  if (count > 0) return;

  for (const sample of samples) {
    await db.put('projects', sample);
  }
};

export const getProjectCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('projects');
};

export const clearGalleryDB = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('projects');
  await db.clear('comments');
  await db.clear('likes');
};
