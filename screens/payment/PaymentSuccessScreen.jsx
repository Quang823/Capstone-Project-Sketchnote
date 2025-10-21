import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22, color: "green", marginBottom: 20 }}>
        ✅ Thanh toán thành công!
      </Text>
      <Pressable
        style={{
          backgroundColor: "#3B82F6",
          padding: 12,
          borderRadius: 8,
        }}
        onPress={() => navigation.navigate("Wallet")}
      >
        <Text style={{ color: "white" }}>Quay lại ví</Text>
      </Pressable>
    </View>
  );
}
