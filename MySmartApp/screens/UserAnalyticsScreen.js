import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const USER_KEY = "USERS_LIST";

export default function UserAnalyticsScreen({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [growthData, setGrowthData] = useState([0]);

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    if (route?.params?.users) {
      processUsers(route.params.users);
      return;
    }
    loadUsersFromStorage();
  }, []);

  const loadUsersFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_KEY);
      processUsers(stored ? JSON.parse(stored) : []);
    } catch {
      processUsers([]);
    }
  };

  /* ================= PROCESS USERS ================= */
  const processUsers = (userList) => {
    const list = Array.isArray(userList) ? userList : [];
    setUsers(list);

    const count = list.length;
    setTotalUsers(count);

    // Estimated active users (30%)
    const active = Math.round(count * 0.3);
    setActiveUsers(active);

    // Growth curve
    const growth = list.map((_, index) => index + 1);
    setGrowthData(growth.length ? growth : [0]);
  };

  const engagementRate = totalUsers
    ? Math.round((activeUsers / totalUsers) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <LinearGradient colors={["#4f46e5", "#3730a3"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>User Analytics Dashboard</Text>
        <Text style={styles.subTitle}>
          Visual analysis of user growth and engagement
        </Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= KPI SECTION ================= */}
        <View style={styles.kpiRow}>
          <KpiCard title="Total Users" value={totalUsers} />
          <KpiCard title="Active Users" value={activeUsers} />
        </View>

        <View style={styles.kpiRow}>
          <KpiCard title="Engagement Rate" value={`${engagementRate}%`} />
          <KpiCard title="User Growth" value="Increasing" />
        </View>

        
        

        {/* ================= LINE GRAPH ================= */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>User Growth Over Time</Text>
          <Text style={styles.axisText}>X-Axis: User Registration Order</Text>
          <Text style={styles.axisText}>Y-Axis: Total Users</Text>

          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: growthData.map((_, i) =>
                  i % 2 === 0 ? `U${i + 1}` : ""
                ),
                datasets: [{ data: growthData }],
              }}
              width={screenWidth - 64}
              height={240}
              chartConfig={chartConfig}
              bezier
              fromZero
            />
          </View>
        </View>

        {/* ================= BAR GRAPH ================= */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>User Activity Distribution</Text>
          <Text style={styles.axisText}>X-Axis: Activity Status</Text>
          <Text style={styles.axisText}>Y-Axis: Number of Users</Text>

          <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: ["Active", "Inactive"],
                datasets: [
                  {
                    data: [
                      activeUsers,
                      Math.max(totalUsers - activeUsers, 0),
                    ],
                  },
                ],
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              fromZero
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= KPI CARD ================= */
const KpiCard = ({ title, value }) => (
  <View style={styles.kpiCard}>
    <Text style={styles.kpiLabel}>{title}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
  </View>
);

/* ================= CHART CONFIG ================= */
const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(79,70,229,${opacity})`,
  labelColor: () => "#475569",
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  backBtn: { position: "absolute", left: 16, top: 56 },
  backIcon: { fontSize: 26, color: "#fff", fontWeight: "900" },

  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  subTitle: { marginTop: 6, fontSize: 13, color: "#c7d2fe" },

  kpiRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
  },

  kpiCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    elevation: 5,
  },

  kpiLabel: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  kpiValue: { fontSize: 24, fontWeight: "900", color: "#4f46e5" },

  definitionBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    padding: 12,
  },

  definitionText: {
    fontSize: 12,
    color: "#334155",
    marginBottom: 4,
  },

  bold: { fontWeight: "800" },

  chartCard: {
    marginTop: 26,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 5,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },

  axisText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },

  chartWrapper: {
    marginTop: 10,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 16,
  },
});
