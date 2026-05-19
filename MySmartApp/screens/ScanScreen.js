// ScanScreen.js (Modern Animated UI + Fixed Header + SafeAreaView)

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scanProduct } from "../services/api";

export default function ScanScreen({ navigation, addToCart }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  // Animations
  const previewAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (imageUri) {
      previewAnim.setValue(0);
      Animated.timing(previewAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [imageUri]);

  useEffect(() => {
    if (product) {
      cardAnim.setValue(0);
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [product]);

  // CAMERA PICKER
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera access is needed.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendToML(uri);
    }
  };

  // GALLERY PICKER
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery access is needed.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.9,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendToML(uri);
    }
  };

  // SEND IMAGE TO ML BACKEND
  const sendToML = async (uri) => {
    try {
      setLoading(true);
      setProduct(null);

      const res = await scanProduct(uri);
      console.log("ML RESPONSE:", res);

      if (!res || res.status !== "success") {
        Alert.alert("Server Error", "ML server did not respond properly.");
        return;
      }

      if (!res.product) {
        Alert.alert("Not Found", "No matching product detected.");
        return;
      }

      setProduct(res.product);
    } catch (err) {
      console.log("ML Error:", err);
      Alert.alert("Error", "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  // ADD TO CART HANDLER
  const handleAddToCart = () => {
    if (!product) return;

    if (addToCart) {
      addToCart(product); // ➜ Global cart
      Alert.alert("Added to Cart", `${product.name} added to your cart.`);
    } else {
      navigation.navigate("MyCart", { product });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="cart-outline" size={26} color="#1e3a8a" />
          <Text style={styles.headerTitle}>Smart Product Scanner</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Scan any retail product to view quick insights.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* BUTTONS */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnPrimary} onPress={openCamera}>
            <MaterialCommunityIcons
              name="camera-enhance-outline"
              size={22}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, styles.btnSecondary]}
            onPress={openGallery}
          >
            <MaterialCommunityIcons
              name="image-outline"
              size={22}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* PREVIEW */}
        {imageUri ? (
          <Animated.View
            style={{
              opacity: previewAnim,
              transform: [
                {
                  translateY: previewAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          </Animated.View>
        ) : (
          <View style={styles.previewPlaceholder}>
            <MaterialCommunityIcons name="image-search" size={40} color="#94a3b8" />
            <Text style={styles.placeholderTitle}>No image selected</Text>
            <Text style={styles.placeholderText}>
              Use Camera or Gallery to scan a product.
            </Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 18 }} />
        )}

        {/* PRODUCT CARD */}
        {product && (
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  {
                    scale: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{product.category}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Price</Text>
              <Text style={styles.value}>₹ {product.price}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Nutrition Score</Text>
              <Text style={styles.value}>{product.nutrition_score}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Eco Rating</Text>
              <Text style={styles.value}>{product.eco_rating}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            {/* ADD TO CART */}
            <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
              <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
              <Text style={styles.addCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========== STYLES =========== */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSubtitle: { marginTop: 4, fontSize: 13, color: "#6b7280" },
  container: { padding: 20, paddingBottom: 40 },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    paddingVertical: 12,
    borderRadius: 999,
    marginHorizontal: 4,
    elevation: 4,
  },
  btnSecondary: { backgroundColor: "#0f766e" },
  btnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  preview: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewPlaceholder: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    backgroundColor: "#e5e7eb33",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  placeholderText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    marginTop: 22,
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    elevation: 6,
  },
  productName: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  label: { fontSize: 14, color: "#6b7280" },
  value: { fontSize: 14, fontWeight: "700", color: "#111827" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 20 },

  // ADD TO CART
  addCartBtn: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    borderRadius: 10,
  },
  addCartText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
});
