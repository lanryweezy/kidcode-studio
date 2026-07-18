import { AppMode } from './enums';

export interface GalleryProject {
  id: string;
  name: string;
  description: string;
  mode: AppMode;
  thumbnail?: string;
  author: string;
  authorAvatar: string;
  likes: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isRemix: boolean;
  remixOf?: string;
  projectData: any;
}

export interface GalleryComment {
  id: string;
  projectId: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
  likes: number;
}

export type GallerySortBy = 'trending' | 'recent' | 'most_liked';
export type GalleryFilter = 'all' | AppMode;
