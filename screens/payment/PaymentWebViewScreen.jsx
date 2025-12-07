import React, { useRef, useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import ErrorBoundary from "../../components/ErrorBoundary";

export default function PaymentWebViewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentUrl } = route.params;

  const webViewRef = useRef(null);
  const isMounted = useRef(true);
  const [hasError, setHasError] = useState(false);

  // ✅ Cleanup khi unmount
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      // Stop loading nếu WebView đang load
      if (webViewRef.current) {
        try {
          webViewRef.current.stopLoading();
        } catch (err) {
          console.warn("[PaymentWebView] Failed to stop loading:", err);
        }
      }
    };
  }, []);

  const handleShouldStartLoadWithRequest = (request) => {
    if (!isMounted.current) return false;

    const url = request?.url ?? "";

    // ✅ Check nếu URL chứa "wallet-success"
    if (url.includes("wallet-success")) {
      if (isMounted.current) {
        navigation.replace("PaymentSuccessScreen");
      }
      return false; // Không load URL đó trong WebView
    }

    // ✅ Check nếu URL chứa "wallet-fail"
    if (url.includes("wallet-fail")) {
      if (isMounted.current) {
        navigation.replace("PaymentFailedScreen");
      }
      return false; // Không load URL đó trong WebView
    }

    return true; // Cho phép WebView load các URL khác
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("[PaymentWebView] Error:", nativeEvent);

    if (!isMounted.current) return;

    setHasError(true);

    Alert.alert(
      "Lỗi tải trang",
      "Không thể tải trang thanh toán. Vui lòng thử lại.",
      [
        {
          text: "Thử lại",
          onPress: () => {
            setHasError(false);
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          },
        },
        {
          text: "Quay lại",
          onPress: () => navigation.goBack(),
          style: "cancel",
        },
      ]
    );
  };

  const handleHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("[PaymentWebView] HTTP Error:", nativeEvent.statusCode);

    if (nativeEvent.statusCode >= 400) {
      handleError(syntheticEvent);
    }
  };

  const handleLoadEnd = () => {
    if (!isMounted.current) return;
  };

  const handleErrorBoundary = (error, errorInfo) => {
    console.error("[PaymentWebView] ErrorBoundary caught:", error, errorInfo);

    if (isMounted.current) {
      Alert.alert("Lỗi", "Trang thanh toán gặp sự cố. Vui lòng thử lại.", [
        {
          text: "Quay lại",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  return (
    <ErrorBoundary
      onError={handleErrorBoundary}
      message="Không thể hiển thị trang thanh toán"
    >
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onError={handleError}
          onHttpError={handleHttpError}
          onLoadEnd={handleLoadEnd}
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
          // ✅ Performance optimizations
          cacheEnabled={false}
          incognito={true}
          // ✅ Security
          mixedContentMode="never"
          allowsInlineMediaPlayback={false}
        />
      </View>
    </ErrorBoundary>
  );
}
