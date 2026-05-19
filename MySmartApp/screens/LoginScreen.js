// screens/LoginScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { login } from "../services/api";

export default function LoginScreen({ navigation, onLoginSuccess, route = {} }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    if (route?.params?.resetForm) {
      setEmail("");
      setPassword("");
    }
  }, [route?.params]);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Enter email & password");
    }

    const res = await login(email.trim().toLowerCase(), password.trim());

    if (res.status === "success") {
      const userData = {
        name: res.name,
        email: res.email,
        role: res.role,
      };

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(userData);
        return;
      }

      if (res.role === "admin") {
        navigation.navigate("AdminDashboard", userData);
      } else {
        navigation.navigate("UserHome", userData);
      }
    } else {
      Alert.alert("Login Failed", res.message || "Invalid credentials");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.gradientBg} />

      <Animated.View
        style={[
          styles.centerWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#1f3c88"
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#1f3c88"
            />
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#1f3c88"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signup}>
            New user? <Text style={styles.signupLink}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e0e7ff" },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  gradientBg: {
    position: "absolute",
    width: "160%",
    height: "160%",
    top: -200,
    left: -100,
    backgroundColor: "#b3c5ff",
    opacity: 0.25,
    borderRadius: 350,
    transform: [{ rotate: "15deg" }],
  },
  title: { fontSize: 36, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#475569", marginBottom: 25 },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.75)",
    padding: 22,
    borderRadius: 18,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.3,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  input: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 16 },
  loginBtn: {
    backgroundColor: "#1f3c88",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 12,
  },
  loginText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  forgot: {
    color: "#1f3c88",
    fontWeight: "700",
    fontSize: 15,
    marginTop: 18,
  },
  signup: { fontSize: 15, color: "#334155", marginTop: 18 },
  signupLink: { color: "#1f3c88", fontWeight: "800" },
});
