import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* -------- BANK LIST -------- */
const BANKS = [
  "HDFC Bank",
  "State Bank of India",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Yes Bank",
];

/* -------- TXN ID -------- */
const generateTxnId = () =>
  "UPI" + Math.floor(100000000000 + Math.random() * 900000000000);

/* -------- UPI APPS -------- */
const UPI_APPS = [
  { label: "Google Pay", icon: "google", color: "#4285F4" },
  { label: "PhonePe", icon: "cellphone", color: "#673ab7" },
  { label: "Paytm", icon: "wallet", color: "#00baf2" },
];

export default function DummyUPIScreen({ navigation, route }) {
  const { amount, invoice, clearCart, resetRewards } = route.params || {};

  const [stage, setStage] = useState("select");
  const [status, setStatus] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [bank, setBank] = useState("");
  const [txnId] = useState(generateTxnId);

  /* -------- ANIMATIONS -------- */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  /* ❌ Disable hardware back ONLY during payment */
  useEffect(() => {
    if (stage !== "select") {
      const back = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => back.remove();
    }
  }, [stage]);

  /* Screen transition */
  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stage]);

  /* Rotating processing icon */
  useEffect(() => {
    if (stage === "processing") {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [stage]);

  /* Fake bank response */
  useEffect(() => {
    if (stage === "processing") {
      setTimeout(() => {
        const ok = Math.random() < 0.7;
        setStatus(ok ? "success" : "failed");
        setStage("result");
      }, 2600);
    }
  }, [stage]);

  const pickBank = () =>
    BANKS[Math.floor(Math.random() * BANKS.length)];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* ================= SELECT ================= */
  if (stage === "select") {
    return (
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* 🔙 BACK BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#1e40af"
          />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Select UPI App</Text>

        {UPI_APPS.map((app) => (
          <TouchableOpacity
            key={app.label}
            style={styles.upiBtn}
            onPress={() => {
              setSelectedApp(app);
              setBank(pickBank());
              setStage("processing");
            }}
          >
            <MaterialCommunityIcons
              name={app.icon}
              size={28}
              color={app.color}
            />
            <Text style={styles.upiText}>{app.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#6b7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        ))}

        <Text style={styles.amount}>Amount: ₹{amount}</Text>
      </Animated.View>
    );
  }

  /* ================= PROCESSING ================= */
  if (stage === "processing") {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.processingCircle, { transform: [{ rotate: spin }] }]}
        >
          <MaterialCommunityIcons
            name="bank-transfer"
            size={46}
            color="#1e40af"
          />
        </Animated.View>

        <Text style={styles.processingTitle}>Processing Payment</Text>
        <Text style={styles.processingText}>
          {selectedApp?.label} → {bank}
        </Text>

        <ActivityIndicator
          size="large"
          color="#1e40af"
          style={{ marginTop: 16 }}
        />

        <Text style={styles.subText}>Please do not press back</Text>
      </View>
    );
  }

  /* ================= RESULT ================= */
  return (
    <View style={styles.container}>
      {status === "success" ? (
        <>
          <MaterialCommunityIcons
            name="check-circle"
            size={92}
            color="#16a34a"
          />
          <Text style={styles.success}>Payment Successful</Text>

          <Text style={styles.detail}>₹{amount}</Text>
          <Text style={styles.detail}>{bank}</Text>
          <Text style={styles.detail}>Txn ID: {txnId}</Text>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => {
              clearCart?.();
              resetRewards?.();

              navigation.replace("PaymentSuccess", {
                amount,
                paymentId: txnId,
                bankName: bank,
                newInvoice: {
                  ...invoice,
                  bankName: bank,
                  paymentId: txnId,
                },
              });
            }}
          >
            <Text style={styles.doneText}>Continue</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <MaterialCommunityIcons
            name="close-circle"
            size={92}
            color="#dc2626"
          />
          <Text style={styles.failed}>Payment Failed</Text>
          <Text style={styles.detail}>Bank server timeout</Text>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setStage("select");
              setStatus(null);
              setSelectedApp(null);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* -------- STYLES -------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e40af",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  upiBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginVertical: 8,
    backgroundColor: "#ffffff",
  },
  upiText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  amount: {
    marginTop: 26,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  processingCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#bfdbfe",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  processingTitle: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  processingText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  subText: {
    marginTop: 10,
    textAlign: "center",
    color: "#6b7280",
  },
  success: {
    fontSize: 24,
    fontWeight: "800",
    color: "#16a34a",
    textAlign: "center",
    marginTop: 12,
  },
  failed: {
    fontSize: 24,
    fontWeight: "800",
    color: "#dc2626",
    textAlign: "center",
    marginTop: 12,
  },
  detail: {
    marginTop: 6,
    textAlign: "center",
    fontWeight: "600",
  },
  doneBtn: {
    marginTop: 28,
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 28,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
