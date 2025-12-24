import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { loginStyles } from "../LoginScreen/LoginScreen.styles";
import { useToast } from "../../../hooks/use-toast";
import { authService } from "../../../service/authService";
import { MotiView, MotiImage } from "moti";
import Icon from "react-native-vector-icons/MaterialIcons";
export default function VerifyEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { toast } = useToast();
  const email = route?.params?.email || "";
  const { width } = useWindowDimensions();
  const handleResend = async () => {
    try {
      toast({ title: "Sending again...", variant: "default" });

      await authService.sendVerifyEmail(email);

      toast({
        title: "Verification email resent",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to resend email",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Backend already sends verification email during registration
  // Users can manually resend using the "Resend" button below if needed

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={["#CFF4FF", "#DCEEFF", "#E6EBFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={loginStyles.container}
      >
        <View style={loginStyles.contentWrapper}>
          {width > 768 && (
            <View style={loginStyles.brandingSection}>
              <View style={loginStyles.brandContent}>
                {/* Logo + Title */}
                <View style={loginStyles.logoContainer}>
                  <Image
                    source={{
                      uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
                    }}
                    style={loginStyles.logoImage}
                  />
                  <View>
                    <Text style={loginStyles.logoText}>SketchNote</Text>
                    <Text style={loginStyles.logoSubtext}>
                      Visual Note Taking App
                    </Text>
                  </View>
                </View>

                {/* Hero Section */}
                <View style={loginStyles.heroContent}>
                  <Text style={loginStyles.heroTitle}>
                    Sketch Your{"\n"}
                    <Text style={loginStyles.heroHighlight}>Ideas to Life</Text>
                  </Text>
                  {/* <Text style={loginStyles.heroDescription}>
                            Turn your imagination into visual notes, concept designs,
                            and creative sketches — fast, beautiful, and effortless.
                          </Text> */}
                </View>

                {/* Features Section */}
                <View style={loginStyles.featuresContainer}>
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600, delay: 100 }}
                    style={loginStyles.featureCard}
                  >
                    <View
                      style={[
                        loginStyles.featureIconBg,
                        { backgroundColor: "rgba(250, 204, 21, 0.15)" },
                      ]}
                    >
                      <Icon name="brush" size={35} color="#FACC15" />
                    </View>
                    <View>
                      <Text style={loginStyles.featureTitle}>
                        Draw. Create. Express
                      </Text>
                      <Text style={loginStyles.featureDesc}>
                        Natural sketching with smooth, pressure sensitive tools.
                      </Text>
                    </View>
                  </MotiView>

                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600, delay: 250 }}
                    style={loginStyles.featureCard}
                  >
                    <View
                      style={[
                        loginStyles.featureIconBg,
                        { backgroundColor: "rgba(34,197,94,0.15)" },
                      ]}
                    >
                      <Icon name="groups" size={35} color="#22C55E" />
                    </View>
                    <View>
                      <Text style={loginStyles.featureTitle}>
                        Share & Inspire
                      </Text>
                      <Text style={loginStyles.featureDesc}>
                        Post sketches, follow other creators, and get inspired{" "}
                        {"!!"}.
                      </Text>
                    </View>
                  </MotiView>

                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600, delay: 400 }}
                    style={loginStyles.featureCard}
                  >
                    <View
                      style={[
                        loginStyles.featureIconBg,
                        { backgroundColor: "rgba(59,130,246,0.15)" },
                      ]}
                    >
                      <Icon name="shopping-bag" size={35} color="#3B82F6" />
                    </View>
                    <View>
                      <Text style={loginStyles.featureTitle}>
                        Sell Your Art
                      </Text>
                      <Text style={loginStyles.featureDesc}>
                        Turn sketches into digital collectibles and earn money.
                      </Text>
                    </View>
                  </MotiView>
                </View>
              </View>
            </View>
          )}

          {/* Right Side - Verify Card (giống card login, thay nội dung) */}
          <View style={loginStyles.formSection}>
            <View
              style={[
                loginStyles.formContainer,
                {
                  paddingVertical: 28,
                  paddingHorizontal: 20,
                },
              ]}
            >
              {/* Top Decor */}
              <View style={loginStyles.formDecorator} />

              {/* Header */}
              <View style={loginStyles.cardHeader}>
                <Image
                  source={{
                    uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
                  }}
                  style={loginStyles.logoImage}
                />

                <LottieView
                  source={require("../../../assets/Welcome.json")}
                  autoPlay
                  loop
                  style={{ width: 200, height: 80 }}
                />

                <Text style={loginStyles.cardDescription}>
                  Email Verification
                </Text>
              </View>

              {/* Illustration
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image
                  source={require("../../../assets/logo.png")}
                  style={{ width: 160, height: 160 }}
                  resizeMode="contain"
                />
              </View> */}

              {/* Info */}
              <View style={loginStyles.form}>
                <Text
                  style={{
                    fontSize: 17,
                    color: "#1E293B",
                    fontWeight: "600",
                    alignSelf: "center",
                  }}
                >
                  Please check your email
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#3B5BA0",
                    fontWeight: "700",
                    marginTop: 8,
                    alignSelf: "center",
                  }}
                >
                  {email}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#64748B",
                    marginTop: 12,
                    textAlign: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  We have sent a verification link to your inbox. Click the link
                  to activate your account.
                </Text>
              </View>

              {/* Waiting Status */}
              <View
                style={{
                  padding: 12,
                  backgroundColor: "#F1F5F9",
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="small" color="#3B5BA0" />
                <Text
                  style={{ marginLeft: 10, color: "#334155", fontSize: 14 }}
                >
                  Waiting for email verification...
                </Text>
              </View>

              {/* Tips */}
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{ fontSize: 14, color: "#475569", marginBottom: 6 }}
                >
                  • If you don't see the email, check your spam folder.
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#475569", marginBottom: 6 }}
                >
                  • Make sure your email address is correct.
                </Text>
                <Text style={{ fontSize: 14, color: "#475569" }}>
                  • The verification link expires in 10 minutes.
                </Text>
              </View>

              {/* Resend Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#3B5BA0",
                  paddingVertical: 13,
                  borderRadius: 12,
                  marginTop: 20,
                  marginBottom: 20,
                }}
                onPress={handleResend}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Resend Verification Email
                </Text>
              </TouchableOpacity>

              <View style={loginStyles.signupContainer}>
                <Text style={loginStyles.signupText}>
                  Is your account already verified?
                </Text>
                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text style={loginStyles.signupLink}>Back to Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}
