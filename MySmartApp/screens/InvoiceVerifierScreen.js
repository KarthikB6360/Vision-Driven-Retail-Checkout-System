import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const STORAGE_KEY = "INVOICE_HISTORY";

export default function InvoiceVerifierScreen({ navigation, route }) {
  /* 🔐 ROLE CHECK */
  const role = route?.params?.role || "user";

  const [invoiceNo, setInvoiceNo] = useState("");
  const [result, setResult] = useState("");
  const [invoice, setInvoice] = useState(null);

  /* ================= VERIFY & FETCH ================= */
  const verifyInvoice = async () => {
    if (!invoiceNo.trim()) {
      Alert.alert("Error", "Please enter invoice number");
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setResult("❌ No invoices found");
        setInvoice(null);
        return;
      }

      const invoices = JSON.parse(stored);
      let foundInvoice = null;

      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === invoiceNo.trim()) {
          foundInvoice = { ...inv, verificationStatus: "VERIFIED" };
          return foundInvoice;
        }
        return inv;
      });

      if (!foundInvoice) {
        setResult("❌ Invoice NOT FOUND");
        setInvoice(null);
        return;
      }

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedInvoices)
      );

      setInvoice(foundInvoice);
      setResult("✅ Invoice VERIFIED successfully");
      setInvoiceNo("");
    } catch (error) {
      console.log(error);
      setResult("⚠️ Verification failed");
      setInvoice(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#845ef7", "#5f3dc4"]} style={styles.header}>
        {/* 🔙 BACK BUTTON (LEFT IN HEADER) */}
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Invoice Verifier</Text>
        <Text style={styles.subTitle}>Admin Access Only</Text>
      </LinearGradient>

      {/* 🔐 ACCESS CONTROL */}
      {role !== "admin" ? (
        <View style={styles.card}>
          <Text style={styles.restricted}>
            🚫 Access Restricted{"\n\n"}
            Only Admin can verify invoices
          </Text>
        </View>
      ) : (
        <ScrollView>
          {/* INPUT CARD */}
          <View style={styles.card}>
            <Text style={styles.label}>Invoice Number</Text>

            <TextInput
              value={invoiceNo}
              onChangeText={setInvoiceNo}
              placeholder="Enter Invoice No"
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.verifyBtn} onPress={verifyInvoice}>
              <Text style={styles.verifyText}>Verify Invoice</Text>
            </TouchableOpacity>

            {result !== "" && (
              <Text
                style={[
                  styles.result,
                  result.includes("VERIFIED")
                    ? styles.valid
                    : styles.invalid,
                ]}
              >
                {result}
              </Text>
            )}
          </View>

          {/* ================= FULL INVOICE DISPLAY ================= */}
          {invoice && (
            <View style={styles.billCard}>
              <Text style={styles.store}>Smart Retail Store</Text>
              <Text style={styles.sub}>Bengaluru</Text>

              <View style={styles.line} />

              <Row label="Invoice No" value={invoice.id} />
              <Row label="Date & Time" value={invoice.date} />
              <Row label="Bank" value={invoice.bankName || "—"} />
              <Row
                label="Verification"
                value={invoice.verificationStatus}
                success
              />

              <View style={styles.line} />

              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 3 }]}>Name</Text>
                <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>
                  Qty
                </Text>
                <Text style={[styles.th, { flex: 2, textAlign: "right" }]}>
                  Price
                </Text>
              </View>

              {invoice.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={{ flex: 3 }}>{item.name}</Text>
                  <Text style={{ flex: 1, textAlign: "center" }}>
                    {item.qty}
                  </Text>
                  <Text style={{ flex: 2, textAlign: "right" }}>
                    {item.total}
                  </Text>
                </View>
              ))}

              <View style={styles.line} />

              <Row label="Subtotal" value={invoice.subtotal} />
              <Row label="Discount" value={`- ${invoice.discount || 0}`} />

              <View style={styles.boldLine} />

              <Row
                label="TOTAL PAID"
                value={invoice.grandTotal}
                bold
                success
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

/* ================= ROW ================= */
const Row = ({ label, value, bold, success }) => (
  <View style={styles.row}>
    <Text style={[styles.labelText, bold && styles.bold]}>
      {label}
    </Text>
    <Text
      style={[
        styles.value,
        bold && styles.bold,
        success && styles.success,
      ]}
    >
      {value}
    </Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  header: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerBack: {
    position: "absolute",
    left: 16,
    top: 50,
  },

  backIcon: {
    fontSize: 26,
    color: "#ffffff",
    fontWeight: "900",
  },

  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  subTitle: { color: "#e5dbff", marginTop: 4, fontSize: 14 },

  card: {
    margin: 20,
    padding: 25,
    borderRadius: 14,
    backgroundColor: "#fff",
    elevation: 4,
  },

  label: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
  },

  verifyBtn: {
    backgroundColor: "#5f3dc4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  verifyText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  result: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },

  valid: { color: "#2b8a3e" },
  invalid: { color: "#c92a2a" },

  restricted: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#c92a2a",
  },

  billCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },

  store: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  sub: {
    fontSize: 12,
    textAlign: "center",
    color: "#64748b",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  labelText: { fontSize: 13, color: "#475569" },
  value: { fontSize: 13, fontWeight: "600" },

  success: { color: "#16a34a" },

  tableHeader: { flexDirection: "row", paddingVertical: 6 },
  th: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  itemRow: { flexDirection: "row", marginVertical: 4 },

  line: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },

  boldLine: {
    height: 2,
    backgroundColor: "#0f172a",
    marginVertical: 8,
  },

  bold: { fontWeight: "900" },
});
