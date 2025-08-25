import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import Colors from "@/constants/colors";
import { AlertCircle, CheckCircle2, ShieldAlert, ArrowLeft, Volume2 } from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { speak, getLanguageCodeForSpeech, isSpeechSupported, checkSpeechAvailability } from "@/utils/textToSpeech";
import { useTranslation } from "@/hooks/useTranslation";
import * as Speech from 'expo-speech';

type DiagnosisResultProps = {
  result: DiagnosisResultType;
  onBack: () => void;
};

export default function DiagnosisResult({ result, onBack }: DiagnosisResultProps) {
  const { language = "en" } = useAppStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);
  const { t } = useTranslation();

  // Log the language for debugging
  console.log("DiagnosisResult component - current language:", language);

  // Add error handling for missing result properties
  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: No diagnosis result available</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={Colors.primary} />
          <Text style={styles.backButtonText}>{t("backToDiagnosis")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ensure all required properties exist and format them properly
  const safeResult = {
    disease: result.disease || "Unknown Disease",
    description: formatContent(result.description || "No description available"),
    remedy: formatContent(result.remedy || "No remedy information available"),
    prevention: formatContent(result.prevention || "No prevention information available"),
    confidence: result.confidence || 0.5,
    timestamp: result.timestamp || Date.now(),
    image: result.image
  };

  // Function to format content into bullet points if it's not already
  function formatContent(text: string | string[]): string | string[] {
    // If it's already an array, assume it's properly formatted
    if (Array.isArray(text)) {
      return text;
    }

    // If the text already has bullet points, return it as is
    if (text.includes('•') || text.includes('*') || text.includes('-')) {
      return text;
    }

    // Split by sentences and create bullet points
    const sentences = text.split(/\.\s+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) {
      return text;
    }

    // Format as bullet points
    return '• ' + sentences.join('\n• ');
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return Colors.success;
    if (confidence >= 0.7) return Colors.info;
    return Colors.warning;
  };

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  // Check speech availability when component mounts
  useEffect(() => {
    checkSpeechAvailability().catch(console.error);
  }, []);

  const handleSpeak = async (section?: string) => {
    if (isSpeaking) {
      console.log("Already speaking, ignoring request");
      return;
    }

    setIsSpeaking(true);
    try {
      console.log("Starting speech for section:", section || "all");

      // Check if speech is available (this will always return true in our updated implementation)
      await checkSpeechAvailability();

      // Ensure language is defined
      const currentLanguage = language || "en";
      const speechLanguage = getLanguageCodeForSpeech(currentLanguage);
      console.log(`Speaking in language: ${currentLanguage} (code: ${speechLanguage})`);

      // First stop any ongoing speech to ensure we don't have multiple speeches running
      try {
        await Speech.stop();
        console.log("Stopped any ongoing speech");
      } catch (stopError) {
        console.log("Error stopping speech or no speech to stop:", stopError);
      }

      let textToSpeak = "";

      // Function to clean text for speech (remove bullet points, etc.)
      const cleanTextForSpeech = (text: string): string => {
        if (!text) return "";

        return text
          .replace(/•/g, '') // Remove bullet points
          .replace(/\n/g, '. ') // Replace newlines with periods for better speech flow
          .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
          .trim();
      };

      // Helper function to handle both string and array content
      const prepareContentForSpeech = (content: string | string[]): string => {
        if (Array.isArray(content)) {
          return cleanTextForSpeech(content.join('. '));
        } else {
          return cleanTextForSpeech(content);
        }
      };

      if (section === "disease") {
        setSpeakingSection("disease");
        textToSpeak = safeResult.disease;
      } else if (section === "description") {
        setSpeakingSection("description");
        textToSpeak = prepareContentForSpeech(safeResult.description);
      } else if (section === "remedy") {
        setSpeakingSection("remedy");
        textToSpeak = prepareContentForSpeech(safeResult.remedy);
      } else if (section === "prevention") {
        setSpeakingSection("prevention");
        textToSpeak = prepareContentForSpeech(safeResult.prevention);
      } else {
        // Speak all content if no specific section is provided
        setSpeakingSection("all");

        // Create a more structured and clear text for speaking all content
        const diseaseText = safeResult.disease;
        const descriptionText = prepareContentForSpeech(safeResult.description);
        const remedyText = prepareContentForSpeech(safeResult.remedy);
        const preventionText = prepareContentForSpeech(safeResult.prevention);

        // For sequential reading, we'll read each section separately
        // This approach works better on mobile devices
        const readAllSequentially = async () => {
          try {
            // Read disease
            console.log("Reading disease section");
            await new Promise<void>((resolve) => {
              Speech.speak(`${t("disease")}: ${diseaseText}`, {
                language: speechLanguage,
                pitch: 1.0,
                rate: 0.8,
                volume: 1.0,
                onDone: resolve,
                onError: resolve
              });
            });

            // Read description
            console.log("Reading description section");
            await new Promise<void>((resolve) => {
              Speech.speak(`${t("description")}: ${descriptionText}`, {
                language: speechLanguage,
                pitch: 1.0,
                rate: 0.8,
                volume: 1.0,
                onDone: resolve,
                onError: resolve
              });
            });

            // Read remedy
            console.log("Reading remedy section");
            await new Promise<void>((resolve) => {
              Speech.speak(`${t("remedy")}: ${remedyText}`, {
                language: speechLanguage,
                pitch: 1.0,
                rate: 0.8,
                volume: 1.0,
                onDone: resolve,
                onError: resolve
              });
            });

            // Read prevention
            console.log("Reading prevention section");
            await new Promise<void>((resolve) => {
              Speech.speak(`${t("prevention")}: ${preventionText}`, {
                language: speechLanguage,
                pitch: 1.0,
                rate: 0.8,
                volume: 1.0,
                onDone: () => {
                  console.log("Finished reading all sections");
                  setIsSpeaking(false);
                  setSpeakingSection(null);
                  resolve();
                },
                onError: () => {
                  console.log("Error reading prevention section");
                  setIsSpeaking(false);
                  setSpeakingSection(null);
                  resolve();
                }
              });
            });
          } catch (error) {
            console.error("Error in sequential reading:", error);
            setIsSpeaking(false);
            setSpeakingSection(null);
          }

          return true; // Indicate we're handling this specially
        };

        // Start sequential reading
        readAllSequentially().catch(error => {
          console.error("Sequential reading failed:", error);
        });

        // Return early since we're handling this with the sequential approach
        return;
      }

      // Make sure textToSpeak is not undefined or null
      if (!textToSpeak) {
        console.error("No text to speak");
        throw new Error("No text to speak");
      }

      // For demo purposes, limit the text length to avoid speech errors
      // Use a longer limit for "Read All Content" to ensure all sections are included
      const maxLength = speakingSection === "all" ? 1000 : 500;

      if (textToSpeak.length > maxLength) {
        console.log(`Text too long (${textToSpeak.length} chars), truncating to ${maxLength} chars`);
        textToSpeak = textToSpeak.substring(0, maxLength) + "...";
      }

      console.log("About to speak text:", textToSpeak.substring(0, 50) + "...");

      // Try direct Speech API call first for better compatibility with Expo Go
      try {
        console.log("Using direct Speech API call for better Expo Go compatibility");

        // Limit text length for better performance
        // Use a longer limit for "Read All Content" to ensure all sections are included
        const directSpeechMaxLength = speakingSection === "all" ? 500 : 200;
        const limitedText = textToSpeak.substring(0, Math.min(textToSpeak.length, directSpeechMaxLength));

        console.log(`Using direct speech with ${limitedText.length} chars of text`);

        Speech.speak(limitedText, {
          language: speechLanguage,
          pitch: 1.0,
          rate: 0.8,
          volume: 1.0, // Maximum volume
          onDone: () => {
            console.log("Direct speech completed successfully");
            setIsSpeaking(false);
            setSpeakingSection(null);
          },
          onStopped: () => {
            console.log("Direct speech stopped");
            setIsSpeaking(false);
            setSpeakingSection(null);
          },
          onError: async (directError) => {
            console.error("Direct speech error:", directError);

            // Fall back to our utility function
            try {
              console.log("Falling back to speak utility function");
              await speak(textToSpeak, speechLanguage);
              console.log("Fallback speech completed successfully");
            } catch (fallbackError) {
              console.error("Fallback speech error:", fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
            } finally {
              setIsSpeaking(false);
              setSpeakingSection(null);
            }
          }
        });
      } catch (directError) {
        console.error("Error initiating direct speech:", directError);

        // Fall back to our utility function
        try {
          console.log("Falling back to speak utility function");
          await speak(textToSpeak, speechLanguage);
          console.log("Fallback speech completed successfully");
        } catch (fallbackError) {
          console.error("Fallback speech error:", fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
        } finally {
          setIsSpeaking(false);
          setSpeakingSection(null);
        }
      }
    } catch (error) {
      console.error("Speech error:", error instanceof Error ? error.message : String(error));
      // Don't show alert to avoid disrupting the user experience
      console.log("Speech error handled silently to improve user experience");
      setIsSpeaking(false);
      setSpeakingSection(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={20} color={Colors.primary} />
        <Text style={styles.backButtonText}>{t("backToDiagnosis")}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{t("diagnosisResult")}</Text>
        <Text style={styles.timestamp}>{formatDate(safeResult.timestamp)}</Text>
      </View>

      {safeResult.image && (
        <Image source={{ uri: safeResult.image }} style={styles.image} />
      )}

      <View style={styles.diseaseContainer}>
        <View style={styles.diseaseTitleRow}>
          <Text style={styles.diseaseTitle}>{safeResult.disease}</Text>

          {isSpeechSupported() && (
            <TouchableOpacity
              style={[
                styles.speakButton,
                (isSpeaking && speakingSection === "disease") && styles.speakingButton
              ]}
              onPress={() => handleSpeak("disease")}
              disabled={isSpeaking}
            >
              {isSpeaking && speakingSection === "disease" ? (
                <ActivityIndicator size="small" color={Colors.card} />
              ) : (
                <Volume2 size={18} color={Colors.card} />
              )}
            </TouchableOpacity>
          )}
        </View>



        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>{t("confidence")}:</Text>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(safeResult.confidence) },
            ]}
          >
            <Text style={styles.confidenceText}>
              {Math.round(safeResult.confidence * 100)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertCircle size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{t("description")}</Text>

          {isSpeechSupported() && (
            <TouchableOpacity
              style={[
                styles.sectionSpeakButton,
                (isSpeaking && speakingSection === "description") && styles.speakingButton
              ]}
              onPress={() => handleSpeak("description")}
              disabled={isSpeaking}
            >
              {isSpeaking && speakingSection === "description" ? (
                <ActivityIndicator size="small" color={Colors.card} />
              ) : (
                <Volume2 size={16} color={Colors.card} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {Array.isArray(safeResult.description) ? (
          <View>
            {safeResult.description.map((item, index) => (
              <Text key={index} style={styles.sectionContent}>{item}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionContent}>{safeResult.description}</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CheckCircle2 size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{t("remedy")}</Text>

          {isSpeechSupported() && (
            <TouchableOpacity
              style={[
                styles.sectionSpeakButton,
                (isSpeaking && speakingSection === "remedy") && styles.speakingButton
              ]}
              onPress={() => handleSpeak("remedy")}
              disabled={isSpeaking}
            >
              {isSpeaking && speakingSection === "remedy" ? (
                <ActivityIndicator size="small" color={Colors.card} />
              ) : (
                <Volume2 size={16} color={Colors.card} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {Array.isArray(safeResult.remedy) ? (
          <View>
            {safeResult.remedy.map((item, index) => (
              <Text key={index} style={[styles.sectionContent, styles.importantContent]}>{item}</Text>
            ))}
          </View>
        ) : (
          <Text style={[styles.sectionContent, styles.importantContent]}>{safeResult.remedy}</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ShieldAlert size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{t("prevention")}</Text>

          {isSpeechSupported() && (
            <TouchableOpacity
              style={[
                styles.sectionSpeakButton,
                (isSpeaking && speakingSection === "prevention") && styles.speakingButton
              ]}
              onPress={() => handleSpeak("prevention")}
              disabled={isSpeaking}
            >
              {isSpeaking && speakingSection === "prevention" ? (
                <ActivityIndicator size="small" color={Colors.card} />
              ) : (
                <Volume2 size={16} color={Colors.card} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {Array.isArray(safeResult.prevention) ? (
          <View>
            {safeResult.prevention.map((item, index) => (
              <Text key={index} style={styles.sectionContent}>{item}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionContent}>{safeResult.prevention}</Text>
        )}
      </View>

      {isSpeechSupported() && (
        <TouchableOpacity
          style={[
            styles.readAllButton,
            (isSpeaking && speakingSection === "all") && styles.speakingButton
          ]}
          onPress={() => handleSpeak()}
          disabled={isSpeaking}
        >
          {isSpeaking && speakingSection === "all" ? (
            <>
              <ActivityIndicator size="small" color={Colors.card} />
              <Text style={styles.readAllButtonText}>{t("speaking")}</Text>
            </>
          ) : (
            <>
              <Volume2 size={20} color={Colors.card} />
              <Text style={styles.readAllButtonText}>{t("readAllContent")}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 16,
  },
  diseaseContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diseaseTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionSpeakButton: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 'auto',
  },
  speakingButton: {
    backgroundColor: Colors.secondary,
  },
  speciesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  speciesLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  speciesText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: "italic",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: Colors.card,
    fontWeight: "bold",
    fontSize: 12,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  importantContent: {
    fontWeight: '500',
    color: Colors.primary,
  },
  readAllButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 30,
    flexDirection: "row",
    gap: 10,
  },
  readAllButtonText: {
    color: Colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});