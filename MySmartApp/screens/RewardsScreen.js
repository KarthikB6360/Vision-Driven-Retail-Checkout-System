// screens/RewardsScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const FRUITS = ["🍎", "🍊", "🍉", "🍐", "🍓", "🍒"];
const BOMB = "💣";
const HEADER_HEIGHT = 110;
const MIN_REWARD_TOTAL = 1999;

export default function RewardsScreen({ navigation, route, cart }) {
  /* ---------------- REAL-TIME CART ---------------- */
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    if (!Array.isArray(cart)) return;

    const total = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty || 1),
      0
    );

    setCartTotal(total);
  }, [cart]);

  /* ---------------- GAME STATE ---------------- */
  const [phase, setPhase] = useState("rules");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [objects, setObjects] = useState([]);

  const gameLoop = useRef(null);
  const timerLoop = useRef(null);
  const idRef = useRef(0);

  /* Reset on mount */
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    clearLoops();
    setPhase("rules");
    setScore(0);
    setTimeLeft(30);
    setObjects([]);
    idRef.current = 0;
  };

  /* ---------------- VALIDATE BEFORE START ---------------- */
  const validateAndStart = () => {
    if (!cart?.length) {
      Alert.alert("Cart Empty", "Please add items to play the rewards game.");
      return;
    }

    if (cartTotal < MIN_REWARD_TOTAL) {
      Alert.alert(
        "Not Eligible",
        `Minimum ₹${MIN_REWARD_TOTAL} required.\nCurrent total: ₹${cartTotal}`
      );
      return;
    }

    startGame();
  };

  /* ---------------- STOP GAME IF TOTAL DROPS ---------------- */
  useEffect(() => {
    if (phase === "game" && cartTotal < MIN_REWARD_TOTAL) {
      clearLoops();
      setPhase("rules");
      setObjects([]);

      Alert.alert(
        "Game Stopped",
        "Cart total dropped below ₹1999.\nAdd more items to continue."
      );
    }
  }, [cartTotal]);

  /* ---------------- GAME ENGINE ---------------- */
  const clearLoops = () => {
    if (gameLoop.current) clearInterval(gameLoop.current);
    if (timerLoop.current) clearInterval(timerLoop.current);
  };

  const spawn = () => {
    idRef.current += 1;
    const isBomb = Math.random() < 0.35;

    return {
      id: idRef.current,
      type: isBomb ? "BOMB" : "FRUIT",
      icon: isBomb ? BOMB : FRUITS[Math.floor(Math.random() * FRUITS.length)],
      x: Math.random() * (width - 60),
      y: height,
    };
  };

  const startGame = () => {
    setPhase("game");
    setScore(0);
    setTimeLeft(30);
    setObjects([]);

    gameLoop.current = setInterval(() => {
      setObjects((prev) => [
        ...prev
          .map((o) => ({ ...o, y: o.y - 28 }))
          .filter((o) => o.y > HEADER_HEIGHT),
        spawn(),
        spawn(),
      ]);
    }, 200);

    timerLoop.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearLoops();
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const cut = (obj) => {
    setObjects((prev) => prev.filter((o) => o.id !== obj.id));

    if (obj.type === "FRUIT") {
      setScore((s) => s + 10);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setScore((s) => Math.max(0, s - 20));
    }
  };

  /* ---------------- DISCOUNT ---------------- */
  const earnedDiscount =
    score >= 1100 ? 6 :
    score >= 1000 ? 4 :
    score >= 150 ? 2 :
    0;

  const backToCart = () => {
    navigation.navigate("MyCart", {
      rewardScore: score,
      rewardDiscount:
        cartTotal >= MIN_REWARD_TOTAL ? earnedDiscount : 0,
    });
  };

  const notEligible = cartTotal < MIN_REWARD_TOTAL || !cart?.length;

  /* ---------------- UI ---------------- */
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fde68a" />
      <SafeAreaView style={styles.safe}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>🍉 Tap & Win Rewards</Text>
          {phase === "game" && <Text style={styles.timer}>⏱ {timeLeft}s</Text>}
        </View>

        {/* RULES */}
        {phase === "rules" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📜 Rules</Text>

            <Text style={styles.rule}>🍎 Fruit = +10 points</Text>
            <Text style={styles.rule}>💣 Bomb = –20 points</Text>
            <Text style={styles.rule}>⏱ 30 seconds</Text>

            <View style={styles.rewardBox}>
              <Text>150+ → 2% Discount</Text>
              <Text>1000+ → 4% Discount</Text>
              <Text>1100+ → 6% Discount</Text>
            </View>

            <Text style={styles.cond}>🛒 Cart Required</Text>
            <Text style={styles.cond}>💰 Min Order ₹1999</Text>

            <Text style={styles.totalText}>Cart Total: ₹{cartTotal}</Text>

            {notEligible && (
              <Text style={styles.warn}>
                Add ₹{Math.max(MIN_REWARD_TOTAL - cartTotal, 0)} more to start
              </Text>
            )}

            <TouchableOpacity
              style={[styles.startBtn, notEligible && { opacity: 0.4 }]}
              disabled={notEligible}
              onPress={validateAndStart}
            >
              <Text style={styles.startText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* GAME */}
        {phase === "game" && (
          <View style={styles.gameArea}>
            {objects.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[styles.object, { top: o.y, left: o.x }]}
                onPress={() => cut(o)}
              >
                <Text style={styles.icon}>{o.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>⏱ Time Up!</Text>
            <Text style={styles.score}>Score: {score}</Text>
            <Text style={styles.reward}>
              {earnedDiscount
                ? `🎉 You won ${earnedDiscount}% discount`
                : "😔 No reward earned"}
            </Text>

            <TouchableOpacity style={styles.backBtn} onPress={backToCart}>
              <Text style={styles.backText}>Back to Cart</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    </>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#faf5ff" },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: "#fde68a",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "900" },
  timer: { fontSize: 18, fontWeight: "700" },
  card: {
    margin: 20,
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 18,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: "800" },
  rule: { marginTop: 6, fontSize: 15 },
  rewardBox: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: "#ecfeff",
    borderRadius: 12,
  },
  cond: { marginTop: 4, fontWeight: "600" },
  totalText: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 16,
  },
  warn: { marginTop: 6, color: "red", fontWeight: "700" },
  startBtn: {
    marginTop: 16,
    backgroundColor: "#f97316",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  startText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  gameArea: { flex: 1 },
  object: { position: "absolute" },
  icon: { fontSize: 34 },
  result: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultTitle: { fontSize: 22, fontWeight: "800" },
  score: { fontSize: 18, marginVertical: 6 },
  reward: { fontSize: 16, marginBottom: 14 },
  backBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
  },
  backText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
