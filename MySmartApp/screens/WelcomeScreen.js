import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen({ navigation, route }) {
  const { name, email, role } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  const goNext = () => {
    if (role === "admin") {
      navigation.navigate("AdminDashboard", { name, email, role });
    } else {
      navigation.navigate("UserHome", { name, email, role });
    }
  };

  return (
    <LinearGradient
      colors={["#4c6ef5", "#5a8dee", "#7ab3ff"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Animated.Text
        style={{
          fontSize: 34,
          fontWeight: "bold",
          color: "#fff",
          marginBottom: 20,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        Welcome, {name} 👋
      </Animated.Text>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          onPress={goNext}
          style={{
            backgroundColor: "#fff",
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 30,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#4c6ef5" }}>
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}
