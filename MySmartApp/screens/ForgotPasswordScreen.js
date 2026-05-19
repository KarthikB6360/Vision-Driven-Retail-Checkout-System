// screens/ForgotPasswordScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resetPassword } from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleReset = async () => {
    if (!email || !newPass || !confirmPass)
      return Alert.alert("Error", "All fields are required.");

    if (!email.includes("@"))
      return Alert.alert("Error", "Enter a valid email.");

    if (newPass.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters.");

    if (newPass !== confirmPass)
      return Alert.alert("Error", "Passwords do not match.");

    setLoading(true);

    const res = await resetPassword(email.trim().toLowerCase(), newPass);
    setLoading(false);

    if (res.status === "success") {
      Alert.alert("Success", "Password updated!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login", { resetForm: true }),
        },
      ]);
    } else {
      Alert.alert("Failed", res.message || "Unable to reset password");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Background design */}
      <View style={styles.gradientBg} />

      {/* Back button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#1f3c88" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Reset Password</Text>
      </View>

      <Animated.View
        style={[
          styles.centerWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.heading}>Forgot Password?</Text>
        <Text style={styles.subheading}>Enter email & set a new password.</Text>

        {/* Email */}
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="email-outline" size={22} color="#1f3c88" />
          <TextInput
            placeholder="Registered Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* New Password */}
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="lock-reset" size={22} color="#1f3c88" />
          <TextInput
            placeholder="New Password"
            value={newPass}
            secureTextEntry={!showNew}
            onChangeText={setNewPass}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <MaterialCommunityIcons
              name={showNew ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#1f3c88"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="lock-check" size={22} color="#1f3c88" />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPass}
            secureTextEntry={!showConfirm}
            onChangeText={setConfirmPass}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <MaterialCommunityIcons
              name={showConfirm ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#1f3c88"
            />
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resetText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },

  gradientBg: {
    position: "absolute",
    width: "180%",
    height: "180%",
    top: -250,
    left: -150,
    backgroundColor: "#b3c5ff",
    opacity: 0.25,
    borderRadius: 350,
    transform: [{ rotate: "25deg" }],
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 45,
  },

  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
    color: "#1e293b",
  },

  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1e293b",
  },

  subheading: {
    color: "#475569",
    marginBottom: 25,
    fontSize: 15,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },

  resetBtn: {
    backgroundColor: "#1f3c88",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#1f3c88",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  resetText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
