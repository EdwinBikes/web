export enum View {
    Portfolio = 'PORTFOLIO',
    AIEditor = 'AI_EDITOR',
    AIVideoGenerator = 'AI_VIDEO_GENERATOR',
}

export interface MediaItem {
  id: number;
  type: 'image' | 'video';
  src: string;
  title: string;
  description: string;
}
