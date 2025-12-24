
export enum ComponentType {
  HEADING = 'HEADING',
  TEXT_INPUT = 'TEXT_INPUT',
  BUTTON = 'BUTTON',
  RESULT_DISPLAY = 'RESULT_DISPLAY',
  VIDEO_INPUT = 'VIDEO_INPUT',
  VIDEO_GEN = 'VIDEO_GEN',
  VISUAL_STYLE_SELECTOR = 'VISUAL_STYLE_SELECTOR'
}

export interface AppElement {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
}

export interface AIConfig {
  systemInstruction: string;
  temperature: number;
  model: string;
}

export interface AppConfig {
  name: string;
  elements: AppElement[];
  aiConfig: AIConfig;
}

export enum ViewMode {
  BUILD = 'BUILD',
  PREVIEW = 'PREVIEW'
}
