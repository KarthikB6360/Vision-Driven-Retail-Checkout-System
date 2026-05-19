import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nutritionData } from "../data/nutritionData";
import { CART_PRODUCTS } from "../data/cartProducts";

/* ================= STORAGE KEYS ================= */
const SCORE_KEY = "LAST_PAID_NUTRITION_SCORE";
const PAID_KEY = "HAS_PAID_ONCE";

/* ================= INDIAN RECOMMENDED VALUES ================= */
const LIMITS = {
  calories: { value: 2400, unit: "kcal", label: "Calories" },
  carbs: { value: 300, unit: "g", label: "Carbohydrates" },
  sugar: { value: 50, unit: "g", label: "Sugars" },
  protein: { value: 60, unit: "g", label: "Protein" },
  fat: { value: 65, unit: "g", label: "Total Fat" },
  sodium: { value: 2000, unit: "mg", label: "Sodium" },
  fiber: { value: 30, unit: "g", label: "Dietary Fiber" },
};

/* ================= HELPERS ================= */
const normalize = (str = "") =>
  str.replace(/\s|_/g, "").toLowerCase();

const percent = (value, max) => {
  if (!value || !max) return 0;
  return Math.min(100, (value / max) * 100);
};

const barColor = (p) => {
  if (p <= 60) return "#22C55E";
  if (p <= 90) return "#FACC15";
  return "#EF4444";
};

