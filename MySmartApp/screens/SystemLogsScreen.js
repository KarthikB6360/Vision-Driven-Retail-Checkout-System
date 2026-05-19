import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONSTANT ================= */
const HEALTH_TEST_KEY = "__system_health_test__";

export default function SystemLogsScreen({ navigation }) {
  const [storageOk, setStorageOk] = useState(true);
  const [systemStatus, setSystemStatus] = useState("CHECKING");
  const [logs, setLogs] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const [heartbeat, setHeartbeat] = useState(0);

  /* ================= SAFE LOG ADDER ================= */
  const addLog = (type, message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      { time, type, message },
      ...prev.slice(0, 14),
    ]);
  };

  /* ================= HEARTBEAT (PROVES SYSTEM ALIVE) ================= */
  useEffect(() => {
    const beat = setInterval(() => {
      setHeartbeat((h) => h + 1);
    }, 1000);

    return () => clearInterval(beat);
  }, []);

  /* ================= STORAGE SELF-TEST ================= */
  useEffect(() => {
    const checkStorage = async () => {
      try {
        await AsyncStorage.setItem(HEALTH_TEST_KEY, "OK");
        const value = await AsyncStorage.getItem(HEALTH_TEST_KEY);

        if (value === "OK") {
          setStorageOk(true);
          addLog("INFO", "Storage read/write verified");
        } else {
          throw new Error("Mismatch");
        }
      } catch {
        setStorageOk(false);
        addLog("ERROR", "Storage access failed");
      }

      setLastCheck(new Date());
    };

    checkStorage();
    const interval = setInterval(checkStorage, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ================= SYSTEM HEALTH DECISION ================= */
  useEffect(() => {
    if (!storageOk) {
      setSystemStatus("ERROR");
    } else {
      setSystemStatus("HEALTHY");
    }
  }, [storageOk, heartbeat]);

  /* ================= STATUS COLOR ================= */
  const statusColor =
    systemStatus === "HEALTHY"
      ? "#16a34a"
      : "#dc2626";

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <LinearGradient colors={["#111827", "#1f2937"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>System Logs Monitor</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.subtitle}>
          Real-time internal system verification
        </Text>
      </LinearGradient>

      {/* ================= CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* STATUS CARD */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>System Status</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>
            {systemStatus}
          </Text>

          <Text style={styles.statusMeta}>
            Storage: {storageOk ? "OK" : "FAILED"}
          </Text>
          <Text style={styles.statusMeta}>
            Heartbeat: {heartbeat} (system alive)
          </Text>
        </View>

        {/* LAST CHECK */}
        <View style={styles.card}>
          <MaterialCommunityIcons name="clock-outline" size={20} />
          <Text style={styles.cardText}>
            Last System Check:{" "}
            {lastCheck ? lastCheck.toLocaleTimeString() : "Running…"}
          </Text>
        </View>

        {/* LIVE LOGS */}
        <View style={styles.logBox}>
          <Text style={styles.logTitle}>Live System Events</Text>

          {logs.length === 0 && (
            <Text style={styles.logItem}>Waiting for events…</Text>
          )}

          {logs.map((log, index) => (
            <Text key={index} style={styles.logItem}>
              [{log.time}] [{log.type}] {log.message}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    paddingTop: 50,
    paddingBottom: 28,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 20, fontWeight: "900", color: "#fff" },
  subtitle: {
    marginTop: 6,
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
  },

  content: { padding: 16 },

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 4,
    marginBottom: 16,
  },

  statusLabel: { fontSize: 14, fontWeight: "700", color: "#374151" },
  statusValue: { fontSize: 22, fontWeight: "900", marginTop: 6 },
  statusMeta: { fontSize: 12, marginTop: 4, color: "#6b7280" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 3,
    marginBottom: 12,
  },

  cardText: { marginLeft: 10, fontSize: 14 },

  logBox: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },

  logTitle: {
    color: "#e5e7eb",
    fontWeight: "800",
    marginBottom: 6,
  },

  logItem: {
    color: "#c7d2fe",
    fontSize: 12,
    marginTop: 4,
  },
});
