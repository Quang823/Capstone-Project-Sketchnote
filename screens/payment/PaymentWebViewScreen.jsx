import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function PaymentWebViewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentUrl } = route.params;

  const handleShouldStartLoadWithRequest = (request) => {
    const url = request?.url ?? "";
    console.log("🌐 WebView intercepted URL:", url);

    // ✅ Check nếu URL chứa "wallet-success"
    if (url.includes("wallet-success")) {
      console.log("✅ Payment success detected");
      navigation.replace("PaymentSuccessScreen");
      return false; // Không load URL đó trong WebView
    }

    // ✅ Check nếu URL chứa "wallet-fail"
    if (url.includes("wallet-fail")) {
      console.log("❌ Payment failed detected");
      navigation.replace("PaymentFailedScreen");
      return false; // Không load URL đó trong WebView
    }

    return true; // Cho phép WebView load các URL khác
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: paymentUrl }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#3B82F6"
            style={{ marginTop: 20 }}
          />
        )}
        javaScriptEnabled={true}
        allowsBackForwardNavigationGestures={false}
      />
    </View>
  );
}
