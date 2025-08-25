import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import LanguageSelector from "@/components/LanguageSelector";
import InputMethodSelector from "@/components/InputMethodSelector";
import TextInputComponent from "@/components/TextInput";
import ImageInput from "@/components/ImageInput";
import VoiceInput from "@/components/VoiceInput";
import DiagnosisResult from "@/components/DiagnosisResult";
import { InputMethod, DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { diagnoseCrop, processTextInput } from "@/utils/api";
import { User } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

export default function DiagnoseScreen() {
  const [inputMethod, setInputMethod] = useState<InputMethod>("text");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResultType | null>(null);
  const { language, addDiagnosisResult } = useAppStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const handleTextSubmit = async (text: string) => {
    if (!text || text.trim() === "") return;

    setIsLoading(true);
    try {
      // Process text input - detect language and translate if needed
      const processedText = await processTextInput(text, language);

      const diagnosisResult = await diagnoseCrop({
        method: "text",
        text: processedText,
        language,
      });

      setResult(diagnosisResult);
      addDiagnosisResult(diagnosisResult);
    } catch (error) {
      console.error("Error diagnosing crop:", error instanceof Error ? error.message : String(error));
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async (imageUri: string) => {
    if (!imageUri) return;

    setIsLoading(true);
    try {
      const diagnosisResult = await diagnoseCrop({
        method: "image",
        image: imageUri,
        language,
      });

      setResult(diagnosisResult);
      addDiagnosisResult(diagnosisResult);
    } catch (error) {
      console.error("Error diagnosing crop:", error instanceof Error ? error.message : String(error));
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSubmit = async (audioUri: string, transcribedText?: string) => {
    if (!audioUri) return;

    setIsLoading(true);
    try {
      const diagnosisResult = await diagnoseCrop({
        method: "voice",
        audio: audioUri,
        text: transcribedText, // Pass the transcribed text if available
        language,
      });

      setResult(diagnosisResult);
      addDiagnosisResult(diagnosisResult);
    } catch (error) {
      console.error("Error diagnosing crop:", error instanceof Error ? error.message : String(error));
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const resetDiagnosis = () => {
    setResult(null);
  };

  if (result) {
    return <DiagnosisResult result={result} onBack={resetDiagnosis} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      enabled
    >
      <Stack.Screen
        options={{
          title: t("appName"),
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/profile")}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
              ) : (
                <User size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="dark" />

      <ScrollView>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop" }}
            style={styles.headerImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(46,125,50,0.7)']}
            style={styles.headerOverlay}
          />
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>{t("smartCropDiagnosis")}</Text>
            <Text style={styles.subHeaderText}>
              {t("identifyPlantDiseases")}
            </Text>
          </View>
        </View>

        <LanguageSelector />

        <View style={styles.diagnosisContainer}>
          <Text style={styles.sectionTitle}>{t("howWouldYouLikeToDiagnose")}</Text>
          <InputMethodSelector
            selectedMethod={inputMethod}
            onSelectMethod={setInputMethod}
          />

          {inputMethod === "text" && (
            <TextInputComponent
              onSubmit={handleTextSubmit}
              isLoading={isLoading}
            />
          )}

          {inputMethod === "image" && (
            <ImageInput
              onSubmit={handleImageSubmit}
              isLoading={isLoading}
            />
          )}

          {inputMethod === "voice" && (
            <VoiceInput
              onSubmit={handleVoiceSubmit}
              isLoading={isLoading}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontWeight: "bold",
  },
  headerContainer: {
    height: 220,
    position: "relative",
    overflow: "hidden",
  },
  headerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  headerContent: {
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeaderText: {
    fontSize: 16,
    color: "#FFFFFF",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontWeight: "500",
  },
  diagnosisContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});