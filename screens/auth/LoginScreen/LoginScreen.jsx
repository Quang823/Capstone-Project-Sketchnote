import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useToast } from "../../../hooks/use-toast";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { loginStyles } from "./LoginScreen.styles";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../../service/authService";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

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
    if (!email || !password) {
      toast({
        title: "Vui lòng nhập email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { roles } = await authService.login(email, password);
      toast({
        title: "Đăng nhập thành công! 🎉",
        variant: "success",
      });

      if (roles.includes("CUSTOMER")) navigation.navigate("Home");
      else if (roles.includes("DESIGNER"))
        navigation.navigate("DesignerDashboard");
      else if (roles.includes("ADMIN")) navigation.navigate("AdminDashboard");
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: `Đăng nhập với ${provider}`,
      description: `Tính năng sẽ sớm được cập nhật`,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={["#F8FAFC", "#EFF6FF", "#F5F3FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={loginStyles.container}
      >
        {/* ✅ Background không chặn touch */}
        <View pointerEvents="none" style={loginStyles.backgroundContainer}>
          <View style={[loginStyles.gradientOrb, loginStyles.orbTop]} />
          <View style={[loginStyles.gradientOrb, loginStyles.orbBottom]} />
          <View style={[loginStyles.gradientOrb, loginStyles.orbRight]} />
          <View style={[loginStyles.floatingElement, loginStyles.float1]} />
          <View style={[loginStyles.floatingElement, loginStyles.float2]} />
          <View style={[loginStyles.floatingElement, loginStyles.float3]} />
        </View>

        {/* Main Content */}
        <View style={loginStyles.contentWrapper}>
          {/* Left Side - Branding */}
          {width > 768 && (
            <View style={loginStyles.brandingSection}>
              <View style={loginStyles.brandContent}>
                <View style={loginStyles.logoContainer}>
                  <LinearGradient
                    colors={["#1D4ED8", "#3B82F6", "#60A5FA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={loginStyles.logoBg}
                  >
                    <Icon name="palette" size={48} color="#FFFFFF" />
                  </LinearGradient>
                  <View>
                    <Text style={loginStyles.logoText}>SketchNote</Text>
                    <Text style={loginStyles.logoSubtext}>Creative Studio</Text>
                  </View>
                </View>

                <View style={loginStyles.heroContent}>
                  <Text style={loginStyles.heroTitle}>
                    Sketch Your{"\n"}
                    <Text style={loginStyles.heroHighlight}>Ideas to Life</Text>
                  </Text>
                  <Text style={loginStyles.heroDescription}>
                    Transform your thoughts into beautiful sketches, notes, and
                    designs in seconds
                  </Text>
                </View>

                <View style={loginStyles.featuresContainer}>
                  <View style={loginStyles.featureCard}>
                    <View style={loginStyles.featureIconBg}>
                      <Icon name="bolt" size={24} color="#FCD34D" />
                    </View>
                    <View>
                      <Text style={loginStyles.featureTitle}>
                        Lightning Fast
                      </Text>
                      <Text style={loginStyles.featureDesc}>
                        Instant sync across devices
                      </Text>
                    </View>
                  </View>

                  <View style={loginStyles.featureCard}>
                    <View style={loginStyles.featureIconBg}>
                      <Icon name="palette" size={24} color="#34D399" />
                    </View>
                    <View>
                      <Text style={loginStyles.featureTitle}>
                        Creative Tools
                      </Text>
                      <Text style={loginStyles.featureDesc}>
                        Professional drawing tools
                      </Text>
                    </View>
                  </View>

                  <View style={loginStyles.featureCard}>
                    <View style={loginStyles.featureIconBg}>
                      <Icon name="shield" size={24} color="#60A5FA" />
                    </View>
                    <View>
                      <Text style={loginStyles.featureTitle}>Fully Secure</Text>
                      <Text style={loginStyles.featureDesc}>
                        End-to-end encryption
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Right Side - Login Form */}
          <View style={loginStyles.formSection}>
            <View style={loginStyles.formContainer}>
              <View style={loginStyles.formDecorator} />

              {/* Header */}
              <View style={loginStyles.cardHeader}>
                <View style={loginStyles.headerGradient}>
                  <Icon name="login" size={32} color="#FFFFFF" />
                </View>
                <Text style={loginStyles.cardTitle}>Welcome Back</Text>
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
                    <Icon name="mail" size={20} color="#6366F1" />
                    <TextInput
                      style={loginStyles.textInput}
                      placeholder="your@email.com"
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
                    <Icon name="lock" size={20} color="#6366F1" />
                    <TextInput
                      style={[loginStyles.textInput, loginStyles.passwordField]}
                      placeholder="••••••••"
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
                      <ReanimatedView style={animatedIconStyle}>
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#6366F1"
                        />
                      </ReanimatedView>
                    </Pressable>
                  </View>
                </View>

                {/* Login Button */}
                <ReanimatedView style={animatedButtonStyle}>
                  <Pressable
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleLogin}
                    disabled={isLoading}
                    style={loginStyles.loginButtonWrapper}
                  >
                    <LinearGradient
                      colors={["#1D4ED8", "#3B82F6", "#60A5FA"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={loginStyles.loginButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Icon name="arrow-forward" size={20} color="#fff" />
                          <Text style={loginStyles.buttonText}>Sign In</Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </ReanimatedView>

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
                      <Icon name="language" size={20} color="#6366F1" />
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
                      <Icon name="phone-iphone" size={20} color="#6366F1" />
                      <Text style={loginStyles.socialBtnText}>Apple</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Signup */}
                <View style={loginStyles.signupContainer}>
                  <Text style={loginStyles.signupText}>
                    Don't have an account?{" "}
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
                    <Icon name="arrow-back" size={20} color="#6366F1" />
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
