export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export interface GenerationParams {
  productImage: ImageFile | null;
  sceneImage: ImageFile | null;
  prompt: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
  timestamp: Date;
}

export interface ApiError {
  message: string;
  code?: string;
}
