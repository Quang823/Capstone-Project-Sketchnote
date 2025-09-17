import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  Animated,
} from "react-native";
import { useToast } from "../../../hooks/use-toast";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import heroImage from "../../../assets/logo1.webp";
import { loginStyles } from "./LoginScreen.styles";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

export default function LoginScreen({ onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // Animations: Fade-in và slide-up cho form
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.ease });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Hiệu ứng scale cho buttons khi press
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 150 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withTiming(1, { duration: 150 });
  };

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Welcome to SketchNote! 🎨",
      description: "Login successful! Start creating amazing sketches.",
    });
    // Optional: Thêm confetti effect nếu cài react-native-confetti-cannon
    // <ConfettiCannon count={200} origin={{x: -10, y: 0}} />
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: `${provider} Login`,
      description: `Continue with ${provider} integration`,
    });
  };

  return (
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]} // Gradient bắt mắt: Xanh nhạt đến vàng nhạt
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={loginStyles.container}
    >
      {/* Background Hero Image với overlay gradient */}
      <ImageBackground source={heroImage} style={loginStyles.heroBackground}>
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]}
          style={loginStyles.heroOverlay}
        />
      </ImageBackground>

      {/* Main Content */}
      <ReanimatedView style={[loginStyles.contentWrapper, animatedStyle]}>
        {/* Left Side - Branding */}
        <View style={loginStyles.brandingSection}>
          <Shadow distance={8} startColor="#00000010" finalColor="#00000005">
            <View style={loginStyles.brandContent}>
              <View style={loginStyles.logoContainer}>
                <Icon
                  name="palette"
                  size={32} // Tăng size cho bắt mắt
                  color="#4F46E5" // Primary color
                  style={loginStyles.logoIcon}
                />
                <Text style={loginStyles.logoText}>SketchNote</Text>
              </View>

              <Text style={loginStyles.heroTitle}>
                Unlock Your{" "}
                <Text style={loginStyles.heroHighlight}>Creative</Text>{" "}
                Potential
              </Text>

              <Text style={loginStyles.heroDescription}>
                Transform your ideas into beautiful sketches and notes. Join
                thousands of artists and creators who trust SketchNote for their
                creative journey.
              </Text>

              <View style={loginStyles.featuresGrid}>
                <View style={loginStyles.featureItem}>
                  <Icon
                    name="edit"
                    size={24}
                    color="#F59E0B" // Secondary color
                    style={loginStyles.featureIcon}
                  />
                  <Text style={loginStyles.featureText}>
                    Intuitive Drawing Tools
                  </Text>
                </View>
                <View style={loginStyles.featureItem}>
                  <Icon
                    name="star"
                    size={24}
                    color="#F59E0B"
                    style={loginStyles.featureIcon}
                  />
                  <Text style={loginStyles.featureText}>
                    AI-Powered Suggestions
                  </Text>
                </View>
              </View>
            </View>
          </Shadow>
        </View>

        {/* Right Side - Login Form */}
        <View style={loginStyles.formSection}>
          <Shadow distance={12} startColor="#00000020" finalColor="#00000005">
            <ReanimatedView style={[loginStyles.loginCard, animatedStyle]}>
              <View style={loginStyles.cardHeader}>
                <Text style={loginStyles.cardTitle}>Welcome Back!</Text>
                <Text style={loginStyles.cardDescription}>
                  Sign in to continue your creative journey
                </Text>
              </View>

              <View style={loginStyles.cardContent}>
                <View style={loginStyles.form}>
                  <View style={loginStyles.inputGroup}>
                    <Text style={loginStyles.label}>Email Address</Text>
                    <TextInput
                      style={loginStyles.input}
                      placeholder="artist@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={loginStyles.inputGroup}>
                    <Text style={loginStyles.label}>Password</Text>
                    <View style={loginStyles.passwordContainer}>
                      <TextInput
                        style={loginStyles.passwordInput}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={loginStyles.passwordToggle}
                      >
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#4F46E5"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={loginStyles.formActions}>
                    <Pressable>
                      <Text style={loginStyles.forgotPassword}>
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </View>

                  <Reanimated.View style={[animatedButtonStyle]}>
                    <Pressable
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={handleLogin}
                      style={loginStyles.loginButton}
                    >
                      <LinearGradient
                        colors={["#4F46E5", "#6366F1"]} // Gradient cho button
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={loginStyles.buttonGradient}
                      >
                        <Text style={loginStyles.buttonText}>
                          Sign In to SketchNote
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Reanimated.View>

                  <View style={loginStyles.separatorContainer}>
                    <View style={loginStyles.separator} />
                    <Text style={loginStyles.separatorText}>
                      or continue with
                    </Text>
                    <View style={loginStyles.separator} />
                  </View>

                  <View style={loginStyles.socialButtons}>
                    <Reanimated.View style={[animatedButtonStyle]}>
                      <Pressable
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => handleSocialLogin("Google")}
                        style={loginStyles.socialButton}
                      >
                        <Text style={loginStyles.buttonText}>Google</Text>
                      </Pressable>
                    </Reanimated.View>
                    <Reanimated.View style={[animatedButtonStyle]}>
                      <Pressable
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => handleSocialLogin("Apple")}
                        style={loginStyles.socialButton}
                      >
                        <Text style={loginStyles.buttonText}>Apple</Text>
                      </Pressable>
                    </Reanimated.View>
                  </View>

                  <View style={loginStyles.signupPrompt}>
                    <Text>New to SketchNote? </Text>
                    <Pressable>
                      <Text style={loginStyles.signupLink}>
                        Create an account
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {onBack && (
                  <Pressable onPress={onBack} style={loginStyles.backButton}>
                    <Text>← Back to Home</Text>
                  </Pressable>
                )}
              </View>
            </ReanimatedView>
          </Shadow>
        </View>
      </ReanimatedView>
    </LinearGradient>
  );
}
