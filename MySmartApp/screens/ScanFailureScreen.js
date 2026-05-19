import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
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
  Parleg: require("../assets/products/Parleg.jpg"),

  Lays_Masala: require("../assets/products/Lays_Masala.jpg"),
  Doritos: require("../assets/products/Doritos.jpg"),

  Dairy_Milk: require("../assets/products/Dairy_Milk.jpg"),
  Kitkat: require("../assets/products/Kitkat.jpg"),
  Snickers: require("../assets/products/Snickers.jpg"),

  Boost: require("../assets/products/Boost.jpg"),
  Bournvita: require("../assets/products/Bournvita.jpg"),
};

/* ================= WEATHER OPTIONS ================= */
const WEATHER_OPTIONS = [
  "Summer",
  "Rainy",
  "Winter",
  "Spring",
  "Autumn",
  "Cloudy",
  "Extreme Heat",
  "Cold Wave",
];

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ name, source }) => (
  <View style={styles.card}>
    <View style={styles.imageBox}>
      <Image source={source} style={styles.productImg} />
    </View>
    <Text style={styles.productName}>{name}</Text>
  </View>
);

export default function ProductsScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [enabledSet, setEnabledSet] = useState(new Set(Object.keys(IMAGES)));
  const [temperature, setTemperature] = useState("");
  const [season, setSeason] = useState("");
  const [day, setDay] = useState("");
  const [showSeasonDrop, setShowSeasonDrop] = useState(false);

  useEffect(() => {
    loadAvailability();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ================= LOAD AVAILABILITY ================= */
  const loadAvailability = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const enabled = parsed.filter(p => p.enabled).map(p => p.key);
      if (enabled.length > 0) setEnabledSet(new Set(enabled));
    } catch {
      setEnabledSet(new Set(Object.keys(IMAGES)));
    }
  };

  /* ================= VALIDATION ================= */
  const isValidInput =
    temperature.trim() !== "" &&
    season.trim() !== "" &&
    day.trim() !== "";

  /* ================= PREDICTION LOGIC ================= */
  const predictedProducts = useMemo(() => {
    if (!isValidInput) return [];

    const t = Number(temperature);
    let pool = [];

    if (t >= 35) pool = ["Cocacola","Sprite","Maaza","Frooti"];
    else if (t >= 25) pool = ["Hideandseek","Lays_Masala","Kitkat"];
    else if (t >= 10) pool = ["Boost","Bournvita","Dairy_Milk"];
    else pool = ["Snickers","Dairy_Milk"];

    if (season === "Rainy" || season === "Cloudy")
      pool.push("Parleg","Doritos");

    if (season === "Winter" || season === "Cold Wave")
      pool.push("Snickers");

    if (season === "Extreme Heat")
      pool.push("Tropicana_Orange","RedBull");

    if (day !== "Today")
      pool.push("RedBull");

    return [...new Set(pool)].filter(
      k => enabledSet.has(k) && IMAGES[k]
    );
  }, [temperature, season, day, enabledSet, isValidInput]);

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}
      <LinearGradient colors={["#020617", "#1e3a8a"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.heading}>Live Product Recommendation</Text>
            <Text style={styles.subHeading}>Real-time admin intelligence</Text>
          </View>

          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      {/* ================= FILTER PANEL ================= */}
      <View style={styles.panel}>
        <Text style={styles.label}>Temperature (°C)</Text>
        <TextInput
          keyboardType="numeric"
          value={temperature}
          onChangeText={setTemperature}
          placeholder="Enter temperature"
          style={styles.input}
        />

        <Text style={styles.label}>Weather / Season</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSeasonDrop(!showSeasonDrop)}
        >
          <Text style={styles.dropdownText}>
            {season || "Select weather"}
          </Text>
          <MaterialCommunityIcons
            name={showSeasonDrop ? "chevron-up" : "chevron-down"}
            size={20}
          />
        </TouchableOpacity>

        {showSeasonDrop && (
          <View style={styles.dropdownList}>
            {WEATHER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setSeason(opt);
                  setShowSeasonDrop(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Day</Text>
        <View style={styles.row}>
          {["Today","Tomorrow","Future"].map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setDay(d)}
              style={[styles.chip, day === d && styles.chipActive]}
            >
              <Text style={day === d ? styles.chipTextActive : styles.chipText}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ================= RESULTS ================= */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {!isValidInput ? (
          <Text style={styles.warning}>
            Please enter Temperature, Weather and Day to predict.
          </Text>
        ) : (
          <>
            <Text style={styles.resultTitle}>Predicted Items</Text>
            <View style={styles.grid}>
              {predictedProducts.map(key => (
                <ProductCard
                  key={key}
                  name={key.replace(/_/g, " ")}
                  source={IMAGES[key]}
                />
              ))}
            </View>
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  headerCenter: { flex: 1, alignItems: "center" },

  heading: { fontSize: 20, fontWeight: "900", color: "#fff" },
  subHeading: { fontSize: 12, color: "#bfdbfe" },

  panel: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
  },

  label: { fontWeight: "700", marginTop: 12 },

  input: {
    borderBottomWidth: 2,
    borderColor: "#2563eb",
    fontSize: 16,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#c7d2fe",
  },

  dropdownText: { fontSize: 14 },

  dropdownList: {
    backgroundColor: "#f1f5ff",
    borderRadius: 10,
    marginTop: 6,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#e0e7ff",
  },

  dropdownItemText: { fontSize: 13 },

  row: { flexDirection: "row", marginTop: 8 },

  chip: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
  },

  chipActive: { backgroundColor: "#1e40af" },
  chipText: { fontSize: 12, fontWeight: "700", color: "#1e3a8a" },
  chipTextActive: { fontSize: 12, fontWeight: "800", color: "#fff" },

  warning: {
    marginTop: 20,
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "700",
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 16,
    marginTop: 12,
  },

  grid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
    alignItems: "center",
  },

  imageBox: {
    width: "100%",
    height: 110,
    backgroundColor: "#f1f5ff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  productImg: { width: 90, height: 90, resizeMode: "contain" },

  productName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
