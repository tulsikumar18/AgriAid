export type InputMethod = "text" | "image" | "voice";

export type DiagnosisInput = {
  method: InputMethod;
  text?: string;
  image?: string;
  audio?: string;
  language: string;
};

export type DiagnosisResult = {
  species?: string;
  disease: string;
  description: string;
  remedy: string;
  prevention: string;
  confidence: number;
  image?: string;
  timestamp: number;
};