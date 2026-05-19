import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "INVOICE_HISTORY";
const MAX_HISTORY = 15;

export default function PaymentSuccess({ navigation, route }) {
  const {
    paymentId = "N/A",
    amount = 0,
    newInvoice,
    bankName = "UPI Bank",
  } = route?.params || {};

  const [processing, setProcessing] = useState(true);

  const paymentMethod = "UPI";
  const status = "SUCCESS";
  const dateTime = new Date().toLocaleString();

  /* ---------------- PROCESSING ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setProcessing(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (processing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.processingText}>
          Finalizing transaction...
        </Text>
      </View>
    );
  }

  /* ---------------- RECEIPT ---------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🧾</Text>
      <Text style={styles.title}>Payment Receipt</Text>

      <View style={styles.receipt}>
        <Row label="Amount Paid" value={`₹ ${String(amount)}`} bold />
        <Row label="Status" value={String(status)} success />
        <Row label="Payment Method" value={String(paymentMethod)} />
        <Row label="Bank" value={String(bankName)} />
        <Row label="Transaction ID" value={String(paymentId)} />
        <Row label="Date & Time" value={String(dateTime)} />
      </View>

      {/* SAVE INVOICE */}
      <TouchableOpacity
        style={styles.btn}
        onPress={async () => {
          if (!newInvoice) return;

          try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const invoices = stored ? JSON.parse(stored) : [];

            const updated = [newInvoice, ...invoices].slice(0, MAX_HISTORY);

            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(updated)
            );
          } catch (e) {
            console.log("Invoice save failed", e);
          }

          navigation.navigate("InvoiceHistory", {
            newInvoice,
          });
        }}
      >
        <Text style={styles.btnText}>View Invoice</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- ROW ---------------- */
const Row = ({ label, value, bold, success }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{String(label)}</Text>
    <Text
      style={[
        styles.value,
        bold && styles.bold,
        success && styles.success,
      ]}
    >
      {String(value)}
    </Text>
  </View>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  icon: {
    fontSize: 52,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 10,
  },
  processingText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    color: "#475569",
  },
  receipt: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    color: "#64748b",
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  bold: {
    fontSize: 18,
    fontWeight: "800",
  },
  success: {
    color: "#16a34a",
    fontWeight: "800",
  },
  btn: {
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
});
