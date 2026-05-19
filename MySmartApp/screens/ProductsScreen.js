import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= STORAGE KEY ================= */
const STORAGE_KEY = "PRODUCT_AVAILABILITY_STATE";

/* ================= IMAGE MAP ================= */
const IMAGES = {
  Cocacola: require("../assets/products/cocacola2.jpg"),
  Frooti: require("../assets/products/Frooti.jpg"),
  Maaza: require("../assets/products/Maaza.jpg"),
  Paperboat_Apple: require("../assets/products/Paperboat_Apple.jpg"),
  Paperboat_MixedFruit: require("../assets/products/Paperboat_MixedFruit.jpg"),
  RedBull: require("../assets/products/RedBull.jpg"),
  Sprite: require("../assets/products/Sprite.jpg"),
  Thumsup: require("../assets/products/Thumsup.jpg"),
  Tropicana_Orange: require("../assets/products/Tropicana_Orange.jpg"),

  Hideandseek: require("../assets/products/Hideandseek.jpg"),
  Oreo_Double_Stuf: require("../assets/products/Oreo_Double_Stuf.jpg"),
  Oreo_Strawberry: require("../assets/products/Oreo_Strawberry.jpg"),
  Parleg: require("../assets/products/Parleg.jpg"),
  Unibic_Cashew: require("../assets/products/Unibic_Cashew.jpg"),
  Unibic_Choco_Chip: require("../assets/products/Unibic_Choco_Chip.jpg"),
  Unibic_Honey: require("../assets/products/Unibic_Honey.jpg"),
  Unibic_Oat_Meal: require("../assets/products/Unibic_Oat_Meal.jpg"),

  Aloo_Bhujia: require("../assets/products/Aloo_Bhujia.jpg"),
  Doritos: require("../assets/products/Doritos.jpg"),
  Khatta_Meetha: require("../assets/products/Khatta_Meetha.jpg"),
  Lays_Cream_Onion: require("../assets/products/Lays_Cream_Onion.jpg"),
  Lays_Masala: require("../assets/products/Lays_Masala.jpg"),
  Lays_Salted: require("../assets/products/Lays_Salted.jpg"),
  Pringles_Peri_Peri: require("../assets/products/Pringles_Peri_Peri.jpg"),
  Pringles_Pizza: require("../assets/products/Pringles_Pizza.jpg"),
  Too_Yummy: require("../assets/products/Too_Yummy.jpg"),

  Bounty: require("../assets/products/Bounty.jpg"),
  Bournville: require("../assets/products/Bournville.jpg"),
  Dairy_Milk: require("../assets/products/Dairy_Milk.jpg"),
  Dairy_Milk_Silk: require("../assets/products/Dairy_Milk_Silk.jpg"),
  Dairy_Milk_Silk_Oreo: require("../assets/products/Dairy_Milk_Silk_Oreo.jpg"),
  Galaxy: require("../assets/products/Galaxy.jpg"),
  Kitkat: require("../assets/products/Kitkat.jpg"),
  Lindt: require("../assets/products/Lindt.jpg"),
  Mars: require("../assets/products/Mars.jpg"),
  Perk: require("../assets/products/Perk.jpg"),
  Snickers: require("../assets/products/Snickers.jpg"),
  Snickers_Almond: require("../assets/products/Snickers_Almond.jpg"),
  Twix: require("../assets/products/Twix.jpg"),

  Chanaflour: require("../assets/products/Chanaflour.jpg"),
  Greenmoong: require("../assets/products/Greenmoong.jpg"),
  Idlirava: require("../assets/products/Idlirava.jpg"),
  Maida: require("../assets/products/Maida.jpg"),
  Rajma: require("../assets/products/Rajma.jpg"),
  Sugar: require("../assets/products/Sugar.jpg"),
  Toordal: require("../assets/products/Toordal.jpg"),

  Boost: require("../assets/products/Boost.jpg"),
  Bournvita: require("../assets/products/Bournvita.jpg"),
  Horlicks_Lite: require("../assets/products/Horlicks_Lite.jpg"),
  Horlicks_Women_Plus: require("../assets/products/Horlicks_Women_Plus.jpg"),
  Protein_X_Chocolate: require("../assets/products/Protein_X_Chocolate.jpg"),
  Protein_X_Vanilla: require("../assets/products/Protein_X_Vanilla.jpg"),
  Similaciq: require("../assets/products/Similaciq.jpg"),

  Biotique_Honey: require("../assets/products/Biotique_Honey.jpg"),
  Biotique_Papaya: require("../assets/products/Biotique_Papaya.jpg"),
  Body_Lotion: require("../assets/products/Body_Lotion.jpg"),
  Face_Wash: require("../assets/products/Face_Wash.jpg"),
  Garnier_Bright: require("../assets/products/Garnier_Bright.jpg"),

  Kissan_Jam: require("../assets/products/Kissan_Jam.jpg"),
  Kissanjam_Pineapple: require("../assets/products/Kissanjam_Pineapple.jpg"),
  Kissanketchup_Spicy: require("../assets/products/Kissanketchup_Spicy.jpg"),
  Peri_peri: require("../assets/products/Peri_peri.jpg"),
  Strifry: require("../assets/products/Strifry.jpg"),
  Thousand_Island: require("../assets/products/Thousand_Island.jpg"),
};

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ name, source }) => (
  <View style={styles.card}>
    <View style={styles.imageWrapper}>
      <Image source={source} style={styles.productImg} />
    </View>
    <Text style={styles.productName}>{name}</Text>
  </View>
);

