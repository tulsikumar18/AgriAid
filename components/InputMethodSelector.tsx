import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { InputMethod } from "@/types/diagnosis";
import Colors from "@/constants/colors";
import { MessageSquare, Image, Mic } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

type InputMethodSelectorProps = {
  selectedMethod: InputMethod;
  onSelectMethod: (method: InputMethod) => void;
};

export default function InputMethodSelector({
  selectedMethod,
  onSelectMethod,
}: InputMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.methodButton,
          selectedMethod === "text" && styles.selectedMethod,
        ]}
        onPress={() => onSelectMethod("text")}
      >
        <MessageSquare
          size={24}
          color={selectedMethod === "text" ? Colors.card : Colors.primary}
        />
        <Text
          style={[
            styles.methodText,
            selectedMethod === "text" && styles.selectedMethodText,
          ]}
        >
          {t("text")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.methodButton,
          selectedMethod === "image" && styles.selectedMethod,
        ]}
        onPress={() => onSelectMethod("image")}
      >
        <Image
          size={24}
          color={selectedMethod === "image" ? Colors.card : Colors.primary}
        />
        <Text
          style={[
            styles.methodText,
            selectedMethod === "image" && styles.selectedMethodText,
          ]}
        >
          {t("image")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.methodButton,
          selectedMethod === "voice" && styles.selectedMethod,
        ]}
        onPress={() => onSelectMethod("voice")}
      >
        <Mic
          size={24}
          color={selectedMethod === "voice" ? Colors.card : Colors.primary}
        />
        <Text
          style={[
            styles.methodText,
            selectedMethod === "voice" && styles.selectedMethodText,
          ]}
        >
          {t("voice")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  methodButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.lightGreen,
    flexDirection: "row",
    gap: 8,
  },
  selectedMethod: {
    backgroundColor: Colors.primary,
  },
  methodText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  selectedMethodText: {
    color: Colors.card,
  },
});