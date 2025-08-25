import { translations as enTranslations } from './en';
import { translations as hiTranslations } from './hi';
import { translations as teTranslations } from './te';
import { translations as knTranslations } from './kn';
import { translations as taTranslations } from './ta';
import { translations as mrTranslations } from './mr';
import { Translations } from '@/types/translations';

export type TranslationKey = keyof Translations;

export const translations: Record<string, Translations> = {
  en: enTranslations as Translations,
  hi: hiTranslations as Translations,
  te: teTranslations as Translations,
  kn: knTranslations as Translations,
  ta: taTranslations as Translations,
  mr: mrTranslations as Translations
};

export function getTranslation(key: TranslationKey, language?: string): string {
  // Handle undefined language or unsupported language
  if (!language || !translations[language as keyof typeof translations]) {
    console.log(`Using default English translation for key "${key}" (language: ${language || 'undefined'})`);
    return translations.en[key] || key;
  }

  // Get translations for the specified language
  const langTranslations = translations[language as keyof typeof translations];

  // Return the translation or fall back to English if not found
  return langTranslations[key] || translations.en[key] || key;
}