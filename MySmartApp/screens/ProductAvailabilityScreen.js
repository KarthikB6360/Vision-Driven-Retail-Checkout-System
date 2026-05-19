import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CART_PRODUCTS } from "../data/cartProducts";

/* ================= STORAGE KEY ================= */
const STORAGE_KEY = "PRODUCT_AVAILABILITY_STATE";

/* ================= CATEGORY MAP ================= */
const CATEGORY_MAP = {
  DRINKS: [
    "Cocacola","Frooti","Maaza","Paperboat_Apple","Paperboat_MixedFruit",
    "RedBull","Sprite","Thumsup","Tropicana_Orange",
  ],
  BISCUITS: [
    "Hideandseek","Oreo_Double_Stuf","Oreo_Strawberry","Parleg",
    "Unibic_Cashew","Unibic_Choco_Chip","Unibic_Honey","Unibic_Oat_Meal",
  ],
  SNACKS: [
    "Aloo_Bhujia","Doritos","Khatta_Meetha","Lays_Cream_Onion",
    "Lays_Masala","Lays_Salted","Pringles_Peri_Peri",
    "Pringles_Pizza","Too_Yummy",
  ],
  CHOCOLATES: [
    "Bounty","Bournville","Dairy_Milk","Dairy_Milk_Silk",
    "Dairy_Milk_Silk_Oreo","Galaxy","Kitkat","Lindt",
    "Mars","Perk","Snickers","Snickers_Almond","Twix",
  ],
  GROCERY: [
    "Chanaflour","Greenmoong","Idlirava","Maida","Rajma","Sugar","Toordal",
  ],
  HEALTH: [
    "Boost","Bournvita","Horlicks_Lite","Horlicks_Women_Plus",
    "Protein_X_Chocolate","Protein_X_Vanilla","Similaciq",
  ],
  PERSONAL: [
    "Biotique_Honey","Biotique_Papaya","Body_Lotion","Face_Wash","Garnier_Bright",
  ],
  SAUCES: [
    "Kissan_Jam","Kissanjam_Pineapple","Kissanketchup_Spicy",
    "Peri_peri","Strifry","Thousand_Island",
  ],
};

/* ================= MASTER PRODUCTS ================= */
const buildMasterProducts = () =>
  Object.keys(CART_PRODUCTS).map((key) => ({
    key,
    name: CART_PRODUCTS[key].name,
    enabled: true,
  }));

export default function ProductAvailabilityScreen({ navigation, route }) {
  const adminName = route?.params?.name || "Admin";

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("DRINKS");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    initState();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ================= INIT ================= */
  const initState = async () => {
    const master = buildMasterProducts();
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setItems(master);
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(master.map(({ key, enabled }) => ({ key, enabled })))
        );
        return;
      }

      const saved = JSON.parse(stored);
      const merged = master.map((p) => {
        const match = saved.find((s) => s.key === p.key);
        return match ? { ...p, enabled: match.enabled } : p;
      });

      setItems(merged);
    } catch {
      setItems(master);
    }
  };

  /* ================= TOGGLE ================= */
  const toggleItem = (key) => {
    const updated = items.map((p) =>
      p.key === key ? { ...p, enabled: !p.enabled } : p
    );

    setItems(updated);
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated.map(({ key, enabled }) => ({ key, enabled })))
    );
  };

  /* ================= FILTER ================= */
  const visibleItems = items.filter((p) =>
    CATEGORY_MAP[category].includes(p.key)
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#12b886", "#0ca678", "#099268"]}
        style={styles.headerBg}
      />

      {/* ================= HEADER (CENTERED) ================= */}
      <View style={styles.header}>
        {/* BACK BUTTON (ABSOLUTE) */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        {/* CENTER TITLE */}
        <View style={styles.headerCenter}>
          <Text style={styles.welcomeText}>Admin Control</Text>
          <Text style={styles.nameText}>Product Availability</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Menu>
          <MenuTrigger>
            <View style={styles.dropdown}>
              <View>
                <Text style={styles.dropdownLabel}>Category</Text>
                <Text style={styles.dropdownText}>{category}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={26} />
            </View>
          </MenuTrigger>

          <MenuOptions customStyles={menuStyles}>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <MenuOption key={cat} onSelect={() => setCategory(cat)}>
                <Text style={styles.menuItem}>{cat}</Text>
              </MenuOption>
            ))}
          </MenuOptions>
        </Menu>

        {visibleItems.map((item) => (
          <Animated.View
            key={item.key}
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text
                style={[
                  styles.status,
                  { color: item.enabled ? "#12b886" : "#fa5252" },
                ]}
              >
                {item.enabled ? "Enabled" : "Disabled"}
              </Text>
            </View>

            <Switch
              value={item.enabled}
              onValueChange={() => toggleItem(item.key)}
              trackColor={{ false: "#ced4da", true: "#63e6be" }}
              thumbColor={item.enabled ? "#099268" : "#adb5bd"}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */
const menuStyles = {
  optionsContainer: {
    paddingVertical: 6,
    borderRadius: 12,
    width: 200,
    backgroundColor: "#fff",
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  headerBg: {
    position: "absolute",
    width: "100%",
    height: 150,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    left: 20,
    bottom: 18,
  },

  headerCenter: {
    alignItems: "center",
  },

  welcomeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e6fcf5",
  },

  nameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
  },

  content: { paddingTop: 36, paddingBottom: 30 },

  dropdown: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  dropdownText: { fontSize: 17, fontWeight: "800", color: "#111827" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  productName: { fontSize: 16, fontWeight: "700" },
  status: { fontSize: 13, fontWeight: "600", marginTop: 4 },

  menuItem: { fontSize: 15, padding: 10, fontWeight: "600" },
});
