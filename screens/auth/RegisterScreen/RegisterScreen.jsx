import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
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
import { registerStyles } from "./RegisterScreen.styles";
import { useNavigation } from "@react-navigation/native";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();
  const navigation = useNavigation();

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

  const handleRegister = () => {
    if (!email || !password || !confirmPassword || !fullName) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin đăng ký",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Mật khẩu và xác nhận mật khẩu phải giống nhau",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Đăng ký thành công! 🎨",
      description: "Chào mừng bạn đến với SketchNote!",
    });
    
    // Chuyển đến màn hình đăng nhập sau khi đăng ký thành công
    navigation.navigate("Login");
  };

  const handleSocialRegister = (provider) => {
    toast({
      title: `Đăng ký với ${provider}`,
      description: `Tiếp tục đăng ký với ${provider}`,
    });
  };

  return (
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]} // Gradient bắt mắt: Xanh nhạt đến vàng nhạt
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={registerStyles.container}
    >
      {/* Background Hero Image với overlay gradient */}
      <ImageBackground source={heroImage} style={registerStyles.heroBackground}>
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]}
          style={registerStyles.heroOverlay}
        />
      </ImageBackground>

      {/* Main Content */}
      <ReanimatedView style={[registerStyles.contentWrapper, animatedStyle]}>
        {/* Left Side - Branding */}
        <View style={registerStyles.brandingSection}>
          <Shadow distance={8} startColor="#00000010" finalColor="#00000005">
            <View style={registerStyles.brandContent}>
              <View style={registerStyles.logoContainer}>
                <Icon
                  name="palette"
                  size={32}
                  color="#4F46E5" // Primary color
                  style={registerStyles.logoIcon}
                />
                <Text style={registerStyles.logoText}>SketchNote</Text>
              </View>

              <Text style={registerStyles.heroTitle}>
                Bắt đầu hành trình{" "}
                <Text style={registerStyles.heroHighlight}>sáng tạo</Text>{" "}
                của bạn
              </Text>

              <Text style={registerStyles.heroDescription}>
                Chuyển đổi ý tưởng thành những bản phác thảo và ghi chú tuyệt đẹp. 
                Tham gia cùng hàng nghìn nghệ sĩ và người sáng tạo tin tưởng SketchNote.
              </Text>

              <View style={registerStyles.featuresGrid}>
                <View style={registerStyles.featureItem}>
                  <Icon
                    name="edit"
                    size={24}
                    color="#F59E0B" // Secondary color
                    style={registerStyles.featureIcon}
                  />
                  <Text style={registerStyles.featureText}>
                    Công cụ vẽ trực quan
                  </Text>
                </View>
                <View style={registerStyles.featureItem}>
                  <Icon
                    name="star"
                    size={24}
                    color="#F59E0B"
                    style={registerStyles.featureIcon}
                  />
                  <Text style={registerStyles.featureText}>
                    Gợi ý thông minh AI
                  </Text>
                </View>
              </View>
            </View>
          </Shadow>
        </View>

        {/* Right Side - Register Form */}
        <View style={registerStyles.formSection}>
          <Shadow distance={12} startColor="#00000020" finalColor="#00000005">
            <ReanimatedView style={[registerStyles.registerCard, animatedStyle]}>
              <View style={registerStyles.cardHeader}>
                <Text style={registerStyles.cardTitle}>Đăng ký tài khoản</Text>
                <Text style={registerStyles.cardDescription}>
                  Tạo tài khoản để bắt đầu hành trình sáng tạo
                </Text>
              </View>

              <View style={registerStyles.cardContent}>
                <View style={registerStyles.form}>
                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Họ và tên</Text>
                    <TextInput
                      style={registerStyles.input}
                      placeholder="Nhập họ và tên của bạn"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                  
                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Email</Text>
                    <TextInput
                      style={registerStyles.input}
                      placeholder="example@gmail.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Mật khẩu</Text>
                    <View style={registerStyles.passwordContainer}>
                      <TextInput
                        style={registerStyles.passwordInput}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={registerStyles.passwordToggle}
                      >
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#4F46E5"
                        />
                      </Pressable>
                    </View>
                  </View>
                  
                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Xác nhận mật khẩu</Text>
                    <View style={registerStyles.passwordContainer}>
                      <TextInput
                        style={registerStyles.passwordInput}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <Pressable
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={registerStyles.passwordToggle}
                      >
                        <Icon
                          name={showConfirmPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#4F46E5"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Reanimated.View style={[animatedButtonStyle]}>
                    <Pressable
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={handleRegister}
                      style={registerStyles.registerButton}
                    >
                      <LinearGradient
                        colors={["#4F46E5", "#6366F1"]} // Gradient cho button
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={registerStyles.buttonGradient}
                      >
                        <Text style={registerStyles.buttonText}>
                          Đăng ký tài khoản
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Reanimated.View>

                  <View style={registerStyles.separatorContainer}>
                    <View style={registerStyles.separator} />
                    <Text style={registerStyles.separatorText}>
                      hoặc đăng ký với
                    </Text>
                    <View style={registerStyles.separator} />
                  </View>

                  <View style={registerStyles.socialButtons}>
                    <Reanimated.View style={[animatedButtonStyle]}>
                      <Pressable
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => handleSocialRegister("Google")}
                        style={registerStyles.socialButton}
                      >
                        <Text style={registerStyles.socialButtonText}>Google</Text>
                      </Pressable>
                    </Reanimated.View>
                    <Reanimated.View style={[animatedButtonStyle]}>
                      <Pressable
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => handleSocialRegister("Apple")}
                        style={registerStyles.socialButton}
                      >
                        <Text style={registerStyles.socialButtonText}>Apple</Text>
                      </Pressable>
                    </Reanimated.View>
                  </View>

                  <View style={registerStyles.loginPrompt}>
                    <Text>Đã có tài khoản? </Text>
                    <Pressable onPress={() => navigation.navigate("Login")}>
                      <Text style={registerStyles.loginLink}>
                        Đăng nhập ngay
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </ReanimatedView>
          </Shadow>
        </View>
      </ReanimatedView>
    </LinearGradient>
  );
}