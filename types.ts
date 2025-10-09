
export enum View {
    Portfolio = 'PORTFOLIO',
    AIEditor = 'AI_EDITOR',
}

export interface MediaItem {
  id: number;
  type: 'image' | 'video';
  src: string;
  title: string;
  description: string;
}
