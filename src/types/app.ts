
export interface AppElement {
  id: string;
  blockId?: string;
  type: 'button' | 'text' | 'input' | 'image' | 'switch' | 'slider' | 'checkbox' | 'progress' | 'video' | 'map' | 'chart' | 'date' | 'camera' | 'drawing_canvas' | 'list' | 'divider' | 'spacer' | 'color_picker' | 'qr_code' | 'audio_recorder' | 'card' | 'link' | 'progress_bar' | 'badge' | 'avatar' | 'chat_bubble' | 'news_feed';
  content: string;
  actionMessage?: string;
  targetScreen?: string;
  // Styling & Binding
  color?: string;
  textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  variableName?: string;
  max?: number;
  min?: number;
  step?: number;
  value?: number;
  value2?: number;
  placeholder?: string;
  // Additional properties for extended components
  icon?: string;
  inputType?: string;
  imageUrl?: string;
  aspectRatio?: string | number;
  height?: number;
  url?: string;
  alignment?: 'left' | 'right' | 'center';
  text?: string;
  text2?: string;
  listName?: string;
  varName?: string;
  condition?: string;
  pin?: number;
  angle?: number;
  speed?: number;
  state?: boolean;
  ssid?: string;
  password?: string;
  ssid2?: string;
  message?: string;
  varName2?: string;
}

export interface AppState {
  title: string;
  backgroundColor: string;
  activeScreen: string;
  screens: Record<string, AppElement[]>;
  score: number;
  variables: Record<string, any>;
  // UI State
  isCollapsed?: boolean;
  activeLevelTool?: string; // Relaxed type to allow new entities
}
