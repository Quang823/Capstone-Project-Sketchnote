import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
  StyleSheet,
} from "react-native";
import { useToast } from "../../../hooks/use-toast";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  createAnimatedComponent,
} from "react-native-reanimated";

import { loginStyles } from "./LoginScreen.styles";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../context/AuthContext";
import { MotiView, MotiImage } from "moti";
import LottieView from "lottie-react-native";
import AnimatedBackground from "./AnimatedBackground";

export default function LoginScreen({ onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { toast } = useToast();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { login } = useContext(AuthContext);

  // chỉ giữ animation cho button và icon (không đụng layout)
  const buttonScale = useSharedValue(1);
  const rotateIcon = useSharedValue(0);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateIcon.value}deg` }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withTiming(0.92, { duration: 100 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const handlePasswordToggle = () => {
    rotateIcon.value = withTiming(rotateIcon.value + 180, { duration: 300 });
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    if (!email || !password)
      return toast({
        title: "Please enter email and password",
        variant: "destructive",
      });

    setIsLoading(true);
    try {
      const loginResult = await login(email, password); // Use context login

      toast({ title: "Login successfully! 🎉", variant: "success" });

      const { roles } = loginResult;
      if (roles.includes("DESIGNER")) navigation.navigate("DesignerDashboard");
      else if (roles.includes("CUSTOMER")) navigation.navigate("Home");
      else if (isCustomer) navigation.navigate("Home");
      else navigation.navigate("Home");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: `Login with ${provider}`,
      description: `This feature will be updated soon`,
    });
  };

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
        {/* ✅ Background không chặn touch */}
        <AnimatedBackground />

        {/* Main Content */}
        <View style={loginStyles.contentWrapper}>
          {/* Left Side - Branding */}
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

          {/* Right Side - Login Form */}
          <View style={loginStyles.formSection}>
            <View style={loginStyles.formContainer}>
              <View style={loginStyles.formDecorator} />

              {/* Header with Lottie */}
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
                  style={{ width: 200, height: 60 }}
                />
                <Text style={loginStyles.cardDescription}>
                  Sign in to continue creating magic
                </Text>
              </View>

              {/* Form Inputs */}
              <View style={loginStyles.form}>
                {/* Email */}
                <View style={loginStyles.inputGroup}>
                  <Text style={loginStyles.label}>Email Address</Text>
                  <View
                    style={[
                      loginStyles.inputContainer,
                      emailFocused && loginStyles.inputContainerFocused,
                    ]}
                  >
                    <Icon name="mail" size={20} color="#3B5BA0" />
                    <TextInput
                      style={loginStyles.textInput}
                      placeholder="Enter your email (ex: sketchnote@gmail.com)"
                      placeholderTextColor="#CBD5E1"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                </View>
                {/* Password */}
                <View style={loginStyles.inputGroup}>
                  <View style={loginStyles.labelRow}>
                    <Text style={loginStyles.label}>Password</Text>
                    <Pressable>
                      <Text style={loginStyles.forgotLink}>Forgot?</Text>
                    </Pressable>
                  </View>
                  <View
                    style={[
                      loginStyles.inputContainer,
                      passwordFocused && loginStyles.inputContainerFocused,
                    ]}
                  >
                    <Icon name="lock" size={20} color="#3B5BA0" />
                    <TextInput
                      style={[loginStyles.textInput, loginStyles.passwordField]}
                      placeholder="Enter your password"
                      placeholderTextColor="#CBD5E1"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                    />
                    <Pressable
                      onPress={handlePasswordToggle}
                      style={loginStyles.eyeButton}
                    >
                      <Animated.View style={animatedIconStyle}>
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#3B5BA0"
                        />
                      </Animated.View>
                    </Pressable>
                  </View>
                </View>
                {/* Login Button */}
                <Animated.View style={animatedButtonStyle}>
                  <Pressable
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleLogin}
                    disabled={isLoading}
                    style={loginStyles.loginButtonWrapper}
                  >
                    <LinearGradient
                      colors={["#3B5BA0", "#2563EB", "#3B5BA0"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={loginStyles.loginButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={loginStyles.buttonText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
                {/* Divider */}
                <View style={loginStyles.divider}>
                  <View style={loginStyles.dividerLine} />
                  <Text style={loginStyles.dividerText}>or continue with</Text>
                  <View style={loginStyles.dividerLine} />
                </View>
                {/* Social Buttons */}
                <View style={loginStyles.socialContainer}>
                  <Pressable
                    onPress={() => handleSocialLogin("Google")}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      loginStyles.socialBtn,
                      pressed && loginStyles.socialBtnPressed,
                    ]}
                  >
                    <View style={loginStyles.socialBtnGradient}>
                      <Icon name="language" size={20} color="#3B5BA0" />
                      <Text style={loginStyles.socialBtnText}>Google</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSocialLogin("Apple")}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      loginStyles.socialBtn,
                      pressed && loginStyles.socialBtnPressed,
                    ]}
                  >
                    <View style={loginStyles.socialBtnGradient}>
                      <Icon name="phone-iphone" size={20} color="#3B5BA0" />
                      <Text style={loginStyles.socialBtnText}>Apple</Text>
                    </View>
                  </Pressable>
                </View>
                {/* Signup */}
                <View style={loginStyles.signupContainer}>
                  <Text style={loginStyles.signupText}>
                    Don't have an account?
                  </Text>
                  <Pressable
                    onPress={() => navigation.navigate("Register")}
                    disabled={isLoading}
                  >
                    <Text style={loginStyles.signupLink}>Create account</Text>
                  </Pressable>
                </View>
                {/* Back Button */}
                {onBack && (
                  <Pressable onPress={onBack} style={loginStyles.backBtn}>
                    <Text style={loginStyles.backBtnText}>Back</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}
