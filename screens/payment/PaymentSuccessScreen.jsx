import React, { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, MotiText } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const confettiRef = useRef(null);

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
      {/* 🎉 Pháo hoa ăn mừng */}
      <ConfettiCannon
        count={80}
        origin={{ x: 200, y: 0 }}
        autoStart={true}
        fadeOut={true}
        explosionSpeed={400}
        fallSpeed={2500}
      />

      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 10 }}
        style={{ alignItems: "center", marginBottom: 16 }}
      >
        <Text style={{ fontSize: 64 }}>✅</Text>
      </MotiView>

      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300, type: "timing", duration: 500 }}
        style={{
          fontSize: 24,
          color: "green",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Thanh toán thành công!
      </MotiText>

      <Pressable
        style={{
          backgroundColor: "#3B82F6",
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 12,
          width: "100%",
          alignItems: "center",
          marginTop: 8,
        }}
        onPress={() => navigation.navigate("Wallet")}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Quay lại ví
        </Text>
      </Pressable>
    </View>
  );
}
