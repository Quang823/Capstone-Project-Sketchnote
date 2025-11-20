import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

export default function PaymentFailedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { code, status, orderCode } = route.params || {};
  const { width } = useWindowDimensions();

  // Responsive container width for tablet
  const containerWidth = width > 768 ? 500 : width - 40;

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
      <View
        style={{
          width: containerWidth,
          alignItems: "center",
        }}
      >
        {/* ❌ Error icon with shake animation */}
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
          Payment Failed
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
          Your transaction has been cancelled or unsuccessful
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
              <Text
                style={{
                  color: "#1F2937",
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Order Code: {orderCode}
              </Text>
            )}
            {status && (
              <Text
                style={{
                  color: "#1F2937",
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Status: {status}
              </Text>
            )}
            {code && (
              <Text style={{ color: "#1F2937", fontWeight: "600" }}>
                Error Code: {code}
              </Text>
            )}
          </Animatable.View>
        )}

        {/* ✅ Two buttons with better spacing and max width */}
        <Animatable.View
          animation="fadeInUp"
          delay={700}
          style={{ width: "100%", maxWidth: 400 }}
        >
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#2563EB" : "#3B82F6",
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              width: "100%",
              alignItems: "center",
              marginBottom: 12,
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            })}
            onPress={() => navigation.navigate("Wallet")}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Back to Wallet
            </Text>
          </Pressable>

          {/* <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#E5E7EB" : "#F3F4F6",
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              width: "100%",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#D1D5DB",
            })}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "#1F2937", fontSize: 16, fontWeight: "600" }}>
              Try Again
            </Text>
          </Pressable> */}
        </Animatable.View>
      </View>
    </View>
  );
}