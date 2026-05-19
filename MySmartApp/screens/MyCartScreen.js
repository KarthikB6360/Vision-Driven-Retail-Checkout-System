// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   Alert,
// } from "react-native";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { CART_PRODUCTS } from "../data/cartProducts";

// const MIN_REWARD_TOTAL = 1999;
// const BOTTOM_BAR_HEIGHT = 90;

// export default function MyCartScreen({
//   cart = [],
//   updateQty,
//   removeFromCart,
//   navigation,
//   route,
// }) {
//   const [expandedId, setExpandedId] = useState(null);
//   const [applyReward, setApplyReward] = useState(false);

//   const [rewardData, setRewardData] = useState({
//     score: 0,
//     discount: 0,
//   });

//   const prevCartRef = useRef(cart);

//   /* ================= RECEIVE REWARD FROM GAME ================= */
//   useEffect(() => {
//     if (route?.params?.rewardDiscount) {
//       setRewardData({
//         score: route.params.rewardScore,
//         discount: route.params.rewardDiscount,
//       });
//       setApplyReward(false);
//     }
//   }, [route?.params]);

//   /* ================= PRODUCT RESOLUTION ================= */
//   const normalize = (str = "") =>
//     str.replace(/\s|_/g, "").toLowerCase();

//   const resolveProduct = (name) =>
//     Object.values(CART_PRODUCTS).find(
//       (p) => normalize(p.name) === normalize(name)
//     );

//   /* ================= TOTAL ================= */
//   const cartTotal = cart.reduce(
//     (sum, item) => sum + Number(item.price) * Number(item.qty || 1),
//     0
//   );

//   /* ================= INVALIDATE REWARD ================= */
//   useEffect(() => {
//     if (cartTotal < MIN_REWARD_TOTAL && rewardData.discount > 0) {
//       setRewardData({ score: 0, discount: 0 });
//       setApplyReward(false);

//       Alert.alert(
//         "Reward Removed",
//         "Cart total dropped below ₹1999.\nAdd items again to unlock rewards."
//       );
//     }

//     prevCartRef.current = cart;
//   }, [cart, cartTotal]);

//   /* ================= DISCOUNT ================= */
//   const discountAmount =
//     applyReward && rewardData.discount > 0
//       ? Math.round((cartTotal * rewardData.discount) / 100)
//       : 0;

//   const finalTotal = cartTotal - discountAmount;

//   /* ================= CREATE INVOICE ================= */
//   const createInvoice = () => ({
//     id: "INV_" + Date.now(),
//     date: new Date().toLocaleString(),
//     items: cart.map((i) => ({
//       name: i.name,
//       qty: i.qty || 1,
//       price: i.price,
//       total: i.price * (i.qty || 1),
//     })),
//     subtotal: cartTotal,
//     discount: discountAmount,
//     grandTotal: finalTotal,
//   });

//   /* ================= PAYMENT HANDLER ================= */
//   const handlePayment = () => {
//     if (!cart.length) return;

//     const invoice = createInvoice();

//     // reset rewards
//     setRewardData({ score: 0, discount: 0 });
//     setApplyReward(false);

//     // clear cart
//     cart.forEach((item, index) =>
//       removeFromCart(item.id ?? index)
//     );

//     // ✅ ONLY FIX: pass newInvoice key
//     navigation.navigate("PaymentSuccess", {
//       amount: finalTotal,
//       newInvoice: invoice,
//     });
//   };

//   /* ================= EMPTY CART ================= */
//   if (!cart.length) {
//     return (
//       <SafeAreaView style={styles.empty}>
//         <Text style={{ fontSize: 18 }}>Your cart is empty</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>My Cart</Text>
//       </View>

//       {/* CONTENT */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={[
//           styles.scrollContent,
//           { paddingBottom: BOTTOM_BAR_HEIGHT + 20 },
//         ]}
//       >
//         {cart.map((item, index) => {
//           const qty = Number(item.qty || 1);
//           const uid = item.id ?? index;
//           const expanded = expandedId === uid;
//           const product = resolveProduct(item.name);

//           return (
//             <View key={uid} style={styles.card}>
//               <TouchableOpacity
//                 style={styles.remove}
//                 onPress={() => removeFromCart(uid)}
//               >
//                 <MaterialCommunityIcons
//                   name="close-circle"
//                   size={22}
//                   color="#ef4444"
//                 />
//               </TouchableOpacity>

