import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* USER SCREENS */
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import UserHome from "../screens/UserHome";
import ProfileScreen from "../screens/ProfileScreen";
import InvoiceHistory from "../screens/InvoiceHistory";
import RewardsScreen from "../screens/RewardsScreen";
import ScanScreen from "../screens/ScanScreen";
import EcoScoreScreen from "../screens/EcoScoreScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import MyCartScreen from "../screens/MyCartScreen";
import ProductsScreen from "../screens/ProductsScreen";
import BarcodeVerifierScreen from "../screens/BarcodeVerifierScreen";
import PaymentSuccess from "../screens/PaymentSuccess";
import DummyUPIScreen from "../screens/DummyUPIScreen";

/* ADMIN CORE */
import AdminDashboard from "../screens/AdminDashboard";
import UserListScreen from "../screens/UserListScreen";

/* 🔹 NEW ADMIN FEATURES (TEMP) */
import ProductAvailabilityScreen from "../screens/ProductAvailabilityScreen";
import InvoiceVerifierScreen from "../screens/InvoiceVerifierScreen";
import UserAnalyticsScreen from "../screens/UserAnalyticsScreen";
import ScanFailureScreen from "../screens/ScanFailureScreen";
import SystemLogsScreen from "../screens/SystemLogsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ----------------- CUSTOM BACK BUTTON ----------------- */
const BackButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{ paddingHorizontal: 10 }}
  >
    <MaterialCommunityIcons name="arrow-left" size={26} color="#1f3c88" />
  </TouchableOpacity>
);

/* ----------------- USER TABS ----------------- */
function UserTabs({ route = { params: {} } }) {
  const { name, email, role } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1f3c88",
          height: 58,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#c7d2fe",
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserHome}
        initialParams={{ name, email, role }}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-outline" size={22} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontWeight: "600" }}>Home</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="barcode-scan" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="shopping-search" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={InvoiceHistory}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-document-outline" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot-outline" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/* ----------------- ADMIN STACK ----------------- */
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserListScreen" component={UserListScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* 🔹 UNIQUE ADMIN FEATURE SCREENS */}
      <Stack.Screen
        name="ProductAvailabilityScreen"
        component={ProductAvailabilityScreen}
      />
      <Stack.Screen
        name="InvoiceVerifierScreen"
        component={InvoiceVerifierScreen}
      />
      <Stack.Screen
        name="UserAnalyticsScreen"
        component={UserAnalyticsScreen}
      />
      <Stack.Screen
        name="ScanFailureScreen"
        component={ScanFailureScreen}
      />
      <Stack.Screen
        name="SystemLogsScreen"
        component={SystemLogsScreen}
      />
    </Stack.Navigator>
  );
}

/* ----------------- ROOT NAVIGATOR ----------------- */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#eef2ff" },
          headerLeft: () => <BackButton navigation={navigation} />,
        })}
      >
        {/* AUTH */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* USER FLOW */}
        <Stack.Screen
          name="UserTabs"
          component={UserTabs}
          options={{ headerShown: false }}
        />

        {/* CART */}
        <Stack.Screen
          name="MyCart"
          component={MyCartScreen}
          options={{ headerShown: false }}
        />

        {/* DUMMY UPI */}
        <Stack.Screen
          name="DummyUPI"
          component={DummyUPIScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* REWARDS */}
        <Stack.Screen
          name="Rewards"
          component={RewardsScreen}
          options={{ headerShown: false }}
        />

        {/* ECO SCORE */}
        <Stack.Screen
          name="EcoScore"
          component={EcoScoreScreen}
          options={{ headerShown: false }}
        />

        {/* PAYMENT SUCCESS */}
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccess}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* BARCODE VERIFIER */}
        <Stack.Screen
          name="BarcodeVerifier"
          component={BarcodeVerifierScreen}
        />

        {/* ADMIN */}
        <Stack.Screen
          name="AdminStack"
          component={AdminStack}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
