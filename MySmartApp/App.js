// import React, { useState, useMemo } from "react";
// import { SafeAreaView, View, StyleSheet } from "react-native";
// import { MenuProvider } from "react-native-popup-menu";
// import { MaterialCommunityIcons } from "@expo/vector-icons";

// /* ----------- IMPORT ALL SCREENS ----------- */
// import LoginScreen from "./screens/LoginScreen";
// import SignupScreen from "./screens/SignupScreen";
// import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
// import WelcomeScreen from "./screens/WelcomeScreen";
// import UserHome from "./screens/UserHome";
// import ProfileScreen from "./screens/ProfileScreen";
// import AdminDashboard from "./screens/AdminDashboard";
// import UserListScreen from "./screens/UserListScreen";
// import InvoiceHistory from "./screens/InvoiceHistory";
// import RewardsScreen from "./screens/RewardsScreen";
// import ScanScreen from "./screens/ScanScreen";
// import EcoScoreScreen from "./screens/EcoScoreScreen";
// import ChatbotScreen from "./screens/ChatbotScreen";
// import MyCartScreen from "./screens/MyCartScreen";
// import ProductsScreen from "./screens/ProductsScreen";
// import BarcodeVerifierScreen from "./screens/BarcodeVerifierScreen";
// import PaymentSuccess from "./screens/PaymentSuccess";
// import DummyUPIScreen from "./screens/DummyUPIScreen";

// /* 🔹 NEW ADMIN FEATURE SCREENS (TEMP) */
// import ProductAvailabilityScreen from "./screens/ProductAvailabilityScreen";
// import InvoiceVerifierScreen from "./screens/InvoiceVerifierScreen";
// import UserAnalyticsScreen from "./screens/UserAnalyticsScreen";
// import ScanFailureScreen from "./screens/ScanFailureScreen";
// import SystemLogsScreen from "./screens/SystemLogsScreen";

// /* ==========================================================
//       CUSTOM BOTTOM TABS (USER ONLY)
// ========================================================== */
// function BottomTabs({ navigation, active }) {
//   const tabs = [
//     { key: "UserHome", icon: "home-variant" },
//     { key: "ChatbotScreen", icon: "robot-outline" },
//     { key: "InvoiceHistory", icon: "file-document-outline" },
//     { key: "Rewards", icon: "gift-outline" },
//     { key: "MyCart", icon: "cart-outline" },
//   ];

//   return (
//     <View style={tabStyles.tabBar}>
//       {tabs.map((t) => {
//         const isActive = active === t.key;
//         return (
//           <View key={t.key} style={tabStyles.tabItem}>
//             <MaterialCommunityIcons
//               name={t.icon}
//               size={30}
//               color={isActive ? "#1f3c88" : "#6B7280"}
//               onPress={() => navigation.navigate(t.key)}
//             />
//           </View>
//         );
//       })}
//     </View>
//   );
// }

// /* ==========================================================
//       MAIN APP — GLOBAL STATES + CUSTOM NAVIGATION
// ========================================================== */
// export default function App() {
//   const [route, setRoute] = useState("Login");
//   const [currentUser, setCurrentUser] = useState(null);

//   /* -------- GLOBAL CART STATE -------- */
//   const [cart, setCart] = useState([]);

//   const addToCart = (product) => {
//     setCart((prev) => {
//       const exists = prev.find((p) => p.id === product.id);
//       if (exists) {
//         return prev.map((p) =>
//           p.id === product.id ? { ...p, qty: p.qty + 1 } : p
//         );
//       }
//       return [...prev, { ...product, qty: 1 }];
//     });
//   };

//   const updateQty = (id, qty) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, qty: Math.max(1, qty) } : item
//       )
//     );
//   };

//   const removeFromCart = (id) => {
//     setCart((prev) => prev.filter((i) => i.id !== id));
//   };

//   const clearCart = () => {
//     setCart([]);
//   };

//   /* -------- CUSTOM NAV OBJECT -------- */
//   const navigation = useMemo(
//     () => ({
//       navigate: (screen, data = {}) => {
//         setCurrentUser((prev) => ({ ...(prev || {}), ...(data || {}) }));
//         setRoute(screen);
//       },

//       replace: (screen, data = {}) => {
//         setCurrentUser((prev) => ({ ...(prev || {}), ...(data || {}) }));
//         setRoute(screen);
//       },

//       goBack: () => {
//         if (currentUser?.role === "admin") setRoute("AdminDashboard");
//         else setRoute("UserHome");
//       },

//       onLoginSuccess: (user) => {
//         setCurrentUser(user);
//         setRoute(user.role === "admin" ? "AdminDashboard" : "UserHome");
//       },

//       // CART HELPERS
//       addToCart,
//       updateQty,
//       removeFromCart,
//       clearCart,
//       cart,
//     }),
//     [currentUser, cart]
//   );

//   const isAdmin = currentUser?.role === "admin";

//   /* ==========================================================
//       ROUTING LOGIC
// ========================================================== */
//   const getScreen = () => {
//     const safeRoute = { params: currentUser || {} };