//               {product?.image && (
//                 <Image
//                   source={product.image}
//                   style={styles.productImg}
//                   resizeMode="contain"
//                 />
//               )}

//               <Text style={styles.name}>{item.name}</Text>

//               <View style={styles.qtyRow}>
//                 <TouchableOpacity
//                   style={styles.qtyBtn}
//                   onPress={() => updateQty(uid, qty - 1)}
//                 >
//                   <MaterialCommunityIcons name="minus" size={18} />
//                 </TouchableOpacity>

//                 <Text style={styles.qtyText}>{qty}</Text>

//                 <TouchableOpacity
//                   style={styles.qtyBtn}
//                   onPress={() => updateQty(uid, qty + 1)}
//                 >
//                   <MaterialCommunityIcons name="plus" size={18} />
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.price}>₹ {item.price * qty}</Text>

//               <TouchableOpacity
//                 style={styles.barcodeToggle}
//                 onPress={() => setExpandedId(expanded ? null : uid)}
//               >
//                 <MaterialCommunityIcons name="barcode" size={20} />
//                 <Text style={styles.barcodeText}>View Barcode</Text>
//               </TouchableOpacity>

//               {expanded && product?.barcodeImage && (
//                 <Image
//                   source={product.barcodeImage}
//                   style={styles.barcodeImg}
//                   resizeMode="contain"
//                 />
//               )}
//             </View>
//           );
//         })}

//         {/* REWARDS */}
//         <View style={styles.rewardSection}>
//           <Text style={styles.rewardTitle}>🎁 Rewards</Text>

//           {rewardData.discount > 0 ? (
//             <>
//               <Text style={styles.rewardInfo}>
//                 {rewardData.discount}% discount (Score {rewardData.score})
//               </Text>

//               <TouchableOpacity
//                 style={styles.checkboxRow}
//                 onPress={() => {
//                   if (cartTotal < MIN_REWARD_TOTAL) {
//                     Alert.alert(
//                       "Cannot Apply Reward",
//                       "Cart total is below ₹1999 — add more items."
//                     );
//                     return;
//                   }
//                   setApplyReward((v) => !v);
//                 }}
//               >
//                 <MaterialCommunityIcons
//                   name={
//                     applyReward
//                       ? "checkbox-marked"
//                       : "checkbox-blank-outline"
//                   }
//                   size={22}
//                   color="#16a34a"
//                 />
//                 <Text style={styles.checkboxText}>
//                   Apply Reward Discount
//                 </Text>
//               </TouchableOpacity>
//             </>
//           ) : cartTotal >= MIN_REWARD_TOTAL ? (
//             <TouchableOpacity
//               style={styles.playBtn}
//               onPress={() =>
//                 navigation.navigate("Rewards", {
//                   cart,
//                   autoStart: true,
//                 })
//               }
//             >
//               <Text style={styles.playText}>Start Rewards Game</Text>
//             </TouchableOpacity>
//           ) : (
//             <Text style={styles.rewardHint}>
//               Add items worth ₹1999 to unlock rewards
//             </Text>
//           )}
//         </View>
//       </ScrollView>

//       {/* BOTTOM BAR */}
//       <View style={styles.bottomBar}>
//         <View>
//           <Text style={styles.totalLabel}>Grand Total</Text>
//           <Text style={styles.totalPrice}>₹ {finalTotal}</Text>

//           {applyReward && rewardData.discount > 0 && (
//             <Text style={styles.discountText}>
//               You saved ₹{discountAmount}
//             </Text>
//           )}
//         </View>

