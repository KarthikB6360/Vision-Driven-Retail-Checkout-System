import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_KEY = "INVOICE_HISTORY";
const MAX_HISTORY = 15;

/* 🔹 FORCE INVOICE NUMBER TO 5 DIGITS */
const formatInvoiceNo = (id) => {
  if (!id) return "00000";
  const digits = id.toString().replace(/\D/g, "");
  return digits.slice(-5).padStart(5, "0");
};

export default function InvoiceHistory({ route }) {
  const [invoices, setInvoices] = useState([]);

  /* ================= LOAD STORED INVOICES ================= */
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        const normalized = parsed.map((inv) => ({
          ...inv,
          id: formatInvoiceNo(inv.id),
          verificationStatus: inv.verificationStatus || "PENDING",
          discount: inv.discount || 0,
        }));

        setInvoices(normalized);
      }
    } catch (e) {
      console.log("Failed to load invoices", e);
    }
  };

  /* ================= ADD NEW INVOICE ================= */
  useEffect(() => {
    if (route?.params?.newInvoice) {
      setInvoices((prev) => {
        const newInv = {
          ...route.params.newInvoice,
          id: formatInvoiceNo(route.params.newInvoice.id),
          verificationStatus: "PENDING",
          discount: route.params.newInvoice.discount || 0,
        };

        const updated = [newInv, ...prev].slice(0, MAX_HISTORY);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [route?.params?.newInvoice]);

  /* ================= VOICE READER ================= */
  const speakInvoice = (inv) => {
    if (!inv) return;

    let speechText = "Welcome to our store. ";

    // if (inv.date) speechText += `Date and time ${inv.date}. `;
    if (inv.bankName)
      speechText += `Payment made through ${inv.bankName}. `;

    speechText += `Invoice number ${inv.id}. `;
    speechText += "Purchased items are. ";

    inv.items.forEach((item) => {
      speechText += `${item.name}, quantity ${item.qty}, price rupees ${item.total}. `;
    });

    if (Number(inv.discount) > 0) {
      speechText += `Discount applied rupees ${inv.discount}. `;
    } else {
      speechText += "No discount applied. ";
    }

    speechText += `Invoice verification status is ${inv.verificationStatus}. `;
    speechText += `Total amount paid rupees ${inv.grandTotal}. Thank you.`;

    Speech.stop();
    Speech.speak(speechText, {
      rate: 0.9,
      pitch: 1.0,
      language: "en-IN",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

      {/* ================= TITLE BAR ================= */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>INVOICE HISTORY</Text>

        {invoices.length > 0 && (
          <TouchableOpacity
            style={styles.speaker}
            onPress={() => speakInvoice(invoices[0])}
          >
            <MaterialCommunityIcons
              name="volume-high"
              size={26}
              color="#ffffff"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= CONTENT ================= */}
      {invoices.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>🧾 No invoices available</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {invoices.map((inv, index) => {
            const totalQty = inv.items.reduce(
              (sum, i) => sum + Number(i.qty),
              0
            );

            return (
              <View key={`${inv.id}_${index}`} style={styles.billCard}>
                <Text style={styles.store}>Smart Retail Store</Text>
                <Text style={styles.sub}>Bengaluru</Text>

                <View style={styles.line} />

                <Row label="Invoice No" value={inv.id} />
                <Row label="Date & Time" value={inv.date} />
                <Row label="Bank" value={inv.bankName || "—"} />
                <Row
                  label="Verification"
                  value={inv.verificationStatus}
                  status
                />

                <View style={styles.line} />

                {/* ===== ITEMS TABLE ===== */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 3 }]}>Name</Text>
                  <Text
                    style={[
                      styles.th,
                      { flex: 1, textAlign: "center" },
                    ]}
                  >
                    Qty
                  </Text>
                  <Text
                    style={[
                      styles.th,
                      { flex: 2, textAlign: "right" },
                    ]}
                  >
                    Price
                  </Text>
                </View>

                {inv.items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={{ flex: 3 }}>{item.name}</Text>
                    <Text
                      style={{ flex: 1, textAlign: "center" }}
                    >
                      {item.qty}
                    </Text>
                    <Text
                      style={{ flex: 2, textAlign: "right" }}
                    >
                      {item.total}
                    </Text>
                  </View>
                ))}

                <View style={styles.line} />

                <Row label="Total Quantity" value={totalQty} />
                <Row label="Subtotal" value={inv.subtotal} />
                <Row label="Discount" value={`- ${inv.discount}`} />

                <View style={styles.boldLine} />

                <Row
                  label="TOTAL PAID"
                  value={inv.grandTotal}
                  bold
                  success
                />
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ================= ROW ================= */
const Row = ({ label, value, bold, success, status }) => (
  <View style={styles.row}>
    <Text style={[styles.label, bold && styles.bold]}>
      {label}
    </Text>
    <Text
      style={[
        styles.value,
        bold && styles.bold,
        success && styles.success,
        status &&
          (value === "VERIFIED"
            ? styles.verified
            : styles.pending),
      ]}
    >
      {value}
    </Text>
  </View>
);

/* ================= STYLES (UNCHANGED) ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },

  titleBar: {
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 12,
    height:
      Platform.OS === "android"
        ? 60 + StatusBar.currentHeight
        : 60,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
  },

  titleText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },

  speaker: {
    position: "absolute",
    right: 16,
    bottom: 14,
  },

  container: { padding: 12 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
  },

  billCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
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

  label: { fontSize: 13, color: "#475569" },
  value: { fontSize: 13, fontWeight: "600" },

  bold: { fontWeight: "900", fontSize: 15 },
  success: { color: "#16a34a" },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
  },

  th: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },

  itemRow: {
    flexDirection: "row",
    marginVertical: 4,
  },

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

  pending: { color: "#d97706" },
  verified: { color: "#16a34a" },
});
