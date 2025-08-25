import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";
import { Mic, MicOff, Send } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";
import { startRecording, stopRecording, transcribeAudio } from "@/utils/speechToText";

type VoiceInputProps = {
  onSubmit: (audioUri: string, transcribedText?: string) => void;
  isLoading: boolean;
};

export default function VoiceInput({ onSubmit, isLoading }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAvailable, setRecordingAvailable] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { t } = useTranslation();

  // Clean up recording when component unmounts
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording().catch(console.error);
      }
    };
  }, [isRecording]);

  const toggleRecording = async () => {
    if (Platform.OS === "web") {
      Alert.alert(t("webVoiceNotSupported"));
      return;
    }

    try {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        setIsTranscribing(true);

        // Get the audio URI
        const uri = await stopRecording();
        setAudioUri(uri);

        // Transcribe the audio
        try {
          const text = await transcribeAudio(uri);
          setTranscribedText(text);
          console.log("Transcribed text:", text);
        } catch (error) {
          console.error("Transcription error:", error instanceof Error ? error.message : String(error));
          // Show a more specific error message if available
          const errorMessage = error instanceof Error ? error.message : String(error);
          Alert.alert(
            t("transcriptionError"),
            errorMessage.includes("API")
              ? errorMessage
              : t("couldNotTranscribeAudio")
          );
        } finally {
          setIsTranscribing(false);
          setRecordingAvailable(true);
        }
      } else {
        // Reset state for new recording
        setAudioUri(null);
        setTranscribedText(null);
        setRecordingAvailable(false);

        // Start recording
        await startRecording();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Recording error:", error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        t("recordingError"),
        errorMessage.includes("Permission")
          ? t("microphonePermissionDenied")
          : errorMessage
      );
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const handleSubmit = () => {
    if (audioUri && recordingAvailable && !isLoading) {
      onSubmit(audioUri, transcribedText || undefined);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordingContainer}>
        <Text style={styles.recordingText}>
          {isRecording
            ? t("recording")
            : isTranscribing
            ? t("transcribing")
            : recordingAvailable
            ? t("recordingComplete")
            : t("tapMicrophoneToStart")}
        </Text>

        {transcribedText && recordingAvailable && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>{t("transcribedText")}:</Text>
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingActiveButton,
            isTranscribing && styles.transcribingButton,
          ]}
          onPress={toggleRecording}
          disabled={isTranscribing || isLoading}
        >
          {isRecording ? (
            <MicOff size={32} color={Colors.card} />
          ) : isTranscribing ? (
            <ActivityIndicator size="large" color={Colors.card} />
          ) : (
            <Mic size={32} color={Colors.primary} />
          )}
        </TouchableOpacity>

        {Platform.OS === "web" && (
          <Text style={styles.webNotice}>
            {t("webVoiceNotSupported")}
          </Text>
        )}
      </View>

      {recordingAvailable && !isTranscribing && (
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? t("analyzing") : t("diagnose")}
          </Text>
          <Send size={18} color={Colors.card} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  recordingContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    marginBottom: 16,
  },
  recordingText: {
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  transcriptionContainer: {
    backgroundColor: Colors.lightGreen + '20', // 20% opacity
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  transcriptionLabel: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptionText: {
    color: Colors.text,
    fontSize: 14,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingActiveButton: {
    backgroundColor: Colors.error,
  },
  transcribingButton: {
    backgroundColor: Colors.secondary,
  },
  webNotice: {
    color: Colors.error,
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
});