//     const props = {
//       navigation,
//       route: safeRoute,
//       cart,
//       addToCart,
//       updateQty,
//       removeFromCart,
//     };

//     switch (route) {
//       case "Signup":
//         return <SignupScreen navigation={navigation} />;

//       case "ForgotPassword":
//         return <ForgotPasswordScreen navigation={navigation} />;

//       case "UserHome":
//         return <UserHome {...props} />;

//       case "Products":
//         return <ProductsScreen {...props} />;

//       case "Profile":
//         return <ProfileScreen {...props} />;

//       case "InvoiceHistory":
//         return <InvoiceHistory {...props} />;

//       case "Rewards":
//         return <RewardsScreen {...props} />;

//       case "Scan":
//         return <ScanScreen {...props} />;

//       case "EcoScore":
//         return <EcoScoreScreen {...props} />;

//       case "ChatbotScreen":
//         return <ChatbotScreen {...props} />;

//       case "MyCart":
//         return <MyCartScreen {...props} />;

//       case "BarcodeVerifier":
//         return <BarcodeVerifierScreen {...props} />;

//       case "DummyUPI":
//         return (
//           <DummyUPIScreen
//             navigation={navigation}
//             route={safeRoute}
//             clearCart={clearCart}
//           />
//         );

//       case "PaymentSuccess":
//         return <PaymentSuccess navigation={navigation} route={safeRoute} />;

//       /* 🔹 ADMIN CORE */
//       case "AdminDashboard":
//         return <AdminDashboard {...props} />;

//       case "UserListScreen":
//         return <UserListScreen {...props} />;

//       /* 🔹 NEW ADMIN FEATURES */
//       case "ProductAvailabilityScreen":
//         return <ProductAvailabilityScreen {...props} />;

//       case "InvoiceVerifierScreen":
//         return <InvoiceVerifierScreen {...props} />;

//       case "UserAnalyticsScreen":
//         return <UserAnalyticsScreen {...props} />;

//       case "ScanFailureScreen":
//         return <ScanFailureScreen {...props} />;

//       case "SystemLogsScreen":
//         return <SystemLogsScreen {...props} />;

//       default:
//         return (
//           <LoginScreen
//             navigation={navigation}
//             onLoginSuccess={navigation.onLoginSuccess}
//           />
//         );
//     }
//   };

//   const ScreenComponent = getScreen();

//   /*  HIDE BOTTOM TABS */
//   const hideTabs =
//     route === "Login" ||
//     route === "Signup" ||
//     route === "ForgotPassword" ||
//     route === "Welcome" ||
//     route === "DummyUPI" ||
//     route === "PaymentSuccess";

//   return (
//     <MenuProvider>
//       <SafeAreaView style={{ flex: 1 }}>
//         <View style={styles.screenWithTabs}>
//           <View style={{ flex: 1 }}>{ScreenComponent}</View>

//           {!hideTabs && !isAdmin && (
//             <BottomTabs navigation={navigation} active={route} />
//           )}
//         </View>
//       </SafeAreaView>
//     </MenuProvider>
//   );
// }

// /* -------- STYLES -------- */
// const styles = StyleSheet.create({
//   screenWithTabs: {
//     flex: 1,
//     backgroundColor: "#F8F9FF",
//   },
// });

// const tabStyles = StyleSheet.create({
//   tabBar: {
//     height: 62,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     alignItems: "center",
//     elevation: 8,
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 10,
//   },
// });




import React, { useState, useMemo, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuProvider } from "react-native-popup-menu";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* ----------- IMPORT ALL SCREENS ----------- */
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import UserHome from "./screens/UserHome";
import ProfileScreen from "./screens/ProfileScreen";
import AdminDashboard from "./screens/AdminDashboard";
import UserListScreen from "./screens/UserListScreen";
import InvoiceHistory from "./screens/InvoiceHistory";
import RewardsScreen from "./screens/RewardsScreen";
import ScanScreen from "./screens/ScanScreen";
import EcoScoreScreen from "./screens/EcoScoreScreen";
import ChatbotScreen from "./screens/ChatbotScreen";
import MyCartScreen from "./screens/MyCartScreen";
import ProductsScreen from "./screens/ProductsScreen";
import BarcodeVerifierScreen from "./screens/BarcodeVerifierScreen";
import PaymentSuccess from "./screens/PaymentSuccess";
import DummyUPIScreen from "./screens/DummyUPIScreen";

/* 🔹 NEW ADMIN FEATURE SCREENS */
import ProductAvailabilityScreen from "./screens/ProductAvailabilityScreen";
import InvoiceVerifierScreen from "./screens/InvoiceVerifierScreen";
import UserAnalyticsScreen from "./screens/UserAnalyticsScreen";
import ScanFailureScreen from "./screens/ScanFailureScreen";
import SystemLogsScreen from "./screens/SystemLogsScreen";

