import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  Animated,useWindowDimensions ,
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
import { useNavigation } from "@react-navigation/native";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

export default function LoginScreen({ onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigation = useNavigation();
 const { width } = useWindowDimensions();
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
        title: "Thiếu thông tin đăng nhập",
        description: "Vui lòng nhập email và mật khẩu",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Chào mừng đến với SketchNote! 🎨",
      description: "Đăng nhập thành công! Bắt đầu sáng tạo ngay.",
    });
    // Chuyển đến màn hình Home sau khi đăng nhập
    navigation.navigate("Home");
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: `Đăng nhập với ${provider}`,
      description: `Tiếp tục với tích hợp ${provider}`,
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
        {width > 768 && (
    <View style={loginStyles.brandingSection}>
      <Shadow distance={8} startColor="#00000010" finalColor="#00000005">
        <View style={loginStyles.brandContent}>
          <View style={loginStyles.logoContainer}>
            <Icon name="palette" size={32} color="#4F46E5" />
            <Text style={loginStyles.logoText}>SketchNote</Text>
          </View>
          <Text style={loginStyles.heroTitle}>
            Mở khóa <Text style={loginStyles.heroHighlight}>tiềm năng sáng tạo</Text> của bạn
          </Text>
          <Text style={loginStyles.heroDescription}>
            Chuyển đổi ý tưởng thành những bản phác thảo và ghi chú tuyệt đẹp. 
          </Text>
        </View>
      </Shadow>
    </View>
  )}

        {/* Right Side - Login Form */}
        <View style={loginStyles.formSection}>
          <Shadow distance={12} startColor="#00000020" finalColor="#00000005">
            <ReanimatedView style={[loginStyles.loginCard, animatedStyle]}>
              <View style={loginStyles.cardHeader}>
                <Text style={loginStyles.cardTitle}>Chào mừng trở lại!</Text>
                <Text style={loginStyles.cardDescription}>
                  Đăng nhập để tiếp tục hành trình sáng tạo của bạn
                </Text>
              </View>

              <View style={loginStyles.cardContent}>
                <View style={loginStyles.form}>
                  <View style={loginStyles.inputGroup}>
                    <Text style={loginStyles.label}>Email</Text>
                    <TextInput
                      style={loginStyles.input}
                      placeholder="example@gmail.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={loginStyles.inputGroup}>
                    <Text style={loginStyles.label}>Mật khẩu</Text>
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
                        Quên mật khẩu?
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
                          Đăng nhập
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Reanimated.View>

                  <View style={loginStyles.separatorContainer}>
                    <View style={loginStyles.separator} />
                    <Text style={loginStyles.separatorText}>
                      hoặc đăng nhập với
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
                    <Text>Chưa có tài khoản? </Text>
                    <Pressable onPress={() => navigation.navigate("Register")}>
                      <Text style={loginStyles.signupLink}>
                        Đăng ký ngay
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {onBack && (
                  <Pressable onPress={onBack} style={loginStyles.backButton}>
                    <Text>← Quay lại trang chủ</Text>
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
