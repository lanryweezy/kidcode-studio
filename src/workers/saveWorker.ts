import { compress } from 'lz-string';

interface SaveMessage {
  type: 'save';
  project: unknown;
  thumbnail?: string;
}

self.onmessage = (e: MessageEvent<SaveMessage>) => {
  if (e.data.type === 'save') {
    const { project, thumbnail } = e.data;
    try {
      const projectWithThumb = thumbnail
        ? { ...project as Record<string, unknown>, thumbnail }
        : project;
      const compressed = compress(JSON.stringify(projectWithThumb));
      self.postMessage({ type: 'saved', compressed, success: true });
    } catch (error) {
      self.postMessage({ type: 'saved', success: false, error: (error as Error).message });
    }
  }
};

export {};
