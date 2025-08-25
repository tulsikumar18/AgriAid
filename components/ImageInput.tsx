import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { Camera, Upload, Send } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

type ImageInputProps = {
  onSubmit: (imageUri: string) => void;
  isLoading: boolean;
};

export default function ImageInput({ onSubmit, isLoading }: ImageInputProps) {
  const [image, setImage] = useState<string | null>(null);
  const { t } = useTranslation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (image && !isLoading) {
      onSubmit(image);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.changeImageText}>{t("changeImage")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <Text style={styles.uploadText}>
            {t("uploadOrTakePhoto")}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload size={24} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>{t("upload")}</Text>
            </TouchableOpacity>
            
            {Platform.OS !== "web" && (
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Camera size={24} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>{t("camera")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {image && (
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
  uploadContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.lightGreen,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    marginBottom: 16,
  },
  uploadText: {
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  uploadButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 8,
  },
  changeImageButton: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  changeImageText: {
    color: Colors.primary,
    fontWeight: "600",
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