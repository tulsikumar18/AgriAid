import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Switch, Image } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import LanguageSelector from "@/components/LanguageSelector";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Globe, Info, Mail, Star, ExternalLink, User, LogOut } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleDarkMode = () => {
    setDarkModeEnabled(!darkModeEnabled);
  };
  
  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t("settings") }} />
      <StatusBar style="dark" />

      <ScrollView>
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => router.push("/profile")}
        >
          <View style={styles.profileInfo}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={24} color={Colors.primary} />
              </View>
            )}
            <View>
              <Text style={styles.profileName}>{user?.name || user?.username}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <ExternalLink size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("preferences")}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Globe size={20} color={Colors.primary} />
              <Text style={styles.settingText}>{t("language")}</Text>
            </View>
          </View>
          
          <LanguageSelector />
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t("enableNotifications")}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.textSecondary, true: Colors.lightGreen }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t("darkMode")}</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              trackColor={{ false: Colors.textSecondary, true: Colors.lightGreen }}
              thumbColor={darkModeEnabled ? Colors.primary : Colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about")}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Linking.openURL("https://example.com/about")}
          >
            <View style={styles.settingContent}>
              <Info size={20} color={Colors.primary} />
              <Text style={styles.settingText}>{t("aboutAgriAid")}</Text>
            </View>
            <ExternalLink size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Linking.openURL("mailto:support@agriaid.com")}
          >
            <View style={styles.settingContent}>
              <Mail size={20} color={Colors.primary} />
              <Text style={styles.settingText}>{t("contactSupport")}</Text>
            </View>
            <ExternalLink size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Linking.openURL("https://example.com/rate")}
          >
            <View style={styles.settingContent}>
              <Star size={20} color={Colors.primary} />
              <Text style={styles.settingText}>{t("rateTheApp")}</Text>
            </View>
            <ExternalLink size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.settingContent}>
              <LogOut size={20} color={Colors.error} />
              <Text style={[styles.settingText, styles.logoutText]}>{t("logout")}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>{t("version")} 1.0.0</Text>
          <Text style={styles.copyright}>© 2023 {t("appName")}. {t("allRightsReserved")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    marginBottom: 1,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
  },
  logoutItem: {
    marginTop: 16,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  version: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});