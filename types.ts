export interface StoryPanel {
  panel: number;
  storyText: string;
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface StoryGenerationResult {
  panels: StoryPanel[];
  questions: string[];
}
