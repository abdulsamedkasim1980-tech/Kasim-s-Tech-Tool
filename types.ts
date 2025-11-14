
export interface Character {
  id: number;
  image: File | null;
  imageBase64: string | null;
  isSelected: boolean;
}

export interface PromptItem {
  id: string;
  value: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageBase64: string;
  charactersUsed: number[];
  timestamp: Date;
}

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3";