//         <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
//           <Text style={styles.payText}>Pay Now</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#f1f5f9" },
//   header: {
//     paddingTop:
//       Platform.OS === "android" ? StatusBar.currentHeight + 12 : 16,
//     paddingBottom: 14,
//     paddingHorizontal: 20,
//     backgroundColor: "#ffffff",
//     elevation: 4,
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: "800",
//     color: "#1e3a8a",
//   },
//   scrollContent: { padding: 16 },
//   card: {
//     backgroundColor: "#ffffff",
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   remove: { position: "absolute", top: 10, right: 10 },
//   productImg: { width: "100%", height: 140, marginBottom: 6 },
//   name: { fontSize: 16, fontWeight: "700", textAlign: "center" },
//   qtyRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginVertical: 8,
//   },
//   qtyBtn: {
//     padding: 8,
//     backgroundColor: "#e5e7eb",
//     borderRadius: 8,
//   },
//   qtyText: { marginHorizontal: 16, fontWeight: "700" },
//   price: {
//     textAlign: "center",
//     fontWeight: "700",
//     color: "#1e40af",
//   },
//   barcodeToggle: {
//     alignSelf: "center",
//     flexDirection: "row",
//     marginTop: 6,
//   },
//   barcodeText: { marginLeft: 6, fontWeight: "600" },
//   barcodeImg: { width: "100%", height: 100, marginTop: 8 },
//   rewardSection: {
//     marginTop: 10,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#ecfeff",
//   },
//   rewardTitle: { fontSize: 18, fontWeight: "800" },
//   rewardInfo: { fontWeight: "600", marginVertical: 6 },
//   rewardHint: {
//     fontWeight: "600",
//     color: "#64748b",
//     marginTop: 6,
//   },
//   checkboxRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   checkboxText: { marginLeft: 8, fontWeight: "600" },
//   playBtn: {
//     marginTop: 10,
//     backgroundColor: "#f97316",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   playText: { color: "#ffffff", fontWeight: "800" },
//   bottomBar: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 90,
//     backgroundColor: "#ffffff",
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     elevation: 10,
//   },
//   totalLabel: { fontSize: 14, color: "#64748b" },
//   totalPrice: {
//     fontSize: 22,
//     fontWeight: "900",
//     color: "#1e40af",
//   },
//   discountText: { fontWeight: "700", color: "#15803d" },
//   payBtn: {
//     backgroundColor: "#1e40af",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   payText: { color: "#ffffff", fontWeight: "700" },
//   empty: { flex: 1, justifyContent: "center", alignItems: "center" },
// });










import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CART_PRODUCTS } from "../data/cartProducts";

const MIN_REWARD_TOTAL = 1999;
const BOTTOM_BAR_HEIGHT = 90;

