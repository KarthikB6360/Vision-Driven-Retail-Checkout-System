import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import { LinearGradient } from "expo-linear-gradient";
import { getAllUsers } from "../services/api";

export default function AdminDashboard({ navigation, route }) {
  const adminName = route?.params?.name || "Admin";
  const adminEmail = route?.params?.email || "";

  /* ---------------- ANIMATIONS ---------------- */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ---------------- STATS ---------------- */
  const stats = [
    {
      title: "Total Users",
      color1: "#4c6ef5",
      color2: "#364fc7",
      onPress: async () => {
        const users = await getAllUsers();
        navigation.navigate("UserListScreen", {
          users,
          name: adminName,
          email: adminEmail,
          role: "admin",
        });
      },
    },
  ];

  /* ---------------- ADMIN CONTROLS ---------------- */
  const adminControls = [
    {
      title: "Product Availability Control",
      colors: ["#12b886", "#0ca678"],
      screen: "ProductAvailabilityScreen",
    },
    {
      title: "Products List",
      colors: ["#4f46e5", "#6366f1"],
      screen: "Products", // ✅ USER PRODUCT SCREEN
    },
    {
      title: "Invoice Verifier",
      colors: ["#845ef7", "#5f3dc4"],
      screen: "InvoiceVerifierScreen",
    },
    {
      title: "User Activity Analytics",
      colors: ["#339af0", "#1c7ed6"],
      screen: "UserAnalyticsScreen",
    },
    {
      title: "Live Product Recommendation",
      colors: ["#ff922b", "#f76707"],
      screen: "ScanFailureScreen",
    },
    {
      title: "System Logs Monitor",
      colors: ["#868e96", "#495057"],
      screen: "SystemLogsScreen",
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER BG */}
      <LinearGradient
        colors={["#4c6ef5", "#3b5bdb", "#364fc7"]}
        style={styles.headerBg}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={styles.welcomeText}>Welcome Back 👋</Text>
          <Text style={styles.nameText}>Admin {adminName}</Text>
        </Animated.View>

        <Menu>
          <MenuTrigger>
            <View style={styles.profileBtn}>
              <Text style={styles.profileInitial}>
                {adminName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </MenuTrigger>

          <MenuOptions customStyles={optionsStyles}>
            <MenuOption
              onSelect={() =>
                navigation.navigate("Profile", {
                  name: adminName,
                  email: adminEmail,
                  role: "admin",
                })
              }
            >
              <Text style={styles.menuItem}>Profile</Text>
            </MenuOption>

            <MenuOption onSelect={() => navigation.navigate("Login")}>
              <Text style={[styles.menuItem, { color: "red" }]}>Logout</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>

        {/* STATS */}
        <View style={styles.singleStatRow}>
          {stats.map((item, index) => (
            <TouchableOpacity key={index} onPress={item.onPress}>
              <Animated.View
                style={[
                  styles.statCard,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[item.color1, item.color2]}
                  style={styles.gradientCard}
                >
                  <Text style={styles.statTitle}>{item.title}</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ADMIN CONTROLS */}
        <Text style={styles.sectionTitle}>Admin Controls</Text>

        {adminControls.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            style={styles.controlWrapper}
          >
            <Animated.View
              style={[
                styles.controlCard,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <LinearGradient
                colors={item.colors}
                style={styles.gradientCard}
              >
                <Text style={styles.statTitle}>{item.title}</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/* MENU STYLE */
const optionsStyles = {
  optionsContainer: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 150,
  },
};

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  headerBg: {
    position: "absolute",
    width: "100%",
    height: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  welcomeText: { fontSize: 16, fontWeight: "600", color: "#e7e9fb" },
  nameText: { fontSize: 26, fontWeight: "800", color: "#fff" },

  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  profileInitial: { fontSize: 20, fontWeight: "bold", color: "#000" },

  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    paddingHorizontal: 20,
    color: "#222",
  },

  singleStatRow: { paddingHorizontal: 20 },

  statCard: { borderRadius: 18, overflow: "hidden", marginBottom: 10 },

  controlWrapper: { marginHorizontal: 20, marginBottom: 14 },

  controlCard: { borderRadius: 18, overflow: "hidden" },

  gradientCard: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  statTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  menuItem: { fontSize: 15, padding: 8, color: "#222" },
});
