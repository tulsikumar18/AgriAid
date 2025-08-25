import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LANGUAGES, Language } from "@/constants/languages";
import { useAppStore } from "@/store/useAppStore";
import Colors from "@/constants/colors";
import { Globe } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

export default function LanguageSelector() {
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe size={20} color={Colors.primary} />
        <Text style={styles.title}>{t("selectLanguage")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {LANGUAGES.map((lang: Language) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageButton,
              language === lang.code && styles.selectedLanguage,
            ]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text
              style={[
                styles.languageText,
                language === lang.code && styles.selectedLanguageText,
              ]}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginLeft: 8,
  },
  scrollView: {
    paddingHorizontal: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.lightGreen,
  },
  selectedLanguage: {
    backgroundColor: Colors.primary,
  },
  languageText: {
    color: Colors.text,
    fontWeight: "500",
  },
  selectedLanguageText: {
    color: Colors.card,
  },
});