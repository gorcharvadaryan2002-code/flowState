export interface Project {
  id: string;
  title: string;
  lyrics: string;
  audioBlob?: Blob;
  audioUrl?: string;
  createdAt: number;
  updatedAt: number;
  coverArtUrl?: string;
  artistName?: string;
  status: 'draft' | 'published';
}

export enum StudioTab {
  WRITE = 'WRITE',
  RECORD = 'RECORD',
  PUBLISH = 'PUBLISH'
}

export interface AiSuggestion {
  type: 'rhyme' | 'line' | 'feedback';
  content: string;
}
