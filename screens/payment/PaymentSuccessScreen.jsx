import React, { useRef } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, MotiText } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const confettiRef = useRef(null);
  const { width, height } = useWindowDimensions();

  // Responsive container width for tablet
  const containerWidth = width > 768 ? 500 : width - 40;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 20,
      }}
    >
      {/* 🎉 Confetti celebration */}
      <ConfettiCannon
        count={80}
        origin={{ x: width / 2, y: 0 }}
        autoStart={true}
        fadeOut={true}
        explosionSpeed={400}
        fallSpeed={2500}
      />

      <View
        style={{
          width: containerWidth,
          alignItems: "center",
        }}
      >
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#D1FAE5",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 56 }}>✅</Text>
        </MotiView>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, type: "timing", duration: 500 }}
          style={{
            fontSize: 24,
            color: "#059669",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Payment Successful!
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500, type: "timing", duration: 600 }}
          style={{
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Your transaction has been completed successfully
        </MotiText>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700, type: "timing", duration: 500 }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#2563EB" : "#3B82F6",
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 12,
              width: "100%",
              alignItems: "center",
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            })}
            onPress={() => navigation.navigate("Wallet")}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Back to Wallet
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}