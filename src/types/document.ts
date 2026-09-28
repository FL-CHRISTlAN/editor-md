export interface DocItem {
  id: string;
  title: string;
  content: string; // Stored as Markdown source
  html?: string;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'split' | 'editor' | 'markdown';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}
