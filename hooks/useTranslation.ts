import { useAppStore } from "@/store/useAppStore";
import { getTranslation, TranslationKey } from "@/translations";

export function useTranslation() {
  const { language = "en" } = useAppStore();

  const t = (key: TranslationKey): string => {
    // Ensure language is defined, default to English if not
    const safeLanguage = language || "en";
    return getTranslation(key, safeLanguage);
  };

  return { t, language };
}