import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* ---------------- CONSTANT COLOR THEME ---------------- */
const COLORS = {
  primary: "#6C5CE7",
  secondary: "#A29BFE",
  bg: "#F3F4FF",
  white: "#FFFFFF",
};

export default function UserHome({ navigation, route }) {
  const { name, email, role } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [selectedTip, setSelectedTip] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const startPress = () =>
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start();

  const endPress = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  /* ---------------- QUICK ACTION BUTTONS ---------------- */
  const quickActions = [
    { title: "Scan Product", icon: "barcode-scan", screen: "Scan", color: COLORS.primary },
    { title: "Barcode Verifier", icon: "barcode-check", screen: "BarcodeVerifier", color: "#10B981" }, // ✅ ADDED
    { title: "My Cart", icon: "cart-outline", screen: "MyCart", color: "#FF67A0" },
    { title: "Products", icon: "shopping-outline", screen: "Products", color: "#22C55E" },
    { title: "Nutrition Score", icon: "leaf-circle-outline", screen: "EcoScore", color: "#06B6D4" },
    { title: "Rewards", icon: "gift-outline", screen: "Rewards", color: "#F59E0B" },
    { title: "Chatbot", icon: "robot-outline", screen: "ChatbotScreen", color: "#0EA5E9" },
    { title: "Invoice History", icon: "file-document-outline", screen: "InvoiceHistory", color: "#8B5CF6" },
  ];

  const healthTips = [
    "High fiber improves digestion",
    "Reduce sugar for long-term wellness",
    "Drink water before meals",
    "Avoid expired foods",
  ];

  const newFeatures = [
    {
      key: "AI_HEALTH",
      title: "AI Health Coach",
      subtitle: "Personalized meal suggestions & diet analytics",
      icon: "robot-happy-outline",
      color: COLORS.primary,
      action: () => navigation.navigate("EcoScore", { name, email, role }),
    },
    {
      key: "PRODUCT_INSIGHTS",
      title: "Product Insights",
      subtitle: "Scan items for sustainability details",
      icon: "chart-donut",
      color: "#10B981",
      action: () => navigation.navigate("Scan", { name, email, role }),
    },
  ];

  const handleLogout = () => navigation.navigate("Login", { resetForm: true });

  return (
    <View style={styles.container}>
      <View style={styles.headerGradient} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back 👋</Text>
          <Text style={styles.userName}>{name || "User"}</Text>
        </View>

        <Menu>
          <MenuTrigger>
            <View style={styles.profileCircle}>
              <Text style={styles.profileText}>
                {(name && name.charAt(0).toUpperCase()) || "U"}
              </Text>
            </View>
          </MenuTrigger>

          <MenuOptions customStyles={menuStyles}>
            <MenuOption onSelect={() => navigation.navigate("Profile", { name, email, role })}>
              <Text style={styles.menuItem}>Profile</Text>
            </MenuOption>
            <MenuOption onSelect={handleLogout}>
              <Text style={[styles.menuItem, { color: "red" }]}>Logout</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Explore Features</Text>

        <View style={styles.gridContainer}>
          {quickActions.map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <TouchableOpacity
                onPressIn={startPress}
                onPressOut={endPress}
                onPress={() => navigation.navigate(item.screen, { name, email, role })}
                style={styles.cardContent}
              >
                <View style={[styles.iconGlow, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.featureLabel}>{item.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* HEALTH TIPS */}
        <Text style={styles.sectionTitle}>Health Tips</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {healthTips.map((tip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.glassTip}
              onPress={() => {
                setSelectedTip(tip);
                setModalVisible(true);
              }}
            >
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={COLORS.primary} />
              <Text style={styles.tipText}>{tip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MODAL */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <MaterialCommunityIcons name="lightbulb-on" size={46} color="#FACC15" />
              <Text style={styles.modalHeading}>Health Tip</Text>
              <Text style={styles.modalBody}>{selectedTip}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* FEATURED */}
        <Text style={styles.sectionTitle}>Featured</Text>

        <View style={{ paddingHorizontal: 20 }}>
          {newFeatures.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={f.action}
              style={[styles.featuredCard, { borderLeftColor: f.color }]}
            >
              <View style={styles.featuredLeft}>
                <MaterialCommunityIcons name={f.icon} size={34} color={f.color} />
              </View>

              <View style={styles.featuredBody}>
                <Text style={styles.featuredTitle}>{f.title}</Text>
                <Text style={styles.featuredSubtitle}>{f.subtitle}</Text>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={28} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Smart Retail AI</Text>
          <Text style={styles.footerText}>GARB N GO • Shop Smart, Eat Smart</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* POPUP MENU */
const menuStyles = {
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 8,
    elevation: 12,
  },
};

/* STYLES (UNCHANGED FROM YOUR FILE) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerGradient: {
    position: "absolute",
    width: "140%",
    height: 200,
    top: 0,
    left: -40,
    backgroundColor: COLORS.primary,
    opacity: 0.95,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { fontSize: 16, color: COLORS.white },
  userName: { fontSize: 30, fontWeight: "900", color: COLORS.white },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: { fontSize: 24, fontWeight: "800", color: "#000" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginVertical: 12,
    paddingHorizontal: 22,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  featureCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 22,
    marginBottom: 15,
    elevation: 5,
  },
  cardContent: { alignItems: "center" },
  iconGlow: {
    width: 52,
    height: 52,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureLabel: { fontSize: 16, fontWeight: "700" },
  glassTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginLeft: 20,
    marginRight: 10,
  },
  tipText: { marginLeft: 8, fontSize: 14, fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: { width: "80%", backgroundColor: "#fff", padding: 28, borderRadius: 20, alignItems: "center" },
  modalHeading: { fontSize: 22, fontWeight: "900" },
  modalBody: { fontSize: 15, textAlign: "center", marginVertical: 12 },
  closeButton: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 },
  closeButtonText: { color: COLORS.white, fontWeight: "700" },
  featuredCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderLeftWidth: 6,
    alignItems: "center",
  },
  featuredLeft: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featuredBody: { flex: 1 },
  featuredTitle: { fontSize: 17, fontWeight: "800" },
  featuredSubtitle: { color: "#555", marginTop: 4, fontSize: 13 },
  footer: { alignItems: "center", paddingVertical: 18 },
  footerText: { fontSize: 12, color: "#888" },
});