export default function MyCartScreen({
  cart = [],
  updateQty,
  removeFromCart,
  navigation,
  route,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [applyReward, setApplyReward] = useState(false);

  const [rewardData, setRewardData] = useState({
    score: 0,
    discount: 0,
  });

  const prevCartRef = useRef(cart);

  /* ================= RECEIVE REWARD FROM GAME ================= */
  useEffect(() => {
    if (route?.params?.rewardDiscount) {
      setRewardData({
        score: route.params.rewardScore,
        discount: route.params.rewardDiscount,
      });
      setApplyReward(false);
    }
  }, [route?.params]);

  /* ================= PRODUCT RESOLUTION ================= */
  const normalize = (str = "") =>
    str.replace(/\s|_/g, "").toLowerCase();

  const resolveProduct = (name) =>
    Object.values(CART_PRODUCTS).find(
      (p) => normalize(p.name) === normalize(name)
    );

  /* ================= TOTAL ================= */
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty || 1),
    0
  );

  /* ================= INVALIDATE REWARD ================= */
  useEffect(() => {
    if (cartTotal < MIN_REWARD_TOTAL && rewardData.discount > 0) {
      setRewardData({ score: 0, discount: 0 });
      setApplyReward(false);

      Alert.alert(
        "Reward Removed",
        "Cart total dropped below ₹1999.\nAdd items again to unlock rewards."
      );
    }

    prevCartRef.current = cart;
  }, [cart, cartTotal]);

  /* ================= DISCOUNT ================= */
  const discountAmount =
    applyReward && rewardData.discount > 0
      ? Math.round((cartTotal * rewardData.discount) / 100)
      : 0;

  const finalTotal = cartTotal - discountAmount;

  /* ================= CREATE INVOICE ================= */
  const createInvoice = () => ({
    id: "INV_" + Date.now(),
    date: new Date().toLocaleString(),
    items: cart.map((i) => ({
      name: i.name,
      qty: i.qty || 1,
      price: i.price,
      total: i.price * (i.qty || 1),
    })),
    subtotal: cartTotal,
    discount: discountAmount,
    grandTotal: finalTotal,
  });

  /* ================= PAYMENT HANDLER (ONLY UPDATE HERE) ================= */
  const handlePayment = () => {
    if (!cart.length) return;

    Alert.alert(
      "Before Payment",
      "Please check your Nutrition Score before proceeding to payment.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            const invoice = createInvoice();

            navigation.navigate("DummyUPI", {
              amount: finalTotal,
              invoice,
              clearCart: () => {
                cart.forEach((item, index) =>
                  removeFromCart(item.id ?? index)
                );
              },
              resetRewards: () => {
                setRewardData({ score: 0, discount: 0 });
                setApplyReward(false);
              },
            });
          },
        },
      ]
    );
  };

  /* ================= EMPTY CART ================= */
  if (!cart.length) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={{ fontSize: 18 }}>Your cart is empty</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + 20 },
        ]}
      >
        {cart.map((item, index) => {
          const qty = Number(item.qty || 1);
          const uid = item.id ?? index;
          const expanded = expandedId === uid;
          const product = resolveProduct(item.name);

          return (
            <View key={uid} style={styles.card}>
              <TouchableOpacity
                style={styles.remove}
                onPress={() => removeFromCart(uid)}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={22}
                  color="#ef4444"
                />
              </TouchableOpacity>

              {product?.image && (
                <Image
                  source={product.image}
                  style={styles.productImg}
                  resizeMode="contain"
                />
              )}

              <Text style={styles.name}>{item.name}</Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(uid, qty - 1)}
                >
                  <MaterialCommunityIcons name="minus" size={18} />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{qty}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(uid, qty + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={18} />
                </TouchableOpacity>
              </View>

              <Text style={styles.price}>₹ {item.price * qty}</Text>

              <TouchableOpacity
                style={styles.barcodeToggle}
                onPress={() => setExpandedId(expanded ? null : uid)}
              >
                <MaterialCommunityIcons name="barcode" size={20} />
                <Text style={styles.barcodeText}>View Barcode</Text>
              </TouchableOpacity>

              {expanded && product?.barcodeImage && (
                <Image
                  source={product.barcodeImage}
                  style={styles.barcodeImg}
                  resizeMode="contain"
                />
              )}
            </View>
          );
        })}

        {/* REWARDS (UNCHANGED) */}
        <View style={styles.rewardSection}>
          <Text style={styles.rewardTitle}>🎁 Rewards</Text>

          {rewardData.discount > 0 ? (
            <>
              <Text style={styles.rewardInfo}>
                {rewardData.discount}% discount (Score {rewardData.score})
              </Text>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  if (cartTotal < MIN_REWARD_TOTAL) {
                    Alert.alert(
                      "Cannot Apply Reward",
                      "Cart total is below ₹1999 — add more items."
                    );
                    return;
                  }
                  setApplyReward((v) => !v);
                }}
              >
                <MaterialCommunityIcons
                  name={
                    applyReward
                      ? "checkbox-marked"
                      : "checkbox-blank-outline"
                  }
                  size={22}
                  color="#16a34a"
                />
                <Text style={styles.checkboxText}>
                  Apply Reward Discount
                </Text>
              </TouchableOpacity>
            </>
          ) : cartTotal >= MIN_REWARD_TOTAL ? (
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() =>
                navigation.navigate("Rewards", {
                  cart,
                  autoStart: true,
                })
              }
            >
              <Text style={styles.playText}>Start Rewards Game</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.rewardHint}>
              Add items worth ₹1999 to unlock rewards.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalPrice}>₹ {finalTotal}</Text>

          {applyReward && rewardData.discount > 0 && (
            <Text style={styles.discountText}>
              You saved ₹{discountAmount}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES (UNCHANGED) ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight + 12 : 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    elevation: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },
  remove: { position: "absolute", top: 10, right: 10 },
  productImg: { width: "100%", height: 140, marginBottom: 6 },
  name: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  qtyBtn: {
    padding: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
  },
  qtyText: { marginHorizontal: 16, fontWeight: "700" },
  price: {
    textAlign: "center",
    fontWeight: "700",
    color: "#1e40af",
  },
  barcodeToggle: {
    alignSelf: "center",
    flexDirection: "row",
    marginTop: 6,
  },
  barcodeText: { marginLeft: 6, fontWeight: "600" },
  barcodeImg: { width: "100%", height: 100, marginTop: 8 },
  rewardSection: {
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ecfeff",
  },
  rewardTitle: { fontSize: 18, fontWeight: "800" },
  rewardInfo: { fontWeight: "600", marginVertical: 6 },
  rewardHint: {
    fontWeight: "600",
    color: "#64748b",
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  checkboxText: { marginLeft: 8, fontWeight: "600" },
  playBtn: {
    marginTop: 10,
    backgroundColor: "#f97316",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  playText: { color: "#ffffff", fontWeight: "800" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#ffffff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 10,
  },
  totalLabel: { fontSize: 14, color: "#64748b" },
  totalPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1e40af",
  },
  discountText: { fontWeight: "700", color: "#15803d" },
  payBtn: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payText: { color: "#ffffff", fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});
