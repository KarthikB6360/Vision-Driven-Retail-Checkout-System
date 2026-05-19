import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "USERS_LIST";

export default function UserListScreen({ navigation, route }) {
  const adminName = route?.params?.name || "Admin";
  const adminEmail = route?.params?.email || "";

  const [users, setUsers] = useState([]);

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    // 1️⃣ Priority: users passed via route
    if (route?.params?.users) {
      setUsers(route.params.users);
      return;
    }

    // 2️⃣ Fallback: load from AsyncStorage
    loadUsersFromStorage();
  }, []);

  const loadUsersFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_KEY);
      if (stored) {
        setUsers(JSON.parse(stored));
      }
    } catch (e) {
      console.log("Failed to load users", e);
    }
  };

  const goBack = () => {
    navigation.navigate("AdminDashboard", {
      name: adminName,
      email: adminEmail,
      role: "admin",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#4f46e5", "#4338ca", "#3730a3"]}
        style={styles.headerBg}
      />

      {/* BACK BUTTON */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.backBtn}
        onPress={goBack}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={26}
          color="#1f2937"
        />
      </TouchableOpacity>

      {/* HEADER CONTENT */}
      <View style={styles.headerContent}>
        <Text style={styles.totalUsers}>
          Total Users <Text style={styles.count}>{users.length}</Text>
        </Text>
        <Text style={styles.subText}>Registered Platform Users</Text>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>All Users</Text>

      {/* USERS LIST */}
      <FlatList
        data={users}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={["#ffffff", "#f4f6ff"]}
            style={styles.userCard}
          >
            <View style={styles.userAvatar}>
              <MaterialCommunityIcons
                name="account"
                size={26}
                color="#4f46e5"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
          </LinearGradient>
        )}
        ListEmptyComponent={
          <Text style={styles.noUsers}>No users found.</Text>
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  headerBg: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 170,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backBtn: {
    position: "absolute",
    top: 55,
    left: 16,
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",

    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  headerContent: {
    marginTop: 55,
    alignItems: "center",
  },

  totalUsers: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },

  count: {
    color: "#fde047",
    fontWeight: "900",
  },

  subText: {
    marginTop: 4,
    fontSize: 14,
    color: "#e0e7ff",
  },

  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,

    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  noUsers: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
  },
});
