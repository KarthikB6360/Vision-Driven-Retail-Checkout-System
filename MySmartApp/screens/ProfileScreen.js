// ProfileScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { updateProfile } from "../services/api";

export default function ProfileScreen({ navigation, route }) {
  const user = route?.params || {};

  const [newName, setNewName] = useState(user.name);
  const [newEmail, setNewEmail] = useState(user.email);

  const saveChanges = async () => {
    if (!newName.trim()) return Alert.alert("Error", "Name cannot be empty");
    if (!newEmail.trim()) return Alert.alert("Error", "Email cannot be empty");

    const res = await updateProfile(
      user.email,
      newName.trim(),
      newEmail.trim().toLowerCase()
    );

    if (res.status === "success") {
      const updatedUser = {
        name: newName,
        email: newEmail,
        role: user.role, // keep same role
      };

      // Update global app state
      navigation.updateUser(updatedUser);

      Alert.alert("Success", "Profile updated!");

      // Correct navigation for admin/user
      if (user.role === "admin") {
        navigation.navigate("AdminDashboard", updatedUser);
      } else {
        navigation.navigate("UserHome", updatedUser);
      }

    } else {
      Alert.alert("Error", res.message);
    }
  };

  const handleBack = () => {
    if (user.role === "admin") {
      navigation.navigate("AdminDashboard", user);
    } else {
      navigation.navigate("UserHome", user);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {newName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heading}>My Profile</Text>
      </View>

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        value={newName}
        onChangeText={setNewName}
        style={styles.input}
        placeholder="Full Name"
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={newEmail}
        onChangeText={setNewEmail}
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
      />

      {/* Save Changes */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: "#fff" },

  backBtn: { marginTop: 14, marginBottom: 20 },
  backIcon: { fontSize: 32, fontWeight: "700", color: "#222" },

  header: { alignItems: "center", marginBottom: 30 },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#4c6ef5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
  },

  avatarText: { color: "#fff", fontSize: 42, fontWeight: "700" },

  heading: { fontSize: 27, fontWeight: "700", color: "#111" },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#f7f7f7",
  },

  saveBtn: {
    backgroundColor: "#4c6ef5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 22,
  },

  saveText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  logoutBtn: {
    backgroundColor: "#e03131",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 22,
  },

  logoutText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
