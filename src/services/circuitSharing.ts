// ============================================================
// Circuit Sharing & Community System
// URL sharing, gallery, clone, ratings, community templates
// ============================================================

import { CircuitComponent, Wire } from '../types';

// === SHARING TYPES ===

export interface SharedCircuit {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  components: CircuitComponent[];
  wires: Wire[];
  thumbnail: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  likes: number;
  downloads: number;
  remixes: number;
  comments: CircuitComment[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface CircuitComment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface CircuitRating {
  overall: number;       // 1-5 stars
  difficulty: number;    // 1-5
  creativity: number;    // 1-5
  educational: number;   // 1-5
  count: number;
}

export interface GalleryFilter {
  category?: string;
  difficulty?: string;
  sortBy?: 'newest' | 'popular' | 'trending' | 'rating';
  search?: string;
}

// === URL SHARING ===

export function encodeCircuitToURL(
  components: CircuitComponent[],
  wires: Wire[],
  name: string
): string {
  const circuitData = {
    n: name,
    c: components.map(c => ({
      t: c.type,
      x: c.x,
      y: c.y,
      p: c.pin,
      r: c.rotation || 0,
    })),
    w: wires.map(w => ({
      f: w.fromComponentId,
      fp: w.fromPin,
      t: w.toComponentId,
      tp: w.toPin,
      c: w.color,
    })),
  };

  const encoded = btoa(JSON.stringify(circuitData));
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?circuit=${encodeURIComponent(encoded)}`;
}

export function decodeCircuitFromURL(url: string): { components: CircuitComponent[]; wires: Wire[]; name: string } | null {
  try {
    const params = new URLSearchParams(new URL(url).search);
    const encoded = params.get('circuit');
    if (!encoded) return null;

    const decoded = JSON.parse(atob(decodeURIComponent(encoded)));

    const components: CircuitComponent[] = decoded.c.map((c: { t: string; x: number; y: number; p: number; r?: number }, i: number) => ({
      id: `shared-${i}`,
      type: c.t,
      x: c.x,
      y: c.y,
      pin: c.p,
      rotation: c.r || 0,
    }));

    const wires: Wire[] = decoded.w.map((w: { f: number; fp: number; t: number; tp: number; c: string }, i: number) => ({
      id: `shared-wire-${i}`,
      fromComponentId: components.find(c => c.x === w.f && c.y === w.f)?.id || w.f,
      fromPin: w.fp,
      toComponentId: components.find(c => c.x === w.t && c.y === w.t)?.id || w.t,
      toPin: w.tp,
      color: w.c,
    }));

    return { components, wires, name: decoded.n || 'Shared Circuit' };
  } catch (e) {
    console.error('Failed to decode circuit URL:', e);
    return null;
  }
}

// === LOCAL STORAGE GALLERY ===

const GALLERY_KEY = 'kidcode_circuit_gallery';

export function getCircuitGallery(): SharedCircuit[] {
  try {
    const stored = localStorage.getItem(GALLERY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCircuitToGallery(circuit: SharedCircuit): void {
  const gallery = getCircuitGallery();
  const existing = gallery.findIndex(c => c.id === circuit.id);
  if (existing >= 0) {
    gallery[existing] = circuit;
  } else {
    gallery.unshift(circuit);
  }
  localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
}

export function deleteCircuitFromGallery(id: string): void {
  const gallery = getCircuitGallery().filter(c => c.id !== id);
  localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
}

export function getCircuitFromGallery(id: string): SharedCircuit | null {
  return getCircuitGallery().find(c => c.id === id) || null;
}

// === COMMUNITY TEMPLATES ===

export const COMMUNITY_TEMPLATES: SharedCircuit[] = [
  {
    id: 'ct-1',
    name: 'LED Blink',
    description: 'Classic first project - blink an LED on and off',
    author: 'KidCode Team',
    authorAvatar: '🤖',
    components: [
      { id: 'ct1-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ct1-led', type: 'LED_RED', x: 100, y: 100, pin: 0, rotation: 0 },
      { id: 'ct1-res', type: 'RESISTOR', x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'cw1', fromComponentId: 'ct1-mc', fromPin: 13, toComponentId: 'ct1-res', toPin: 0, color: '#ef4444' },
      { id: 'cw2', fromComponentId: 'ct1-res', fromPin: 0, toComponentId: 'ct1-led', toPin: 0, color: '#fbbf24' },
    ],
    thumbnail: '💡',
    tags: ['beginner', 'led', 'blinking'],
    difficulty: 'beginner',
    category: 'Basics',
    likes: 1250,
    downloads: 3400,
    remixes: 89,
    comments: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    isPublic: true,
  },
  {
    id: 'ct-2',
    name: 'Temperature Alarm',
    description: 'Sound alarm when temperature exceeds threshold',
    author: 'KidCode Team',
    authorAvatar: '🤖',
    components: [
      { id: 'ct2-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ct2-dht', type: 'DHT11', x: 80, y: 80, pin: 28, rotation: 0 },
      { id: 'ct2-buz', type: 'BUZZER', x: 80, y: 180, pin: 8, rotation: 0 },
      { id: 'ct2-led', type: 'LED_RED', x: 180, y: 80, pin: 0, rotation: 0 },
      { id: 'ct2-res', type: 'RESISTOR', x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'cw1', fromComponentId: 'ct2-mc', fromPin: 2, toComponentId: 'ct2-dht', toPin: 28, color: '#3b82f6' },
      { id: 'cw2', fromComponentId: 'ct2-mc', fromPin: 8, toComponentId: 'ct2-buz', toPin: 8, color: '#fbbf24' },
      { id: 'cw3', fromComponentId: 'ct2-mc', fromPin: 13, toComponentId: 'ct2-res', toPin: 0, color: '#ef4444' },
      { id: 'cw4', fromComponentId: 'ct2-res', fromPin: 0, toComponentId: 'ct2-led', toPin: 0, color: '#ef4444' },
    ],
    thumbnail: '🌡️',
    tags: ['intermediate', 'sensor', 'temperature', 'alarm'],
    difficulty: 'intermediate',
    category: 'Sensors',
    likes: 890,
    downloads: 2100,
    remixes: 56,
    comments: [],
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    isPublic: true,
  },
  {
    id: 'ct-3',
    name: 'Robot Car',
    description: 'Two-motor robot car with obstacle avoidance',
    author: 'MakerKids',
    authorAvatar: '🚗',
    components: [
      { id: 'ct3-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ct3-m1', type: 'MOTOR_DC', x: 80, y: 80, pin: 6, rotation: 0 },
      { id: 'ct3-m2', type: 'MOTOR_DC', x: 80, y: 200, pin: 5, rotation: 0 },
      { id: 'ct3-sonic', type: 'ULTRASONIC', x: 180, y: 80, pin: 92, rotation: 0 },
      { id: 'ct3-trn1', type: 'TRANSISTOR_NPN', x: 180, y: 150, pin: 0, rotation: 0 },
      { id: 'ct3-res1', type: 'RESISTOR', x: 250, y: 150, pin: 0, rotation: 0, resistance: 1000 },
    ],
    wires: [
      { id: 'cw1', fromComponentId: 'ct3-mc', fromPin: 6, toComponentId: 'ct3-res1', toPin: 0, color: '#fbbf24' },
      { id: 'cw2', fromComponentId: 'ct3-res1', fromPin: 0, toComponentId: 'ct3-trn1', toPin: 0, color: '#fbbf24' },
      { id: 'cw3', fromComponentId: 'ct3-mc', fromPin: 2, toComponentId: 'ct3-sonic', toPin: 92, color: '#3b82f6' },
    ],
    thumbnail: '🤖',
    tags: ['advanced', 'robot', 'motor', 'sensor'],
    difficulty: 'advanced',
    category: 'Robotics',
    likes: 2100,
    downloads: 4500,
    remixes: 120,
    comments: [],
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
    isPublic: true,
  },
  {
    id: 'ct-4',
    name: 'Weather Station',
    description: 'Complete weather station with temperature, humidity, and pressure',
    author: 'ScienceLab',
    authorAvatar: '🌤️',
    components: [
      { id: 'ct4-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ct4-dht', type: 'DHT22', x: 80, y: 80, pin: 28, rotation: 0 },
      { id: 'ct4-lcd', type: 'LCD', x: 100, y: 250, pin: 95, rotation: 0 },
      { id: 'ct4-led', type: 'LED_GREEN', x: 180, y: 80, pin: 0, rotation: 0 },
      { id: 'ct4-res', type: 'RESISTOR', x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'cw1', fromComponentId: 'ct4-mc', fromPin: 2, toComponentId: 'ct4-dht', toPin: 28, color: '#3b82f6' },
      { id: 'cw2', fromComponentId: 'ct4-mc', fromPin: 4, toComponentId: 'ct4-lcd', toPin: 95, color: '#22c55e' },
      { id: 'cw3', fromComponentId: 'ct4-mc', fromPin: 13, toComponentId: 'ct4-res', toPin: 0, color: '#ef4444' },
      { id: 'cw4', fromComponentId: 'ct4-res', fromPin: 0, toComponentId: 'ct4-led', toPin: 0, color: '#ef4444' },
    ],
    thumbnail: '🌤️',
    tags: ['intermediate', 'weather', 'sensor', 'lcd'],
    difficulty: 'intermediate',
    category: 'Science',
    likes: 1560,
    downloads: 3200,
    remixes: 78,
    comments: [],
    createdAt: '2024-04-12',
    updatedAt: '2024-04-12',
    isPublic: true,
  },
  {
    id: 'ct-5',
    name: 'RGB Mood Light',
    description: 'Mix colors with potentiometers for mood lighting',
    author: 'LightArtist',
    authorAvatar: '🎨',
    components: [
      { id: 'ct5-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ct5-rgb', type: 'RGB_LED', x: 100, y: 100, pin: 10, rotation: 0 },
      { id: 'ct5-p1', type: 'POTENTIOMETER', x: 80, y: 250, pin: 97, rotation: 0 },
      { id: 'ct5-p2', type: 'POTENTIOMETER', x: 180, y: 250, pin: 97, rotation: 0 },
      { id: 'ct5-p3', type: 'POTENTIOMETER', x: 280, y: 250, pin: 97, rotation: 0 },
    ],
    wires: [
      { id: 'cw1', fromComponentId: 'ct5-mc', fromPin: 10, toComponentId: 'ct5-rgb', toPin: 10, color: '#fbbf24' },
      { id: 'cw2', fromComponentId: 'ct5-mc', fromPin: 14, toComponentId: 'ct5-p1', toPin: 97, color: '#ef4444' },
      { id: 'cw3', fromComponentId: 'ct5-mc', fromPin: 15, toComponentId: 'ct5-p2', toPin: 97, color: '#22c55e' },
      { id: 'cw4', fromComponentId: 'ct5-mc', fromPin: 16, toComponentId: 'ct5-p3', toPin: 97, color: '#3b82f6' },
    ],
    thumbnail: '🎨',
    tags: ['intermediate', 'rgb', 'color', 'potentiometer'],
    difficulty: 'intermediate',
    category: 'Creative',
    likes: 1890,
    downloads: 3800,
    remixes: 95,
    comments: [],
    createdAt: '2024-05-20',
    updatedAt: '2024-05-20',
    isPublic: true,
  },
];

// === SHARING FUNCTIONS ===

export function shareCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  name: string
): { url: string; shareText: string } {
  const url = encodeCircuitToURL(components, wires, name);
  const shareText = `Check out my circuit "${name}" on KidCode Studio! ${url}`;

  return { url, shareText };
}

export function cloneCircuit(circuit: SharedCircuit): SharedCircuit {
  return {
    ...circuit,
    id: `clone-${Date.now()}`,
    name: `${circuit.name} (Copy)`,
    author: 'You',
    authorAvatar: '👤',
    likes: 0,
    downloads: 0,
    remixes: circuit.remixes + 1,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function rateCircuit(
  circuitId: string,
  rating: CircuitRating
): void {
  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (circuit) {
    (circuit as any).rating = rating;
    saveCircuitToGallery(circuit);
  }
}

export function addComment(
  circuitId: string,
  author: string,
  text: string
): void {
  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (circuit) {
    circuit.comments.push({
      id: `comment-${Date.now()}`,
      author,
      authorAvatar: '👤',
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
    });
    saveCircuitToGallery(circuit);
  }
}

export function likeCircuit(circuitId: string): void {
  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (circuit) {
    circuit.likes++;
    saveCircuitToGallery(circuit);
  }
}

// === GALLERY FILTERING ===

export function filterGallery(
  circuits: SharedCircuit[],
  filter: GalleryFilter
): SharedCircuit[] {
  let filtered = [...circuits];

  if (filter.category) {
    filtered = filtered.filter(c => c.category === filter.category);
  }

  if (filter.difficulty) {
    filtered = filtered.filter(c => c.difficulty === filter.difficulty);
  }

  if (filter.search) {
    const search = filter.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  switch (filter.sortBy) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'popular':
      filtered.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'trending':
      filtered.sort((a, b) => b.likes - a.likes);
      break;
    case 'rating':
      filtered.sort((a, b) => ((b as any).rating?.overall || 0) - ((a as any).rating?.overall || 0));
      break;
  }

  return filtered;
}

// === PUBLIC CIRCUIT GALLERY ===

export function getPublicGallery(): SharedCircuit[] {
  const allCircuits = [...COMMUNITY_TEMPLATES, ...getCircuitGallery()];
  return allCircuits.filter(c => c.isPublic);
}

export function getPublicGalleryByCategory(category: string): SharedCircuit[] {
  return getPublicGallery().filter(c => c.category === category);
}

export function getPublicGalleryByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): SharedCircuit[] {
  return getPublicGallery().filter(c => c.difficulty === difficulty);
}

export function searchPublicGallery(query: string): SharedCircuit[] {
  const search = query.toLowerCase();
  return getPublicGallery().filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.description.toLowerCase().includes(search) ||
    c.tags.some(t => t.toLowerCase().includes(search))
  );
}

export function getTopRatedCircuits(limit: number = 10): SharedCircuit[] {
  return getPublicGallery()
    .sort((a, b) => {
      const ratingA = (a as any).rating?.overall || 0;
      const ratingB = (b as any).rating?.overall || 0;
      return ratingB - ratingA;
    })
    .slice(0, limit);
}

export function getMostDownloadedCircuits(limit: number = 10): SharedCircuit[] {
  return getPublicGallery()
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

export function getRecentCircuits(limit: number = 10): SharedCircuit[] {
  return getPublicGallery()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// === CIRCUIT FORKING ===

export function forkCircuit(
  sourceCircuit: SharedCircuit,
  newAuthor: string = 'You'
): SharedCircuit {
  const forked = cloneCircuit(sourceCircuit);
  forked.author = newAuthor;
  forked.authorAvatar = '👤';
  forked.name = `${sourceCircuit.name} (Fork)`;
  forked.description = `Forked from "${sourceCircuit.name}" by ${sourceCircuit.author}`;
  forked.likes = 0;
  forked.downloads = 0;
  forked.remixes = 0;
  forked.comments = [];
  forked.createdAt = new Date().toISOString();
  forked.updatedAt = new Date().toISOString();
  return forked;
}

export function getForkCount(circuitId: string): number {
  const gallery = getCircuitGallery();
  return gallery.filter(c =>
    c.description.includes(`Forked from`) && c.description.includes(circuitId)
  ).length;
}

// === CIRCUIT VERSIONING ===

export interface CircuitVersion {
  id: string;
  circuitId: string;
  version: number;
  components: CircuitComponent[];
  wires: Wire[];
  timestamp: string;
  message: string;
  author: string;
}

const VERSION_KEY = 'kidcode_circuit_versions';

export function getCircuitVersions(circuitId: string): CircuitVersion[] {
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    const versions: CircuitVersion[] = stored ? JSON.parse(stored) : [];
    return versions.filter(v => v.circuitId === circuitId)
      .sort((a, b) => b.version - a.version);
  } catch {
    return [];
  }
}

export function saveCircuitVersion(
  circuitId: string,
  components: CircuitComponent[],
  wires: Wire[],
  message: string,
  author: string
): CircuitVersion {
  const versions = getCircuitVersions(circuitId);
  const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;

  const newVersion: CircuitVersion = {
    id: `version-${Date.now()}`,
    circuitId,
    version: nextVersion,
    components: [...components],
    wires: [...wires],
    timestamp: new Date().toISOString(),
    message,
    author,
  };

  const allVersions = getAllCircuitVersions();
  allVersions.push(newVersion);
  localStorage.setItem(VERSION_KEY, JSON.stringify(allVersions));

  return newVersion;
}

export function getCircuitVersion(circuitId: string, version: number): CircuitVersion | undefined {
  return getCircuitVersions(circuitId).find(v => v.version === version);
}

export function deleteCircuitVersions(circuitId: string): void {
  const allVersions = getAllCircuitVersions();
  const filtered = allVersions.filter(v => v.circuitId !== circuitId);
  localStorage.setItem(VERSION_KEY, JSON.stringify(filtered));
}

function getAllCircuitVersions(): CircuitVersion[] {
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// === ENHANCED COMMENTS ===

export function addCommentWithReply(
  circuitId: string,
  author: string,
  text: string,
  parentCommentId?: string
): CircuitComment {
  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (!circuit) {
    return {
      id: `comment-${Date.now()}`,
      author,
      authorAvatar: '👤',
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
  }

  const newComment: CircuitComment = {
    id: `comment-${Date.now()}`,
    author,
    authorAvatar: '👤',
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  circuit.comments.push(newComment);
  saveCircuitToGallery(circuit);
  return newComment;
}

export function likeComment(circuitId: string, commentId: string): void {
  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (circuit) {
    const comment = circuit.comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes++;
      saveCircuitToGallery(circuit);
    }
  }
}

export function deleteComment(circuitId: string, commentId: string): void {
  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (circuit) {
    circuit.comments = circuit.comments.filter(c => c.id !== commentId);
    saveCircuitToGallery(circuit);
  }
}

export function getCommentsByAuthor(circuitId: string, author: string): CircuitComment[] {
  const circuit = getCircuitFromGallery(circuitId);
  return circuit ? circuit.comments.filter(c => c.author === author) : [];
}

// === ENHANCED RATINGS ===

export function rateCircuitEnhanced(
  circuitId: string,
  overall: number,
  difficulty: number,
  creativity: number,
  educational: number
): CircuitRating {
  const rating: CircuitRating = {
    overall: Math.max(1, Math.min(5, overall)),
    difficulty: Math.max(1, Math.min(5, difficulty)),
    creativity: Math.max(1, Math.min(5, creativity)),
    educational: Math.max(1, Math.min(5, educational)),
    count: 1,
  };

  const gallery = getCircuitGallery();
  const circuit = gallery.find(c => c.id === circuitId);
  if (circuit) {
    const existingRating = (circuit as any).rating as CircuitRating | undefined;
    if (existingRating) {
      rating.count = existingRating.count + 1;
      rating.overall = (existingRating.overall * existingRating.count + overall) / rating.count;
      rating.difficulty = (existingRating.difficulty * existingRating.count + difficulty) / rating.count;
      rating.creativity = (existingRating.creativity * existingRating.count + creativity) / rating.count;
      rating.educational = (existingRating.educational * existingRating.count + educational) / rating.count;
    }
    (circuit as any).rating = rating;
    saveCircuitToGallery(circuit);
  }

  return rating;
}

export function getCircuitAverageRating(circuitId: string): CircuitRating | null {
  const circuit = getCircuitFromGallery(circuitId);
  return circuit ? ((circuit as any).rating as CircuitRating | null) || null : null;
}

export function getTopRatedByCategory(category: string, limit: number = 5): SharedCircuit[] {
  return getPublicGalleryByCategory(category)
    .sort((a, b) => {
      const ratingA = (a as any).rating?.overall || 0;
      const ratingB = (b as any).rating?.overall || 0;
      return ratingB - ratingA;
    })
    .slice(0, limit);
}

// === STATISTICS ===

export function getCircuitStats(): {
  totalCircuits: number;
  totalLikes: number;
  totalDownloads: number;
  totalComments: number;
  totalRatings: number;
  averageRating: number;
  topCategories: { category: string; count: number }[];
} {
  const gallery = getCircuitGallery();
  const allCircuits = [...gallery, ...COMMUNITY_TEMPLATES];

  const categoryCount = new Map<string, number>();
  let totalComments = 0;
  let totalRatings = 0;
  let totalRatingSum = 0;

  allCircuits.forEach(c => {
    categoryCount.set(c.category, (categoryCount.get(c.category) || 0) + 1);
    totalComments += c.comments.length;
    const rating = (c as any).rating as CircuitRating | undefined;
    if (rating) {
      totalRatings += rating.count;
      totalRatingSum += rating.overall * rating.count;
    }
  });

  const topCategories = Array.from(categoryCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalCircuits: allCircuits.length,
    totalLikes: allCircuits.reduce((sum, c) => sum + c.likes, 0),
    totalDownloads: allCircuits.reduce((sum, c) => sum + c.downloads, 0),
    totalComments,
    totalRatings,
    averageRating: totalRatings > 0 ? totalRatingSum / totalRatings : 0,
    topCategories,
  };
}