export default function EcoScoreScreen({ cart = [] }) {
  const [expandedItem, setExpandedItem] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const animatedScore = useRef(new Animated.Value(0)).current;

  /* ================= TOTAL NUTRITION ================= */
  const totals = useMemo(() => {
    const t = {
      calories: 0,
      carbs: 0,
      sugar: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
    };

    cart.forEach((item) => {
      const product = Object.values(CART_PRODUCTS).find(
        (p) => normalize(p.name) === normalize(item.name)
      );
      if (!product) return;

      const nutrition = Object.values(nutritionData).find(
        (n) => normalize(n.name) === normalize(product.name)
      );
      if (!nutrition) return;

      const qty = Number(item.qty || 1);

      t.calories += (nutrition.calories_kcal || 0) * qty;
      t.carbs += (nutrition.carbohydrates_g || 0) * qty;
      t.sugar += (nutrition.sugars_g || 0) * qty;
      t.protein += (nutrition.protein_g || 0) * qty;
      t.fat += (nutrition.fat_g || 0) * qty;
      t.sodium += (nutrition.sodium_mg || 0) * qty;
      t.fiber += (nutrition.fiber_g || 0) * qty;
    });

    return t;
  }, [cart]);

  /* ================= LIVE SCORE ================= */
  const liveScore = useMemo(() => {
    if (!cart.length) return 0;

    const bad =
      percent(totals.sugar, LIMITS.sugar.value) +
      percent(totals.fat, LIMITS.fat.value) +
      percent(totals.sodium, LIMITS.sodium.value);

    const good =
      percent(totals.protein, LIMITS.protein.value) +
      percent(totals.fiber, LIMITS.fiber.value);

    return Math.max(0, Math.min(100, 100 - bad / 3 + good / 4));
  }, [totals, cart]);

  /* ================= DECIDE SCORE TO SHOW ================= */
  useEffect(() => {
    const resolveScore = async () => {
      if (cart.length > 0) {
        // 🛒 Cart active → show live score
        setDisplayScore(liveScore);
        return;
      }

      // 🧺 Cart empty
      const hasPaid = await AsyncStorage.getItem(PAID_KEY);

      if (hasPaid === "true") {
        const saved = await AsyncStorage.getItem(SCORE_KEY);
        setDisplayScore(saved ? Number(saved) : 0);
      } else {
        setDisplayScore(0);
      }
    };

    resolveScore();
  }, [cart, liveScore]);

  /* ================= SCORE ANIMATION ================= */
  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: displayScore,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [displayScore]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ================= HEADER ================= */}
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="chart-donut" size={30} color="#065F46" />
          <Text style={styles.title}>Nutrition Score</Text>
        </View>
        <Text style={styles.subtitle}>
          Real-time health analysis based on your cart
        </Text>

        {/* ================= SCORE CARD ================= */}
        <View style={styles.scoreCard}>
          <Text style={styles.score}>
            {displayScore.toFixed(2)}%
          </Text>
          <Text style={styles.scoreText}>Overall Health Quality</Text>
        </View>

        {/* 🔽 BELOW THIS — YOUR DESIGN & UI IS 100% UNCHANGED 🔽 */}

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Nutrient</Text>
            <Text style={styles.tableCell}>Recommended</Text>
            <Text style={styles.tableCell}>Your Intake</Text>
          </View>

          {Object.keys(LIMITS).map((key) => (
            <View key={key} style={styles.tableRow}>
              <Text style={styles.tableCell}>{LIMITS[key].label}</Text>
              <Text style={styles.tableCell}>
                {LIMITS[key].value} {LIMITS[key].unit}
              </Text>
              <Text style={styles.tableCellHighlight}>
                {Math.round(totals[key])} {LIMITS[key].unit}
              </Text>
            </View>
          ))}

          <View style={styles.noteRow}>
            <Text style={styles.noteText}>
              Note: (ICMR / FSSAI – simplified daily reference), {"\n"}
              kcal = kilocalories, g = grams, mg = milligrams.
            </Text>
          </View>
        </View>

        {/* ================= ITEMS ================= */}
        <Text style={styles.section}>Items Included</Text>

        {cart.map((item, index) => {
          const product = Object.values(CART_PRODUCTS).find(
            (p) => normalize(p.name) === normalize(item.name)
          );
          if (!product) return null;

          const nutrition = Object.values(nutritionData).find(
            (n) => normalize(n.name) === normalize(product.name)
          );

          const open = expandedItem === index;

          return (
            <View key={index}>
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => setExpandedItem(open ? null : index)}
              >
                <Image source={product.image} style={styles.image} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  <Text style={styles.qty}>Qty: {item.qty}</Text>
                </View>
                <MaterialCommunityIcons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>

              {open && nutrition && (
                <View style={styles.dropdown}>
                  <Text style={styles.dropText}>Calories: {nutrition.calories_kcal} kcal</Text>
                  <Text style={styles.dropText}>Carbs: {nutrition.carbohydrates_g} g</Text>
                  <Text style={styles.dropText}>Sugar: {nutrition.sugars_g} g</Text>
                  <Text style={styles.dropText}>Protein: {nutrition.protein_g} g</Text>
                  <Text style={styles.dropText}>Fat: {nutrition.fat_g} g</Text>
                  <Text style={styles.dropText}>Sodium: {nutrition.sodium_mg} mg</Text>
                  <Text style={styles.dropText}>Fiber: {nutrition.fiber_g} g</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* ================= BREAKDOWN ================= */}
        <Text style={styles.section}>Nutrition Breakdown</Text>

        {Object.keys(LIMITS).map((key) => {
          const p = percent(totals[key], LIMITS[key].value);
          return (
            <View key={key} style={styles.nutritionCard}>
              <View style={styles.row}>
                <Text style={styles.label}>{LIMITS[key].label}</Text>
                <Text style={styles.value}>{Math.round(p)}%</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${p}%`, backgroundColor: barColor(p) },
                  ]}
                />
              </View>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
/* 🔒 100% UNCHANGED */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ECFDF5" },
  container: { padding: 16, paddingBottom: 50 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 28, fontWeight: "800", color: "#065F46" },
  subtitle: { color: "#047857", marginBottom: 14 },
  scoreCard: {
    backgroundColor: "#D1FAE5",
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
  },
  score: { fontSize: 48, fontWeight: "900", color: "#065F46" },
  scoreText: { color: "#065F46", fontWeight: "600" },
  section: { fontSize: 19, fontWeight: "700", marginVertical: 14, color: "#064E3B" },
  table: { backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", marginBottom: 18, elevation: 6 },
  tableHeader: { backgroundColor: "#ECFEFF" },
  tableRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  tableCell: { flex: 1, textAlign: "center", fontWeight: "600", color: "#334155" },
  tableCellHighlight: { flex: 1, textAlign: "center", fontWeight: "800", color: "#0F766E" },
  noteRow: { backgroundColor: "#F0FDFA", paddingVertical: 10 },
  noteText: { textAlign: "center", fontSize: 12, fontWeight: "600", color: "#065F46" },
  itemCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 18, padding: 14, alignItems: "center", marginBottom: 6, elevation: 4 },
  image: { width: 52, height: 52, borderRadius: 12, marginRight: 14 },
  itemName: { fontSize: 16, fontWeight: "700" },
  qty: { fontSize: 13, color: "#64748B" },
  dropdown: { backgroundColor: "#ECFEFF", padding: 14, borderRadius: 14, marginBottom: 8 },
  dropText: { fontSize: 13, color: "#134E4A", marginVertical: 2 },
  nutritionCard: { backgroundColor: "#fff", borderRadius: 18, padding: 14, marginBottom: 12, elevation: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontWeight: "600", color: "#022C22" },
  value: { fontWeight: "800" },
  barBg: { height: 9, backgroundColor: "#E5E7EB", borderRadius: 10, marginTop: 6 },
  barFill: { height: "100%", borderRadius: 10 },
});
