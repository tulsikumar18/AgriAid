import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform, ScrollView, findNodeHandle, Keyboard } from "react-native";
import Colors from "@/constants/colors";
import { Send } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

type TextInputComponentProps = {
  onSubmit: (text: string) => void;
  isLoading: boolean;
};

export default function TextInputComponent({
  onSubmit,
  isLoading,
}: TextInputComponentProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
      Keyboard.dismiss();
    }
  };

  const handleFocus = () => {
    // On mobile, scroll the view to make the input visible
    if (Platform.OS !== "web" && inputRef.current && scrollViewRef.current) {
      // Use setTimeout to ensure the keyboard is fully shown
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
  };

  // Add keyboard listeners to handle keyboard appearance
  useEffect(() => {
    if (Platform.OS !== "web") {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          if (scrollViewRef.current) {
            // Delay scrolling to ensure the keyboard is fully shown
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }
        }
      );

      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          // Optional: handle keyboard hiding if needed
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={t("describeCropSymptoms")}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          placeholderTextColor={Colors.textSecondary}
          onFocus={handleFocus}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!text.trim() || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!text.trim() || isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? t("analyzing") : t("diagnose")}
          </Text>
          <Send size={18} color={Colors.card} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 80 : 40,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.lightGreen,
    color: Colors.text,
    marginBottom: 16,
    textAlignVertical: "top",
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