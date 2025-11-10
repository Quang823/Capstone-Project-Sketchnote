import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

export default function PaymentFailedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { code, status, orderCode } = route.params || {};

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      {/* ❌ Biểu tượng lỗi có hiệu ứng rung + fadeOut nhẹ */}
      <Animatable.View
        animation="shake"
        iterationCount={2}
        duration={800}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#FEE2E2",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Animatable.Text
          animation="fadeInDown"
          duration={700}
          style={{ fontSize: 48 }}
        >
          ❌
        </Animatable.Text>
      </Animatable.View>

      <Animatable.Text
        animation="fadeInUp"
        duration={600}
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#DC2626",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Thanh toán thất bại
      </Animatable.Text>

      <Animatable.Text
        animation="fadeIn"
        delay={300}
        duration={700}
        style={{
          fontSize: 16,
          color: "#6B7280",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Giao dịch của bạn đã bị hủy hoặc không thành công
      </Animatable.Text>

      {(code || status || orderCode) && (
        <Animatable.View
          animation="fadeIn"
          delay={400}
          duration={600}
          style={{
            backgroundColor: "#F3F4F6",
            padding: 16,
            borderRadius: 12,
            width: "100%",
            marginBottom: 24,
          }}
        >
          {orderCode && (
            <Text style={{ color: "#1F2937", fontWeight: "600" }}>
              Mã đơn hàng: {orderCode}
            </Text>
          )}
          {status && (
            <Text style={{ color: "#1F2937", fontWeight: "600" }}>
              Trạng thái: {status}
            </Text>
          )}
          {code && (
            <Text style={{ color: "#1F2937", fontWeight: "600" }}>
              Mã lỗi: {code}
            </Text>
          )}
        </Animatable.View>
      )}

      {/* ✅ Hai nút cùng kích thước, đều nhau */}
      <Animatable.View
        animation="fadeInUp"
        delay={700}
        style={{ width: "100%" }}
      >
        <Pressable
          style={{
            backgroundColor: "#3B82F6",
            paddingVertical: 14,
            borderRadius: 12,
            width: "100%",
            alignItems: "center",
            marginBottom: 12,
          }}
          onPress={() => navigation.navigate("Wallet")}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Quay lại ví
          </Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#F3F4F6",
            paddingVertical: 14,
            borderRadius: 12,
            width: "100%",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#1F2937", fontSize: 16, fontWeight: "600" }}>
            Thử lại
          </Text>
        </Pressable>
      </Animatable.View>
    </View>
  );
}
