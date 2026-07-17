export interface Studio {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  projects: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isPublic: boolean;
  likes: number;
  views: number;
}
