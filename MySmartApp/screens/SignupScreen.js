// screens/SignupScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signup } from "../services/api";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
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
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const doSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Error", "All fields are required");
    }

    if (!email.includes("@")) {
      return Alert.alert("Error", "Enter a valid email");
    }

    if (password.length < 6) {
      return Alert.alert("Error", "Password must be 6+ characters");
    }

    const res = await signup(name.trim(), email.trim().toLowerCase(), password.trim());

    if (res.status === "success") {
      Alert.alert("Success", "Signup successful! Please login.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } else {
      Alert.alert("Signup Failed", res.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#eef2ff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* BACKGROUND EFFECT */}
      <View style={styles.bgCircle} />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.card}>
          {/* Name */}
          <View style={styles.row}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#1f3c88" />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          {/* Email */}
          <View style={styles.row}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#1f3c88" />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.row}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#1f3c88" />
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#1f3c88"
              />
            </TouchableOpacity>
          </View>

          {/* SIGN UP BUTTON */}
          <TouchableOpacity style={styles.signupBtn} onPress={doSignup}>
            <Text style={styles.signupText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 20 }}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bgCircle: {
    position: "absolute",
    width: 400,
    height: 400,
    backgroundColor: "#b3c5ff",
    opacity: 0.25,
    borderRadius: 300,
    top: -100,
    left: -80,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: "#1e293b",
  },

  signupBtn: {
    backgroundColor: "#1f3c88",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#1f3c88",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  signupText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  loginText: {
    fontSize: 15,
    color: "#1e293b",
    textAlign: "center",
  },

  loginLink: {
    color: "#1f3c88",
    fontWeight: "700",
  },
});
