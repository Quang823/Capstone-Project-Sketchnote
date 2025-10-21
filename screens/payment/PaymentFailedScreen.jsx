import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function PaymentFailedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get parameters from URL
  const { code, id, cancel, status, orderCode } = route.params || {};

  useEffect(() => {
    console.log("Payment Failed Screen - Params:", route.params);
  }, [route.params]);

  return (
    <View style={{ 
      flex: 1, 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 20,
      backgroundColor: "#fff"
    }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24
      }}>
        <Text style={{ fontSize: 40 }}>❌</Text>
      </View>
      
      <Text style={{ 
        fontSize: 24, 
        fontWeight: "bold",
        color: "#DC2626", 
        marginBottom: 12, 
        textAlign: "center" 
      }}>
        Thanh toán thất bại
      </Text>
      
      <Text style={{ 
        fontSize: 16, 
        color: "#6B7280", 
        marginBottom: 24, 
        textAlign: "center" 
      }}>
        Giao dịch của bạn đã bị hủy hoặc không thành công
      </Text>
      
      {/* Details Section */}
      {(code || status || orderCode) && (
        <View style={{
          backgroundColor: "#F3F4F6",
          padding: 16,
          borderRadius: 12,
          width: "100%",
          marginBottom: 24
        }}>
          {orderCode && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>Mã đơn hàng</Text>
              <Text style={{ fontSize: 16, color: "#1F2937", fontWeight: "600" }}>
                {orderCode}
              </Text>
            </View>
          )}
          
          {status && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>Trạng thái</Text>
              <Text style={{ fontSize: 16, color: "#1F2937", fontWeight: "600" }}>
                {status}
              </Text>
            </View>
          )}
          
          {code && (
            <View>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>Mã lỗi</Text>
              <Text style={{ fontSize: 16, color: "#1F2937", fontWeight: "600" }}>
                {code}
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Action Buttons */}
      <Pressable
        style={{
          backgroundColor: "#3B82F6",
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 12,
          width: "100%",
          alignItems: "center",
          marginBottom: 12
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
          paddingHorizontal: 32,
          borderRadius: 12,
          width: "100%",
          alignItems: "center"
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#1F2937", fontSize: 16, fontWeight: "600" }}>
          Thử lại
        </Text>
      </Pressable>
    </View>
  );
}