export default function ProductsScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  const [enabledSet, setEnabledSet] = useState(new Set());

  useEffect(() => {
    initAvailability();

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

  /* ================= BULLETPROOF INIT ================= */
  const initAvailability = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let parsed = stored ? JSON.parse(stored) : [];

      // ❌ invalid / empty / all disabled → RESET
      if (
        !Array.isArray(parsed) ||
        parsed.length === 0 ||
        parsed.every((p) => !p.enabled)
      ) {
        const reset = Object.keys(IMAGES).map((key) => ({
          key,
          enabled: true,
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
        setEnabledSet(new Set(Object.keys(IMAGES)));
        return;
      }

      // ✅ valid
      const enabled = parsed.filter((p) => p.enabled).map((p) => p.key);
      setEnabledSet(new Set(enabled));
    } catch {
      // 🚑 safety fallback
      const allKeys = Object.keys(IMAGES);
      setEnabledSet(new Set(allKeys));
    }
  };

  const CATEGORIES = [
    { title: "Beverages", items: ["Cocacola","Frooti","Maaza","Paperboat_Apple","Paperboat_MixedFruit","RedBull","Sprite","Thumsup","Tropicana_Orange"] },
    { title: "Biscuits", items: ["Hideandseek","Oreo_Double_Stuf","Oreo_Strawberry","Parleg","Unibic_Cashew","Unibic_Choco_Chip","Unibic_Honey","Unibic_Oat_Meal"] },
    { title: "Chips & Snacks", items: ["Aloo_Bhujia","Doritos","Khatta_Meetha","Lays_Cream_Onion","Lays_Masala","Lays_Salted","Pringles_Peri_Peri","Pringles_Pizza","Too_Yummy"] },
    { title: "Chocolates", items: ["Bounty","Bournville","Dairy_Milk","Dairy_Milk_Silk","Dairy_Milk_Silk_Oreo","Galaxy","Kitkat","Lindt","Mars","Perk","Snickers","Snickers_Almond","Twix"] },
    { title: "Groceries", items: ["Chanaflour","Greenmoong","Idlirava","Maida","Rajma","Sugar","Toordal"] },
    { title: "Health Drinks", items: ["Boost","Bournvita","Horlicks_Lite","Horlicks_Women_Plus","Protein_X_Chocolate","Protein_X_Vanilla","Similaciq"] },
    { title: "Personal Care", items: ["Biotique_Honey","Biotique_Papaya","Body_Lotion","Face_Wash","Garnier_Bright"] },
    { title: "Sauces & Spreads", items: ["Kissan_Jam","Kissanjam_Pineapple","Kissanketchup_Spicy","Peri_peri","Strifry","Thousand_Island"] },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#4f46e5", "#6366f1"]} style={styles.header}>
        <Text style={styles.heading}>Today's Products</Text>
        <Text style={styles.subHeadingText}>Available items in store</Text>
      </LinearGradient>

      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {CATEGORIES.map((cat) => {
          const visible = cat.items.filter((k) => enabledSet.has(k));
          if (!visible.length) return null;

          return (
            <View key={cat.title} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
              <View style={styles.grid}>
                {visible.map((key) => (
                  <ProductCard
                    key={key}
                    name={key.replace(/_/g, " ")}
                    source={IMAGES[key]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </Animated.View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF1FF" },
  header: { paddingTop: 40, paddingBottom: 42, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heading: { fontSize: 28, fontWeight: "900", color: "#fff" },
  subHeadingText: { marginTop: 6, fontSize: 14, color: "#e5e7ff" },
  backContainer: { padding: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  backText: { marginLeft: 6, fontWeight: "600" },
  categoryBlock: { paddingHorizontal: 16, marginBottom: 22 },
  categoryTitle: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", backgroundColor: "#fff", borderRadius: 18, padding: 10, marginBottom: 18, elevation: 5 },
  imageWrapper: { height: 140, backgroundColor: "#f3f4ff", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  productImg: { width: "90%", height: "90%", resizeMode: "contain" },
  productName: { marginTop: 6, textAlign: "center", fontSize: 15, fontWeight: "700" },
});