/* ==========================================================
      CUSTOM BOTTOM TABS (USER ONLY)
========================================================== */
function BottomTabs({ navigation, active }) {
  const tabs = [
    { key: "UserHome", icon: "home-variant" },
    { key: "ChatbotScreen", icon: "robot-outline" },
    { key: "InvoiceHistory", icon: "file-document-outline" },
    { key: "Rewards", icon: "gift-outline" },
    { key: "MyCart", icon: "cart-outline" },
  ];

  return (
    <View style={tabStyles.tabBar}>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <View key={t.key} style={tabStyles.tabItem}>
            <MaterialCommunityIcons
              name={t.icon}
              size={30}
              color={isActive ? "#1f3c88" : "#6B7280"}
              onPress={() => navigation.navigate(t.key)}
            />
          </View>
        );
      })}
    </View>
  );
}

/* ==========================================================
      MAIN APP
========================================================== */
export default function App() {
  const [route, setRoute] = useState("Login");
  const [currentUser, setCurrentUser] = useState(null);

  /* 🔹 LOGO SCREEN STATE */
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  /* -------- GLOBAL CART STATE -------- */
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  /* -------- CUSTOM NAV OBJECT -------- */
  const navigation = useMemo(
    () => ({
      navigate: (screen, data = {}) => {
        setCurrentUser((prev) => ({ ...(prev || {}), ...(data || {}) }));
        setRoute(screen);
      },
      replace: (screen, data = {}) => {
        setCurrentUser((prev) => ({ ...(prev || {}), ...(data || {}) }));
        setRoute(screen);
      },
      goBack: () => {
        if (currentUser?.role === "admin") setRoute("AdminDashboard");
        else setRoute("UserHome");
      },
      onLoginSuccess: (user) => {
        setCurrentUser(user);
        setRoute(user.role === "admin" ? "AdminDashboard" : "UserHome");
      },
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      cart,
    }),
    [currentUser, cart]
  );

  const isAdmin = currentUser?.role === "admin";

  /* ================= ROUTING ================= */
  const getScreen = () => {
    const safeRoute = { params: currentUser || {} };

    const props = {
      navigation,
      route: safeRoute,
      cart,
      addToCart,
      updateQty,
      removeFromCart,
    };

    switch (route) {
      case "Signup":
        return <SignupScreen navigation={navigation} />;
      case "ForgotPassword":
        return <ForgotPasswordScreen navigation={navigation} />;
      case "UserHome":
        return <UserHome {...props} />;
      case "Products":
        return <ProductsScreen {...props} />;
      case "Profile":
        return <ProfileScreen {...props} />;
      case "InvoiceHistory":
        return <InvoiceHistory {...props} />;
      case "Rewards":
        return <RewardsScreen {...props} />;
      case "Scan":
        return <ScanScreen {...props} />;
      case "EcoScore":
        return <EcoScoreScreen {...props} />;
      case "ChatbotScreen":
        return <ChatbotScreen {...props} />;
      case "MyCart":
        return <MyCartScreen {...props} />;
      case "BarcodeVerifier":
        return <BarcodeVerifierScreen {...props} />;
      case "DummyUPI":
        return (
          <DummyUPIScreen
            navigation={navigation}
            route={safeRoute}
            clearCart={clearCart}
          />
        );
      case "PaymentSuccess":
        return <PaymentSuccess navigation={navigation} route={safeRoute} />;

      /* ADMIN */
      case "AdminDashboard":
        return <AdminDashboard {...props} />;
      case "UserListScreen":
        return <UserListScreen {...props} />;
      case "ProductAvailabilityScreen":
        return <ProductAvailabilityScreen {...props} />;
      case "InvoiceVerifierScreen":
        return <InvoiceVerifierScreen {...props} />;
      case "UserAnalyticsScreen":
        return <UserAnalyticsScreen {...props} />;
      case "ScanFailureScreen":
        return <ScanFailureScreen {...props} />;
      case "SystemLogsScreen":
        return <SystemLogsScreen {...props} />;

      default:
        return (
          <LoginScreen
            navigation={navigation}
            onLoginSuccess={navigation.onLoginSuccess}
          />
        );
    }
  };

  /* ================= LOGO SCREEN ================= */
  if (showLogo) {
    return (
      <SafeAreaView style={logoStyles.container}>
        <Image
          source={require("./assets/smart-retail-icon.png")}
          style={logoStyles.logo}
        />
      </SafeAreaView>
    );
  }

  const ScreenComponent = getScreen();

  const hideTabs =
    route === "Login" ||
    route === "Signup" ||
    route === "ForgotPassword" ||
    route === "Welcome" ||
    route === "DummyUPI" ||
    route === "PaymentSuccess";

  return (
    <MenuProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.screenWithTabs}>
          <View style={{ flex: 1 }}>{ScreenComponent}</View>
          {!hideTabs && !isAdmin && (
            <BottomTabs navigation={navigation} active={route} />
          )}
        </View>
      </SafeAreaView>
    </MenuProvider>
  );
}

/* -------- STYLES -------- */
const styles = StyleSheet.create({
  screenWithTabs: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
});

const tabStyles = StyleSheet.create({
  tabBar: {
    height: 62,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
});

const logoStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: "contain",
  },
});
