import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import { useAppStore } from "@/store/useAppStore";
import HistoryItem from "@/components/HistoryItem";
import DiagnosisResult from "@/components/DiagnosisResult";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Trash2 } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

export default function HistoryScreen() {
  const { diagnosisHistory, clearHistory } = useAppStore();
  const [selectedResult, setSelectedResult] = useState<DiagnosisResultType | null>(null);
  const { t } = useTranslation();

  const handleSelectItem = (item: DiagnosisResultType) => {
    setSelectedResult(item);
  };

  const handleBack = () => {
    setSelectedResult(null);
  };

  if (selectedResult) {
    return <DiagnosisResult result={selectedResult} onBack={handleBack} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("diagnosisHistory"),
          headerRight: () => (
            diagnosisHistory.length > 0 ? (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearHistory}
              >
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      <StatusBar style="dark" />

      {diagnosisHistory.length > 0 ? (
        <FlatList
          data={diagnosisHistory}
          keyExtractor={(item) => item.timestamp.toString()}
          renderItem={({ item }) => (
            <HistoryItem item={item} onPress={handleSelectItem} />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t("noDiagnosisHistory")}</Text>
          <Text style={styles.emptyText}>
            {t("previousDiagnosesWillAppear")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
});