import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DiagnosisResult } from "@/types/diagnosis";

interface AppState {
  language: string;
  diagnosisHistory: DiagnosisResult[];
  setLanguage: (language: string) => void;
  addDiagnosisResult: (result: DiagnosisResult) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en",
      diagnosisHistory: [],
      setLanguage: (language) => {
        set({ language });
        // Force a reload of the current screen to apply translations immediately
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            // This will trigger a re-render of all components using the language
            set(state => ({ language: state.language }));
          }, 100);
        }
      },
      addDiagnosisResult: (result) =>
        set((state) => ({
          diagnosisHistory: [result, ...state.diagnosisHistory].slice(0, 20)
        })),
      clearHistory: () => set({ diagnosisHistory: [] }),
    }),
    {
      name: "agriaid-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);