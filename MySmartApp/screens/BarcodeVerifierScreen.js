import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CART_PRODUCTS } from "../data/cartProducts";

export default function BarcodeVerifierScreen({ cart = [] }) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  /* ================= VERIFY BARCODE ================= */
  const verifyBarcode = () => {
    setError("");
    setResult(null);

    const enteredCode = barcodeInput.trim().toUpperCase();

    const product = Object.values(CART_PRODUCTS).find(
      (p) => p.barcodeCode?.toUpperCase() === enteredCode
    );

    if (!product) {
      setError("Invalid PRD number");
      return;
    }

    const isInCart = cart.some(
      (item) =>
        item.name?.toLowerCase() === product.name.toLowerCase()
    );

    if (!isInCart) {
      setError("Please add this item to cart before verifying.");
      return;
    }

    setResult(product);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ✅ STATUS BAR FIX */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f1f5f9"
      />

      <View style={styles.container}>
        <Text style={styles.title}>Barcode Verifier</Text>

        {/* INPUT */}
        <View style={styles.inputBox}>
          <MaterialCommunityIcons
            name="barcode"
            size={22}
            color="#1e3a8a"
          />
          <TextInput
            placeholder="Enter PRD number (e.g. PRD-0015)"
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        {/* VERIFY BUTTON */}
        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={verifyBarcode}
        >
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        {/* ERROR MESSAGE */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* RESULT */}
        {result && (
          <View style={styles.resultCard}>
            <Image
              source={result.image}
              style={styles.productImg}
              resizeMode="contain"
            />

            <Text style={styles.productName}>{result.name}</Text>

            {result.barcodeImage && (
              <Image
                source={result.barcodeImage}
                style={styles.barcodeImg}
                resizeMode="contain"
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  /* ✅ EXTRA CONTAINER TO AVOID OVERLAP */
  container: {
    flex: 1,
    padding: 20,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + 12
        : 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 20,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  verifyBtn: {
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },

  verifyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  error: {
    marginTop: 14,
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },

  resultCard: {
    marginTop: 24,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    alignItems: "center",
  },

  productImg: {
    width: "100%",
    height: 160,
    marginBottom: 12,
  },

  productName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  barcodeImg: {
    width: "100%",
    height: 90,
  },
});
