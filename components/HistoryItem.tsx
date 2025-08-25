import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { DiagnosisResult } from "@/types/diagnosis";
import Colors from "@/constants/colors";
import { ChevronRight } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

type HistoryItemProps = {
  item: DiagnosisResult;
  onPress: (item: DiagnosisResult) => void;
};

export default function HistoryItem({ item, onPress }: HistoryItemProps) {
  const { t } = useTranslation();
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return Colors.success;
    if (confidence >= 0.7) return Colors.info;
    return Colors.warning;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.disease}>{item.disease}</Text>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
        <View style={styles.confidenceContainer}>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(item.confidence) },
            ]}
          >
            <Text style={styles.confidenceText}>
              {Math.round(item.confidence * 100)}% {t("confidence")}
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  disease: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  confidenceContainer: {
    flexDirection: "row",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  confidenceText: {
    color: Colors.card,
    fontWeight: "500",
    fontSize: 10,
  },
});